import { tz } from '@date-fns/tz';
import { addDays, eachDayOfInterval, format, startOfDay } from 'date-fns';

export const BUSINESS_TIMEZONE = 'Europe/Kyiv';

const kyiv = tz(BUSINESS_TIMEZONE);
const utc = tz('UTC');

export function formatKyivDate(date: Date): string {
  return format(date, 'yyyy-MM-dd', { in: kyiv });
}

export function startOfKyivDay(date = new Date()): Date {
  return toUtcDate(startOfDay(date, { in: kyiv }));
}

export function getKyivDateWindow(
  dayCount: number,
  now = new Date(),
): {
  today: string;
  dates: string[];
  start: Date;
  end: Date;
} {
  const todayStart = startOfKyivDay(now);
  const start = toUtcDate(addDays(todayStart, 1 - dayCount, { in: kyiv }));
  const end = toUtcDate(addDays(todayStart, 1, { in: kyiv }));

  return {
    today: formatKyivDate(todayStart),
    dates: eachDayOfInterval({ start, end: todayStart }, { in: kyiv }).map(
      formatKyivDate,
    ),
    start,
    end,
  };
}

export function toIsoUtcString(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'", { in: utc });
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export class InvalidKyivDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidKyivDateError';
  }
}

/** Calendar date `YYYY-MM-DD` interpreted in Europe/Kyiv. */
export function parseKyivDate(value: string): Date {
  const match = ISO_DATE.exec(value);
  if (!match) {
    throw new InvalidKyivDateError(`Некоректна дата: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    utcNoon.getUTCFullYear() !== year ||
    utcNoon.getUTCMonth() !== month - 1 ||
    utcNoon.getUTCDate() !== day
  ) {
    throw new InvalidKyivDateError(`Некоректна дата: ${value}`);
  }

  return utcNoon;
}

/** Inclusive Kyiv calendar range. `end` is exclusive (start of the next day). */
export function getKyivInclusiveRange(
  from: string,
  to: string,
): {
  dates: string[];
  start: Date;
  end: Date;
} {
  const fromKey = formatKyivDate(parseKyivDate(from));
  const toKey = formatKyivDate(parseKyivDate(to));
  if (fromKey > toKey) {
    throw new InvalidKyivDateError('Дата «від» не може бути пізніше за «до»');
  }

  const start = startOfKyivDay(parseKyivDate(from));
  const endInclusive = startOfKyivDay(parseKyivDate(to));
  const end = toUtcDate(addDays(endInclusive, 1, { in: kyiv }));

  return {
    dates: eachDayOfInterval({ start, end: endInclusive }, { in: kyiv }).map(
      formatKyivDate,
    ),
    start,
    end,
  };
}

function toUtcDate(date: Date): Date {
  return new Date(date.getTime());
}

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

function toUtcDate(date: Date): Date {
  return new Date(date.getTime());
}

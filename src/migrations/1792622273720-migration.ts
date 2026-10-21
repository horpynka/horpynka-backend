import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1792622273720 implements MigrationInterface {
  name = 'Migration1792622273720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cash_shift" ADD "actual_closing_balance" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cash_shift" DROP COLUMN "actual_closing_balance"`,
    );
  }
}

import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1792249181781 implements MigrationInterface {
  name = 'Migration1792249181781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cash_shift" ADD "closing_balance" integer`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_cash_shift_single_open" ON "cash_shift" ((true)) WHERE "status" = 'OPEN'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_cash_shift_single_open"`);
    await queryRunner.query(
      `ALTER TABLE "cash_shift" DROP COLUMN "closing_balance"`,
    );
  }
}

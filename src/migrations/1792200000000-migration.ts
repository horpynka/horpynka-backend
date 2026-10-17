import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1792200000000 implements MigrationInterface {
  name = 'Migration1792200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ingredient" ADD "stock_quantity" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "stock_quantity" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" ALTER COLUMN "actual_quantity" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "inventory_item" SET "actual_quantity" = 0 WHERE "actual_quantity" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" ALTER COLUMN "actual_quantity" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "stock_quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingredient" DROP COLUMN "stock_quantity"`,
    );
  }
}

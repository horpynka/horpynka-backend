import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1792249969907 implements MigrationInterface {
  name = 'Migration1792249969907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "order_item"
      SET "discount_type" = CASE
        WHEN upper(btrim("discount_type")) IN ('PERCENT', 'PERCENTAGE') THEN 'PERCENT'
        WHEN upper(btrim("discount_type")) IN ('AMOUNT', 'FIXED') THEN 'AMOUNT'
        ELSE 'NONE'
      END
    `);
    await queryRunner.query(`
      UPDATE "order_item"
      SET "discount" = NULL
      WHERE "discount_type" = 'NONE'
        AND ("discount" IS NULL OR btrim("discount") = '')
    `);
    await queryRunner.query(`
      ALTER TABLE "order_item"
      ADD CONSTRAINT "CHK_order_item_discount_type"
      CHECK ("discount_type" IN ('NONE', 'PERCENT', 'AMOUNT'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_item" DROP CONSTRAINT "CHK_order_item_discount_type"
    `);
    await queryRunner.query(`
      UPDATE "order_item"
      SET
        "discount_type" = CASE
          WHEN "discount_type" = 'PERCENT' THEN 'PERCENTAGE'
          WHEN "discount_type" = 'AMOUNT' THEN 'FIXED'
          ELSE ''
        END,
        "discount" = CASE
          WHEN "discount" IS NULL THEN ''
          ELSE "discount"
        END
    `);
  }
}

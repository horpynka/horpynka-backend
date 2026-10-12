import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1791829792002 implements MigrationInterface {
  name = 'Migration1791829792002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" ADD "quantity" numeric`,
    );
    // Existing rows were created before quantities were tracked; the column stays without a default.
    await queryRunner.query(
      `UPDATE "dish_ingredient" SET "quantity" = 1 WHERE "quantity" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" ALTER COLUMN "quantity" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" ADD CONSTRAINT "CHK_dish_ingredient_quantity_positive" CHECK ("quantity" > 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" DROP CONSTRAINT "CHK_dish_ingredient_quantity_positive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" DROP COLUMN "quantity"`,
    );
  }
}

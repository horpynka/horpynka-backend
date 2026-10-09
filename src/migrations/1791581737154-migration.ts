import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1791581737154 implements MigrationInterface {
  name = 'Migration1791581737154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_measurement_unit_enum" AS ENUM('g', 'ml', 'pcs')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "measurement_unit" "public"."product_measurement_unit_enum" NOT NULL DEFAULT 'pcs'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "measurement_unit" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "measurement_unit"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."product_measurement_unit_enum"`,
    );
  }
}

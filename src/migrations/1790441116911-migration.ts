import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1790441116911 implements MigrationInterface {
  name = 'Migration1790441116911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_item_measurement_unit_enum" AS ENUM('g', 'ml', 'pcs')`,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory_item" ("id" SERIAL NOT NULL, "name" text NOT NULL, "measurement_unit" "public"."inventory_item_measurement_unit_enum" NOT NULL, "expected_quantity" integer NOT NULL, "actual_quantity" integer NOT NULL, "inventory_id" integer NOT NULL, CONSTRAINT "PK_94f5cbcb5f280f2f30bd4a9fd90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_status_enum" AS ENUM('COMPLETED', 'WITH_DIFFERENCES', 'IN_PROGRESS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "finished_at" TIMESTAMP, "status" "public"."inventory_status_enum" NOT NULL, "responsible" text NOT NULL, CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" ADD CONSTRAINT "FK_a2129b235bd560a0a725ae3404b" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_item" DROP CONSTRAINT "FK_a2129b235bd560a0a725ae3404b"`,
    );
    await queryRunner.query(`DROP TABLE "inventory"`);
    await queryRunner.query(`DROP TYPE "public"."inventory_status_enum"`);
    await queryRunner.query(`DROP TABLE "inventory_item"`);
    await queryRunner.query(
      `DROP TYPE "public"."inventory_item_measurement_unit_enum"`,
    );
  }
}

import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1789926571925 implements MigrationInterface {
  name = 'Migration1789926571925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cash_shift_status_enum" AS ENUM('OPEN', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cash_shift" ("id" SERIAL NOT NULL, "opened_at" TIMESTAMP NOT NULL, "closed_at" TIMESTAMP, "opening_balance" integer NOT NULL, "status" "public"."cash_shift_status_enum" NOT NULL DEFAULT 'OPEN', "opened_by_user_id" integer NOT NULL, CONSTRAINT "PK_608dd64098394f6449bc02dd933" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cash_shift" ADD CONSTRAINT "FK_7499366417e4f10d6bdc97a627a" FOREIGN KEY ("opened_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cash_shift" DROP CONSTRAINT "FK_7499366417e4f10d6bdc97a627a"`,
    );
    await queryRunner.query(`DROP TABLE "cash_shift"`);
    await queryRunner.query(`DROP TYPE "public"."cash_shift_status_enum"`);
  }
}

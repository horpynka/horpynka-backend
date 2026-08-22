import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1785002653477 implements MigrationInterface {
  name = 'InitMigration1785002653477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "username" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "roles" text array NOT NULL DEFAULT '{}', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ingredient" ("id" SERIAL NOT NULL, "measurement_unit" text NOT NULL, CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dish_ingredient" ("id" SERIAL NOT NULL, "dish_id" integer, "ingredient_id" integer, CONSTRAINT "UQ_1682f23d194fb890f70dc07a8be" UNIQUE ("dish_id", "ingredient_id"), CONSTRAINT "PK_45fe3741605e7eae03adea9e81d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dish" ("id" SERIAL NOT NULL, "name" text NOT NULL, "category_id" integer, "own_price" integer NOT NULL, "selling_price" integer NOT NULL, "selling" boolean NOT NULL DEFAULT true, "created_at" date NOT NULL, "updated_at" date NOT NULL, CONSTRAINT "PK_59ac7b35af39b231276bfc4c00c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" SERIAL NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" text NOT NULL, "own_price" integer NOT NULL, "selling_price" integer NOT NULL, "category_id" integer, "selling" boolean NOT NULL DEFAULT true, "created_at" date NOT NULL, "updated_at" date NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item" ("id" SERIAL NOT NULL, "selling_price" integer NOT NULL, "discount" text, "discount_type" text NOT NULL, "dish_id" integer, "product_id" integer, "order_id" integer, CONSTRAINT "CHK_7dc18d0d781dc2ce4ebeec7675" CHECK ((("dish_id" IS NOT NULL AND "product_id" IS NULL) OR ("dish_id" IS NULL AND "product_id" IS NOT NULL))), CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('CREATED', 'PAID', 'CANCELLED', 'DELETED', 'REFUNDED', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" SERIAL NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'CREATED', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "order_price" integer NOT NULL, "paid_with_cash" integer NOT NULL, "paid_with_card" integer NOT NULL, "refunded_with_cash" integer NOT NULL, "refunded_with_card" integer NOT NULL, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" ADD CONSTRAINT "FK_bf20bab52a792abc0d7928573da" FOREIGN KEY ("dish_id") REFERENCES "dish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" ADD CONSTRAINT "FK_1df4645c6a5d1424f7aba76acf8" FOREIGN KEY ("ingredient_id") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish" ADD CONSTRAINT "FK_99a7f8da03e95489210ec2c8ed8" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_1c8211d2f1e3a0e3548b1d8af1c" FOREIGN KEY ("dish_id") REFERENCES "dish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_e9674a6053adbaa1057848cddfa" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_e9674a6053adbaa1057848cddfa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_1c8211d2f1e3a0e3548b1d8af1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish" DROP CONSTRAINT "FK_99a7f8da03e95489210ec2c8ed8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" DROP CONSTRAINT "FK_1df4645c6a5d1424f7aba76acf8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish_ingredient" DROP CONSTRAINT "FK_bf20bab52a792abc0d7928573da"`,
    );
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "dish"`);
    await queryRunner.query(`DROP TABLE "dish_ingredient"`);
    await queryRunner.query(`DROP TABLE "ingredient"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}

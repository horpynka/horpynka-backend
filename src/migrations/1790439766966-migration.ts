import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1790439766966 implements MigrationInterface {
  name = 'Migration1790439766966';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ingredient" ADD "name" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingredient" ALTER COLUMN "name" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "name"`);
  }
}

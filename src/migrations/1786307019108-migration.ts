import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1786307019108 implements MigrationInterface {
  name = 'Migration1786307019108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category" ADD "name" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "name"`);
  }
}

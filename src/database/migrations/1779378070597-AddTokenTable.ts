import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokenTable1779378070597 implements MigrationInterface {
    name = 'AddTokenTable1779378070597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" ADD "email" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "email"`);
    }

}

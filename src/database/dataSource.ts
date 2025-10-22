/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { container } from 'tsyringe';
import { PostgresDialect, PostgresQueryInterface } from '@sequelize/postgres';
import { Sequelize } from '@sequelize/core';
import { SequelizeStorage, Umzug } from 'umzug';
import { GetVaultSecretService } from '../shared/vault/services/GetVaultSecret.service';
import fs from 'node:fs';
import path from 'node:path';
import { Logger } from '../shared/logger/winston';
import { CustomException } from '../shared/exceptions/CustomException';

const dbConnectionLogger = Logger.info({ file: 'src/database' });

let sequelize: Sequelize;

export const dataSourceConnect = async () => {
    const vault = container.resolve(GetVaultSecretService);

    const username = (await vault.getSecret('DB_USER')) as string;
    const password = (await vault.getSecret('DB_PASSWORD')) as string;
    const dbName = (await vault.getSecret('DB_NAME')) as string;
    const dbHost = (await vault.getSecret('DB_HOST')) as string;
    const dbPort = (await vault.getSecret('DB_PORT')) as number;

    sequelize = new Sequelize({
        dialect: PostgresDialect,
        user: username,
        database: dbName,
        host: dbHost,
        port: dbPort,
        password: password
    });

    await sequelize.authenticate({
        retry: { max: 3, timeout: 3000 }
    });

    return sequelize;
};

export const dbInitiate = async () => {
    try {
        const sqel = await dataSourceConnect();

        const migrations = fs
            .readdirSync(path.resolve('./src/database/migrations/'))
            .map((name) => {
                const migration = require(`../database/migrations/${name}`);
                return {
                    up: async (params: {
                        name: string;
                        context: PostgresQueryInterface;
                    }) => {
                        await migration.up(params.context, sqel);
                    },
                    down: async (params: {
                        name: string;
                        context: PostgresQueryInterface;
                    }) => await migration.down(params.context, sqel),
                    name
                };
            });

        const umzug = new Umzug({
            migrations,
            context: sqel.queryInterface as PostgresQueryInterface,
            storage: new SequelizeStorage({ sequelize: sqel }),
            logger: console
        });

        const executed = await umzug.executed();
        dbConnectionLogger.warn(`executed migration -> ${executed.length}`);

        const up = await umzug.up();
        dbConnectionLogger.warn(`up migrations -> ${up.length}`);
    } catch (error: unknown) {
        dbConnectionLogger.error(`Error -> ${String(error)}`);
        throw new CustomException(String(error));
    }
};

export async function disconnectConn() {
    await sequelize.close();
}

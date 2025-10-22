/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { container, singleton } from 'tsyringe';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import fs from 'node:fs';
import path from 'node:path';
import { Sequelize, Transaction, TransactionNestMode } from '@sequelize/core';
import { SequelizeStorage, Umzug } from 'umzug';
import { PostgresDialect, PostgresQueryInterface } from '@sequelize/postgres';
import { IDatabaseConnection } from '../interfaces/IDatabaseConnection';
import { IPostgresCredentials } from '../interfaces/IPostgresConnection';
import { IAny, isEmpty } from '../../shared/utils/helpers';
import { CustomException } from '../../shared/exceptions/CustomException';
import { Config } from '../../shared/config/Config';
import { Logger } from '../../shared/logger/winston';

const databaseTag = Logger.child({ file: 'DatabaseConnection' });

export type MutationCallback<T> = (transaction: Transaction) => Promise<T>;

@singleton()
export class DatabaseConnection implements IDatabaseConnection {
    private secretClient: SecretManagerServiceClient;
    private projectId: string;
    private secretName: string;
    private sequelize: Sequelize;

    initiateSecretManager = (): SecretManagerServiceClient => {
        const config = container.resolve<Config>(Config);

        const secretName = config.get<string>('DB_SECRET_NAME', '');
        console.log({ secretName });
        if (!secretName || isEmpty(secretName)) {
            throw new CustomException('Invalid configuration');
        }

        this.secretName = secretName;

        const encoded = config.get<string>('GOOGLE_SERVICE_ACCOUNT', '');
        console.log({ encoded });
        if (!encoded || isEmpty(encoded)) {
            throw new CustomException(
                'Service account is needed to initiate database connection'
            );
        }

        this.projectId = encoded;

        return new SecretManagerServiceClient({
            projectId: encoded
        });
    };

    /**
     * Retrieve secret from Google Cloud Secret Manager
     */
    async getSecret(secretVersionId: string = 'latest'): Promise<string> {
        try {
            this.secretClient = this.initiateSecretManager();
            console.log({ secretClient: this.secretClient });

            const name = this.secretClient.secretVersionPath(
                this.projectId,
                this.secretName,
                secretVersionId
            );
            console.log([name]);

            const [version] = await this.secretClient.accessSecretVersion({
                name: name
            });
            console.log({ version });

            // Extract the secret payload
            const secretPayload = version.payload?.data;
            console.log({ secretPayload });
            if (!secretPayload) {
                throw new CustomException('Secret payload is empty');
            }

            // Convert from Uint8Array to string
            const secret = Buffer.from(secretPayload as Uint8Array).toString(
                'utf8'
            );
            console.log({ secret });
            return secret;
        } catch (error) {
            console.error(`Error accessing secret ${this.secretName}:`, error);
            throw new CustomException(String(error));
        }
    }

    instance() {
        return this.sequelize;
    }

    /**
     * Parse PostgreSQL credentials from JSON secret
     */
    private parseCredentials(secretValue: string): IPostgresCredentials {
        try {
            const credentials: IAny = JSON.parse(secretValue);

            // Validate required fields
            const required = ['host', 'port', 'user', 'password', 'database'];
            for (const field of required) {
                if (!credentials[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            return {
                host: credentials.host,
                port: Number.parseInt(credentials.port, 10),
                user: credentials.user,
                password: credentials.password,
                database: credentials.database
            };
        } catch (error: unknown) {
            console.error('Error parsing credentials:', error);
            throw new CustomException(String(error));
        }
    }

    /**
     * Initialize PostgreSQL connection pool with credentials from Secret Manager
     */
    async initializePool(allowMigration: boolean): Promise<Sequelize> {
        try {
            // Retrieve secret
            const secretValue = await this.getSecret();
            console.log({ secretValue });

            // Parse credentials
            const credentials = this.parseCredentials(secretValue);
            console.log({ credentials });

            // Create connection pool
            this.sequelize = new Sequelize({
                dialect: PostgresDialect,
                user: credentials.user,
                database: credentials.database,
                host: credentials.host,
                port: credentials.port,
                password: credentials.password,
                idle_in_transaction_session_timeout: 10000,
                statement_timeout: 2000,
                pool: {
                    idle: 1000, //The maximum time, in milliseconds, that a connection can be idle before being released
                    max: 10,
                    // @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
                    acquire: 5000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
                    evict: 10000, // The time interval, in milliseconds, after which sequelize-pool will remove idle connections.
                    maxUses: 10 // The number of times to use a connection before closing and replacing it.  Default is Infinity
                },
                retry: {
                    match: [/SequelizeConnectionAcquireTimeoutError/i], // Retry on connection errors
                    max: 3, // Maximum retry 3 times
                    backoffBase: 3000, // Initial backoff duration in ms. Default: 100,
                    backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
                    timeout: 3000
                }
            });
            console.log({ sequelize: this.sequelize });
            console.log({ credentials });

            await this.sequelize.authenticate({
                retry: { max: 3, timeout: 100000 }
            });
            Logger.warn('Done authenticating?');

            if (allowMigration) {
                Logger.warn('Start migrating...');

                const migrations = fs
                    .readdirSync(path.resolve('./src/database/migrations/'))
                    .map((name) => {
                        const migration = require(`../migrations/${name}`);
                        return {
                            up: async (params: {
                                name: string;
                                context: PostgresQueryInterface;
                            }) => {
                                await migration.up(
                                    params.context,
                                    this.sequelize
                                );
                            },
                            down: async (params: {
                                name: string;
                                context: PostgresQueryInterface;
                            }) =>
                                await migration.down(
                                    params.context,
                                    this.sequelize
                                ),
                            name
                        };
                    });

                const umzug = new Umzug({
                    migrations,
                    context: this.sequelize
                        .queryInterface as PostgresQueryInterface,
                    storage: new SequelizeStorage({
                        sequelize: this.sequelize
                    }),
                    logger: console
                });

                const executed = await umzug.executed();
                Logger.warn(`executed migration -> ${executed.length}`);

                const up = await umzug.up();
                Logger.warn(`up migrations -> ${up.length}`);
            }

            return this.sequelize;
        } catch (error: unknown) {
            Logger.error('Failed to initialize connection pool:', error);
            throw new CustomException(String(error));
        }
    }

    executeTransaction = async <T>(
        fn: MutationCallback<T>
    ): Promise<{ error: boolean; message: string }> => {
        const executeTag = databaseTag.child({
            file: 'database::executeTransaction'
        });
        try {
            await this.sequelize.transaction(
                { nestMode: TransactionNestMode.reuse },
                fn
            );
            return { error: false, message: 'committed transaction' };
        } catch (error: unknown) {
            console.error({ executeTxn: error });
            executeTag.error(`Error -> ${String(error)}`);
            if (String(error).toLowerCase().includes('@sequelize/core')) {
                return {
                    error: true,
                    message: 'Unable to complete this operation'
                };
            }
            return { error: true, message: String(error) };
        }
    };

    dropAllTables = async () => {
        await this.sequelize.truncate({ cascade: true });
    };
}

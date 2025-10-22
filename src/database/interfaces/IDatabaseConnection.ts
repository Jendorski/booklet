import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { MutationCallback } from '../services/DatabaseConnection';
import Sequelize from '@sequelize/core';

export interface IDatabaseConnection {
    initiateSecretManager(): SecretManagerServiceClient;
    executeTransaction<T>(
        fn: MutationCallback<T>
    ): Promise<{ error: boolean; message: string }>;

    dropAllTables(): Promise<void>;
    instance(): Sequelize;
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { container, singleton } from 'tsyringe';
import { IGetVaultSecretService } from '../interfaces/IGetVaultSecretService';
import { Config } from '../../config/Config';
import NodeVault from 'node-vault';
import { Logger } from '../../logger/winston';
import { IAny } from '../../utils/helpers';

const TAG = 'shared::services::vault::GetVaultSecret.service';

@singleton()
export class GetVaultSecretService implements IGetVaultSecretService {
    private readonly vault;
    private readonly PATH_PREFIX;

    constructor() {
        const config = container.resolve(Config);
        const appName = config.get<string>('APP_NAME');
        const env = config.get<string>('ENV');

        this.PATH_PREFIX = `secret/data/${appName}/${env}/`;

        this.vault = NodeVault({
            endpoint: config.get<string>('VAULT_ADDRESS'),
            token: config.get<string>('VAULT_TOKEN')
        });
    }

    async getSecret(key: string): Promise<IAny> {
        const logger = Logger.child({ file: `${TAG}::getSecret` });

        try {
            const result = await this.vault.read(this.PATH_PREFIX + key);

            const value = result?.data?.data;

            return typeof value.value === 'string'
                ? value.value
                : JSON.parse(value.value as string);
        } catch (error: unknown) {
            logger.error(`${TAG} => Error -> ${String(error)}`);
        }
    }
}

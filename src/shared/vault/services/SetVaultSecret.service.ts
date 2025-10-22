/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { container, singleton } from 'tsyringe';
import { ISetVaultSecretService } from '../interfaces/ISetVaultSecretService';
import { Config } from '../../config/Config';
import NodeVault from 'node-vault';
import { Logger } from '../../logger/winston';
import { IAny } from '../../utils/helpers';

const TAG = 'shared::services::vault::GetVaultSecret.service';

@singleton()
export class SetVaultSecretService implements ISetVaultSecretService {
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

    async setSecret(props: { key: string; value: IAny }): Promise<boolean> {
        const logger = Logger.child({ file: `${TAG}::setSecret` });

        try {
            const { key, value } = props;

            const result = await this.vault.write(this.PATH_PREFIX + key, {
                data: { value }
            });
            logger.info(`${TAG}::setSecret => ${JSON.stringify(result)}`);
            return true;
        } catch (err: unknown) {
            logger.error(
                'vault:services:SetVaultSecret.service',
                `Error -> ${String(err)}`
            );
            return false;
        }
    }

    vaultStatus(): Promise<IAny> {
        Logger.warn(`${TAG} => Vault status loading`);
        return this.vault.status();
    }
}

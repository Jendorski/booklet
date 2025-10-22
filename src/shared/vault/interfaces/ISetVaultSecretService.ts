import { IAny } from '../../utils/helpers';

export interface ISetVaultSecretService {
    setSecret: (props: { key: string; value: IAny }) => Promise<IAny>;

    vaultStatus: () => IAny;
}

export const VaultKeys = {
    JWT_SECRET: 'jwt_secret',
    JWT_REFRESH_SECRET: 'jwt_refresh_secret'
};

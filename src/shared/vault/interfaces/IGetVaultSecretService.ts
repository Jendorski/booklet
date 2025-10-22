export interface IGetVaultSecretService {
    getSecret: <T>(key: string) => Promise<T>;
}

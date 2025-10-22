/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { container, inject, singleton } from 'tsyringe';
import { Config } from '../config/Config';
import jwt from 'jsonwebtoken';
import jose from 'node-jose';
import { IJwtService, UserAuthToken } from './interface/IJwtService';
import { CacheComponents } from '../../cache/cacheComponents';
import { ICache } from '../../cache/interfaces/ICache';
import { TimeUnit } from '../utils/momentHelper';
import { Logger } from '../logger/winston';
import { IUser, UserStatus } from '../../database/models/User.model';
import { CachePrefix } from '../../cache/CachePrefix';
import { IAny, isEmpty, randomFixedInteger } from '../utils/helpers';
import { CustomException } from '../exceptions/CustomException';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as argon2 from 'argon2';

const TAG = 'shared:services::JWTService';

export interface IJWTkeyProps {
    kid: string;
    privateKey: string;
    publicKey: string;
}

interface IPasswordProps {
    passwordSalt: string;
}

@singleton()
export class JWTService implements IJwtService {
    private secretName: string;

    private projectId: string;

    private secretClient: SecretManagerServiceClient;

    constructor(
        @inject(CacheComponents.Cache) private readonly cache: ICache
    ) {}

    initiateSecretManager = (): SecretManagerServiceClient => {
        const config = container.resolve<Config>(Config);

        const secretName = config.get<string>('JWT_SECRET_NAME', '');
        if (!secretName || isEmpty(secretName)) {
            throw new CustomException('Invalid JWT configuration');
        }

        this.secretName = secretName;

        const encoded = config.get<string>('GOOGLE_SERVICE_ACCOUNT', '');
        if (!encoded || isEmpty(encoded)) {
            throw new CustomException(
                'Service account is needed to initiate database connection'
            );
        }

        const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

        const keyFile: { project_id: string } = JSON.parse(decoded);

        this.projectId = keyFile.project_id;

        return new SecretManagerServiceClient({
            projectId: keyFile.project_id
        });
    };

    initiatePasswordSecretManager = (): SecretManagerServiceClient => {
        const config = container.resolve<Config>(Config);

        const secretName = config.get<string>('PASSWORD_SECRET_NAME', '');
        if (!secretName || isEmpty(secretName)) {
            throw new CustomException('Invalid Pasword configuration');
        }

        this.secretName = secretName;

        const encoded = config.get<string>('GOOGLE_SERVICE_ACCOUNT', '');
        if (!encoded || isEmpty(encoded)) {
            throw new CustomException(
                'Service account is needed to initiate database connection'
            );
        }

        const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

        const keyFile: { project_id: string } = JSON.parse(decoded);

        this.projectId = keyFile.project_id;

        return new SecretManagerServiceClient({
            projectId: keyFile.project_id
        });
    };

    /**
     * Retrieve secret from Google Cloud Secret Manager
     */
    async getPasswordSecret(
        secretVersionId: string = 'latest'
    ): Promise<IPasswordProps> {
        try {
            const secretClient = this.initiatePasswordSecretManager();

            const name = secretClient.secretVersionPath(
                this.projectId,
                this.secretName,
                secretVersionId
            );

            const [version] = await secretClient.accessSecretVersion({
                name: name
            });

            // Extract the secret payload
            const secretPayload = version.payload?.data;
            if (!secretPayload) {
                throw new CustomException('Secret payload is empty');
            }

            // Convert from Uint8Array to string
            const secret = Buffer.from(secretPayload as Uint8Array).toString(
                'utf8'
            );
            const credentials: IAny = JSON.parse(secret);

            // Validate required fields
            const required = ['passwordSalt'];
            for (const field of required) {
                if (!credentials[field]) {
                    throw new Error(
                        `Missing required Password field: ${field}`
                    );
                }
            }

            return {
                passwordSalt: credentials.passwordSalt
            };
        } catch (error) {
            console.error(`Error accessing secret ${this.secretName}:`, error);
            throw new CustomException(String(error));
        }
    }

    async passwordHash(
        password: string
    ): Promise<{ isError: boolean; hash: string }> {
        const logger = Logger.child({ file: `${TAG}::passwordHash` });
        const { passwordSalt } = await this.getPasswordSecret();
        try {
            const rndm = randomFixedInteger(1);

            const hash = await argon2.hash(password, {
                secret: Buffer.from(passwordSalt),
                hashLength: rndm <= 4 ? 5 : rndm
            });

            return { isError: false, hash: hash.toString() };
        } catch (error: unknown) {
            logger.error(`Error occurred in hashing password ${String(error)}`);
            return { isError: true, hash: String(error) };
        }
    }

    async comparePasswordHash(
        hashed: string,
        plainPassword: string
    ): Promise<boolean> {
        const { passwordSalt } = await this.getPasswordSecret();
        const logger = Logger.child({ file: `${TAG}::comparePasswordHash` });
        try {
            const unhash: boolean = await argon2.verify(hashed, plainPassword, {
                secret: Buffer.from(passwordSalt)
            });
            return unhash;
        } catch (error: unknown) {
            logger.error(
                'utils:comparePasswordHash',
                `Error -> ${String(error)}`
            );
            return false;
        }
    }
    async genericHash(
        toHash: string
    ): Promise<{ isError: boolean; hash: string }> {
        const logger = Logger.child({ file: `${TAG}::genericHash` });
        try {
            const hash = await argon2.hash(toHash);
            return { isError: false, hash: hash.toString() };
        } catch (error: unknown) {
            logger.error(
                'utils:genericHash',
                `Error occurred in hashing generic info ${String(error)}`
            );
            return { isError: true, hash: String(error) };
        }
    }
    async compareGenericHash(hashed: string, plain: string): Promise<boolean> {
        const logger = Logger.child({ file: `${TAG}::compareGenericHash` });
        try {
            const unhash: boolean = await argon2.verify(hashed, plain);
            return unhash;
        } catch (error: unknown) {
            logger.error(
                'utils:compareGenericHash',
                `Error occurred in comparing generic hash -> ${String(error)}`
            );
            return false;
        }
    }

    /**
     * Retrieve secret from Google Cloud Secret Manager
     */
    async getSecret(secretVersionId: string = 'latest'): Promise<string> {
        try {
            this.secretClient = this.initiateSecretManager();

            const name = this.secretClient.secretVersionPath(
                this.projectId,
                this.secretName,
                secretVersionId
            );

            const [version] = await this.secretClient.accessSecretVersion({
                name: name
            });

            // Extract the secret payload
            const secretPayload = version.payload?.data;
            if (!secretPayload) {
                throw new CustomException('Secret payload is empty');
            }

            // Convert from Uint8Array to string
            const secret = Buffer.from(secretPayload as Uint8Array).toString(
                'utf8'
            );
            return secret;
        } catch (error) {
            console.error(`Error accessing secret ${this.secretName}:`, error);
            throw new CustomException(String(error));
        }
    }

    private parseCredentials(secretValue: string): IJWTkeyProps {
        try {
            const credentials: IAny = JSON.parse(secretValue);

            // Validate required fields
            const required = ['kid', 'privateKey', 'publicKey'];
            for (const field of required) {
                if (!credentials[field]) {
                    throw new Error(`Missing required JWT field: ${field}`);
                }
            }

            return {
                kid: credentials.kid,
                privateKey: credentials.privateKey,
                publicKey: credentials.publicKey
            };
        } catch (error: unknown) {
            console.error('Error parsing credentials:', error);
            throw new CustomException(String(error));
        }
    }

    jwtSign = async (props: {
        payload: UserAuthToken;
        validity: string | number;
        timeUnit?: TimeUnit;
    }): Promise<string | null> => {
        const logger = Logger.child({ file: `${TAG}::jwtSign` });
        try {
            const { payload, validity, timeUnit } = props;

            const jwtSecret: IJWTkeyProps = await this.getActiveJWTKeys();

            const expiresIn = timeUnit
                ? `${validity}${timeUnit}`
                : `${validity}`;

            return jwt.sign(payload, jwtSecret.privateKey, {
                algorithm: 'RS256',
                expiresIn
            });
        } catch (error: unknown) {
            logger.error(`${TAG}::jwtSign`, String(error));
            return null;
        }
    };
    jwtVerify = async (token: string): Promise<UserAuthToken | null> => {
        const logger = Logger.child({ file: `${TAG}::jwtVerify` });

        try {
            const jwtSecret: IJWTkeyProps = await this.getActiveJWTKeys();

            const auth = jwt.verify(
                token,
                jwtSecret.publicKey
            ) as UserAuthToken;
            logger.info(JSON.stringify(auth));
            return auth;
        } catch (error: unknown) {
            logger.error(String(error));
            return null;
        }
    };
    jwtPayload(user: Partial<IUser>): UserAuthToken {
        return {
            userUUID: user.uuid as unknown as string,
            status: user.status as UserStatus
        };
    }
    getActiveJWTKeys = async (): Promise<IJWTkeyProps> => {
        const cachedKeys = await this.cache.get<IJWTkeyProps>(
            CachePrefix.JWT_KEYS
        );
        if (cachedKeys) return cachedKeys;

        const fromVault = await this.getSecret();
        if (!fromVault) {
            return await this.generateJWTSecret();
        }

        const creds = this.parseCredentials(fromVault);

        return creds;
    };
    async generateJWTSecret(): Promise<IJWTkeyProps> {
        const keyPairs = await this.generateKeyPair();
        const keyData = {
            kid: keyPairs.kid,
            publicKey: keyPairs.publicKey,
            privateKey: keyPairs.privateKey,
            data: JSON.stringify(keyPairs),
            active: true
        };

        void this.cache.set({
            key: CachePrefix.JWT_KEYS,
            value: keyData,
            expiryInSeconds: 8640000
        });

        return {
            kid: keyPairs.kid,
            privateKey: keyPairs.privateKey,
            publicKey: keyPairs.publicKey
        };
    }
    private async generateKeyPair() {
        const keyStore = jose.JWK.createKeyStore();
        const key = await keyStore.generate('RSA', 2048, {
            alg: 'RS256',
            use: 'sig'
        });
        const privateKeyPEM = key.toPEM(true);
        const publicKeyPEM = key.toPEM();
        return {
            privateKey: privateKeyPEM,
            publicKey: publicKeyPEM,
            kid: key.kid
        };
    }
}

import { container } from 'tsyringe';
import { Logger } from '../logger/winston';
import { Config } from '../config/Config';

const RequiredEnvs = [
    'PORT',
    'DB_SECRET_NAME',
    'ENV',
    'JWT_SECRET_NAME',
    'REDIS_HOST',
    'APP_NAME',
    'PASSWORD_SECRET_NAME',
    'GOOGLE_SERVICE_ACCOUNT'
];

const logger = Logger.child({ file: 'shared::utils::validateEnvs' });

export const ValidateEnvs = () => {
    const configService = container.resolve(Config);

    const errors = [];
    for (const element of RequiredEnvs) {
        const value = element;
        const err = configService.get(value);
        if (err === undefined) errors.push(value);
    }
    if (errors.length > 0) {
        logger.error(
            `${errors.length} Environmental Variable(s) are required... ${errors.join(', ')}`
        );
        process.exit(1);
    }
};

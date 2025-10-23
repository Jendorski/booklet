import { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { IStore } from './interfaces/IStore';
import { Config } from '../shared/config/Config';

const config = container.resolve(Config);
const host = config.get<string>('REDIS_HOST');
const port = config.get<number>('REDIS_PORT');
const env = config.get<string>('ENV');
const password = config.get<string>('REDIS_PASSWORD');
const isRemote = env === 'development' || env === 'production';

export const cacheConnection: IStore = new Redis({
    host,
    port,
    password,
    maxRetriesPerRequest: null,
    ...(isRemote && {
        username: 'default'
    })
}) as IStore;

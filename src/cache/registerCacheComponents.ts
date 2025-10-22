import { container } from 'tsyringe';
import { Cache } from './Cache';
import { CacheComponents } from './cacheComponents';
import { cacheConnection } from './cacheConnection';
import { ICache } from './interfaces/ICache';

export const registerCacheComponents = () => {
    container.register<ICache>(CacheComponents.Cache, {
        useValue: new Cache(cacheConnection)
    });
};

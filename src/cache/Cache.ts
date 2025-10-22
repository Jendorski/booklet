import { singleton } from 'tsyringe';
import { ICache } from './interfaces/ICache';
import { IStore } from './interfaces/IStore';

@singleton()
export class Cache implements ICache {
    constructor(private readonly store: IStore) {}

    async get<T>(key: string): Promise<T | null> {
        const v = await this.store.get(key);
        return v ? (JSON.parse(v) as T) : null;
    }

    async set<T>(props: { key: string; value: T; expiryInSeconds?: number }) {
        const { key, value, expiryInSeconds: expiry } = props;
        const stringValue = JSON.stringify(value);
        const others = expiry ? ['EX', expiry] : [];

        await this.store.set(
            key,
            ...[stringValue, ...(others as ['EX', number])]
        );
    }

    async expire(props: {
        key: string;
        expiryInSeconds: number;
        mode?: 'NX' | 'XX' | 'GT' | 'LT';
    }) {
        const { key, expiryInSeconds: expiry } = props;
        await this.store.expire(key, expiry);
    }

    async search<T, U>(props: {
        key: string;
        searchFn?: (params: U) => Promise<T>;
        searchParams?: U;
        expiryInSeconds?: number;
    }): Promise<T | null> {
        const { key, searchFn, searchParams, expiryInSeconds } = props;
        const cached = await this.store.get(key);

        if (cached) {
            return JSON.parse(cached) as T;
        }

        const value = searchFn ? await searchFn(searchParams as U) : null;

        if (value) {
            await this.set({ key, value, expiryInSeconds });
        }

        return value;
    }

    async delete(key: string): Promise<void> {
        await this.expire({ key, expiryInSeconds: -1 });
    }

    async push<T>(props: { key: string; value: T }): Promise<void> {
        const { key, value } = props;
        const stringValue = JSON.stringify(value);
        await this.store.lpush(key, stringValue);
    }

    pop<T>(props: { key: string; count?: number }): Promise<T[]> {
        const { key, count } = props;
        return this.store.lpop(key, count);
    }

    async lRange<T extends WeakKey>(props: {
        key: string;
        start: number;
        stop: number;
    }): Promise<T[]> {
        const { key, start, stop } = props;
        const cachedInfo: string[] = await this.store.lrange(key, start, stop);
        return cachedInfo.map((v: string) => JSON.parse(v) as T);
    }

    async lLen(key: string): Promise<number> {
        return this.store.llen(key);
    }

    async lRem<T>(props: { key: string; element: T }): Promise<number> {
        const { key, element } = props;
        return this.store.lrem(key, 0, JSON.stringify(element));
    }

    ttl(key: string): Promise<number> {
        return this.store.ttl(key);
    }

    async asyncDelete(key: string | string[]): Promise<number> {
        return this.store.unlink(key);
    }
}

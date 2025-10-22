export interface ICache {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(props: {
        key: string;
        value: T;
        expiryInSeconds?: number;
    }) => Promise<void>;
    expire: (props: {
        key: string;
        expiryInSeconds: number;
        //mode?: 'NX' | 'XX' | 'GT' | 'LT';
    }) => Promise<void>;
    search: <T, U>(props: {
        key: string;
        searchFn?: (params: U) => Promise<T>;
        searchParams?: U;
        expiryInSeconds?: number;
    }) => Promise<T | null>;
    delete: (key: string) => Promise<void>;
    push: <T>(props: { key: string; value: T }) => Promise<void>;
    pop: <T>(props: { key: string; count?: number }) => Promise<T[]>;
    lRange: <T extends WeakKey>(props: {
        key: string;
        start: number;
        stop: number;
    }) => Promise<T[]>;
    lLen: (key: string) => Promise<number>;
    lRem: <T>(props: { key: string; element: T }) => Promise<number>;
    ttl: (key: string) => Promise<number>;
    asyncDelete: (key: string | string[]) => Promise<number>;
}

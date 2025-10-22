export interface IStore {
    get: (key: string) => Promise<string | null>;
    set: <T>(
        key: string,
        value: T,
        secondsToken?: 'EX',
        expiry?: number
    ) => Promise<'OK'>;
    expire: (
        key: string,
        expiry: number
        //mode?: 'NX' | 'XX' | 'GT' | 'LT'
    ) => Promise<number>;
    lpush: <T>(key: string, value: T) => Promise<number>;
    lpop: <T>(key: string, count?: number) => Promise<T[]>;
    lrange: <T>(key: string, start: number, stop: number) => Promise<T[]>;
    llen: (key: string) => Promise<number>;
    lrem: <T>(key: string, count: number, element: T) => Promise<number>;
    ttl: (key: string) => Promise<number>;
    unlink: (key: string | string[]) => Promise<number>;
}

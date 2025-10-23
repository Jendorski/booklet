import { Logger } from '../logger/winston';

const TryWrapper = async <T>(
    f: (() => Promise<T>) | (() => T),
    loggerName?: string
) => {
    try {
        const data = await f();
        return data;
    } catch (e: unknown) {
        Logger.error(JSON.stringify(e));
        throw e;
    }
};

export default TryWrapper;

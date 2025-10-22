import { Cluster, Redis } from 'ioredis';
import { container } from 'tsyringe';
import { IStore } from './interfaces/IStore';
import { CustomException } from '../shared/exceptions/CustomException';
import httpStatus from 'http-status';
import { Logger } from '../shared/logger/winston';
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

export const flushAllMasters = async () => {
    const flushLog = Logger.child('cacheConnection::flushAllMasters');
    try {
        const cluster = cacheConnection as Cluster;
        const clusterInfo = await cluster.cluster('INFO');
        flushLog.info(`clusterInfo -> ${clusterInfo}`);

        if (!clusterInfo.includes('cluster_state:ok')) {
            flushLog.error(`clusterInfo is not okay!!! -> ${clusterInfo}`);
            throw new CustomException(
                `clusterInfo is not okay!!! -> ${clusterInfo}`
            );
        }

        const masterNodes = cluster.nodes('master');

        //Get all keys
        const keyCounts = masterNodes.map(async (node) => {
            return await node.dbsize();
        });

        const totalkeyCounts = await Promise.all(keyCounts);
        flushLog.info(`totalkeyCounts -> ${JSON.stringify(totalkeyCounts)}`);

        const total = totalkeyCounts.reduce((total, count) => total + count, 0);
        flushLog.info(`total -> ${total}`);

        const flushPromises = masterNodes.map(async (nodes: Redis) => {
            return await nodes.flushall();
        });

        const oks = await Promise.all(flushPromises);
        flushLog.info(`oks -> ${JSON.stringify(oks)}`);

        return true;
    } catch (error: unknown) {
        throw new CustomException(
            `Error -> ${String(error)}`,
            httpStatus.INTERNAL_SERVER_ERROR
        );
    }
};

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { singleton } from 'tsyringe';
import { IQueueService } from '../interfaces/IQueueService';
import {
    Job,
    BaseJobOptions,
    Queue,
    QueueEvents,
    ConnectionOptions,
    Worker
} from 'bullmq';
import { Logger } from '../../logger/winston';
import { cacheConnection } from '../../../cache/cacheConnection';
import { CustomException } from '../../exceptions/CustomException';

const TAG = 'services::bullMQ::QueueService';

const bullLogger = Logger.child({ file: TAG });

const defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000
    }
};

//Queue -> Worker (Worker does the actual job here)
@singleton()
export class QueueService implements IQueueService {
    create = <T>(props: {
        name: string;
        processor: (job: Job<T>) => Promise<void>;
        options?: BaseJobOptions & {
            delayInMs: number;
            maxJobs: number;
            noDelay?: boolean;
        };
        noDelay?: boolean;
    }): { queue: Queue<T>; queueEvents: QueueEvents } => {
        const { name, processor, options } = props;

        if (!name) {
            throw new CustomException(`${name} is not found`);
        }

        const queue = new Queue<T>(name, {
            connection: cacheConnection as ConnectionOptions,
            defaultJobOptions: { ...defaultJobOptions, ...options }
            //prefix: `{${name}}`
        });

        const worker = new Worker<T>(
            name,
            async (job: Job) => {
                Logger.info(JSON.stringify(job));
                await processor(job);
            },
            {
                connection: cacheConnection as ConnectionOptions,
                limiter: {
                    max: options?.maxJobs || 100,
                    duration: options?.delayInMs || 45
                }
            }
        );
        const queueEvents = new QueueEvents(name, {
            connection: cacheConnection as ConnectionOptions
        });

        worker.on('completed', ({ data, name, id }) => {
            void queue.remove(id as string);
            bullLogger.info(
                `QueueService.completed -> ${JSON.stringify({
                    data,
                    id,
                    name
                })}`
            );
        });
        worker.on('failed', (job, { message, stack }) => {
            bullLogger.error(
                `QueueService.failed -> ${JSON.stringify({
                    data: job?.data,
                    name: job?.name,
                    id: job?.id,
                    message,
                    stack
                })}`
            );
        });
        worker.on('error', ({ message, stack }) => {
            bullLogger.error(
                `QueueService.error -> ${JSON.stringify({
                    name: worker.name,
                    message,
                    stack
                })}`
            );
        });

        if (options?.noDelay === true) {
            worker
                .startStalledCheckTimer()
                .then(() => {
                    bullLogger.info('You were called?');
                })
                .catch((error: unknown) =>
                    bullLogger.error(`Error -> ${JSON.stringify(error)}`)
                );
        }

        return { queue, queueEvents };
    };

    // private readonly handleQueueProcessing = async (
    //     type: JOB_NAMES,
    //     data: IQueueProps
    // ) => {
    //     bullLogger.info(
    //         `New Event Received ==> ${JSON.stringify({ type, data })}`
    //     );

    //     if (!Object.keys(JOB_NAMES).includes(type)) {
    //         bullLogger.error(`type is ${type}`);
    //     }

    //     if (type === JOB_NAMES.APARTMENT_CHECK_IN_PROCESSING) {
    //         // const { props } = data;
    //         // const { ipAddress, userId } = props;
    //         await this.cache.delete('');
    //     }

    //     if (type === JOB_NAMES.APARTMENT_CHECK_OUT_PROCESSING) {
    //         //
    //     }
    // };
}

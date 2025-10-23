import { BaseJobOptions, Job, Queue, QueueEvents } from 'bullmq';
export interface IQueueService {
    create<T>(props: {
        name: string;
        processor: (job: Job<T>) => Promise<void>;
        options?: BaseJobOptions;
        noDelay?: boolean;
    }): { queue: Queue<T>; queueEvents: QueueEvents };
}

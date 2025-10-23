import { BaseJobOptions, Job, Queue, QueueEvents } from 'bullmq';
import { JOB_NAMES } from '../types';
import { IAny } from '../../utils/helpers';
export interface IQueueProps {
    type: JOB_NAMES;
    props: Record<string, IAny>;
}
export interface IQueueService {
    create<T>(props: {
        name: string;
        processor: (job: Job<T>) => Promise<void>;
        options?: BaseJobOptions;
        noDelay?: boolean;
    }): { queue: Queue<T>; queueEvents: QueueEvents };
}

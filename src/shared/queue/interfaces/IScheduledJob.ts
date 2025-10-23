export interface IScheduledJob {
    name: string;
    schedule: string;
    func: (...args: unknown[]) => unknown;
    args?: unknown[];
}

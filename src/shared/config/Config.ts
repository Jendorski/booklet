import { singleton } from 'tsyringe';
import { IConfig } from './IConfig';
import * as dotenv from 'dotenv';

dotenv.config();
@singleton()
export class Config implements IConfig {
    private readonly config: Record<string, string>;

    constructor() {
        this.config = process.env as Record<string, string>;
    }

    get<T = unknown>(propertyPath: string, defaultValue?: T): T | undefined {
        const value = this.config[propertyPath] as T;
        return value || defaultValue;
    }
}

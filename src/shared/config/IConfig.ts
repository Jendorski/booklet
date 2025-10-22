export interface IConfig {
    get<T = unknown>(propertyPath: string, defaultValue?: T): T | undefined;
}

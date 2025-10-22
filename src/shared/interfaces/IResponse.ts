export interface IResponse<T> {
    status: ResponseStatus;
    message?: string;
    data: T;
}

export enum ResponseStatus {
    SUCCESS = 'success',
    ERROR = 'error'
}

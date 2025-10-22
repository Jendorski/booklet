import { IResponse, ResponseStatus } from '../interfaces/IResponse';

export class ResponseDTO<T = null> implements IResponse<T> {
    data: T;

    message: string | undefined;

    status: ResponseStatus;

    constructor(status: ResponseStatus, message?: string, data?: T) {
        this.status = status;
        this.message = message;
        this.data = (data ?? null) as T;
    }

    static success<T>({
        message,
        data = null
    }: { message?: string; data?: T | null } = {}): ResponseDTO<T | null> {
        return {
            status: ResponseStatus.SUCCESS,
            message,
            data
        };
    }
}

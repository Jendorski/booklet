import HttpStatus from 'http-status';
import { Logger } from '../logger/winston';

const TAG = 'CustomException';

export class CustomException extends Error {
    status: number;

    message: string;

    fields?: unknown;

    constructor(message: string, status?: number, fields?: unknown[]) {
        super(message);
        this.status = status || HttpStatus.EXPECTATION_FAILED;
        this.message = message;
        this.fields = fields;
        Logger.error(
            `${TAG} => ${JSON.stringify({ message, status, fields })}`
        );
    }
}

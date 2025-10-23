import { NextFunction, Request, Response } from 'express';
import { ResponseStatus } from '../interfaces/IResponse';
import { CustomException } from '../exceptions/CustomException';
import httpStatus from 'http-status';
import { ICustomException } from '../interfaces/ICustomException';
import { Logger } from '../logger/winston';

export function errorMiddlewareFn() {
    return function errorMiddleWare(
        error: ICustomException,
        req: Request,
        res: Response,
        _: NextFunction
    ) {
        const {
            status = httpStatus.INTERNAL_SERVER_ERROR,
            fields = {},
            message = error instanceof CustomException
                ? error.message
                : 'Something went wrong'
        } = error;
        const { reqId } = req as unknown as { reqId: string };

        Logger.error('handler.unhandled', {
            message,
            stack: error.stack as unknown,
            fields,
            reqId
        });

        res.status(status).send({
            message,
            //stack: error.stack as unknown,
            status: ResponseStatus.ERROR,
            data: fields
        });
    };
}

export const handleBodyParserError = () => {
    return function errorParser(
        errE: Error,
        req: Request,
        _res: Express.Response,
        next: NextFunction
    ) {
        next(
            new CustomException(
                'Internal Server Error',
                httpStatus.INTERNAL_SERVER_ERROR,
                [{ error: JSON.stringify(errE) }]
            )
        );
    };
};

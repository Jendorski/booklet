import moment from 'moment';
import { Request } from 'express';
import morgan from 'morgan';
import { Logger } from './winston';

// Override the stream method by telling
// Morgan to use our custom logger instead of the
const stream = {
    // Use the http severity
    write: (message: string) => Logger.http(message)
};

morgan.token('ip', (req: Request) => req.ip);
morgan.token('headers', (request: Request) => JSON.stringify(request.headers));
morgan.token('body', (request: Request) => JSON.stringify(request.body));
morgan.token('timestamp', () => moment().format());
// Build the morgan middleware
const morganMiddleware = morgan(
    ':method :url :status :headers :body -- :response-time ms -- :ip',
    { stream }
);

export default morganMiddleware;

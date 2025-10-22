/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import 'winston-daily-rotate-file';
import winston from 'winston';

const levels = {
    error: 0,
    http: 1,
    warn: 2,
    info: 3,
    debug: 4
};

const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'info';
};

const colors = {
    error: 'red',
    warn: 'yellow',
    http: 'magenta',
    info: 'green',
    debug: 'white'
};

winston.addColors(colors);

const colorizer = winston.format.colorize({ all: true });

const logFormat = winston.format.printf((info) => {
    const { timestamp: ts, level, message, file: fg } = info;
    //const rest = info[SPLAT] || [];
    const msg = info.stack
        ? JSON.stringify(info?.stack) || '' //formatObjectToString(info?.stack || "") //
        : JSON.stringify(message); //formatObjectToString(message); //
    const result = colorizer.colorize(
        level,
        `${ts} [${level}]${fg ? `[${fg}]` : ''}: ${msg}`
        /**
     *${
      rest.length > 0 ? `\n${rest.map(formatObjectToString).join("\n")}` : ""
    }
     */
    );
    return result;
});

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    logFormat,
    winston.format.errors({ stack: true })
);

const transports = [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
        filename: 'logs/error.log',
        maxSize: '1m',
        maxFiles: '1d'
    }),
    new winston.transports.DailyRotateFile({
        level: 'http',
        filename: 'logs/request.log',
        maxSize: '1m',
        maxFiles: '1d'
    }),
    new winston.transports.DailyRotateFile({
        filename: 'logs/all.log',
        maxSize: '1m',
        maxFiles: '1d'
    })
];

const Logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
        new winston.transports.Console()
    ]
});

export { Logger };

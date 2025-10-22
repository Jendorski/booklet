import 'reflect-metadata';
import { ValidateEnvs } from './shared/utils/validateEnvs';
import { registerComponents } from './registerComponents';
import { Logger } from './shared/logger/winston';

ValidateEnvs();

registerComponents(true)
    .then((sql) => {
        //
        Logger.warn('We are getting there!');
    })
    .catch((err: Error) => {
        Logger.error(`registerComponents.failed -> ${JSON.stringify({ err })}`);
    });

process.on('uncaughtException', (err) => {
    Logger.warn('Uncaught Exception!! Shutting down process..');
    Logger.error(`err.stack -> ${JSON.stringify(err)}`);
    Logger.error(`err.stack -> ${JSON.stringify(err.stack)}`);
});

process.on('unhandledRejection', (err: unknown) => {
    Logger.warn(`Unhandled Rejection!! -> ${JSON.stringify(err)}`);
    // send alerts for system error/termination
    Logger.error(String(err));
});

process.on('SIGINT', () => {
    Logger.info(
        'Received SIGINT. Terminating Server. \n Press Control-D to exit.'
    );
    process.exit();
});

process.on('exit', (code) => {
    Logger.info('Server Terminated: ', code);
});

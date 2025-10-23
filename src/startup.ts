import 'reflect-metadata';
import { ValidateEnvs } from './shared/utils/validateEnvs';
import { registerComponents } from './registerComponents';
import { Logger } from './shared/logger/winston';
import { server } from '.';
import { container } from 'tsyringe';
import { Config } from './shared/config/Config';

const config = container.resolve(Config);
ValidateEnvs();

registerComponents(true)
    .then((sql) => {
        server.listen(config.get<number>('PORT', 8000), () => {
            Logger.info('server.running');
        });
    })
    .catch((err: unknown) => {
        console.log({ err });
        Logger.error(`registerComponents.failed -> ${JSON.stringify({ err })}`);
    });

process.on('uncaughtException', (err) => {
    Logger.warn('Uncaught Exception!! Shutting down process..');
    Logger.error(`err.stack -> ${JSON.stringify(err)}`);
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

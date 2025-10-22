import 'reflect-metadata';

import { registerSharedComponents } from './shared/registerSharedComponents';
import { registerCacheComponents } from './cache/registerCacheComponents';
import { registerComponents } from './registerComponents';
import { Logger } from './shared/logger/winston';

export function mochaGlobalSetup() {
    Logger.warn('mochaGlobalSetup');
    registerComponents(true)
        .then(() => {
            registerSharedComponents();
            registerCacheComponents();
        })
        .catch((err: Error) => {
            Logger.error(
                `registerComponents.failed -> ${JSON.stringify({ err })}`
            );
        });
}

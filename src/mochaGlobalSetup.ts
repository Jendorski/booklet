import 'reflect-metadata';

import { registerSharedComponents } from './shared/registerSharedComponents';
import { registerCacheComponents } from './cache/registerCacheComponents';
import { registerComponents } from './registerComponents';
import { Logger } from './shared/logger/winston';

export async function mochaGlobalSetup() {
    Logger.warn('mochaGlobalSetup');
    await registerComponents(true)
        .then(() => {
            registerSharedComponents();
            registerCacheComponents();
        })
        .catch((err: unknown) => {
            console.log({ err });
            Logger.error(
                `registerComponents.failed -> ${JSON.stringify({ err })}`
            );
        });
}

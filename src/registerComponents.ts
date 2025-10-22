import { registerCacheComponents } from './cache/registerCacheComponents';
import { registerDatabaseComponents } from './database/registerDatabaseComponents';
import { registerApartmentComponents } from './modules/apartment/registerApartmentComponents';
import { registerUserComponents } from './modules/user/registerUserComponents';
import { registerSharedComponents } from './shared/registerSharedComponents';

export const registerComponents = async (allowMigration: boolean) => {
    await registerDatabaseComponents(allowMigration);
    // .then(() => {
    //     Logger.info('Database connected');
    // })
    // .catch((err: unknown) => Logger.error(`Error -> ${String(err)}`));

    registerSharedComponents();
    registerCacheComponents();

    registerUserComponents();
    registerApartmentComponents();
};

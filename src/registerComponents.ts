import { registerCacheComponents } from './cache/registerCacheComponents';
import { registerDatabaseComponents } from './database/registerDatabaseComponents';
import { registerApartmentComponents } from './modules/apartment/registerApartmentComponents';
import { registerUserComponents } from './modules/user/registerUserComponents';
import { registerSharedComponents } from './shared/registerSharedComponents';
import { registerBookingComponents } from './modules/booking/registerBookingComponents';

export const registerComponents = async (allowMigration: boolean) => {
    await registerDatabaseComponents(allowMigration);

    registerSharedComponents();
    registerCacheComponents();

    registerUserComponents();
    registerApartmentComponents();
    registerBookingComponents();
};

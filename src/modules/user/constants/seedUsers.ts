import { IUser } from '../../../database/models/User.model';

export const seededHosts: Partial<IUser>[] = [
    {
        fullName: 'John Doe',
        email: 'john.doe@example.com'
    },
    {
        fullName: 'Alice Bob',
        email: 'alice.bob@example.com'
    },
    {
        fullName: 'David Growth',
        email: 'david.growth@example.com'
    },
    {
        fullName: 'Ebenezer Obey',
        email: 'ebenezer.obey@example.com'
    }
];

import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../interfaces/IBookingRepository';
import { QueryTypes } from '@sequelize/core';
import { DatabaseComponents } from '../../../database/constants/DatabaseComponents';
import { IDatabaseConnection } from '../../../database/interfaces/IDatabaseConnection';
import { CacheComponents } from '../../../cache/cacheComponents';
import { ICache } from '../../../cache/interfaces/ICache';
import { IBooking } from '../../../database/models/Booking.model';

@injectable()
export class BookingRepository implements IBookingRepository {
    constructor(
        @inject(DatabaseComponents.DatabaseConnection)
        private readonly dbConnect: IDatabaseConnection,
        @inject(CacheComponents.Cache) private readonly cache: ICache
    ) {}

    newBooking = async (
        payload: Partial<IBooking>
    ): Promise<Partial<IBooking>> => {
        await this.cache.delete('');
        throw new Error('Method not implemented.');
    };

    truncate = async (): Promise<void> => {
        const tableName = 'apartments';
        const sql = `DELETE FROM "${tableName}";`;

        await this.dbConnect.instance().query(sql, { type: QueryTypes.DELETE });
    };
}

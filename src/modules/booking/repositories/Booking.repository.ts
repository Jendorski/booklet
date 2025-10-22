import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../interfaces/IBookingRepository';
import { QueryTypes } from '@sequelize/core';
import { DatabaseComponents } from '../../../database/constants/DatabaseComponents';
import { IDatabaseConnection } from '../../../database/interfaces/IDatabaseConnection';
import { CacheComponents } from '../../../cache/cacheComponents';
import { ICache } from '../../../cache/interfaces/ICache';
import BookingModel, { IBooking } from '../../../database/models/Booking.model';
import { IAny, queryBuilder } from '../../../shared/utils/helpers';
import { CachePrefix } from '../../../cache/CachePrefix';

@injectable()
export class BookingRepository implements IBookingRepository {
    constructor(
        @inject(DatabaseComponents.DatabaseConnection)
        private readonly dbConnect: IDatabaseConnection,
        @inject(CacheComponents.Cache) private readonly cache: ICache
    ) {}

    retrieveOne = async (
        bookingUUID: string
    ): Promise<Partial<IBooking> | null> => {
        const cachedKey = `${CachePrefix.A_BOOKING}/${bookingUUID}`;

        const cached = await this.cache.get<Partial<IBooking>>(cachedKey);
        if (cached) return cached;

        const { query } = queryBuilder({ bookingUUID }, []);

        const sql = this.dbConnect.instance();
        const exists = await BookingModel(sql).findOne({
            where: query.where,
            raw: true
        });

        if (!exists) return null;

        void this.cache.set<Partial<IBooking>>({
            key: cachedKey,
            value: exists,
            expiryInSeconds: 12600
        });

        return exists;
    };
    findBookings(
        query: Record<string, IAny>
    ): Promise<{ total: number; bookings: Partial<IBooking>[] }> {
        throw new Error('Method not implemented.');
    }
    retrieveBookingsForAnApartment(
        apartmentUUID: string
    ): Promise<{ total: number; bookings: Partial<IBooking>[] }> {
        throw new Error('Method not implemented.');
    }

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

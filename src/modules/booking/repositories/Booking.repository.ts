import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../interfaces/IBookingRepository';
import { QueryTypes, Transaction } from '@sequelize/core';
import { DatabaseComponents } from '../../../database/constants/DatabaseComponents';
import { IDatabaseConnection } from '../../../database/interfaces/IDatabaseConnection';
import { CacheComponents } from '../../../cache/cacheComponents';
import { ICache } from '../../../cache/interfaces/ICache';
import BookingModel, {
    IBooking,
    IBookingsFilters,
    IBookingStatus
} from '../../../database/models/Booking.model';
import { cachePagination, queryBuilder } from '../../../shared/utils/helpers';
import { CachePrefix } from '../../../cache/CachePrefix';
import { CustomException } from '../../../shared/exceptions/CustomException';

@injectable()
export class BookingRepository implements IBookingRepository {
    constructor(
        @inject(DatabaseComponents.DatabaseConnection)
        private readonly dbConnect: IDatabaseConnection,
        @inject(CacheComponents.Cache) private readonly cache: ICache
    ) {}

    updateOne = async (props: {
        reference: string;
        update: Partial<IBooking>;
    }): Promise<void> => {
        const { reference, update } = props;

        const sql = this.dbConnect.instance();
        const booking = await BookingModel(sql).findOne({
            where: { reference }
        });
        if (!booking) return;

        const updatedBooking: Partial<IBooking> = {
            ...update
        };

        const updateProcess = async (transaction: Transaction) => {
            await BookingModel(sql).update(updatedBooking, {
                where: { reference, uuid: booking.uuid },
                transaction
            });
        };

        const resp = await this.dbConnect.executeTransaction(updateProcess);
        if (resp.error) {
            throw new CustomException(resp.message);
        }
    };

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
    findBookings = async (
        queryRecord: IBookingsFilters
    ): Promise<{ total: number; bookings: Partial<IBooking>[] }> => {
        const { query, offset, limit } = queryBuilder(queryRecord, []);

        const sql = this.dbConnect.instance();

        const records = await BookingModel(sql).findAll({
            where: query.where,
            offset,
            limit,
            raw: true
        });

        const count = await BookingModel(sql).count({
            where: query.where
        });

        return { total: count, bookings: records };
    };

    findBookingsForAnApartment = async (props: {
        apartmentUUID: string;
        page: number;
        limit: number;
    }): Promise<{ total: number; bookings: Partial<IBooking>[] }> => {
        const { query, offset, limit } = queryBuilder({ ...props }, []);

        const sql = this.dbConnect.instance();

        const records = await BookingModel(sql).findAll({
            where: query.where,
            offset,
            limit,
            raw: true
        });

        const count = await BookingModel(sql).count({
            where: query.where
        });

        return { total: count, bookings: records };
    };

    retrieveBookingsForAnApartment = async (props: {
        apartmentUUID: string;
        page: number;
        limit: number;
    }): Promise<{ total: number; bookings: Partial<IBooking>[] }> => {
        const { apartmentUUID, page, limit } = props;
        const cachedKey = `${CachePrefix.BOOKINGS_FOR_AN_APARTMENT}/${apartmentUUID}`;

        const total = await this.cache.lLen(cachedKey);

        if (total === 0) {
            const fromDB = await this.findBookingsForAnApartment({
                page,
                limit,
                apartmentUUID
            });

            void this.toCache({
                cachedKey,
                records: fromDB.bookings
            });

            return fromDB;
        } else {
            const { start, stop } = cachePagination({ page, limit });

            const cached = await this.cache.lRange<Partial<IBooking>>({
                key: cachedKey,
                start,
                stop
            });

            if (cached.length !== limit) {
                const fromDB = await this.findBookingsForAnApartment({
                    page,
                    limit,
                    apartmentUUID
                });
                void this.toCache({ cachedKey, records: fromDB.bookings });

                return fromDB;
            }

            return { total, bookings: cached };
        }
    };

    private readonly toCache = async (props: {
        cachedKey: string;
        records: Partial<IBooking>[];
    }) => {
        const { cachedKey, records } = props;

        for (const booking of records) {
            await this.cache.push<Partial<IBooking>>({
                key: cachedKey,
                value: booking
            });
        }
    };

    newBooking = async (payload: Partial<IBooking>): Promise<void> => {
        const newBooking: IBooking = {
            reference: payload.reference as string,
            apartmentUUID: payload.apartmentUUID as string,
            totalAmountPaid: payload.totalAmountPaid as number,
            checkOutDate: payload.checkOutDate as string,
            checkInDate: payload.checkInDate as string,
            cautionFee: payload.cautionFee as number,
            bookingDate: payload.bookingDate as string,
            status: payload.status as IBookingStatus,
            numberOfNights: payload.numberOfNights as number,
            guestUUID: payload.guestUUID as string,
            bookingCost: payload.bookingCost as number
        };

        const addProcess = async (transaction: Transaction) => {
            const sql = this.dbConnect.instance();

            await BookingModel(sql).create(newBooking, { transaction });
        };

        const resp = await this.dbConnect.executeTransaction(addProcess);
        if (resp.error) {
            throw new CustomException(resp.message);
        }
    };

    truncate = async (): Promise<void> => {
        const tableName = 'apartments';
        const sql = `DELETE FROM "${tableName}";`;

        await this.dbConnect.instance().query(sql, { type: QueryTypes.DELETE });
    };
}

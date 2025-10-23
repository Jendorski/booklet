/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { QueryTypes, Transaction } from '@sequelize/core';
import ApartmentModel, {
    IApartment,
    IApartmentAmenities,
    IApartmentStatus
} from '../../../database/models/Apartment.model';
import { IApartmentRepository } from '../interfaces/IApartmentRepository';
import { inject, injectable } from 'tsyringe';
import { DatabaseComponents } from '../../../database/constants/DatabaseComponents';
import { IDatabaseConnection } from '../../../database/interfaces/IDatabaseConnection';
import { CustomException } from '../../../shared/exceptions/CustomException';
import {
    cachePagination,
    IAny,
    queryBuilder
} from '../../../shared/utils/helpers';
import { CacheComponents } from '../../../cache/cacheComponents';
import { ICache } from '../../../cache/interfaces/ICache';
import { CachePrefix } from '../../../cache/CachePrefix';

@injectable()
export class ApartmentRepository implements IApartmentRepository {
    constructor(
        @inject(DatabaseComponents.DatabaseConnection)
        private readonly dbConnect: IDatabaseConnection,
        @inject(CacheComponents.Cache)
        private readonly cache: ICache
    ) {}

    updateOne = async (props: {
        apartmentUUID: string;
        update: Partial<IApartment>;
    }): Promise<void> => {
        const { apartmentUUID, update } = props;

        const apartment = await this.findOne({ uuid: apartmentUUID });
        if (!apartment) return;

        const updatedApartment: Partial<IApartment> = {
            ...update
        };

        const sql = this.dbConnect.instance();

        const updateProcess = async (transaction: Transaction) => {
            await ApartmentModel(sql).update(updatedApartment, {
                where: { uuid: apartmentUUID },
                transaction
            });
        };

        const resp = await this.dbConnect.executeTransaction(updateProcess);
        if (resp.error) {
            throw new CustomException(resp.message);
        }
    };

    retrieve = async (props: {
        page: number;
        limit: number;
        ipAddress: string;
        uuid?: string;
        hostUUID?: string;
        title?: string;
        description?: string;
        amenities?: IApartmentAmenities[];
    }): Promise<{ total: number; records: Partial<IApartment>[] }> => {
        const {
            page,
            limit,
            ipAddress,
            uuid,
            hostUUID,
            title,
            description,
            amenities
        } = props;
        const cachedKey = `${CachePrefix.RETRIEVED_APARTMENTS}/${ipAddress}`;

        const cachedLength = await this.cache.lLen(cachedKey);

        if (cachedLength === 0) {
            const fromDB = await this.find({
                page,
                limit,
                ipAddress,
                uuid,
                hostUUID,
                title,
                description,
                amenities
            });

            await this.toCache({ cachedKey, records: fromDB.records });

            return fromDB;
        } else {
            const { start, stop } = cachePagination({ page, limit });
            console.log({ hasCached: { start, stop } });

            const cached = await this.cache.lRange<Partial<IApartment>>({
                key: cachedKey,
                start,
                stop
            });
            console.log({ cached });

            if (cached.length !== limit) {
                const fromDB = await this.find({
                    page,
                    limit,
                    ipAddress,
                    uuid,
                    hostUUID,
                    title,
                    description,
                    amenities
                });
                await this.toCache({ cachedKey, records: fromDB.records });

                return fromDB;
            }

            return { total: cachedLength, records: cached };
        }
    };

    private readonly toCache = async (props: {
        cachedKey: string;
        records: Partial<IApartment>[];
    }) => {
        const { cachedKey, records } = props;

        for (const apartment of records) {
            await this.cache.push<Partial<IApartment>>({
                key: cachedKey,
                value: apartment
            });
        }
    };

    findOne = async (
        apartment: Partial<IApartment>
    ): Promise<Partial<IApartment> | null> => {
        const { uuid, hostName, hostUUID, title, description } = apartment;
        const cachedKey = `${CachePrefix.AN_APARTMENT}/${uuid}`;

        const cached = await this.cache.get<Partial<IApartment>>(cachedKey);
        if (cached) return cached;

        const { query } = queryBuilder({
            uuid,
            hostName,
            hostUUID,
            title,
            description
        });

        const exists = await ApartmentModel(this.dbConnect.instance()).findOne({
            where: query.where,
            raw: true,
            limit: 1
        });
        if (!exists) return null;

        void this.cache.set<Partial<IApartment>>({
            key: cachedKey,
            value: exists,
            expiryInSeconds: 12600
        });

        return exists;
    };
    count = async (apartment: Partial<IApartment>): Promise<number> => {
        const { uuid, hostName, hostUUID, title, description } = apartment;
        const { query } = queryBuilder(
            {
                uuid,
                hostName,
                hostUUID,
                title,
                description
            },
            [],
            false
        );
        return await ApartmentModel(this.dbConnect.instance()).count({
            where: query.where
        });
    };
    find = async (props: {
        page: number;
        limit: number;
        ipAddress: string;
        uuid?: string;
        hostUUID?: string;
        title?: string;
        description?: string;
        amenities?: IApartmentAmenities[];
    }): Promise<{ total: number; records: Partial<IApartment>[] }> => {
        const { limit } = props;

        const { query, offset } = queryBuilder({ ...props }, [], true);

        const sql = this.dbConnect.instance();

        const records = await ApartmentModel(sql).findAll({
            where: query.where,
            offset,
            limit,
            raw: true
        });

        const count = await ApartmentModel(sql).count({
            where: query.where
        });

        return { total: count, records };
    };

    add = async (props: {
        apartment: Partial<IApartment>;
    }): Promise<{ apartmentUUID: string }> => {
        const { apartment } = props;

        delete apartment.uuid;
        apartment['uuid'] = undefined;
        const create: IApartment = {
            hostName: apartment.hostName as string,
            hostUUID: apartment.hostUUID as string,
            amenities: apartment.amenities as IApartmentAmenities[],
            title: apartment.title as string,
            description: apartment.description as string,
            pricePerNight: apartment.pricePerNight as number,
            bathrooms: apartment.bathrooms as number,
            bedrooms: apartment.bedrooms as number,
            toilets: apartment.toilets as number,
            location: apartment.location as string,
            images: apartment.images as string[],
            cautionFee: apartment.cautionFee as number,
            status: apartment.status as IApartmentStatus
        };

        let aprt: IAny;
        const creationProcess = async (transaction: Transaction) => {
            aprt = await ApartmentModel(this.dbConnect.instance()).create(
                create,
                {
                    transaction,
                    isNewRecord: true
                }
            );
        };

        const resp = await this.dbConnect.executeTransaction(creationProcess);
        if (resp.error) {
            throw new CustomException(resp.message);
        }

        return { apartmentUUID: aprt.uuid as string };
    };

    truncate = async (): Promise<void> => {
        const tableName = 'apartments';
        const sql = `DELETE FROM "${tableName}";`;

        await this.dbConnect.instance().query(sql, { type: QueryTypes.DELETE });
    };
}

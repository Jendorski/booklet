/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Op, QueryTypes, sql, Transaction } from '@sequelize/core';
import ApartmentModel, {
    IApartment,
    IApartmentAmenities
} from '../../../database/models/Apartment.model';
import { IApartmentRepository } from '../interfaces/IApartmentRepository';
import { inject, injectable } from 'tsyringe';
import { DatabaseComponents } from '../../../database/constants/DatabaseComponents';
import { IDatabaseConnection } from '../../../database/interfaces/IDatabaseConnection';
import { CustomException } from '../../../shared/exceptions/CustomException';
import { queryBuilder } from '../../../shared/utils/helpers';
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

            void this.toCache({ cachedKey, records: fromDB.records });

            return fromDB;
        } else {
            const start = page === 1 ? page - 1 : limit * (page - 1);
            const stop = page === 1 ? limit - 1 : start + (limit - 1);

            const cached = await this.cache.lRange<Partial<IApartment>>({
                key: cachedKey,
                start,
                stop
            });

            if (cached.length === 0) {
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
                void this.toCache({ cachedKey, records: fromDB.records });

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
        const exists = await ApartmentModel(this.dbConnect.instance()).findOne({
            where: {
                [Op.or]: [
                    sql.where(sql.cast(sql.col('uuid'), 'TEXT'), {
                        [Op.iLike]: `%${uuid}%`
                    }),
                    sql.where(sql.cast(sql.col('hostUUID'), 'TEXT'), {
                        [Op.iLike]: `%${hostUUID}%`
                    }),
                    { hostName: { [Op.like]: `%${hostName}%` } },
                    { title: { [Op.like]: title } },
                    { description: { [Op.like]: `%${description}%` } }
                ]
            },
            raw: true
        });
        if (!exists) return null;

        const cachedKey = `${CachePrefix.AN_APARTMENT}/${exists.uuid}`;
        void this.cache.set<Partial<IApartment>>({
            key: cachedKey,
            value: exists,
            expiryInSeconds: 12600
        });

        return exists;
    };
    count = async (apartment: Partial<IApartment>): Promise<number> => {
        const { uuid, hostName, hostUUID, title, description } = apartment;
        return await ApartmentModel(this.dbConnect.instance()).count({
            where: {
                [Op.or]: [
                    sql.where(sql.cast(sql.col('uuid'), 'TEXT'), {
                        [Op.iLike]: `%${uuid}%`
                    }),
                    sql.where(sql.cast(sql.col('hostUUID'), 'TEXT'), {
                        [Op.iLike]: `%${hostUUID}%`
                    }),
                    { hostName: { [Op.like]: `%${hostName}%` } },
                    { title: { [Op.like]: title } },
                    { description: { [Op.like]: `%${description}%` } }
                ]
            }
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

        const records = await ApartmentModel(this.dbConnect.instance()).findAll(
            {
                where: query.where,
                offset,
                limit,
                raw: true
            }
        );

        const count = await ApartmentModel(this.dbConnect.instance()).count({
            where: query.where
        });

        return { total: count, records };
    };

    add = async (props: { apartment: Partial<IApartment> }): Promise<void> => {
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
            location: apartment.location as string
        };

        const creationProcess = async (transaction: Transaction) => {
            await ApartmentModel(this.dbConnect.instance()).create(create, {
                transaction,
                isNewRecord: true
            });
        };

        const resp = await this.dbConnect.executeTransaction(creationProcess);
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

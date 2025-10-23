import { Transaction } from '@sequelize/core';
import {
    IApartment,
    IApartmentAmenities,
    IApartmentFilters
} from '../../../database/models/Apartment.model';

export interface IApartmentRepository {
    add(props: {
        apartment: Partial<IApartment>;
        transaction?: Transaction;
    }): Promise<{ apartmentUUID: string }>;

    findOne(
        apartment: Partial<IApartment>
    ): Promise<Partial<IApartment> | null>;

    count(apartment: Partial<IApartment>): Promise<number>;

    find(props: {
        page: number;
        limit: number;
        ipAddress: string;
        uuid?: string;
        hostUUID?: string;
        title?: string;
        description?: string;
        amenities?: IApartmentAmenities[];
    }): Promise<{ total: number; records: Partial<IApartment>[] }>;

    retrieve(
        props: IApartmentFilters
    ): Promise<{ total: number; records: Partial<IApartment>[] }>;

    updateOne(props: {
        apartmentUUID: string;
        update: Partial<IApartment>;
    }): Promise<void>;

    truncate(): Promise<void>;
}

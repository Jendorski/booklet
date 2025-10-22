import { IAny } from './helpers';

export type QueryCursor = {
    limit: number;
    skip?: number;
    sort?: Record<string, IAny>;
};
export type QueryBuilder = {
    $or?: Record<string, IAny>[];
    $and?: Record<string, IAny>[];
};

export interface BaseQueryBuilder extends Record<string, IAny> {
    page?: number;
    limit?: number;
}

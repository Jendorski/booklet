import { IPaginatedDataResponse } from '../interfaces/IPaginatedData';

export class PaginatedDataDTO<T> implements IPaginatedDataResponse<T> {
    data: T[];

    page: number;

    limit: number;

    first: boolean;

    last: boolean;

    total: number;

    pages: number;

    constructor(props: {
        data: T[];
        page: number;
        limit: number;
        total: number;
    }) {
        this.page = props.page;
        this.limit = props.limit;
        this.total = props.total;
        this.pages = Math.ceil(props.total / props.limit);
        this.first = this.page === 1;
        this.last = this.page === this.pages;
        this.data = props.data;
    }
}

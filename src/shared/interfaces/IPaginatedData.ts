export interface IPaginatedDataRequest {
    q?: string;
    page: number;
    limit: number;
}

export interface IPaginatedDataResponse<T> {
    data: T[];
    page: number;
    limit: number;
    first: boolean;
    last: boolean;
    total: number;
    pages: number;
}

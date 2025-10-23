export interface ICustomException extends Error {
    status: number;
    message: string;
    fields?: unknown;
}

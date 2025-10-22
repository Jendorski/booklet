import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { ValidateError } from 'tsoa';

function formatValidationErrors(
    errors: ValidationError[]
): Record<string, { message: string; value: string }> {
    const fieldsErrors: Record<string, { message: string; value: string }> = {};
    errors.forEach((error) => {
        if (error.constraints) {
            fieldsErrors[error.property] = {
                message: Object.values(error.constraints).join(', '),
                value: error.value as string
            };
        }

        if (error.children) {
            error.children.forEach((errorNested) => {
                if (errorNested.constraints) {
                    fieldsErrors[errorNested.property] = {
                        message: Object.values(errorNested.constraints).join(
                            ', '
                        ),
                        value: errorNested.value as string
                    };
                }
            });
        }
    });

    return fieldsErrors;
}

export function validatePayload<T extends object>({
    targetClass,
    section
}: {
    section: 'query' | 'params' | 'body';
    targetClass: ClassConstructor<T>;
}) {
    return (req: Request, _: Response, next: NextFunction) => {
        try {
            const instance = plainToInstance(targetClass, req[section]);
            const errors = validateSync(instance, {
                forbidUnknownValues: true,
                validationError: { target: false }
            });
            if (errors.length) {
                const fieldsErrors = formatValidationErrors(errors);

                next(new ValidateError(fieldsErrors, 'Validation failed'));
                return;
            }
            next();
        } catch (error) {
            next(error);
        }
    };
}

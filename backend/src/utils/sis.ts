export const descriptor = {
    code: String,
    description: String,
    formalDescription: String,
    active: Boolean,
    fromDate: Date,
    toDate: Date,
}

export const identifier = {
    type: { type: String },
    id: String,
    primary: Boolean,
    disclose: Boolean,
    fromDate: Date,
    toDate: Date
}

export interface SISResponse<T> {
    apiResponse: {
        correlationId?: string;
        httpStatus: {
            code?: string;
            description?: string;
        };
        response: {
            [key: string]: T[];
        };
    };
}
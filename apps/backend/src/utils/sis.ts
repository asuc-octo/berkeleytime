export const descriptor = {
  code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  formalDescription: String,
  active: Boolean,
  fromDate: Date,
  toDate: Date,
};

export const identifier = {
  type: { type: String },
  id: String,
  primary: Boolean,
  disclose: Boolean,
  fromDate: Date,
  toDate: Date,
};

export interface SISResponse<V> {
  apiResponse: {
    correlationId?: string;
    httpStatus: {
      code?: string;
      description?: string;
    };
    response: Record<string, V[]>;
  };
}
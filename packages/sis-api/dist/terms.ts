/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

type UtilRequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type TermResponse = UtilRequiredKeys<ApiResponse, "httpStatus"> & {
  responseType?: string;
  response: {
    terms?: Term[];
  };
};

export interface ApiResponse {
  source?: string;
  /** @pattern [a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12} */
  correlationId?: string;
  /** @format date */
  timeStamp?: string;
  cursor?: Cursor;
  httpStatus: Descriptor;
  message?: Descriptor;
  /** @format uri */
  helpResource?: string;
}

export interface Cursor {
  previous?: string;
  next?: string;
}

export interface Descriptor {
  code?: string;
  description?: string;
  formalDescription?: string;
  active?: boolean;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface Session {
  temporalPosition?: string;
  id?: string;
  name: string;
  /** @format date */
  beginDate?: string;
  /** @format date */
  endDate?: string;
  weeksOfInstruction?: number;
  holidaySchedule?: Descriptor;
  /** @format date */
  censusDate?: string;
  /** @format date */
  sixtyPercentPoint?: string;
  /** @format date */
  openEnrollmentDate?: string;
  /** @format date */
  enrollBeginDate?: string;
  /** @format date */
  enrollEndDate?: string;
  /** @format date */
  waitListEndDate?: string;
  /** @format date */
  fullyEnrolledDeadline?: string;
  /** @format date */
  dropDeletedFromRecordDeadline?: string;
  /** @format date */
  dropRetainedOnRecordDeadline?: string;
  /** @format date */
  dropWithPenaltyDeadline?: string;
  /** @format date */
  cancelDeadline?: string;
  /** @format date */
  withdrawNoPenaltyDeadline?: string;
  /** @format date */
  withdrawWithPenaltyDeadline?: string;
  /** @format date */
  selfServicePlanBeginDate?: string;
  /** @format date */
  selfServicePlanEndDate?: string;
  timePeriods?: TimePeriod[];
}

export interface Term {
  academicCareer?: Descriptor;
  temporalPosition?: string;
  id?: string;
  name: string;
  category?: Descriptor;
  academicYear?: string;
  /** @format date */
  beginDate?: string;
  /** @format date */
  endDate?: string;
  weeksOfInstruction?: number;
  holidaySchedule?: Descriptor;
  /** @format date */
  censusDate?: string;
  /** @format date */
  fullyEnrolledDeadline?: string;
  /** @format date */
  fullyGradedDeadline?: string;
  /** @format date */
  cancelDeadline?: string;
  /** @format date */
  withdrawNoPenaltyDeadline?: string;
  /** @format date */
  withdrawWithPenaltyDeadline?: string;
  /** @format date */
  degreeConferDate?: string;
  /** @format date */
  selfServicePlanBeginDate?: string;
  /** @format date */
  selfServicePlanEndDate?: string;
  /** @format date */
  selfServiceEnrollBeginDate?: string;
  /** @format date */
  selfServiceEnrollEndDate?: string;
  sessions?: Session[];
}

export interface TimePeriod {
  period: Descriptor;
  /** @format date */
  endDate: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "https://gateway.api.berkeley.edu/uat/sis";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key]
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key)
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      }
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Term API
 * @version 2.0
 * @baseUrl https://gateway.api.berkeley.edu/uat/sis
 *
 * ### Get information about academic terms and sessions.
 *
 * The interactive docs below allow you to test parameter usage and see how both requests and return payloads are formatted using the **"Try it out"** feature.
 *
 * *This feature runs against the UAT version of the API and the QAT version of the source SIS database. Remember to remove "/uat" from the URL to run your client against the production version.*
 */
export class TermsAPI<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  v2 = {
    /**
     * @description Given a term ID, returns all information about that academic term and all associated academic sessions, in the format of the Term EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu)
     *
     * @tags term
     * @name GetByTermIdUsingGet
     * @summary Get term data by ID
     * @request GET:/v2/terms/{term-id}
     */
    getByTermIdUsingGet: (
      termId: string,
      query?: {
        /** The unique code identifying the academic career (terms for all academic careers returned if not specified) */
        "career-code"?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<TermResponse, ApiResponse | void>({
        path: `/v2/terms/${termId}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Given any of the following parameters, returns all information about matching academic terms and their associated academic sessions, in the format of the Term EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu)
     *
     * @tags term
     * @name GetByTermsUsingGet
     * @summary Get term data by query parameters
     * @request GET:/v2/terms
     */
    getByTermsUsingGet: (
      query?: {
        /** The unique code identifying the academic career (returns terms for all academic careers if not specified) */
        "career-code"?: string;
        /** The term's specific position in time as of the specified date (returns "Current" term on that date if no position is specified) */
        "temporal-position"?: "" | "Previous" | "Current" | "Next";
        /**
         * A date (in yyyy-mm-dd format) on which the term would be considered to be in the specified temporal position (uses the system date if not specified)
         * @format date
         */
        "as-of-date"?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<TermResponse, ApiResponse | void>({
        path: `/v2/terms`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}

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

/** Only included as a wrapper to "apiResponse" in JSON responses */
export interface CoursesPayload {
  apiResponse?: CoursesResponse;
}

export type CoursesResponse = ApiResponse & {
  responseType?: string;
  response: {
    courses: Course[];
  };
};

/** Only included as a wrapper to "apiResponse" in JSON responses */
export interface ErrorPayload {
  apiResponse?: ApiResponse;
}

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

export interface CatalogNumber {
  prefix?: string;
  number: string;
  suffix?: string;
  formatted: string;
}

export interface Cip {
  code?: string;
  description?: string;
}

export interface Component {
  instructionMethod: Descriptor;
  primary: boolean;
  /** @format float */
  contactHours?: number;
  /** @format float */
  minContactHours: number;
  /** @format float */
  maxContactHours: number;
  /** @format float */
  workloadHours?: number;
  finalExam?: Descriptor;
  feesExist?: boolean;
}

export interface Course {
  identifiers: Identifier[];
  subjectArea: Descriptor;
  catalogNumber: CatalogNumber;
  classSubjectArea?: Descriptor;
  displayName?: string;
  classDisplayName?: string;
  formerDisplayName?: string;
  title?: string;
  transcriptTitle?: string;
  description?: string;
  academicCareer?: Descriptor;
  academicGroup?: Descriptor;
  academicOrganization?: Descriptor;
  departmentNicknames?: string;
  primaryInstructionMethod?: Descriptor;
  credit?: Credit;
  gradingBasis?: Descriptor;
  blindGrading?: boolean;
  status?: Descriptor;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
  /** @format date */
  createdDate?: string;
  /** @format date */
  updatedDate?: string;
  printInCatalog?: boolean;
  printInstructors?: boolean;
  anyFeesExist?: boolean;
  finalExam?: Descriptor;
  instructorAddConsentRequired?: boolean;
  instructorDropConsentRequired?: boolean;
  allowMultipleEnrollments?: boolean;
  spansMultipleTerms?: boolean;
  multipleTermNumber?: number;
  /** @format float */
  contactHours?: number;
  /** @format float */
  workloadHours?: number;
  enrollmentUnitLoadCalculator?: Descriptor;
  tie?: Tie;
  cip?: Cip;
  hegis?: Hegis;
  repeatability?: Repeatability;
  preparation?: Preparation;
  requisites?: Descriptor;
  creditRestriction?: CreditRestriction;
  courseObjectives?: string[];
  studentLearningOutcomes?: string[];
  proposedInstructors?: string[];
  formatsOffered?: FormatsOffered;
  crossListing?: CrossListing;
  classCrossListing?: CrossListing;
  requirementsFulfilled?: RequirementFulfilled[];
}

export interface Credit {
  type: string;
  value: CreditValue;
}

export interface CreditDiscrete {
  units: number[];
}

export interface CreditFixed {
  /** @format float */
  units: number;
}

export interface CreditRange {
  /** @format float */
  minUnits: number;
  /** @format float */
  maxUnits: number;
}

export interface CreditRestriction {
  restrictionText?: string;
  restrictionCourses?: CreditRestrictionCourse[];
}

export interface CreditRestrictionCourse {
  course: MinimalCourse;
  /** @format float */
  maxCreditPercentage: number;
}

export interface CreditValue {
  fixed?: CreditFixed;
  range?: CreditRange;
  discrete?: CreditDiscrete;
}

export interface CrossListing {
  count: number;
  courses: string[];
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

export interface Format {
  termsAllowed: TermName[];
  sessionType: string;
  description?: string;
  /** @format float */
  aggregateContactHours?: number;
  /** @format float */
  aggregateMinContactHours: number;
  /** @format float */
  aggregateMaxContactHours: number;
  /** @format float */
  minWorkloadHours: number;
  /** @format float */
  maxWorkloadHours: number;
  anyFeesExist?: boolean;
  finalExam?: Descriptor;
  components?: Component[];
}

export interface FormatsOffered {
  description?: string;
  formats: Format[];
  typicallyOffered?: TypicallyOffered;
  summerOnly?: boolean;
}

export interface Hegis {
  code?: string;
  description?: string;
}

export interface Identifier {
  type: string;
  id: string;
  primary?: boolean;
  disclose?: boolean;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface MinimalCourse {
  identifiers: Identifier[];
  subjectArea?: Descriptor;
  catalogNumber?: CatalogNumber;
  displayName: string;
}

export interface Preparation {
  recommendedText?: string;
  recommendedCourses?: MinimalCourse[];
  requiredText?: string;
  requiredCourses?: MinimalCourse[];
}

export interface Repeatability {
  repeatable: boolean;
  description?: string;
  /** @format float */
  maxCredit?: number;
  maxCount?: number;
}

export interface RequirementFulfilled {
  code?: string;
  description?: string;
}

export type TermName = string;

export interface Tie {
  code?: string;
  description?: string;
}

export interface TypicallyOffered {
  terms?: TermName[];
  comments?: string;
}

/** @format float */
export type Units = number;

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
 * @title Course API
 * @version 4.0
 * @baseUrl https://gateway.api.berkeley.edu/uat/sis
 *
 * ### Retrieves information about "canonical" courses as approved by the Academic Senate.
 *
 * The interactive docs below allow you to test parameter usage and see how both requests and return payloads are formatted using the **"Try it out"** feature.
 *
 * *This feature runs against the UAT version of the API and the QAT version of the source SIS database. Remember to remove "/uat" from the URL to run your client against the production version.*
 *
 * (Please note, XML responses do *NOT* include the outermost "payload" node shown in this documentation; "apiResponse" is the outermost node. The "payload" node exists, unnamed, *only* in JSON responses.)
 */
export class CoursesAPI<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  v4 = {
    /**
     * @description Returns course data conforming to the Course EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu)
     *
     * @tags v4
     * @name FindCourseCollectionUsingGet
     * @summary Get course data
     * @request GET:/v4/courses
     */
    findCourseCollectionUsingGet: (
      query?: {
        /** A code indicating a course's current state as regards its availability to be offered */
        "status-code"?: string;
        /** Either a specific code representing an area of academic inquiry covered in the course, e.g., "MATH" -- or a string pattern preceded and/or followed by "%" wildcards, which will match against both the "subjectArea.code" and the "departmentNicknames" (e.g. "%ENGIN%" will return all courses with a subjectArea.code or a departmentNickname that includes the string "ENGIN") */
        "subject-area-code"?: string;
        /** The entire human-readable number for a course, e.g. "C123AC" -- must be an exact match */
        "catalog-number"?: string;
        /** The alpha character/s preceding the numeric portion of the catalog number, e.g. the first "C" in "C123AC" */
        "course-prefix"?: string;
        /** The numeric portion of the catalog number, e.g. "123" in "C123AC" */
        "course-number"?: string;
        /** The high level grouping of academic policy within UC Berkeley, e.g., "UGRD" */
        "academic-career-code"?: string;
        /** An approved unit value for the course (if discrete or a range of values are allowed, this value must be within them) */
        units?: string;
        /** Return only courses offered exclusively during the summer term (defaults to false) */
        "summer-only"?: string;
        /** A code indicating the method of recording performance in the course */
        "grading-basis-code"?: string;
        /** A code indicating a University, Campus, or General Education academic requirement fulfilled when the course is successfully completed */
        "requirement-fulfilled-code"?: string;
        /**
         * Return only courses updated since this date (inclusive) – must be in the format "YYYY-MM-DD", e.g., "2021-04-17"
         * @pattern ^[0-9]{4}-[0-9]{2}-[0-9]{2}
         */
        "last-updated-since"?: string;
        /**
         * Sort the list of courses returned by this element. Valid values are "subject-area-code," "last-updated," and "catalog-number"
         * @default "last-updated"
         */
        "sort-by"?: "subject-area-code" | "last-updated" | "catalog-number";
        /**
         * The set of records to return; can be used to traverse paginated data sets.
         * @default 1
         */
        "page-number"?: number;
        /**
         * The number of records returned in one paginated data set. Maximum is 100
         * @max 100
         * @default 50
         */
        "page-size"?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<CoursesPayload, void>({
        path: `/v4/courses`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Given an ID, returns course data conforming to the Course EDO described on http://bMeta.berkeley.edu
     *
     * @tags v4
     * @name FindCourseByIdUsingGet
     * @summary Get course data by unique ID
     * @request GET:/v4/courses/{id}
     */
    findCourseByIdUsingGet: (
      id: string,
      query?: {
        /** The type of ID being submitted (if left blank, "displayName" is assumed) */
        "id-type"?:
          | ""
          | "cms-id"
          | "cs-course-id"
          | "cms-version-independent-id";
        /** A code indicating a course's current state as regards its availability to be offered */
        "status-code"?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<CoursesPayload, void | ErrorPayload>({
        path: `/v4/courses/${id}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}

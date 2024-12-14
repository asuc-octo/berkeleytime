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

/** Only included as a wrapper to "apiResponse" in JSON responses */
export interface ClassPayload {
  apiResponse?: ClassResponse;
}

export type ClassResponse = UtilRequiredKeys<ApiResponse, "httpStatus"> & {
  responseType?: string;
  response: {
    classes?: Class[];
  };
};

/** Only included as a wrapper to "apiResponse" in JSON responses */
export interface ClassSectionPayload {
  apiResponse?: ClassSectionResponse;
}

export type ClassSectionResponse = UtilRequiredKeys<
  ApiResponse,
  "httpStatus"
> & {
  responseType?: string;
  response: {
    classSections?: ClassSection[];
  };
};

/** Only included as a wrapper to "apiResponse" in JSON responses */
export interface ClassSectionEnrollmentPayload {
  apiResponse?: ClassSectionEnrollmentResponse;
}

export type ClassSectionEnrollmentResponse = UtilRequiredKeys<
  ApiResponse,
  "httpStatus"
> & {
  responseType?: string;
  response: {
    classSections?: ClassSectionEnrollment[];
  };
};

/** Only included as a wrapper to "apiResponse" in JSON responses */
export interface DescriptorPayload {
  apiResponse?: DescriptorResponse;
}

export type DescriptorResponse = UtilRequiredKeys<ApiResponse, "httpStatus"> & {
  responseType?: string;
  response: {
    fieldValueLists?: FieldValueList[];
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
  /** @format dateTime */
  timeStamp?: string;
  cursor?: Cursor;
  httpStatus: Descriptor;
  message?: Descriptor;
  /** @format uri */
  helpResource?: string;
}

export interface Address {
  type?: Descriptor;
  address1?: string;
  address2?: string;
  address3?: string;
  address4?: string;
  num1?: string;
  num2?: string;
  addrField1?: string;
  addrField2?: string;
  addrField3?: string;
  house?: string;
  city?: string;
  county?: string;
  stateCode?: string;
  stateName?: string;
  postalCode?: string;
  /** @default "USA" */
  countryCode?: string;
  countryName?: string;
  formattedAddress?: string;
  /** @default false */
  primary?: boolean;
  /** @default false */
  disclose?: boolean;
  uiControl?: Descriptor;
  lastChangedBy?: Party;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface Affiliation {
  type: Descriptor;
  detail?: string;
  status?: Descriptor;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface AllowedUnits {
  /** @format float */
  minimum: number;
  /** @format float */
  maximum: number;
  /** @format float */
  forAcademicProgress?: number;
  /** @format float */
  forFinancialAid?: number;
}

export interface AssignedClassMaterials {
  status?: Descriptor;
  noneAssigned: boolean;
  instructions?: string;
  classMaterials?: ClassMaterial[];
}

export interface AssignedInstructor {
  assignmentNumber?: number;
  instructor: Person;
  role?: Descriptor;
  contactMinutes?: number;
  printInScheduleOfClasses?: boolean;
  gradeRosterAccess?: Descriptor;
}

export interface Association {
  primary: boolean;
  primaryAssociatedComponent?: Descriptor;
  primaryAssociatedSectionId?: number;
  primaryAssociatedSectionIds?: number[];
  associatedClass?: number;
}

export interface CatalogNumber {
  prefix?: string;
  number: string;
  suffix?: string;
  formatted: string;
}

export interface Class {
  course: Course;
  offeringNumber: number;
  session: Session;
  number: string;
  displayName: string;
  classTitle?: string;
  classTranscriptTitle?: string;
  classDescription?: string;
  primaryComponent?: Descriptor;
  allowedUnits?: AllowedUnits;
  gradingBasis?: Descriptor;
  requirementDesignation?: Descriptor;
  /** @format float */
  contactHours?: number;
  blindGrading?: boolean;
  assignedClassMaterials?: AssignedClassMaterials;
  instructionMode?: Descriptor;
  status?: Descriptor;
  /** @format date */
  lastCancelled?: string;
  anyPrintInScheduleOfClasses?: boolean;
  anyPrintInstructors?: boolean;
  anyFeesExist?: boolean;
  finalExam?: Descriptor;
  aggregateEnrollmentStatus?: ClassSectionEnrollmentStatus;
}

export interface ClassMaterial {
  sequenceNumber: number;
  type: Descriptor;
  status: Descriptor;
  title: string;
  author?: string;
  isbn?: string;
  yearPublished?: string;
  publisher?: string;
  edition?: string;
  price?: Price;
  notes?: string;
}

export interface ClassSection {
  id: number;
  class?: Class;
  number?: string;
  component?: Descriptor;
  displayName?: string;
  instructionMode?: Descriptor;
  type?: Descriptor;
  academicOrganization?: Descriptor;
  academicGroup?: Descriptor;
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string;
  status?: Descriptor;
  /** @format date */
  cancelledDate?: string;
  association?: Association;
  enrollmentStatus?: ClassSectionEnrollmentStatus;
  printInScheduleOfClasses?: boolean;
  addConsentRequired?: Descriptor;
  dropConsentRequired?: Descriptor;
  graded?: boolean;
  feesExist?: boolean;
  characteristics?: Descriptor[];
  roomShare?: boolean;
  sectionAttributes?: SectionAttribute[];
  roomCharacteristics?: Quantity[];
  meetings?: Meeting[];
  exams?: Exam[];
  combination?: Combination;
}

export interface ClassSectionEnrollment {
  id: number;
  enrollmentStatus?: ClassSectionEnrollmentStatus;
}

export interface ClassSectionEnrollmentStatus {
  status: Descriptor;
  enrolledCount?: number;
  reservedCount?: number;
  waitlistedCount?: number;
  minEnroll?: number;
  maxEnroll?: number;
  maxWaitlist?: number;
  openReserved?: number;
  instructorAddConsentRequired?: boolean;
  instructorDropConsentRequired?: boolean;
  seatReservations?: SeatReservation[];
}

export interface Combination {
  id: string;
  description?: string;
  type?: Descriptor;
  enrolledCountCombinedSections?: number;
  waitlistedCountCombinedSections?: number;
  maxEnrollCombinedSections?: number;
  maxWaitlistCombinedSections?: number;
  combinedSections?: number[];
}

export interface Component {
  instructionMethod: Descriptor;
  /** @default false */
  primary?: boolean;
  /** @format float */
  contactHours: number;
  /** @format float */
  minContactHours?: number;
  /** @format float */
  maxContactHours?: number;
  finalExam?: Descriptor;
  /** @default false */
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
  tIE?: Descriptor;
  cIP?: Descriptor;
  hEGIS?: Descriptor;
  repeatability?: Repeatability;
  preparation?: Preparation;
  requisites?: Descriptor;
  creditRestriction?: CreditRestriction;
  gradeReplacement?: GradeReplacement;
  courseObjectives?: string[];
  studentLearningOutcomes?: string[];
  proposedInstructors?: string[];
  formatsOffered?: FormatsOffered;
  crossListing?: CrossListing;
  classCrossListing?: CrossListing;
  requirementsFulfilled?: Descriptor[];
}

export interface Credit {
  type: string;
  value: CreditValue;
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
  discrete?: number[];
  range?: CreditRange;
  /** @format float */
  units?: number;
}

export interface CrossListing {
  count: number;
  courses?: string[];
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

export interface Disability {
  status: Descriptor;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  disabledVet?: boolean;
}

export interface Education {
  highestLevel?: Descriptor;
  fullTimeStudent?: boolean;
}

export interface Email {
  type: Descriptor;
  /** @format email */
  emailAddress: string;
  primary?: boolean;
  disclose?: boolean;
  uiControl?: Descriptor;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface EmergencyContact {
  name: string;
  address?: Address;
  phones: Phone[];
  email?: string;
  relationship?: Descriptor;
  /** @default false */
  preferred?: boolean;
}

export interface Ethnicity {
  group: Descriptor;
  /** @default false */
  hispanicLatino?: boolean;
  detail?: Descriptor;
}

export interface Event {
  /** @format date */
  date?: string;
  /** @format date */
  time?: string;
  /** @format date */
  duration?: string;
  description?: string;
  locality?: string;
  stateCode?: string;
  countryCode?: string;
}

export interface Exam {
  number?: number;
  type: Descriptor;
  location?: Descriptor;
  building?: Descriptor;
  /** @format date */
  date: string;
  /** @format time */
  startTime: string;
  /** @format time */
  endTime: string;
}

export interface FieldValue {
  code?: string;
  description?: string;
  formalDescription?: string;
}

export interface FieldValueList {
  fieldName: string;
  fieldValues: Descriptor[];
}

export interface Format {
  termsAllowed?: string[];
  session?: string;
  description?: string;
  /** @format float */
  aggregateContactHours: number;
  /** @format float */
  aggregateMinContactHours: number;
  /** @format float */
  aggregateMaxContactHours: number;
  /** @format float */
  minWorkloadHours: number;
  /** @format float */
  maxWorkloadHours: number;
  /** @default false */
  anyFeesExist?: boolean;
  finalExam?: Descriptor;
  components?: Component[];
}

export interface FormatsOffered {
  description?: string;
  formats?: Format[];
  typicallyOffered?: TypicallyOffered;
  /** @default false */
  summerOnly?: boolean;
}

export interface Gender {
  genderOfRecord: Descriptor;
  discloseGenderOfRecord?: boolean;
  sexAtBirth?: Descriptor;
  discloseSexAtBirth?: boolean;
  genderIdentity?: Descriptor;
  discloseGenderIdentity?: boolean;
  sexualOrientation?: Descriptor;
  discloseSexualOrientation?: boolean;
  lastChangedBy?: Party;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface GradeReplacement {
  gradeReplacementGroup?: string;
  gradeReplacementText?: string;
  gradeReplacementCourses?: MinimalCourse[];
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

export interface Language {
  name: Descriptor;
  /** @default false */
  translate?: boolean;
  /** @default false */
  teach?: boolean;
  speakingProficiency?: Descriptor;
  readingProficiency?: Descriptor;
  writingProficiency?: Descriptor;
  /** @format date */
  evaluationDate?: string;
  /** @default false */
  native?: boolean;
}

export interface Meeting {
  number: number;
  meetsDays?: string;
  meetsMonday?: boolean;
  meetsTuesday?: boolean;
  meetsWednesday?: boolean;
  meetsThursday?: boolean;
  meetsFriday?: boolean;
  meetsSaturday?: boolean;
  meetsSunday?: boolean;
  /** @format time */
  startTime?: string;
  /** @format time */
  endTime?: string;
  location?: Descriptor;
  building?: Descriptor;
  assignedInstructors?: AssignedInstructor[];
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string;
  meetingTopic?: Descriptor;
  meetingDescription?: string;
}

export interface MinimalCourse {
  identifiers: Identifier[];
  subjectArea: Descriptor;
  catalogNumber: CatalogNumber;
  displayName?: string;
  title?: string;
  transcriptTitle?: string;
}

export interface Name {
  type?: Descriptor;
  familyName: string;
  givenName: string;
  middleName?: string;
  suffixName?: string;
  formattedName?: string;
  preferred?: boolean;
  disclose?: boolean;
  uiControl?: Descriptor;
  lastChangedBy?: Party;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface OfficialDocument {
  type: Descriptor;
  identifier?: string;
  status?: string;
  /** @format date */
  dateIssued?: string;
  issuingAuthority?: string;
  placeIssued?: string;
  /** @format date */
  entryDate?: string;
  duration?: string;
  /** @format date */
  expirationDate?: string;
  supportDocuments?: SupportDocument[];
}

export interface Party {
  id: string;
  name: string;
}

export interface Person {
  identifiers: Identifier[];
  names: Name[];
  gender?: Gender;
  affiliations?: Affiliation[];
  addresses?: Address[];
  phones?: Phone[];
  emails?: Email[];
  urls?: Url[];
  photos?: Url[];
  ethnicities?: Ethnicity[];
  disability?: Disability;
  languages?: Language[];
  usaCountry?: UsaCountry;
  foreignCountries?: Descriptor[];
  education?: Education;
  emergencyContacts?: EmergencyContact[];
  birth?: Event;
  death?: Event;
}

export interface Phone {
  type?: Descriptor;
  number: string;
  countryCode?: string;
  extension?: string;
  primary?: boolean;
  disclose?: boolean;
  uiControl?: Descriptor;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface Preparation {
  recommendedText?: string;
  recommendedCourses?: MinimalCourse[];
  requiredText?: string;
  requiredCourses?: MinimalCourse[];
}

export interface Price {
  /** @format float */
  amount: number;
  currency?: Descriptor;
}

export type Quantity = Descriptor & {
  quantity: number;
};

export interface Repeatability {
  /** @default false */
  repeatable?: boolean;
  description?: string;
  /** @format float */
  maxCredit?: number;
  maxCount?: number;
}

export interface SeatReservation {
  number: number;
  requirementGroup: Descriptor;
  /** @format date */
  fromDate: string;
  maxEnroll: number;
  enrolledCount?: number;
}

export interface SectionAttribute {
  attribute: Descriptor;
  value: Descriptor;
}

export interface Session {
  id: string;
  name: string;
  term: Term;
  timePeriods?: TimePeriod[];
}

export interface SupportDocument {
  type: Descriptor;
  identifier?: string;
  description?: string;
  /** @format date */
  dateIssued?: string;
  issuingAuthority?: string;
  /** @format date */
  expirationDate?: string;
  /** @format date */
  requestDate?: string;
  /** @format date */
  receivedDate?: string;
}

export interface Term {
  id: string;
  name: string;
}

export interface TimePeriod {
  period: Descriptor;
  /** @format date */
  endDate: string;
}

export interface TypicallyOffered {
  terms?: string[];
  comments?: string;
}

export interface Url {
  type?: Descriptor;
  /** @format uri */
  url: string;
  primary?: boolean;
  disclose?: boolean;
  /** @format date */
  fromDate?: string;
  /** @format date */
  toDate?: string;
}

export interface UsaCountry {
  citizenshipStatus?: Descriptor;
  militaryStatus?: Descriptor;
  passport?: OfficialDocument;
  visa?: OfficialDocument;
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
 * @title Class API
 * @version 1.1
 * @baseUrl https://gateway.api.berkeley.edu/uat/sis
 *
 * ### Retrieves information about classes and associated class sections.
 *
 * The interactive docs below allow you to test parameter usage and see how both requests and return payloads are formatted using the **"Try it out"** feature.
 *
 * *This feature runs against the UAT version of the API and the QAT version of the source SIS database. Remember to remove "/uat" from the URL to run your client against the production version.*
 *
 * (Please note, XML responses do *NOT* include the outermost "payload" node shown in this documentation; "apiResponse" is the outermost node. The "payload" node exists, unnamed, *only* in JSON responses.)
 */
export class ClassesAPI<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  v1 = {
    /**
     * @description Returns class data, consisting of the Student/Class EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu) ***Note:** At least one of cs-course-id or term-id query parameters is required.*
     *
     * @tags class
     * @name GetClassesUsingGet
     * @summary Get class data
     * @request GET:/v1/classes
     */
    getClassesUsingGet: (
      query?: {
        /** The unique id for a canonical course in Campus Solutions */
        "cs-course-id"?: string;
        /** The ID uniquely identifying the term */
        "term-id"?: string;
        /** The ID uniquely identifying a session within the term */
        "session-id"?: string;
        /** The area of academic inquiry, such as MATH or ENGLISH */
        "subject-area-code"?: string;
        /** The human-readable number identifying a class within a subject area, such as R1A */
        "catalog-number"?: string;
        /** The index uniquely identifying the class among those with the specified subject area and catalog number */
        "class-number"?: string;
        /** The code indicating whether the class is active or otherwise */
        "status-code"?: string;
        /** The code indicating whether the class is open for enrollment */
        "enrollment-status-code"?: string;
        /** Return only classes with at least one section having a waitlist, whether open or full */
        "waitlist-availability"?: "open" | "full";
        /** The code indicating whether and what kind of final exam is required */
        "final-exam-code"?: string;
        /** The code indicating whether the class is offered in-person or over the web */
        "instruction-mode-code"?: string;
        /** Whether the class requires any additional fees */
        "fees-exist"?: boolean;
        /** Whether the class includes any sections that are to be printed in the Schedule of Classes */
        "print-in-schedule"?: boolean;
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
      this.request<ClassPayload, ErrorPayload | void>({
        path: `/v1/classes`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns field names and the canonical coded values and descriptions allowed for them, in the format of the Common/FieldValueList EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu)
     *
     * @tags class
     * @name GetClassDescriptorsUsingGet
     * @summary Get allowable code/descriptor pairs for class related fields
     * @request GET:/v1/classes/descriptors
     */
    getClassDescriptorsUsingGet: (
      query?: {
        /** The name of a particular coded field, expressed in dot notation (e.g., "class.status"). If this parameter is omitted, all class related fields and value lists are returned. */
        "field-name"?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<DescriptorPayload, ErrorPayload | void>({
        path: `/v1/classes/descriptors`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns class section data, consisting of the Student/Class Section EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu) ***Note:** At least one of cs-course-id or term-id query parameters is required.*
     *
     * @tags class section
     * @name GetClassSectionsUsingGet
     * @summary Get class section data
     * @request GET:/v1/classes/sections
     */
    getClassSectionsUsingGet: (
      query?: {
        /** The unique id for a canonical course in Campus Solutions */
        "cs-course-id"?: string;
        /** The ID uniquely identifying the term */
        "term-id"?: string;
        /** The area of academic inquiry, such as MATH or ENGLISH */
        "subject-area-code"?: string;
        /** The human-readable number identifying a class within a subject area, such as R1A */
        "catalog-number"?: string;
        /** The ID uniquely identifying a session within the term */
        "session-id"?: string;
        /** The index uniquely identifying the class among those with the specified subject area and catalog number */
        "class-number"?: string;
        /** The index uniquely identifying the section among those associated with the same class */
        "section-number"?: string;
        /** The code representing the type of section, e.g., LEC */
        "component-code"?: string;
        /** Whether to return class sections where primary = false */
        "include-secondary"?: boolean;
        /** A concatination of the first two characters of the day names to include, e.g., MoWeFr */
        "meets-days"?: string;
        /**
         * The time at or after which the class meeting begins (in HH:MM:SS format where HH is 00-24, and :SS is optional)
         * @pattern ^(2[0-3]|[01][0-9]):?([0-5][0-9])(:?[0-5][0-9])?$
         */
        "start-time"?: string;
        /**
         * The time at or before which the class meeting ends (in HH:MM:SS format where HH is 00-24, and :SS is optional)
         * @pattern ^(2[0-3]|[01][0-9]):?([0-5][0-9])(:?[0-5][0-9])?$
         */
        "end-time"?: string;
        /** The instructor's ID number in Campus Solutions */
        "instructor-id"?: string;
        /** The instructor's CalNet UID number */
        "instructor-campus-uid"?: string;
        /** The instructor's last name */
        "instructor-family-name"?: string;
        /** The code indicating whether the class section is active or otherwise */
        "status-code"?: string;
        /** The code indicating whether the class section is open for enrollment */
        "enrollment-status-code"?: string;
        /** Return only class sections having a waitlist, whether open or full */
        "waitlist-availability"?: "open" | "full";
        /** The code indicating whether and what kind of final exam is required */
        "final-exam-code"?: string;
        /** The code indicating whether the class section is offered in-person or over the web */
        "instruction-mode-code"?: string;
        /** Whether the class section requires any additional fees */
        "fees-exist"?: boolean;
        /** Whether the class section is to be printed in the Schedule of Classes */
        "print-in-schedule"?: boolean;
        /** [TBD] */
        "release-status"?: string;
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
      this.request<ClassSectionPayload, ErrorPayload | void>({
        path: `/v1/classes/sections`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns class section data, consisting of the Student/Class Section EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu)>
     *
     * @tags class section
     * @name GetClassSectionByTermAndSectionIdUsingGet
     * @summary Get class section data by ID
     * @request GET:/v1/classes/sections/{class-section-id}
     */
    getClassSectionByTermAndSectionIdUsingGet: (
      classSectionId: string,
      query: {
        /** The ID uniquely identifying the term */
        "term-id": string;
        /** Whether to also return secondary class sections if class-section-id identifies a primary section */
        "include-secondary"?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<ClassSectionPayload, ErrorPayload | void>({
        path: `/v1/classes/sections/${classSectionId}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns enrollment counts for class section data, consisting of the Student/Class Section EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu)
     *
     * @tags class section
     * @name GetClassSectionEnrollmentInformationUsingGet
     * @summary Get enrollment counts for a given class section
     * @request GET:/v1/classes/sections/{class-section-id}/term/{term-id}/enrollment
     */
    getClassSectionEnrollmentInformationUsingGet: (
      classSectionId: string,
      termId: string,
      query?: {
        /** [TBD] */
        "seat-reservations"?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ClassSectionEnrollmentPayload, ErrorPayload | void>({
        path: `/v1/classes/sections/${classSectionId}/term/${termId}/enrollment`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns enrollment counts for class section data, consisting of the Student/Class Section EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu)
     *
     * @tags class section
     * @name GetClassEnrollmentInformationUsingGet
     * @summary Get enrollment counts for all class sections updated within the specified time period
     * @request GET:/v1/classes/sections/terms/{term-id}/updated/enrollments
     */
    getClassEnrollmentInformationUsingGet: (
      termId: string,
      query: {
        /**
         * Defines the lower boundary of the time period (in yyyy-MM-ddTHH:mm:ss where HH is 00-23)
         * @pattern ^20[12][0-9]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])$
         */
        "updated-after": string;
        /**
         * Defines the upper boundary of the time period (in yyyy-MM-ddTHH:mm:ss where HH is 00-23)
         * @pattern ^20[12][0-9]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])$
         */
        "updated-before": string;
        /** [TBD] */
        "seat-reservations"?: string;
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
      this.request<ClassSectionEnrollmentPayload, ErrorPayload | void>({
        path: `/v1/classes/sections/terms/${termId}/updated/enrollments`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns field names and the canonical coded values and descriptions allowed for them, in the format of the Common/FieldValueList EDO described on [bMeta.berkeley.edu](http://bMeta.berkeley.edu)
     *
     * @tags class section
     * @name GetClassSectionDescriptorsUsingGet
     * @summary Get allowable code/descriptor pairs for class section related fields
     * @request GET:/v1/classes/sections/descriptors
     */
    getClassSectionDescriptorsUsingGet: (
      query?: {
        /** The name of a particular coded field, expressed in dot notation (e.g., "classSection.status"). If this parameter is omitted, all class section related fields and value lists are returned. */
        "field-name"?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<DescriptorPayload, ErrorPayload | void>({
        path: `/v1/classes/sections/descriptors`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}

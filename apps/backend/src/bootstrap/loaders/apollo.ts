import { ApolloServer } from "@apollo/server";
import type { ApolloServerPlugin } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import {
  KeyValueCache,
  KeyValueCacheSetOptions,
} from "@apollo/utils.keyvaluecache";
import { ApolloArmor } from "@escape.tech/graphql-armor";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import {
  graphqlOperationDuration,
  graphqlOperationCount,
  graphqlErrorCount,
  featureUsageCount,
  cacheHitCount,
  cacheMissCount,
  redisCacheOpDuration,
} from "../../lib/metrics";
import log from "../../lib/logger";
import { createHash } from "crypto";
import { OperationDefinitionNode } from "graphql";
import { RedisClientType } from "redis";
import { gunzipSync, gzipSync } from "zlib";

import { timeToNextPull } from "../../utils/cache";
import { buildSchema } from "../graphql/buildSchema";

/** Map GraphQL operation names → high-level feature names for usage metrics. */
const OPERATION_FEATURE: Record<string, string> = {
  // Catalog / course browsing
  GetCanonicalCatalog: "catalog",
  GetClass: "catalog",
  GetClassDetails: "catalog",
  GetCourse: "catalog",
  GetCourseTitle: "catalog",
  GetCourseUnits: "catalog",
  GetClassOverview: "catalog",
  GetCourseOverviewById: "catalog",
  GetCourseNames: "catalog",
  GetCourses: "catalog",
  GetAllClassesForCourse: "catalog",
  TrackClassView: "catalog",
  // Sections
  GetClassSections: "catalog",
  // Enrollment
  GetClassEnrollment: "enrollment",
  GetEnrollment: "enrollment",
  GetEnrollmentTimeframes: "enrollment",
  ReadEnrollmentTimeframes: "enrollment",
  // Grades
  GetClassGrades: "grades",
  GetCourseGradeDist: "grades",
  GetGradeDistribution: "grades",
  // Ratings
  GetClassRatings: "ratings",
  GetCourseRatings: "ratings",
  GetAggregatedRatings: "ratings",
  GetSemestersWithRatings: "ratings",
  GetUserRatings: "ratings",
  GetAllRatingsData: "ratings",
  GetClassRatingsData: "ratings",
  CreateRatings: "ratings",
  DeleteRatings: "ratings",
  // Schedules
  ReadSchedule: "schedules",
  ReadSchedules: "schedules",
  CreateSchedule: "schedules",
  UpdateSchedule: "schedules",
  DeleteSchedule: "schedules",
  // GradTrak
  GetPlan: "gradtrak",
  GetPlans: "gradtrak",
  CreateNewPlan: "gradtrak",
  EditPlan: "gradtrak",
  SetSelectedCourses: "gradtrak",
  CreateNewPlanTerm: "gradtrak",
  RemovePlanTermByID: "gradtrak",
  EditPlanTerm: "gradtrak",
  // Collections
  GetCollectionById: "collections",
  GetAllCollections: "collections",
  GetAllCollectionsWithPreview: "collections",
  AddClassToCollection: "collections",
  RemoveClassFromCollection: "collections",
  CreateCollection: "collections",
  UpdateCollection: "collections",
  DeleteCollection: "collections",
  // Curated
  GetCuratedClass: "curated",
  GetCuratedClasses: "curated",
  CreateCuratedClass: "curated",
  UpdateCuratedClass: "curated",
  DeleteCuratedClass: "curated",
  // User / profile
  GetUser: "profile",
  UpdateUser: "profile",
  DeleteAccount: "profile",
  // Banners
  GetAllBanners: "banners",
  IncrementBannerClick: "banners",
  IncrementBannerDismiss: "banners",
  TrackBannerView: "banners",
  // Terms
  GetTerms: "terms",
  GetTerm: "terms",
};

/**
 * Apollo Server plugin that creates a span per GraphQL operation with
 * operation name and type as span attributes. When OTel is not initialised
 * the tracer returned by the API is a no-op, so this plugin is always safe
 * to register.
 */
function createOtelPlugin(): ApolloServerPlugin {
  const tracer = trace.getTracer("berkeleytime-graphql");
  return {
    async requestDidStart() {
      const startTime = performance.now();
      const span = tracer.startSpan("graphql.operation");
      let operationName = "anonymous";
      let operationType = "query";

      return {
        async didResolveOperation(ctx) {
          operationName = ctx.request.operationName || "anonymous";
          operationType = ctx.operation?.operation || "query";
          span.updateName(`graphql.${operationType} ${operationName}`);
          span.setAttribute("graphql.operation.name", operationName);
          span.setAttribute("graphql.operation.type", operationType);

          graphqlOperationCount.add(1, {
            "graphql.operation.name": operationName,
            "graphql.operation.type": operationType,
          });

          const feature = OPERATION_FEATURE[operationName];
          if (feature) {
            featureUsageCount.add(1, { feature });
            span.setAttribute("app.feature", feature);
          }
        },

        async didEncounterErrors(ctx) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: ctx.errors?.[0]?.message,
          });
          for (const err of ctx.errors || []) {
            const code = (err.extensions?.code as string) || "UNKNOWN";
            span.addEvent("graphql.error", {
              "error.message": err.message,
              "error.code": code,
            });
            graphqlErrorCount.add(1, {
              "graphql.operation.name": operationName,
              "graphql.operation.type": operationType,
              "error.code": code,
            });
            log.error(
              {
                operationName,
                operationType,
                errorCode: code,
                err: err.message,
              },
              "GraphQL error"
            );
          }
        },

        async willSendResponse() {
          const duration = performance.now() - startTime;
          graphqlOperationDuration.record(duration, {
            "graphql.operation.name": operationName,
            "graphql.operation.type": operationType,
          });
          span.setAttribute("graphql.duration_ms", Math.round(duration));
          span.end();
        },
      };
    },
  };
}

/**
 * Extracts the first query name from a GraphQL operation.
 * For example, if the query is "query { catalog(...) { ... } }", this returns "catalog".
 *
 * @param operation - The parsed GraphQL operation from the request context
 * @returns The name of the first query field, or null if not found
 */
function getOperationName(
  operation: OperationDefinitionNode | undefined
): string | null {
  const firstSelection = operation?.selectionSet?.selections?.[0];
  if (firstSelection && "name" in firstSelection)
    return firstSelection.name.value;
  return null;
}

class RedisCache implements KeyValueCache {
  client: RedisClientType;

  prefix = "apollo-cache:";

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async get(key: string) {
    const start = performance.now();
    const value = await this.client.get(this.prefix + key);
    const duration = performance.now() - start;
    redisCacheOpDuration.record(duration, { operation: "get" });

    if (!value) {
      cacheMissCount.add(1);
      trace.getActiveSpan()?.addEvent("cache.miss", { "cache.key": key });
      return undefined;
    }

    cacheHitCount.add(1);
    trace.getActiveSpan()?.addEvent("cache.hit", { "cache.key": key });

    const buffer = Buffer.from(value, "base64");
    return gunzipSync(buffer).toString("utf-8");
  }

  /**
   * Sets the value in the cache. Accepts a TTL. If no TTL is provided, the ApolloServerPluginCacheControl
   * default maxAge is used, and we use the minimum of the default and the time
   * until the next datapuller run (determined by timeToNextPull).
   */
  async set(
    key: string,
    value: string | null,
    options?: KeyValueCacheSetOptions
  ) {
    if (!value) return;

    const start = performance.now();
    const ttl = Math.min(options?.ttl ?? 24 * 60 * 60, timeToNextPull());
    await this.client.set(
      this.prefix + key,
      gzipSync(value).toString("base64"),
      { EX: ttl }
    );
    const duration = performance.now() - start;
    redisCacheOpDuration.record(duration, { operation: "set" });
    trace.getActiveSpan()?.addEvent("cache.set", {
      "cache.key": key,
      "cache.ttl": ttl,
    });
  }

  async delete(key: string) {
    const start = performance.now();
    const success = await this.client.del(this.prefix + key);
    const duration = performance.now() - start;
    redisCacheOpDuration.record(duration, { operation: "delete" });
    return success === 1;
  }
}

// Limit GraphQL query depth to 3
const armor = new ApolloArmor({
  maxDepth: {
    enabled: true,
    n: 10,
  },
});

const protection = armor.protect();

export default async (redis: RedisClientType) => {
  const schema = buildSchema();

  const server = new ApolloServer({
    schema,
    validationRules: [...protection.validationRules],
    plugins: [
      ...protection.plugins,
      createOtelPlugin(),
      // HTTP caching for catalog query (5 min TTL)
      {
        async requestDidStart() {
          return {
            async willSendResponse(requestContext) {
              if (requestContext.operationName === "GetCanonicalCatalog") {
                requestContext.response.http?.headers.set(
                  "Cache-Control",
                  "public, max-age=300"
                );
              }
            },
          };
        },
      },
      ApolloServerPluginLandingPageLocalDefault({ includeCookies: true }),
      ApolloServerPluginCacheControl({
        calculateHttpHeaders: false,
        defaultMaxAge: 24 * 60 * 60, // 24 hours
      }),
      responseCachePlugin({
        sessionId: async (req) =>
          req.request.http?.headers.get("sessionId") || null,

        /**
         * Custom cache key generator for the canonical catalog query only.
         *
         * GetCanonicalCatalog query uses deterministic keys:
         *   Production: catalog:{year}-{semester} (e.g., "catalog:2024-fall")
         *   Staging: catalog:{year}-{semester}:staging (for pre-warming)
         *
         * When warming cache:
         *   1. executeOperation() with { __warmStaging: true } context
         *   2. Writes to staging key
         *   3. RENAME staging → production (atomic swap, zero downtime)
         *
         * All other queries use Apollo's default cache key.
         */
        generateCacheKey: (requestContext, keyData) => {
          const variables = requestContext.request.variables;
          const operation = requestContext.operation;
          const operationName = getOperationName(operation);

          // Only cache the GetCanonicalCatalog query (no search term)
          if (
            requestContext.operationName === "GetCanonicalCatalog" &&
            operationName === "catalog" &&
            variables?.year &&
            variables?.semester
          ) {
            const semester = String(variables.semester).toLowerCase();
            const isWarmingStaging =
              requestContext.contextValue?.__warmStaging === true;
            const suffix = isWarmingStaging ? ":staging" : "";

            return `catalog:${variables.year}-${semester}${suffix}`;
          }

          // For all other queries, use default Apollo cache key
          return createHash("sha256")
            .update(JSON.stringify(keyData))
            .digest("hex");
        },
      }),
    ],
    // TODO(prod): introspection: config.isDev,
    introspection: true,
    cache: new RedisCache(redis),
    formatError: (formattedError) => {
      // Return BAD_USER_INPUT errors as 400s
      if (formattedError.extensions?.code === "BAD_USER_INPUT") {
        return {
          ...formattedError,
          extensions: {
            ...formattedError.extensions,
            http: { status: 400 },
          },
        };
      }
      // Return other errors as internal server errors
      return {
        message: formattedError.message,
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
          http: { status: 500 },
        },
      };
    },
  });

  await server.start();

  return { server, redis };
};

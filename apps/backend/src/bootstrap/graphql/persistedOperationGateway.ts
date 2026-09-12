import { ApolloServer, HeaderMap } from "@apollo/server";
import type { ErrorRequestHandler, RequestHandler } from "express";
import type { RedisClientType } from "redis";

import log from "../../lib/logger";
import { persistedOperationRejectionCount } from "../../lib/metrics";
import { persistedOperations } from "./generated/persistedOperations";
import { persistedOperations as previousPersistedOperations } from "./generated/previousPersistedOperations";

const acceptedPersistedOperations = {
  ...previousPersistedOperations,
  ...persistedOperations,
};

interface PersistedOperationRequest {
  id: string;
  variables?: Record<string, unknown>;
}

type RejectionReason =
  | "method"
  | "content_type"
  | "body_shape"
  | "unknown_operation"
  | "invalid_json"
  | "request_too_large";

function reject(
  reason: RejectionReason,
  status: number,
  message: string,
  req: Parameters<RequestHandler>[0],
  res: Parameters<RequestHandler>[1]
) {
  persistedOperationRejectionCount.add(1, { reason });
  log.warn(
    { reason, method: req.method, path: req.path },
    "Rejected public GraphQL gateway request"
  );
  res.status(status).json({ error: message });
}

function filterVariables(
  variables: Record<string, unknown> | undefined,
  variableNames: readonly string[]
): Record<string, unknown> | undefined {
  if (variables === undefined) return undefined;

  const filtered: Record<string, unknown> = {};
  for (const name of variableNames) {
    if (Object.hasOwn(variables, name)) filtered[name] = variables[name];
  }
  return filtered;
}

/**
 * Normalizes body-parser failures on the public GraphQL route so malformed and
 * oversized requests use the same bounded JSON error surface and telemetry as
 * gateway-level rejections.
 */
export const persistedOperationBodyErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  if (!/(?:^|\/)graphql\/?$/.test(req.path)) {
    next(error);
    return;
  }

  const status = Number((error as { status?: unknown }).status);
  const type = (error as { type?: unknown }).type;

  if (status === 413 || type === "entity.too.large") {
    reject(
      "request_too_large",
      413,
      "GraphQL request body is too large",
      req,
      res
    );
    return;
  }

  if (status === 400 || type === "entity.parse.failed") {
    reject("invalid_json", 400, "Invalid JSON request body", req, res);
    return;
  }

  next(error);
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePersistedOperationRequest(
  body: unknown
): PersistedOperationRequest | null {
  if (!isRecord(body)) return null;

  const keys = Object.keys(body);
  if (keys.some((key) => key !== "id" && key !== "variables")) return null;
  if (
    typeof body.id !== "string" ||
    !/^[a-f0-9]{64}$/.test(body.id) ||
    (body.variables !== undefined && !isRecord(body.variables))
  ) {
    return null;
  }

  return {
    id: body.id,
    ...(body.variables === undefined ? {} : { variables: body.variables }),
  };
}

/**
 * Public, allowlisted GraphQL operation gateway.
 *
 * The request body never supplies a GraphQL document. The gateway resolves a
 * stable operation ID to a server-controlled document, then executes Apollo
 * in-process so authentication directives, Armor, caching, and telemetry are
 * unchanged. There is deliberately no raw Apollo HTTP middleware mounted in
 * production or development.
 */
export function persistedOperationGateway(
  server: ApolloServer,
  redis: RedisClientType
): RequestHandler {
  return async (req, res) => {
    if (req.method !== "POST") {
      reject("method", 405, "Only POST is supported", req, res);
      return;
    }

    const contentType = req.get("content-type")?.split(";", 1)[0].trim();
    if (contentType !== "application/json") {
      reject(
        "content_type",
        415,
        "Content-Type must be application/json",
        req,
        res
      );
      return;
    }

    const request = parsePersistedOperationRequest(req.body);
    if (!request) {
      reject(
        "body_shape",
        400,
        "Invalid persisted operation request",
        req,
        res
      );
      return;
    }

    const operation = acceptedPersistedOperations[request.id];
    if (!operation) {
      reject("unknown_operation", 404, "Unknown operation", req, res);
      return;
    }

    const headers = new HeaderMap();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    try {
      const variables = filterVariables(
        request.variables,
        operation.variableNames
      );
      const response = await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: {
          method: "POST",
          headers,
          search: "",
          body: {
            query: operation.document,
            operationName: operation.operationName,
            ...(variables === undefined ? {} : { variables }),
          },
        },
        context: async () => ({
          req,
          redis,
          user: {
            ...req.user,
            isAuthenticated: req.isAuthenticated(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            logout: (callback: (err: any) => void) => req.logout(callback),
          },
        }),
      });

      for (const [key, value] of response.headers) {
        res.setHeader(key, value);
      }
      res.status(response.status ?? 200);

      if (response.body.kind === "complete") {
        res.send(response.body.string);
        return;
      }

      for await (const chunk of response.body.asyncIterator) {
        res.write(chunk);
        if (typeof res.flush === "function") res.flush();
      }
      res.end();
    } catch (error) {
      log.error(
        { err: error, operationName: operation.operationName },
        "Persisted GraphQL operation execution failed"
      );
      if (res.headersSent) {
        res.end();
        return;
      }
      res.status(500).json({ error: "GraphQL operation execution failed" });
    }
  };
}

import { createRemoteJWKSet, jwtVerify } from "jose";

interface Env {
  PUBLIC_BACKUPS: R2Bucket;
  PRIVATE_BACKUPS: R2Bucket;
  CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string;
  CLOUDFLARE_ACCESS_AUDIENCE?: string;
}

const PUBLIC_PREFIX = "public/";
const PRIVATE_PREFIX = "private/";
const LEGACY_PUBLIC_PREFIX = "daily/";
const ACCESS_JWKS_BY_ISSUER = new Map<
  string,
  ReturnType<typeof createRemoteJWKSet>
>();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/^\/+/, "");
    const method = request.method.toUpperCase();

    if (!["GET", "HEAD"].includes(method)) {
      return new Response("Method not allowed", {
        status: 405,
        headers: {
          Allow: "GET, HEAD",
        },
      });
    }

    if (!pathname) {
      return new Response("Missing key", { status: 400 });
    }

    if (pathname.startsWith(PUBLIC_PREFIX)) {
      const key = pathname.substring(PUBLIC_PREFIX.length);
      return handleGetFromBucket(env.PUBLIC_BACKUPS, key, {
        method,
        isPrivate: false,
      });
    }

    if (pathname.startsWith(PRIVATE_PREFIX)) {
      if (!(await isPrivateRequestAuthorized(request, env))) {
        return new Response("Forbidden", { status: 403 });
      }

      const key = pathname.substring(PRIVATE_PREFIX.length);
      return handleGetFromBucket(env.PRIVATE_BACKUPS, key, {
        method,
        isPrivate: true,
      });
    }

    // Keep old public URL shape working while callers migrate to /public/*.
    if (pathname.startsWith(LEGACY_PUBLIC_PREFIX)) {
      return handleGetFromBucket(env.PUBLIC_BACKUPS, pathname, {
        method,
        isPrivate: false,
      });
    }

    return new Response("Not found", { status: 404 });
  },
};

function normalizeAccessTeamDomain(teamDomain: string): string {
  const normalized = teamDomain.trim().replace(/\/+$/, "");
  if (normalized.startsWith("https://") || normalized.startsWith("http://")) {
    return normalized;
  }
  return `https://${normalized}`;
}

function getAccessJwks(issuer: string) {
  const existing = ACCESS_JWKS_BY_ISSUER.get(issuer);
  if (existing) {
    return existing;
  }

  const jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
  ACCESS_JWKS_BY_ISSUER.set(issuer, jwks);
  return jwks;
}

async function isPrivateRequestAuthorized(
  request: Request,
  env: Env
): Promise<boolean> {
  const configuredTeamDomain = env.CLOUDFLARE_ACCESS_TEAM_DOMAIN;
  const configuredAudience = env.CLOUDFLARE_ACCESS_AUDIENCE;
  if (!configuredTeamDomain || !configuredAudience) {
    return false;
  }

  const accessJwt = request.headers.get("cf-access-jwt-assertion");
  if (!accessJwt) {
    return false;
  }

  const issuer = normalizeAccessTeamDomain(configuredTeamDomain);
  const audiences = configuredAudience
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (audiences.length === 0) {
    return false;
  }

  try {
    await jwtVerify(accessJwt, getAccessJwks(issuer), {
      issuer,
      audience: audiences,
    });
    return true;
  } catch {
    return false;
  }
}

async function handleGetFromBucket(
  bucket: R2Bucket,
  key: string,
  options: {
    method: "GET" | "HEAD" | string;
    isPrivate: boolean;
  }
): Promise<Response> {
  const normalizedKey = key.replace(/^\/+/, "");
  if (!normalizedKey) {
    return new Response("Missing key", { status: 400 });
  }

  const headers = new Headers();

  if (options.method === "HEAD") {
    const object = await bucket.head(normalizedKey);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    if (options.isPrivate) {
      headers.set("cache-control", "private, no-store");
    }

    return new Response(null, { headers });
  }

  const object = await bucket.get(normalizedKey);
  if (object === null) {
    return new Response("Not found", { status: 404 });
  }

  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  if (options.isPrivate) {
    headers.set("cache-control", "private, no-store");
  }

  return new Response(object.body, { headers });
}

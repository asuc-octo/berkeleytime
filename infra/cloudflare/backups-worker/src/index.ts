interface Env {
  PUBLIC_BACKUPS: R2Bucket;
  PRIVATE_BACKUPS: R2Bucket;
  AUTH_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/^\/+/, "");

    if (!pathname) {
      return new Response("Missing key", { status: 400 });
    }

    if (pathname.startsWith("public/")) {
      const key = pathname.substring("public/".length);
      return handleGetFromBucket(env.PUBLIC_BACKUPS, key);
    }

    if (pathname.startsWith("private/")) {
      const key = pathname.substring("private/".length);

      const auth = request.headers.get("Authorization");
      const expected = `Bearer ${env.AUTH_SECRET}`;
      if (!auth || auth !== expected) {
        return new Response("Unauthorized", { status: 401 });
      }

      return handleGetFromBucket(env.PRIVATE_BACKUPS, key);
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleGetFromBucket(
  bucket: R2Bucket,
  key: string
): Promise<Response> {
  const object = await bucket.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}

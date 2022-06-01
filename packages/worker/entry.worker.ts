import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import {
  createRequestHandler,
  createCookieSessionStorage,
} from "@remix-run/cloudflare";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

import { createDb } from "db-fauna";
import * as build from "remix-app";
import type { AppLoadContext } from "remix-app";

let assetManifest = JSON.parse(manifestJSON);
let handleRemixRequest = createRequestHandler(
  build as any,
  process.env.NODE_ENV
);

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    let url = new URL(request.url);

    try {
      let ttl = url.pathname.startsWith("/build/")
        ? 60 * 60 * 24 * 365 // 1 year
        : 60 * 5; // 5 minutes
      return await getAssetFromKV(
        {
          request: request.clone(),
          waitUntil(promise) {
            return ctx.waitUntil(promise);
          },
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
          cacheControl: {
            browserTTL: ttl,
            edgeTTL: ttl,
          },
        }
      );
    } catch (error) {
      // if (error instanceof MethodNotAllowedError) {
      //   return new Response("Method not allowed", { status: 405 });
      // } else if (!(error instanceof NotFoundError)) {
      //   return new Response("An unexpected error occurred", { status: 500 });
      // }
    }

    try {
      let domain, port, scheme;
      if (env.FAUNA_URL) {
        let url = new URL(env.FAUNA_URL);
        domain = url.hostname;
        port = url.port ? Number(url.port) : undefined;
        scheme = url.protocol.split(":", 1)[0];
        if (scheme !== "http" && scheme !== "https") {
          scheme = undefined;
        }
      }
      let db = createDb({ domain, port, scheme, secret: env.FAUNA_SECRET });
      let sessionStorage = createCookieSessionStorage({
        cookie: {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secrets: [env.SESSION_SECRET],
          secure: !url.host.startsWith("localhost"),
        },
      });

      let session = await sessionStorage.getSession(
        request.headers.get("Cookie")
      );

      let loadContext: AppLoadContext = {
        // @ts-expect-error
        cache: caches.default,
        db,
        env,
        session,
      };
      let response = await handleRemixRequest(request, loadContext);

      let headers = new Headers(response.headers);
      headers.append("Set-Cookie", await sessionStorage.commitSession(session));

      return new Response(response.body, {
        headers,
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error) {
      console.log(String(error));
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};

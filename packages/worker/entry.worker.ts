import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import {
  createRequestHandler,
  createCookieSessionStorage,
} from "@remix-run/cloudflare";
import Toucan from "toucan-js";

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
    context: ExecutionContext
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
            return context.waitUntil(promise);
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

    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      context, // Includes 'waitUntil', which is essential for Sentry logs to be delivered. Modules workers do not include 'request' in context -- you'll need to set it separately.
      request, // request is not included in 'context', so we set it here.
      allowedHeaders: ["user-agent"],
      allowedSearchParams: /(.*)/,
    });

    try {
      let otherOptions: any = {};
      if (env.FAUNA_URL) {
        let url = new URL(env.FAUNA_URL);
        otherOptions.domain = url.hostname;
        otherOptions.port = url.port ? Number(url.port) : undefined;
        otherOptions.scheme = url.protocol.split(":", 1)[0];
        if (otherOptions.scheme !== "http" && otherOptions.scheme !== "https") {
          otherOptions.scheme = undefined;
        }
      }
      let db = createDb({ ...otherOptions, secret: env.FAUNA_SECRET }, sentry);
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
        logger: sentry,
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
      sentry.captureException(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};

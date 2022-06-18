import type { EntryContext } from "remix";
import { RemixServer } from "@remix-run/react";
import { renderToReadableStream } from "react-dom/server";
import isbot from "isbot";

import type { AppLoadContext } from "./types";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  { logger }: AppLoadContext
) {
  let body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      onError(error) {
        responseStatusCode = 500;
        logger.captureException(error);
      },
    }
  );

  if (isbot(request.headers.get("User-Agent"))) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html; charset=utf-8");
  responseHeaders.set("Content-Encoding", "chunked");

  return new Response(body, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}

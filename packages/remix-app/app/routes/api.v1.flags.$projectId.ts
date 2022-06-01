import { json } from "remix";
import type { LoaderFunction } from "~/types";

export let loader: LoaderFunction = async ({
  context: { cache, db },
  params: { projectId },
  request,
}) => {
  try {
    if (!projectId) {
      return json({ error: "No projectId in URL" }, { status: 400 });
    }

    let url = new URL(request.url);
    let token =
      request.headers.get("Authorization") || url.searchParams.get("token");

    if (!token) {
      return json({ error: "No token in request" }, { status: 401 });
    }

    url.hash = "";
    url.search = "";
    let cacheRequest = new Request(url.href);
    let cached = await cache.match(cacheRequest);
    if (cached) {
      return cached;
    }

    let flags = await db.getFlagsByProjectIdWithToken({ projectId, token });
    let data = flags.reduce(
      (acc, flag) => ({
        ...acc,
        [flag.name]: flag.enabled,
      }),
      {}
    );

    await cache.put(
      cacheRequest,
      json(
        { data },
        {
          headers: {
            "Cache-Control": "public, max-age=5",
          },
        }
      )
    );

    return json(
      { data },
      {
        headers: {
          "Cache-Control": "public, max-age=5",
        },
      }
    );
  } catch (error) {
    console.log(String(error));
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};

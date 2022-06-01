import type { ComponentProps } from "react";
import { createElement } from "react";
import type { Session } from "remix";
import { redirect } from "remix";
import { Deferred, useDeferred } from "@remix-run/react";

export function getUserId(session: Session): string | null {
  return session.get("userId") || null;
}

export function requireUserId(
  session: Session,
  redirectTo: string = "/"
): string {
  let userId = getUserId(session);
  if (!userId) throw redirect(`/login?redirect=${redirectTo}`);

  return userId;
}

export function InlineDeferred<TData>({
  children,
  data,
  fallback,
  error,
}: {
  children: ({ value }: { value: TData }) => any;
} & Omit<ComponentProps<typeof Deferred>, "children">) {
  function DeferredWrapper() {
    return children({ value: useDeferred() });
  }
  return createElement(Deferred, {
    data,
    fallback,
    error,
    children: createElement(DeferredWrapper),
  });
}

export async function getRepos({
  githubAccessToken,
}: {
  githubAccessToken: string;
}) {
  let gitHubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${githubAccessToken}`,
      "User-Agent": "github-md",
    },
  });
  let { repos_url: reposUrl } = (await gitHubUserResponse.json()) as {
    repos_url: string;
  };
  let githubReposResponse = await fetch(
    reposUrl + "?per_page=500&type=all&sort=pushed",
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${githubAccessToken}`,
        "User-Agent": "github-md",
      },
    }
  );
  let gitHubRepos = (await githubReposResponse.json()) as {
    full_name: string;
  }[];

  let repos = gitHubRepos.map((repo) => repo.full_name);

  return repos;
}

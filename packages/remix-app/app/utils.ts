import type { ComponentProps } from "react";
import { createElement } from "react";
import type { Session } from "remix";
import { redirect } from "remix";
import { Deferred, useDeferred } from "@remix-run/react";

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Deferrable<Data> {}
export type ResolvedDeferrable<Data> = Data extends Deferrable<infer Data>
  ? Awaited<Data>
  : Awaited<Data>;

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

export function InlineDeferred<Data>({
  children,
  data,
  fallback,
  error,
}: {
  data: Data;
  children: (value: ResolvedDeferrable<Data>) => any;
} & Omit<ComponentProps<typeof Deferred>, "children" | "data">) {
  function DeferredWrapper() {
    return children(useDeferred() as ResolvedDeferrable<Data>);
  }
  return createElement(Deferred, {
    data,
    fallback,
    error,
    children: createElement(DeferredWrapper),
  });
}

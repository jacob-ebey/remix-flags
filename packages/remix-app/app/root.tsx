import type { PropsWithChildren } from "react";
import { useEffect, useMemo } from "react";
import type { MetaFunction } from "remix";
import { json } from "remix";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useFetchers,
  useLocation,
  useMatches,
  useTransition,
} from "@remix-run/react";
import NProgress from "nprogress";

import type { LoaderFunction } from "~/types";
import { getUserId } from "~/utils";

declare global {
  var process: { env: { NODE_ENV: "development" | "production" } };
}

export let meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "remix-flags",
  description: "Everything you need for successful feature flagging",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  loggedIn: boolean;
};

export let loader: LoaderFunction = async ({ context: { session } }) => {
  return json<LoaderData>({
    loggedIn: !!getUserId(session),
  });
};

function Document({ children }: PropsWithChildren<{}>) {
  let transition = useTransition();
  let location = useLocation();
  let fetchers = useFetchers();

  let match = useMatches().find((match) => match.id === "root");
  let { loggedIn } = match?.data || { loggedIn: false };

  let fetchersRunning = useMemo(
    () => fetchers.some((fetcher) => fetcher.state !== "idle"),
    [fetchers]
  );

  useEffect(() => {
    if (!fetchersRunning && transition.state === "idle") NProgress.done();
    else NProgress.start();

    return () => {
      NProgress.done();
    };
  }, [transition.state, fetchersRunning]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://unpkg.com/papercss@1.8.3/dist/paper.min.css"
          as="style"
        />
        <link
          rel="preload"
          href="https://unpkg.com/nprogress@0.2.0/nprogress.css"
          as="style"
        />
        <Links />
        <link
          rel="stylesheet"
          href="https://unpkg.com/papercss@1.8.3/dist/paper.min.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/nprogress@0.2.0/nprogress.css"
        />
      </head>
      <body>
        <nav className="border split-nav">
          <div className="nav-brand">
            <h3>
              <Link to="/">remix-flags</Link>
            </h3>
          </div>
          <div className="collapsible">
            <input
              key={location.key}
              id="collapsibleMenuToggle"
              type="checkbox"
              name="collapsibleMenuToggle"
            />
            <label htmlFor="collapsibleMenuToggle">Menu</label>
            <div className="collapsible-body">
              <ul className="inline">
                {loggedIn && (
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                )}
                <li>
                  <Link to="/docs">Documentation</Link>
                </li>
                {loggedIn && (
                  <li>
                    <Form action="/logout" method="post">
                      <button className="btn-small">Logout</button>
                    </Form>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  let { status, statusText } = useCatch();

  return (
    <Document>
      <div className="row">
        <div className="sm-12 col">
          <main className="paper text-center">
            <h1>{status}</h1>
            {statusText && <p>{statusText}</p>}
          </main>
        </div>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document>
      <div className="row">
        <div className="sm-12 col">
          <main className="paper text-center">
            <h1>Oops, looks like something went wrong 😭</h1>
          </main>
        </div>
      </div>
    </Document>
  );
}

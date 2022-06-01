import { json } from "remix";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";

import type { LoaderFunction } from "~/types";

type LoaderData = {
  loggedIn: boolean;
};

export let loader: LoaderFunction = ({ context: { session } }) => {
  return json<LoaderData>({
    loggedIn: !!session.get("userId"),
  });
};

export default function PublicLayout() {
  let { loggedIn } = useLoaderData() as LoaderData;

  return (
    <div className="row">
      <div className="sm-12 md-8 col">
        <div className="paper">
          <Outlet />
        </div>
      </div>
      <div className="sm-12 md-4 col sidebar">
        <aside className="paper">
          <h3 className="text-center">Links</h3>
          <div className="row flex-center">
            <Link className="paper-btn" to="/">
              Home
            </Link>
            <Link className="paper-btn" to="/docs">
              Documentation
            </Link>
            {loggedIn ? (
              <>
                <Link className="paper-btn" to="/dashboard">
                  Dashboard
                </Link>
                <Form action="/logout" method="post">
                  <button>Logout</button>
                </Form>
              </>
            ) : (
              <>
                <Link className="paper-btn" to="/signup">
                  Signup
                </Link>
                <Link className="paper-btn" to="/login">
                  Login
                </Link>
              </>
            )}
          </div>
        </aside>
        <footer className="paper">
          <div className="row flex-center">
            <p>
              Made with 💛 by{" "}
              <a
                href="https://github.com/jacob-ebey"
                target="_blank"
                rel="noreferrer"
              >
                Jacob
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

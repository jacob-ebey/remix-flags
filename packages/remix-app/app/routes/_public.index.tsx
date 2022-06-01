import { json } from "remix";
import { Link, useLoaderData } from "@remix-run/react";

import type { LoaderFunction } from "~/types";
import { getUserId } from "~/utils";

type LoaderData = {
  loggedIn: boolean;
};

export let loader: LoaderFunction = ({ context: { session } }) => {
  return json<LoaderData>({
    loggedIn: !!getUserId(session),
  });
};

export default function Index() {
  let { loggedIn } = useLoaderData() as LoaderData;

  return (
    <main>
      <div className="text-center">
        <h1>remix-flags</h1>
        <h3>
          <small>Eventually*</small> Everything you'll need for successful
          feature flagging
        </h3>
        {loggedIn ? (
          <p>
            <Link className="paper-btn" to="/dashboard">
              Go to your Dashboard
            </Link>
          </p>
        ) : (
          <p>
            <Link className="paper-btn" to="/signup">
              Signup
            </Link>
            {" or "}
            <Link className="paper-btn" to="/login">
              Login
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { json, redirect } from "remix";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useParams,
} from "@remix-run/react";

import type { ActionFunction, LoaderFunction } from "~/types";
import { requireUserId } from "~/utils";

export let handle = {
  breadcrumb: { text: "API Tokens" },
};

type ActionData = {
  errors?: {
    name?: string;
  };
  secret?: string;
};

export let action: ActionFunction = async ({
  context: { db, session },
  params: { projectId },
  request,
}) => {
  if (!projectId) return redirect("/dashboard");

  let userId = requireUserId(session, `/dashboard/project/${projectId}/tokens`);

  let formData = await request.formData();
  let intent = formData.get("intent");

  switch (intent) {
    case "create": {
      let name = formData.get("name");
      if (typeof name !== "string" || !name) {
        return json<ActionData>({
          errors: { name: "Name is required" },
        });
      }

      let secret = await db.createToken({ name, projectId, userId });

      return json({ secret });
    }
  }

  return json(null);
};

type LoaderData = {
  tokens: { id: string; name: string }[];
};

export let loader: LoaderFunction = async ({
  context: { db, session },
  params: { projectId },
}) => {
  if (!projectId) throw json(null, { status: 404, statusText: "Not Found" });

  let userId = requireUserId(session, `/dashboard/project/${projectId}`);

  let tokens = await db.getTokensByProjectId({ projectId, userId });

  return json<LoaderData>({ tokens });
};

export default function TokensDashboard() {
  let { tokens } = useLoaderData() as LoaderData;
  let { errors, secret } = (useActionData() as ActionData) || {};

  let [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (clicked) {
      let timeout = setTimeout(() => setClicked(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [clicked]);

  return (
    <main id="tokens">
      <h2>API Tokens</h2>

      <Form method="post">
        <input type="hidden" name="intent" value="create" />
        <div className="form-group">
          <label htmlFor="nameInput">Token Name</label>
          <input
            type="text"
            placeholder="Who or what is the token for?"
            id="nameInput"
            name="name"
            className="input-block"
          />
          {errors?.name && (
            <label htmlFor="nameInput" className="error">
              {errors.name}
            </label>
          )}
        </div>
        <button type="submit">Create Token</button>
      </Form>

      <br />
      {secret && (
        <div
          className="alert alert-secondary"
          style={{ wordBreak: "break-all" }}
        >
          New Token (this will only be shown once):{" "}
          <strong
            popover-top={clicked ? "Copied to clipboard" : "Click to copy"}
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (secret) {
                navigator.clipboard.writeText(secret);
                setClicked(true);
              }
            }}
          >
            {secret}
          </strong>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(({ id, name }) => (
              <TokenRow key={id} id={id} name={name} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function TokenRow({ id, name }: { id: string; name: string }) {
  let { projectId } = useParams();

  return (
    <tr>
      <td>{name}</td>
      <td>
        <Link
          className="paper-btn btn-small btn-danger"
          to={`/dashboard/project/${projectId}/token/${id}/delete`}
        >
          Delete
        </Link>
      </td>
    </tr>
  );
}

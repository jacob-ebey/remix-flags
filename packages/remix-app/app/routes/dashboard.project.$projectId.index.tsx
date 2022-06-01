import { json, redirect } from "remix";
import { Link, useFetcher, useLoaderData, useParams } from "@remix-run/react";

import type { ActionFunction, LoaderFunction } from "~/types";
import { requireUserId } from "~/utils";

export let handle = {
  breadcrumb: { text: "Flags" },
};

export let action: ActionFunction = async ({
  context: { db, session },
  params: { projectId },
  request,
}) => {
  if (!projectId) return redirect("/dashboard");

  let userId = requireUserId(session, `/dashboard/project/${projectId}`);

  let formData = await request.formData();
  let intent = formData.get("intent");

  switch (intent) {
    case "toggle": {
      let enabled = formData.get("enabled") === "on";
      let flagId = formData.get("flagId");
      if (!flagId || typeof flagId !== "string") {
        throw json(null, { status: 400, statusText: "Bad Request" });
      }

      await db.setFlagEnabled({ enabled, flagId, userId });
      break;
    }
  }

  return json(null);
};

type LoaderData = {
  flags: { id: string; name: string; enabled: boolean }[];
};

export let loader: LoaderFunction = async ({
  context: { db, session },
  params: { projectId },
}) => {
  if (!projectId) throw json(null, { status: 404, statusText: "Not Found" });

  let userId = requireUserId(session, `/dashboard/project/${projectId}`);

  let flags = await db.getFlagsByProjectId({ projectId, userId });

  return json<LoaderData>({
    flags,
  });
};

export default function ProjectDashboard() {
  let { flags } = useLoaderData() as LoaderData;

  return (
    <main id="flags">
      <h2>Flags</h2>
      <p>
        <Link className="paper-btn" to="new/flag#new-flag">
          New Flag
        </Link>
      </p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Enabled</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map(({ id, name, enabled }) => (
              <FlagRow key={id} id={id} name={name} enabled={enabled} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function FlagRow({
  id,
  name,
  enabled,
}: {
  id: string;
  name: string;
  enabled: boolean;
}) {
  let fetcher = useFetcher();
  let { projectId } = useParams();

  return (
    <tr>
      <td>
        <fetcher.Form
          method="post"
          action={`/dashboard/project/${projectId}?index`}
        >
          <input type="hidden" name="flagId" value={id} />
          <input type="hidden" name="intent" value="toggle" />
          <fieldset className="form-group">
            <label className="paper-switch">
              <input
                name="enabled"
                type="checkbox"
                defaultChecked={enabled}
                disabled={fetcher.state !== "idle"}
                onChange={(event) => {
                  fetcher.submit(event.currentTarget.form);
                }}
              />
              <span className="paper-switch-slider"></span>
            </label>
          </fieldset>
        </fetcher.Form>
      </td>
      <td>{name}</td>
      <td>
        <Link
          className="paper-btn btn-small btn-danger"
          to={`flag/${id}/delete#delete-flag`}
        >
          Delete
        </Link>
      </td>
    </tr>
  );
}

import { json, redirect } from "remix";
import { Form, Link, useLoaderData } from "@remix-run/react";

import type { ActionFunction, LoaderFunction } from "~/types";
import { requireUserId } from "~/utils";

export let handle = {
  breadcrumb: { text: "Delete Flag" },
};

export let action: ActionFunction = async ({
  context: { db, session },
  params: { projectId, flagId },
}) => {
  if (!flagId || !projectId) return redirect("/dashboard");

  let userId = requireUserId(
    session,
    `/dashboard/project/${projectId}/flag/${flagId}/delete`
  );

  await db.deleteFlagById({ flagId, userId });

  return redirect(`/dashboard/project/${projectId}`);
};

type LoaderData = {
  flag: { name: string };
};

export let loader: LoaderFunction = async ({
  context: { db, session },
  params: { projectId, flagId },
}) => {
  if (!flagId || !projectId)
    throw json(null, { status: 404, statusText: "Not Found" });
  let userId = requireUserId(
    session,
    `/dashboard/project/${projectId}/flag/${flagId}/delete`
  );

  let flag = await db.getFlagById({ flagId, userId });

  if (!flag) throw json(null, { status: 404, statusText: "Not Found" });

  return json<LoaderData>({ flag });
};

export default function DeleteFlagDashboard() {
  let { flag } = useLoaderData() as LoaderData;

  return (
    <main id="delete-flag">
      <h2>Danger Zone</h2>
      <p>
        Are you sure you want to delete the flag <strong>{flag.name}</strong>?
      </p>
      <Form id="deleteForm" method="post" />
      <p>
        <button form="deleteForm" className="btn-danger">
          Yes
        </button>
        {" or "}
        <Link className="paper-btn" to={`..`}>
          No
        </Link>
      </p>
    </main>
  );
}

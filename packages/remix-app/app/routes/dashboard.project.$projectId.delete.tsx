import { json, redirect } from "remix";
import { Form, Link, useOutletContext } from "@remix-run/react";

import type { ActionFunction, LoaderFunction } from "~/types";
import { requireUserId } from "~/utils";

import type { OutletContext } from "./dashboard.project.$projectId";

export let handle = {
  breadcrumb: { text: "Delete" },
};

export let action: ActionFunction = async ({
  context: { db, session },
  params: { projectId },
}) => {
  if (!projectId) return redirect("/dashboard");

  let userId = requireUserId(session, `/dashboard/project/delete/${projectId}`);

  await db.deleteProjectById({ userId, projectId });

  return redirect("/dashboard");
};

export let loader: LoaderFunction = async ({
  context: { session },
  params: { projectId },
}) => {
  if (!projectId) throw json(null, { status: 404, statusText: "Not Found" });
  requireUserId(session, `/dashboard/project/${projectId}/new/flag`);

  return json(null);
};

export default function DeleteProjectDashboard() {
  let project = useOutletContext() as OutletContext;

  return (
    <main id="delete-project">
      <h2>Danger Zone</h2>
      <p>
        Are you sure you want to delete the project{" "}
        <strong>{project.name}</strong>?
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

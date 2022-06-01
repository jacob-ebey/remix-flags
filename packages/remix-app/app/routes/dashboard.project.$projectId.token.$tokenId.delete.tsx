import { json, redirect } from "remix";
import { Form, Link, useLoaderData, useParams } from "@remix-run/react";

import type { ActionFunction, LoaderFunction } from "~/types";
import { requireUserId } from "~/utils";

export let handle = {
  breadcrumb: { text: "Delete Token" },
};

export let action: ActionFunction = async ({
  context: { db, session },
  params: { projectId, tokenId },
}) => {
  if (!tokenId || !projectId) return redirect("/dashboard");

  let userId = requireUserId(
    session,
    `/dashboard/project/${projectId}/tokens/${tokenId}/delete`
  );

  await db.deleteTokenById({ tokenId, userId });

  return redirect(`/dashboard/project/${projectId}/tokens`);
};

type LoaderData = {
  token: { name: string };
};

export let loader: LoaderFunction = async ({
  context: { db, session },
  params: { projectId, tokenId },
}) => {
  if (!tokenId || !projectId)
    throw json(null, { status: 404, statusText: "Not Found" });
  let userId = requireUserId(
    session,
    `/dashboard/project/${projectId}/tokens/${tokenId}/delete`
  );

  let token = await db.getTokenById({ tokenId, userId });

  if (!token) throw json(null, { status: 404, statusText: "Not Found" });

  return json<LoaderData>({ token });
};

export default function DeleteFlagDashboard() {
  let { token } = useLoaderData() as LoaderData;
  let { projectId } = useParams();

  return (
    <main id="delete-token">
      <h2>Danger Zone</h2>
      <p>
        Are you sure you want to delete the token <strong>{token.name}</strong>?
      </p>
      <Form id="deleteForm" method="post" />
      <p>
        <button form="deleteForm" className="btn-danger">
          Yes
        </button>
        {" or "}
        <Link
          className="paper-btn"
          to={`/dashboard/project/${projectId}/tokens`}
        >
          No
        </Link>
      </p>
    </main>
  );
}

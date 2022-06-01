import { json } from "remix";
import { useLoaderData } from "@remix-run/react";

import type { LoaderFunction } from "~/types";
import { requireUserId } from "~/utils";

type LoaderData = {
  user: { id: string; email: string };
};

export let loader: LoaderFunction = async ({ context: { db, session } }) => {
  let userId = requireUserId(session, "/dashboard/profile");

  let user = await db.getUserById(userId);

  if (!user) throw json(null, { status: 404, statusText: "Not Found" });

  return json<LoaderData>({ user });
};

export default function ProfileDashboard() {
  let { user } = useLoaderData() as LoaderData;

  return (
    <main id="profile">
      <h1>Profile</h1>
      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>ID</dt>
        <dd>{user.id}</dd>
      </dl>
    </main>
  );
}

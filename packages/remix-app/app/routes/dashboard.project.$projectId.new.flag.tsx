import { json, redirect } from "remix";
import { Form, useActionData, useTransition } from "@remix-run/react";

import type { ActionFunction, LoaderFunction } from "~/types";
import { requireUserId } from "~/utils";

type ActionData = {
  errors?: {
    global?: string;
    name?: string;
    gitHubRepo?: string;
  };
};

export let handle = {
  breadcrumb: { text: "New Flag" },
};

export let action: ActionFunction = async ({
  context: { db, logger, session },
  params: { projectId },
  request,
}) => {
  if (!projectId) return redirect("/dashboard");
  let userId = requireUserId(
    session,
    `/dashboard/project/${projectId}/new/flag`
  );

  let formData = await request.formData();
  let name = formData.get("name");
  let enabled = formData.get("enabled") === "on";

  let errors: ActionData["errors"];
  if (!name || typeof name !== "string") {
    errors = { ...errors, name: "Name is required" };
  }

  if (errors) return json<ActionData>({ errors });

  name = String(name);

  try {
    await db.createFlag({ userId, name, enabled, projectId });
    return redirect(`/dashboard/project/${projectId}`);
  } catch (error) {
    logger.captureException(error);
    return json<ActionData>({
      errors: { global: "An error occurred. Please try again later." },
    });
  }
};

export let loader: LoaderFunction = async ({
  context: { session },
  params: { projectId },
}) => {
  if (!projectId) throw json(null, { status: 404, statusText: "Not Found" });
  requireUserId(session, `/dashboard/project/${projectId}/new/flag`);

  return json(null);
};

export default function NewFlagDashboard() {
  let { errors } = (useActionData() || {}) as ActionData;
  let { state } = useTransition();

  return (
    <main id="new-flag">
      <Form method="post">
        <h2>New Flag</h2>

        {errors?.global && <p className="error">{errors.global}</p>}

        <div className="form-group">
          <label htmlFor="nameInput">Flag Name</label>
          <input
            className="input-block"
            required
            type="text"
            placeholder="yourFlagName"
            id="nameInput"
            name="name"
          />
          {errors?.name && (
            <label htmlFor="nameInput" className="error">
              {errors.name}
            </label>
          )}
        </div>

        <fieldset className="form-group">
          <label htmlFor="enabledInput" className="paper-switch-tile">
            <input id="enabledInput" name="enabled" type="checkbox" />
            <div className="paper-switch-tile-card border">
              <div className="paper-switch-tile-card-front border background-warning">
                Off
              </div>
              <div className="paper-switch-tile-card-back border background-secondary">
                On
              </div>
            </div>
          </label>
        </fieldset>

        <button type="submit" disabled={state !== "idle"}>
          Create
        </button>
      </Form>
    </main>
  );
}

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

export let action: ActionFunction = async ({
  context: { db, logger, session },
  request,
}) => {
  let userId = requireUserId(session, "/projects/new");

  let formData = await request.formData();
  let name = formData.get("name");

  let errors: ActionData["errors"];
  if (!name || typeof name !== "string") {
    errors = { ...errors, name: "Name is required" };
  }

  if (errors) return json<ActionData>({ errors });

  name = String(name);

  try {
    let projectId = await db.createProject({ userId, name });
    return redirect(`/dashboard/project/${projectId}`);
  } catch (error) {
    logger.captureException(error);
    return json<ActionData>({
      errors: { global: "An error occurred. Please try again later." },
    });
  }
};

export let loader: LoaderFunction = async ({ context: { session } }) => {
  requireUserId(session, "/dashboard/projects/new");

  return json(null);
};

export default function NewProjectDashboard() {
  let { errors } = (useActionData() || {}) as ActionData;
  let { state } = useTransition();

  return (
    <main id="new-project">
      <Form method="post">
        <h2>New Project</h2>

        {errors?.global && <p className="error">{errors.global}</p>}

        <div className="form-group">
          <label htmlFor="nameInput">Project Name</label>
          <input
            className="input-block"
            required
            type="text"
            placeholder="Project Name"
            id="nameInput"
            name="name"
          />
          {errors?.name && (
            <label htmlFor="nameInput" className="error">
              {errors.name}
            </label>
          )}
        </div>

        <button type="submit" disabled={state !== "idle"}>
          Create
        </button>
      </Form>
    </main>
  );
}

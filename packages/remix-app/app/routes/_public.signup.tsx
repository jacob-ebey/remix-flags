import { json, redirect } from "remix";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";

import type { ActionFunction } from "~/types";

type ActionData = {
  errors?: {
    global?: string;
    email?: string;
    password?: string;
    verifyPassword?: string;
  };
};

export let action: ActionFunction = async ({
  request,
  context: { db, session },
}) => {
  let formData = await request.formData();
  let email = String(formData.get("email"));
  let password = String(formData.get("password"));
  let verifyPassword = String(formData.get("verifyPassword"));

  let errors: ActionData["errors"];
  if (!email.match(/^.+@.+\..+$/)) {
    errors = { ...errors, email: "Invalid email" };
  }

  if (!password.match(/^.{8,}$/)) {
    errors = { ...errors, password: "Password must be at least 8 characters" };
  } else if (password !== verifyPassword) {
    errors = { ...errors, verifyPassword: "Passwords must match" };
  }

  if (errors) return json<ActionData>({ errors });

  let user = await db.signup({ email, password });

  if (!user) {
    return json<ActionData>({
      errors: { global: "An error occurred. Does your account already exist?" },
    });
  }

  session.set("userId", user.id);

  return redirect("/");
};

export default function Signup() {
  let { errors } = (useActionData() || {}) as ActionData;
  let { state } = useTransition();

  return (
    <main>
      <Form method="post">
        <h2>Signup</h2>

        {errors?.global && <p className="error">{errors.global}</p>}

        <div className="form-group">
          <label htmlFor="emailInput">Email</label>
          <input
            className="input-block"
            required
            type="email"
            autoComplete="current-email"
            placeholder="rachel@remix.run"
            id="emailInput"
            name="email"
          />
          {errors?.email && (
            <label htmlFor="emailInput" className="error">
              {errors.email}
            </label>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="passwordInput">Password</label>
          <input
            className="input-block"
            required
            type="password"
            autoComplete="new-password"
            placeholder="********"
            id="passwordInput"
            name="password"
          />
          {errors?.password && (
            <label htmlFor="passwordInput" className="error">
              {errors.password}
            </label>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="verifyPasswordInput">Verify Password</label>
          <input
            className="input-block"
            required
            type="password"
            autoComplete="new-password"
            placeholder="********"
            id="verifyPasswordInput"
            name="verifyPassword"
          />
          {errors?.verifyPassword && (
            <label htmlFor="verifyPasswordInput" className="error">
              {errors.verifyPassword}
            </label>
          )}
        </div>

        <button type="submit" disabled={state !== "idle"}>
          Signup
        </button>
      </Form>
      <p>
        Already have an account? <Link to="/login">Login</Link>.
      </p>
    </main>
  );
}

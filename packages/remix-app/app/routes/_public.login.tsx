import { json, redirect } from "remix";
import {
  Form,
  Link,
  useActionData,
  useFormAction,
  useSearchParams,
  useTransition,
} from "@remix-run/react";

import type { ActionFunction } from "~/types";

type ActionData = {
  errors?: {
    global?: string;
    email?: string;
    password?: string;
  };
};

export let action: ActionFunction = async ({
  context: { db, session },
  request,
}) => {
  let formData = await request.formData();
  let email = String(formData.get("email"));
  let password = String(formData.get("password"));

  let errors: ActionData["errors"];
  if (!email.match(/^.+@.+\..+$/)) {
    errors = { ...errors, email: "Invalid email" };
  }

  if (!password.match(/^.{8,}$/)) {
    errors = { ...errors, password: "Password must be at least 8 characters" };
  }

  if (errors) return json<ActionData>({ errors });

  let user = await db.login({ email, password });

  if (!user) {
    return json<ActionData>({
      errors: { global: "An error occurred. Invalid email or password?" },
    });
  }

  session.set("userId", user.id);

  let url = new URL(request.url);
  let redirectTo = url.searchParams.get("redirect") || "/";
  if (!redirectTo.startsWith("/") || redirectTo.charAt(1) === "/")
    redirectTo = "/";

  return redirect(redirectTo);
};

export default function Login() {
  let { errors } = (useActionData() || {}) as ActionData;
  let [searchParams] = useSearchParams();
  let { state } = useTransition();

  let formAction = useFormAction(".", "post");
  if (searchParams.has("redirect")) {
    formAction += `?redirect=${searchParams.get("redirect")}`;
  }

  return (
    <main>
      <Form action={formAction} method="post">
        <h2>Login</h2>

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
            autoComplete="current-password"
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

        <button type="submit" disabled={state !== "idle"}>
          Login
        </button>
      </Form>
      <p>
        Don't have an account? <Link to="/signup">Signup</Link>.
      </p>
    </main>
  );
}

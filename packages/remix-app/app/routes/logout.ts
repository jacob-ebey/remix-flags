import { redirect } from "remix";
import type { ActionFunction, LoaderFunction } from "~/types";

export let action: ActionFunction = ({ context: { session } }) => {
  session.unset("userId");
  return redirect("/");
};

export let loader: LoaderFunction = () => redirect("/");

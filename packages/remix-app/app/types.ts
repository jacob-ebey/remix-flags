import type { Session } from "remix";
import type { DataFunctionArgs as RemixDataFunctionArgs } from "remix";

import type { Db } from "db";

export interface AppLoadContext {
  cache: Cache;
  db: Db;
  env: Env;
  session: Session;
}

export interface DataFunctionArgs
  extends Omit<RemixDataFunctionArgs, "context"> {
  context: AppLoadContext;
}

export interface ActionFunction {
  (args: DataFunctionArgs): null | Response | Promise<Response>;
}

export interface LoaderFunction {
  (args: DataFunctionArgs): null | Response | Promise<Response>;
}

import type { Session } from "remix";
import type { DataFunctionArgs as RemixDataFunctionArgs } from "remix";

import type { Db } from "db";
import type { Logger } from "logger";

export interface AppLoadContext {
  cache: Cache;
  db: Db;
  env: Env;
  logger: Logger;
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

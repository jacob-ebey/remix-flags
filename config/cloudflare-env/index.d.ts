interface Env {
  __STATIC_CONTENT: KVNamespace;

  FAUNA_SECRET: string;
  FAUNA_URL?: string;
  SENTRY_DSN?: string;
  SESSION_SECRET: string;
}

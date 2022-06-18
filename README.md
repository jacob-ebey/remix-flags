# remix-flags

_Eventually_ Everything you'll need for successful feature flagging

## What's inside?

This repo uses [npm](https://www.npmjs.com/) as a package manager. It includes the following packages/apps:

### Packages

- `packages/db`: abstractions for DB interactions
- `packages/db-fauna`: an implementation of the `db` abstraction using FaunaDB
- `packages/remix-app`: a [Remix](https://remix.run/) application that makes up the public facing UX
- `packages/worker`: a Cloudflare Worker that brings everything together for deployment
- `config/cloudflare-env`: type definitions for bindings shared across the packages
- `config/eslint-config-custom`: shared eslint config that includes `@remix-run/eslint-config` and `prettier`
- `config/tsconfig`: base tsconfig that other packages inherit from

Each `package/*` is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Github Actions](https://github.com/features/actions)

## Setup

Clone and install dependencies:

```
npm i
```

### Build

To build all apps and packages, run the following command:

```
npm run build
```

### Develop

Copy `packages/worker/wrangler.example.toml` to `packages/worker/wrangler.dev.toml` and edit it to match your environment, or leave it as-is for a local dev environment using the `docker-compose.yml`.

If using docker for your local database, you can run the following command to start the database:

```
docker-compose up -d
```

To develop all apps and packages, run the following command:

```
npm run dev
```

### Deployment

Deployment is done through GitHub Actions. Deployments are triggered whenever you merge to the `main` branch.

The following GitHub action secrets are required:

- `CF_API_TOKEN`: your Cloudflare API token used for deployment
- `FAUNA_ADMIN_KEY`: your FaunaDB admin key used for migrations

The following GitHub action secrets are optional:

- `TURBO_TEAM`: your Turbo team ID used for remote caching
- `TURBO_TOKEN`: your Turbo token used for remote caching

### Remote Caching

Turborepo can use a technique known as [Remote Caching (Beta)](https://turborepo.org/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching (Beta) you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/core-concepts/pipelines)
- [Caching](https://turborepo.org/docs/core-concepts/caching)
- [Remote Caching (Beta)](https://turborepo.org/docs/core-concepts/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/core-concepts/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)

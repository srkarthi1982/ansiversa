# @ansiversa/db

Shared database utilities (drivers, repositories, and types) for the Ansiversa ecosystem.

## Installation

```bash
npm install @ansiversa/db
```

## Usage

```ts
import { createAstroDbDriver, createPlatformsRepo } from "@ansiversa/db";

const driver = createAstroDbDriver({
  url: process.env.ASTRO_DB_URL!,
  authToken: process.env.ASTRO_DB_AUTH_TOKEN,
});

const platformsRepo = createPlatformsRepo(driver);
const platforms = await platformsRepo.list();
```

## Drivers

- `createAstroDbDriver` – wraps the `@libsql/client/web` client and exposes a minimal query/execute API.

## Repositories

- `createPlatformsRepo` – list, paginate, get, create, update, and delete platforms.
- `createSubjectsRepo` – manage subjects with list, filtered pagination, and CRUD helpers.
- `createTopicsRepo` – manage topics with list, filtered pagination, and CRUD helpers.
- `createRoadmapsRepo` – manage roadmaps with list, filtered pagination, and CRUD helpers.
- `createQuestionsRepo` – fetch, paginate, create, update, and delete questions, including random selection helpers.
- `createResultsRepo` – list, paginate, and manage quiz results.

## Types

All Zod schemas and associated TypeScript types can be imported from `@ansiversa/db`:

```ts
import { PlatformSchema, QuestionSchema, type Platform, type Question } from "@ansiversa/db";
```

## Building

```bash
npm run build
```

This uses [tsup](https://tsup.egoist.dev/) to emit both ESM and CJS bundles along with type declarations.

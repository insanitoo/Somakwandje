# Somakwendje

Website do artista plástico angolano O Abstrato Doido / Dioleny Intya, com galeria, agenda, apresentação do artista e área de administração.

## Run & Operate

- `pnpm install` — install workspace dependencies
- Replit starts the website and API through the configured artifact workflows.
- `pnpm --filter @workspace/o-abstrato-doido run dev` — run the Vite website locally.
- `pnpm --filter @workspace/api-server run dev` — build and run the Express API locally.
- `pnpm run typecheck` — typecheck workspace packages.
- `pnpm run build` — typecheck and build workspace packages.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec.
- `pnpm --filter @workspace/db run push` — apply Drizzle schema changes to the development database only.
- Required environment: `DATABASE_URL` and `SESSION_SECRET`.
- Optional upload environment: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. Upload endpoints return 503 until these are configured.

## Stack

- pnpm workspaces and TypeScript
- Website: React and Vite
- API: Express 5
- Database: PostgreSQL and Drizzle ORM
- API client and validation types are generated from the OpenAPI spec.

## Where things live

- `artifacts/o-abstrato-doido/` — website pages, components and styles.
- `artifacts/api-server/` — API routes and server.
- `lib/db/src/schema/` — database schema.
- `lib/api-spec/` — OpenAPI source contract and code generation.
- `attached_assets/` — local artwork and photography used by the website.

## Architecture decisions

- The API client and validation schemas are generated from the shared OpenAPI contract.
- PostgreSQL schema changes are applied to the development database with Drizzle.
- Website analytics store country, route and date; do not persist raw IP addresses.

## Product

Visitors can browse artworks, learn about the artist and see events. The site also includes an administration area for managing its content.

## User preferences

_Nenhuma preferência permanente registada._

## Gotchas

- The development database may contain legacy columns. Preserve them; keep schema changes additive.
- Do not use `push-force` or accept a Drizzle proposal that truncates data.
- Image and video uploads need the optional Cloudinary environment variables listed above.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

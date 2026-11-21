---
name: O Abstrato Doido stack decisions
description: Key non-obvious decisions for the artist website project — auth, DB, API codegen.
---

## Admin auth
- Session-based auth via `express-session` + bcryptjs. Session secret from `SESSION_SECRET` env var.
- Do not keep a shared/default admin password in source or memory; seed or reset `admin` using `ADMIN_PASSWORD` from Replit Secrets and store only its bcrypt hash.
- `logout.mutate(undefined, ...)` — generated mutation expects `void`, not `{}`.

## DB lib rebuild rule
- After adding new table exports to `lib/db/src/schema/`, must run `pnpm run typecheck:libs` before artifact typechecks can see the new exports. Skipping this causes TS2305 "no exported member" in api-server.

**Why:** lib packages are composite and emit declarations; stale `.d.ts` files won't include new exports.

## API hooks
- All hooks from `@workspace/api-client-react`. Generated names: `useListObras`, `useCreateObra`, `useUpdateObra`, `useDeleteObra`, `useListEventos`, `useCreateEvento`, `useUpdateEvento`, `useDeleteEvento`, `useListBlog`, `useCreateBlogPost`, `useUpdateBlogPost`, `useDeleteBlogPost`, `useLogin`, `useLogout`, `useGetMe`, `useGetBlogPost`.
- Query key helpers: `getListObrasQueryKey`, `getListEventosQueryKey`, `getListBlogQueryKey`, `getGetBlogPostQueryKey`, `getGetMeQueryKey`.

## API code generation
- The current Orval generator needs Node.js 22 and produces Zod 4 schemas. Keep `@workspace/api-zod` on Zod 4 even if the workspace catalog remains on Zod 3.

**Why:** Node 20 lacks `Map.groupBy`, and Orval's generated `zod.int()` schema is not available in Zod 3.

**How to apply:** Run API code generation with Node 22 and preserve the package-local Zod 4 dependency.

## Image assets
- `@assets/image_1782125581457.png` = hero painting (fullscreen hero bg)
- `@assets/image_1782125622268.png` = artist photo (about + sobre sections)
- Vite alias `@assets` → `../../attached_assets` relative to artifact dir.

## WhatsApp contact
- Number hardcoded as `351912345678` in `Galeria.tsx` — update before going live.

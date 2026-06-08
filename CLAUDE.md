# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Meta Rules

1. **Primary instruction file**: This file is the authoritative source of truth.
2. **Ignore GEMINI.md** for project instructions.
3. **Language**: Communicate and write all artifacts (implementation_plan, walkthrough) in Japanese.

## Project Overview

**Visual Echo** — an asynchronous, branching image-association game. Players describe an image in text; the AI (NVIDIA NIM / FLUX.1-schnell) generates a new image from that text. Each cycle (image → text → new image) becomes a node, forming a "tree of imagination" (one image can spawn multiple interpretations, like Git branches).

## Architecture

### Data Model — single self-referencing `generations` table (Adjacency List)
- `parent_id` links child→parent; root nodes have `parent_id = NULL`; indexed for traversal.
- **The tree is NOT materialized/cached** — always query `generations` directly; use recursive CTEs for deep traversal.
- Status is strictly `'pending' | 'completed' | 'failed'`.

### Supabase Dual-Client — do NOT mix them
- `lib/supabase/server.ts` — Server Components/Actions/Route Handlers. `@supabase/ssr` cookie sessions. **async**: `const supabase = await createClient()`.
- `lib/supabase/client.ts` — Client Components (`'use client'`). Browser sessions, sync: `createClient()`.
- `lib/supabase/admin.ts` — RLS-bypassing **server-only** writes (uses `SUPABASE_SECRET_KEY`). All INSERT/UPDATE/DELETE go through this; anon/publishable writes are blocked by RLS.
- `middleware.ts` refreshes sessions across requests. Using the wrong client causes auth/session bugs.

### Type Safety
- `types/database.ts` mirrors the schema (`Generation`, `GenerationInsert`, `GenerationUpdate`, `GenerationStatus`).
- **When changing the schema, update `supabase/schema.sql` AND `types/database.ts` (and any RPC) in the same commit.**

### Image Generation — NVIDIA NIM (`lib/nim/client.ts`)
- Model `black-forest-labs/flux.1-schnell` (4-step distilled) via standard `fetch`. Sole export: `generateImage(prompt): Promise<string>` (returns public URL).
- `POST https://ai.api.nvidia.com/v1/genai/${NVIDIA_NIM_MODEL}`, body `{ prompt, width:1024, height:1024, seed, steps:4 }`.
- Response base64: `artifacts[0].base64` (NIM) with `data[0].b64_json` (OpenAI-compatible) fallback.
- **schnell returns JPEG** — extension is decided by magic bytes (`FF D8`→`.jpg`, `89 50`→`.png`), not hardcoded.
- Saved locally to `public/images/generated/` (gitignored). Generated in background via `after()` in the Server Action.

### Query Layer — `lib/queries/` (RPC wrappers)
Complex queries live in PostgreSQL RPCs, wrapped to take `SupabaseClient<Database>` (usable from Server/Client):
- `tree.ts` (`get_tree_structure` + `buildTreeFromFlatData`), `leaves.ts` (`get_leaf_nodes`, `NOT EXISTS`), `lineage.ts` (`get_lineage`, recursive CTE).

## Commands

```bash
npm run dev          # dev server (localhost:3000) — see "Local dev" below for op:// envs
npm run build        # production build
npm run lint         # ESLint (pre-commit hook で自動実行)
npm test             # vitest run (all)
npx vitest run lib/queries/tree.test.ts   # single file
npx vitest run -t "空配列"                 # by test name
```

## Environment Setup (`.env.local.example`)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_... (browser-safe, NEXT_PUBLIC_ required)
SUPABASE_SECRET_KEY=                    # sb_secret_... (server-only, never expose)
NVIDIA_NIM_API_KEY=                     # https://build.nvidia.com
NVIDIA_NIM_MODEL=black-forest-labs/flux.1-schnell   # optional
```
Supabase uses the **new API key scheme** (publishable/secret), not legacy anon/service_role JWTs. RLS policies still reference the `service_role` Postgres role, to which the secret key maps — no SQL change needed.
**DB setup**: run `supabase/schema.sql` in the Supabase SQL Editor first.

### Local dev with `op://` references
If `.env.local` holds 1Password `op://` references, `next dev` sends them unresolved → 401 / "Invalid API key". Start via `op run --env-file=.env.local -- npm run dev`. On WSL (no native `op`), use Windows `op.exe` + `WSLENV` to pass resolved vars to WSL `npm`; the `WSLENV` mapping lives in `.wslenv.env` (gitignored). Details in `LESSONS.md`.

## Testing

Vitest (`vitest.config.ts` resolves only the `@` alias). Three layers:
- **Pure functions** (`buildTreeFromFlatData`, status helpers) — no mocks.
- **RPC wrappers** — inject `createMockSupabase({ rpc_name: { data, error } })` from `lib/test-helpers.ts`.
- **Server Actions** (`app/actions/generations.test.ts`) — `vi.mock` deps; import the `'use server'` file via `await import()`.

## Key Constraints

- **Next.js 16 / React 19 / App Router only**; TypeScript strict.
- `next.config.ts` `remotePatterns` only covers legacy DB records (via.placeholder.com); NIM images are local, so no remote pattern needed.
- **RLS** is permissive for dev — tighten before production.

## Game Flow

User sees an image (blind to its history) → enters a description → Server Action creates a `pending` record and returns immediately → `generating` page polls (2s) → background calls NVIDIA NIM, saves image, sets `completed` → `result` page shows the transformation chain.

## Implemented Features
- **Gallery** (`/gallery`, `/gallery/all`): random 3 + full list
- **Image Detail** (`/gallery/[id]`): lineage timeline, child grid, prompt input
- **Play** (`/play/[id]`): blind mode (no parent image)
- **Generation Flow**: pending → generating (poll) → result
- **Tree View** (`/tree`): tree visualization

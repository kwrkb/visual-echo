# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Visual Echo** is an asynchronous, branching image association game powered by AI. Players describe an image in text, and the AI (Google Gemini) generates a new image from that description. This creates a tree structure of visual transformations, similar to Git branches.

Core concept: A single image can spawn multiple interpretations, forming a "tree of imagination" where each node represents a generation cycle (image → text → new image).

## Architecture

### Data Model: Tree Structure via Self-Referencing Table

The entire game state is represented by a single `generations` table that uses the **Adjacency List pattern** for tree structures:

- `parent_id` creates parent-child relationships between generations
- Root nodes (starting images) have `parent_id = NULL`
- Each node can have multiple children, enabling branching narratives
- Indexes on `parent_id` enable efficient tree traversal queries

**Critical architectural decision**: The tree structure is NOT materialized or cached. Always query directly from the `generations` table. Use recursive CTEs for deep tree traversal if needed.

### Supabase Client Architecture: Dual-Client Pattern

This project uses **separate Supabase clients** for different Next.js contexts:

1. **Server-side** (`lib/supabase/server.ts`):
   - Used in Server Components, Server Actions, and Route Handlers
   - Handles cookie-based session management via `@supabase/ssr`
   - Must be imported with `await` due to async `cookies()` call
   - Example: `const supabase = await createClient()`

2. **Client-side** (`lib/supabase/client.ts`):
   - Used in Client Components (components with `'use client'`)
   - Uses browser localStorage for sessions
   - Synchronous initialization
   - Example: `const supabase = createClient()`

**Do NOT mix these clients**. Using the wrong client will cause session/auth issues. The middleware (`middleware.ts`) automatically refreshes sessions across requests.

### Type Safety: Database Schema Types

All database operations are type-safe via `types/database.ts`:

- `Database` interface mirrors the Supabase schema exactly
- Exported type aliases: `Generation`, `GenerationInsert`, `GenerationUpdate`, `GenerationStatus`
- Enables full IntelliSense for `.from('generations').select()` queries
- Status field is strictly typed as `'pending' | 'completed' | 'failed'`

**When modifying the database schema**: Update `supabase/schema.sql` AND `types/database.ts` in sync.

### Image Generation: Gemini API

Image generation uses **Google Gemini 2.5 Flash Image** model via `@google/genai` SDK (`lib/gemini/client.ts`).

**Implementation details**:
- Uses `gemini-2.5-flash-image` model for image generation
- Generated images are saved locally in `public/images/generated/` directory
- Image URLs are stored as `/images/generated/{timestamp}-{random}.png`
- Images are generated asynchronously in background via Server Actions

**Background generation flow**:
1. Server Action creates a `pending` generation record
2. Returns immediately with the generation ID
3. Background function generates image via Gemini API
4. Downloads base64 image data and saves to local filesystem
5. Updates generation record to `completed` status with image URL

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code quality
npm run lint         # Run ESLint
```

## Environment Setup

Required environment variables (see `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon/public key
GEMINI_API_KEY=                    # Google Gemini API key
GEMINI_MODEL=gemini-2.0-flash-exp  # Optional: model version
```

**Database setup**: Run `supabase/schema.sql` in Supabase SQL Editor before first use.

## Development Patterns

### Server Component Database Query Pattern

```typescript
import { createClient } from '@/lib/supabase/server';

async function MyServerComponent() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('parent_id', parentId);

  // Handle data...
}
```

### Client Component Database Query Pattern

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

function MyClientComponent() {
  const [data, setData] = useState<Generation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('generations')
        .select('*');
      setData(data || []);
    }
    fetchData();
  }, []);

  // Render data...
}
```

### Querying Tree Structures

To get all children of a node:
```typescript
const { data: children } = await supabase
  .from('generations')
  .select('*')
  .eq('parent_id', nodeId);
```

To get root nodes (starting images):
```typescript
const { data: roots } = await supabase
  .from('generations')
  .select('*')
  .is('parent_id', null);
```

For deep tree traversal, consider using Postgres recursive CTEs via `.rpc()` for performance.

## Key Technical Constraints

- **Next.js 15**: Uses App Router exclusively (no Pages Router)
- **React 19**: Uses latest React features
- **TypeScript strict mode**: All code must be type-safe
- **Image optimization**: next.config.ts allows remote image patterns for AI-generated images
- **RLS is enabled**: Currently permissive (all operations allowed) for development. Tighten policies before production deployment.

## Game Flow Implementation Notes

The intended game loop is:

1. User views an image (without seeing its parent or prompt history)
2. User enters a text description of what they see
3. System creates a `pending` generation record with the prompt
4. User is redirected to generating page which polls for completion
5. System calls Gemini API to generate a new image in background
6. System saves image to local filesystem and updates record to `completed`
7. User is redirected to result page showing the transformation chain
8. User can now view the historical chain leading to their contribution

**Status field usage**:
- `pending`: Generation request created but image not yet generated
- `completed`: Image successfully generated and stored
- `failed`: Image generation failed (store error details separately if needed)

## Implemented Features

### Gallery Display
- Shows up to 3 most recent completed images
- Implements parent-based deduplication: for images with same parent, only shows the latest
- Root images (parent_id = null) are all included in the display
- Located at `/gallery` route

### Image Detail & Generation Flow
- Detail page shows image, original prompt, and metadata
- Users can input new prompts to generate child images
- Child images are displayed in a grid below the parent
- Generation status page polls database every 2 seconds
- Result page shows before/after transformation when parent exists

### UI Styling
- Dark text colors for readability (text-gray-900 for main text, text-gray-700 for subtitles)
- Responsive grid layouts with hover effects
- Image cards with aspect-ratio preservation
- Smooth transitions and animations

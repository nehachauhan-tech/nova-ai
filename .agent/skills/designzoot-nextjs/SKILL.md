---
name: designzoot-nextjs
description: |
  DesignZoot Next.js application development skill — project-specific conventions, architecture patterns,
  design system, Supabase integration, credit system, AI image generation rules, and Vercel deployment workflow.
  Use when: working on the zootm Next.js app, creating new pages/components/API routes, fixing bugs,
  adding features, writing styles, integrating Supabase, handling credits, generating AI images,
  or deploying changes. Even if you're just editing a single file in the zootm project, consult this
  skill to ensure consistency with established patterns.
---

# DesignZoot Next.js Development Skill

This skill encodes the exact conventions, patterns, and rules of the **DesignZoot** (`zootm`) Next.js 15 application — an AI-powered jewelry design studio. Every new page, component, API route, and style must follow these patterns for consistency and maintainability.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI Library | React | 19 |
| Language | TypeScript | 5 (strict) |
| Styling | Tailwind CSS | v4 |
| Backend/Auth/DB | Supabase | Client + Service Role |
| Data Fetching | SWR | 2.x |
| Icons | Lucide React | Latest |
| Font | Plus Jakarta Sans (primary) | via Google Fonts |
| Deployment | Vercel | ap-south-1 |
| AI Model | Gemini 2.5 Flash Image Preview | Exclusive |

## Project Architecture

```
zootm/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── api/                # ~59 API route groups
│   │   ├── layout.tsx          # Root layout (AuthProvider → SWRProvider)
│   │   ├── globals.css         # Global styles + Tailwind v4 @theme
│   │   ├── providers/          # SWRProvider
│   │   └── [feature-dirs]/     # ~39 page directories (design, diy, shop, manage, etc.)
│   ├── components/             # Shared UI components
│   │   ├── design-system/      # Core design system components
│   │   ├── configurator/       # Product configurator components
│   │   ├── edit/               # Image editing components
│   │   └── *.tsx               # Standalone shared components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core utilities & business logic
│   │   ├── auth-context.tsx    # AuthProvider with profile/plan/credits
│   │   ├── supabaseClient.ts   # Client-side Supabase (proxy-based)
│   │   ├── supabase-server.ts  # Server-side Supabase (service role)
│   │   ├── credits.ts          # Credit system utilities
│   │   └── [feature libs]      # Feature-specific utilities
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # General-purpose utilities
├── tailwind.config.ts          # Design tokens: brand, semantic, interactive, surface colors
├── next.config.ts              # Rewrites, redirects, image config
└── supabase-schema.yaml        # Database schema source of truth
```

## Design System

### Typography
- **Primary font**: `Plus Jakarta Sans` — use as body/UI font, import via Google Fonts
- **Display font**: Playfair Display (`--font-playfair-display`) — used for headings/hero text
- **Logo font**: Oswald (`--font-oswald`) — used for brand logo, weight 200
- **Fallback**: system-ui, sans-serif

### Colors (from `tailwind.config.ts`)
- **Brand**: `brand-primary: #000000`, hover: `#1a1a1a`, pressed: `#333333`
- **Background**: `#eeeeee` (per global rules), dark theme root: `#000000`
- **Semantic**: success `#10b981`, warning `#f59e0b`, error `#ef4444`, info `#3b82f6`
- **Interactive**: primary `#000000`, secondary `#f3f4f6`, link `#3b82f6`
- **Surface**: background `#f9fafb`, card `#ffffff`, overlay `#00000080`, border `#e5e7eb`

### Tailwind v4 Integration
The project uses Tailwind CSS v4 with `@theme inline` in `globals.css`:
```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-display: var(--font-playfair-display);
  --font-logo: var(--font-oswald);
}
```

Custom design tokens in `tailwind.config.ts` include component-specific border radii, shadows, z-index scales, and transition durations. Always use these tokens instead of arbitrary values.

### Icons
- **Use**: Lucide React (primary), React Icons (alternative)
- **Never use**: Emoji icons
- **Import**: Direct imports only (e.g., `import { Search } from 'lucide-react'`)

## Component Patterns

### Root Layout Wrapping Order
```
<html> → <body> → <GoogleAnalytics /> → <AuthProvider> → <SWRProvider> → {children}
```

All pages automatically have auth context and SWR available. Use `useAuth()` to access user, session, profile, plan, credits, and `isAdmin` status.

### Page Structure
Most pages follow this layout pattern with a navigation panel:
```tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { LeftNavigationPanel } from '@/components/LeftNavigationPanel';
// or DIYNavigationPanel, ManageNavigationPanel depending on section

export default function FeaturePage() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSkeleton />;
  if (!user) return <AccessDenied />;

  return (
    <div className="flex h-screen">
      <LeftNavigationPanel />
      <main className="flex-1 overflow-auto p-6">
        {/* Page content */}
      </main>
    </div>
  );
}
```

### Tab-Switch Refetch Prevention
Always guard `useEffect` data fetches to prevent re-fetching on browser tab switches:
```tsx
// ✅ CORRECT — only fetch when data is actually missing
useEffect(() => {
  if (!authLoading && user && items.length === 0 && !loading) {
    loadData();
  }
}, [authLoading, user, items.length, loading]);

// ❌ WRONG — refetches every time user switches tabs
useEffect(() => {
  if (!authLoading && user) {
    loadData();
  }
}, [authLoading, user]);
```

### SWR Configuration
The global SWR config in `SWRProvider` already sets:
- `shouldRetryOnError: false`
- `revalidateOnFocus: false`
- Auth token automatically included via custom fetcher

For detailed component and page patterns, see `references/component-patterns.md`.

## API Route Patterns

### Standard API Route Structure
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // ... business logic with supabase ...

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Exception in API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Key patterns:
- Create Supabase client at top of file with service role key
- Validate all input parameters early, return 400 with descriptive error
- Wrap entire handler in try/catch, log with `console.error`
- Return consistent JSON shape: `{ data }` for success, `{ error: string }` for failure

For full API conventions, see `references/api-patterns.md`.

## Supabase Integration

### Client-Side (browser)
Import from `@/lib/supabaseClient` — uses a **proxy URL** to avoid CORS:
```tsx
import { supabase } from '@/lib/supabaseClient';
```
The client auto-detects browser vs server and routes through `/api/supabase-proxy` on the client side.

### Server-Side (API routes)
Use `createServerSupabaseClient()` from `@/lib/supabase-server` or create inline with service role:
```tsx
import { createServerSupabaseClient } from '@/lib/supabase-server';
const supabase = createServerSupabaseClient();
```

### Auth Context
The `AuthProvider` in `@/lib/auth-context` provides:
- `user`, `session`, `userProfile`, `userPlan`, `creditBalance`
- `loading`, `isAdmin`, `signOut()`
- `refreshCredits()`, `hasAccess(type: 'photo' | 'video' | 'design' | 'tryon')`

For full Supabase patterns, see `references/supabase-patterns.md`.

## Credit System

All AI generation costs credits. Use the utilities in `@/lib/credits.ts`:
```tsx
import { checkCredits, deductCredits, CREDIT_COSTS } from '@/lib/credits';

// Check before generating
const hasCredits = await checkCredits(userId, CREDIT_COSTS.DESIGN_GENERATION);
if (!hasCredits) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });

// Deduct after successful generation
await deductCredits(userId, CREDIT_COSTS.DESIGN_GENERATION, 'Design generation');
```

Credit costs: Design Generation = 5, Model Generation = 5, Upscale = 2, Background Removal = 1.

## AI Image Generation Rules

> [!CAUTION]
> **GEMINI ONLY** — All image generation MUST use `gemini-2.5-flash-image-preview`. Never use DALL-E or OpenAI for image generation.

- **Model**: `gemini-2.5-flash-image-preview`
- **API**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`
- **Auth Header**: `x-goog-api-key: $GEMINI_API_KEY` (not Bearer token)
- **Output**: Base64 image data in `response.candidates[0].content.parts[].inline_data.data`
- **Prompt Reference**: See `prompts.md` at project root for all prompt templates

## Pre-Commit & Build Rules

Before every commit, run in this order:
```bash
npm run build          # Must pass — no TypeScript errors
npm run lint           # Linting check
npm run typecheck      # tsc --noEmit
```

**Critical**:
- Never commit code that fails `npm run build`
- Never use `any` type — use `Record<string, unknown>` or proper interfaces
- Verify all imports resolve correctly

## Deployment

- **Platform**: Vercel, Region: `ap-south-1` (Mumbai)
- **Branch strategy**: `main` (dev) → `staging` (design.photozoot.in) → `production` (designzoot.com)
- `main` has auto-deploy **disabled** via `vercel.json`
- Never deploy without explicit user confirmation

For the full deployment checklist, see `references/deployment-checklist.md`.

## Reference Files

Read these when you need deeper guidance on a specific topic:

| Reference | When to Read |
|---|---|
| `references/api-patterns.md` | Creating or modifying API routes |
| `references/component-patterns.md` | Building pages or UI components |
| `references/supabase-patterns.md` | Database queries, auth, storage, credits |
| `references/deployment-checklist.md` | Preparing for deployment |

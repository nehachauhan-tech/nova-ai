# Supabase Integration Patterns

How DesignZoot connects to Supabase for auth, database, storage, and credits.

## Two Supabase Clients

### Client-Side (`@/lib/supabaseClient`)
Used in browser (client components). Routes through a Next.js rewrite proxy to avoid CORS:

```tsx
import { supabase } from '@/lib/supabaseClient';
```

The client detects browser vs server and uses:
- **Browser**: `${window.location.origin}/api/supabase-proxy` (avoids CORS across multiple domains)
- **Server**: Direct Supabase URL

Helpers: `getAuthSession()`, `getCurrentUser()`

### Server-Side (`@/lib/supabase-server`)
Used in API routes. Uses the **service role key** (full access, bypasses RLS):

```tsx
import { createServerSupabaseClient } from '@/lib/supabase-server';
const supabase = createServerSupabaseClient();
```

Or create inline (common in API routes):
```tsx
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## Auth Context (`@/lib/auth-context`)

The `AuthProvider` wraps the entire app and provides:

```tsx
const {
  user,           // Supabase User object
  session,        // Supabase Session (access_token, etc.)
  userProfile,    // Profile from 'profiles' table (role, handle_slug, access_allowed, etc.)
  userPlan,       // Plan from 'user_plans' table (name: community/corporate/campus, status)
  creditBalance,  // { total_credits, available_credits, last_updated, last_reset_at, next_reset_at }
  loading,        // Auth loading state
  isAdmin,        // Derived: role === 'admin' || email ends with @designzoot.com/@photozoot.in
  signOut,        // Signs out and redirects to /
  refreshCredits, // Fetches latest credit balance from API
  hasAccess,      // (type: AccessType) => boolean — checks access_allowed array
} = useAuth();
```

### User Profile Interface
```tsx
interface UserProfile {
  id: string;
  email?: string;
  username: string;
  handle_slug: string;
  display_name?: string;
  role: 'admin' | 'user' | 'designer';
  is_designer: boolean;
  created_at: string;
  updated_at: string;
  access_allowed?: ('photo' | 'video' | 'design' | 'tryon')[] | null;
  last_selected_master_category?: string | null;
}
```

### Common Auth Patterns

**Wait for auth before rendering:**
```tsx
const { user, loading } = useAuth();
if (loading) return <LoadingSkeleton />;
if (!user) return <AccessDenied />;
```

**Admin-only content:**
```tsx
const { isAdmin } = useAuth();
if (!isAdmin) return <AccessDenied />;
```

**Feature-gated access:**
```tsx
const { hasAccess } = useAuth();
if (!hasAccess('design')) return <AccessDenied />;
```

## Database Queries

### Schema Reference
The source of truth for schema is `supabase-schema.yaml` at the project root.
Key tables: `profiles`, `designs`, `credit_transactions`, `credit_user_balances`, `credit_packages`, `user_plans`.

### Common Query Patterns

**Select with filtering:**
```tsx
const { data, error } = await supabase
  .from('designs')
  .select('*, profiles!inner(username, handle_slug)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

**Insert with returning:**
```tsx
const { data, error } = await supabase
  .from('designs')
  .insert([{ user_id: userId, title, status: 'draft' }])
  .select()
  .single();
```

**Upsert:**
```tsx
const { error } = await supabase
  .from('credit_user_balances')
  .upsert({
    user_id: userId,
    balance: newBalance,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
```

## Storage

### Bucket Organization
Storage buckets and their usage are documented in `storage-schema.yaml`.

### Signed URL Pattern
Use signed URLs with 15-minute TTL for secure access:
```tsx
const { data } = await supabase.storage
  .from('bucket-name')
  .createSignedUrl(filePath, 900); // 15 minutes
```

### Upload Pattern
```tsx
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload(`${userId}/${filename}`, fileBuffer, {
    contentType: 'image/webp',
    upsert: true,
  });
```

### Signed URL Caching
The project caches signed URLs to avoid unnecessary re-generation. See `@/lib/signedUrlCache.ts`.

## Credit System

### Architecture
- `credit_transactions` — append-only ledger of all credit changes
- `credit_user_balances` — materialized view of current balance (computed periodically)
- `credit_packages` — purchasable credit bundles

### Flow
1. **Check**: `checkCredits(userId, cost)` before expensive operations
2. **Execute**: Perform the AI generation / processing
3. **Deduct**: `deductCredits(userId, cost, description, relatedId)` on success
4. **Update**: Balance record auto-updated via `@/lib/balance-updater`

### Cost Constants
```tsx
const CREDIT_COSTS = {
  DESIGN_GENERATION: 5,
  MODEL_GENERATION: 5,
  UPSCALE: 2,
  BACKGROUND_REMOVAL: 1,
};
```

### Dynamic Costs
Some features use dynamic credit costs from the database. See `@/lib/dynamic-credit-costs.ts`.

## RLS (Row Level Security)

- All production tables have RLS policies
- Documented in `supabase-tables-rls.md`
- Storage bucket policies in `Supabase Snippet Storage Object RLS Policies by Bucket.csv`
- API routes use service role (bypasses RLS) for admin operations
- Client-side queries use anon key (RLS enforced)

# Supabase Patterns

Overview of how to interface with Supabase in the Nova AI application.

## 1. Client-Side Access (Browser)
Always import the Supabase client from `@/lib/supabaseClient`. This uses a proxy URL (`/api/supabase-proxy`) to avoid CORS errors on the frontend.

\`\`\`tsx
import { supabase } from '@/lib/supabaseClient';
\`\`\`

## 2. Server-Side Access (API/Edge)
When operating in an API route or server component, import the creator function from `supabase-server`.

\`\`\`tsx
import { createServerSupabaseClient } from '@/lib/supabase-server';
const supabase = createServerSupabaseClient();
\`\`\`

*Exception: In specific standalone background API routes, creating a standard client with the `SUPABASE_SERVICE_ROLE_KEY` is acceptable for admin tasks.*

## 3. Auth Context
Never read local storage or call `supabase.auth.getUser()` manually inside a client component. Always use the provided React Context.

\`\`\`tsx
import { useAuth } from '@/lib/auth-context';

export function UserProfile() {
  const { 
    user, 
    session, 
    userProfile, 
    userPlan, 
    creditBalance,
    loading,
    isAdmin,
    signOut,
    refreshCredits,
    hasAccess
  } = useAuth();

  // render ...
}
\`\`\`

## 4. Supabase Schema Management
The single source of truth for the database schema is the `supabase-schema.yaml` or `.sql` migration files. Do not make manual schema changes without recording them.

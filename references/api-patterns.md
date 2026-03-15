# API Route Patterns

This document defines the conventions for all Next.js API Routes in the Nova AI (`zootm`) project.

## 1. Structure and Client Initialization
Every API route must instantiate the Supabase client using the **Service Role Key** so it can bypass RLS for administrative operations when deemed appropriate, or use the standard client for user-specific actions. 

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
\`\`\`

## 2. Global Error Handling & Try-Catch
All API Routes must be wrapped in a root `try-catch` block.
- **Success:** Return `{ data: result }`
- **Error:** Return `{ error: "Descriptive message" }` and an appropriate HTTP status code (400, 401, 402, 500).

\`\`\`typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Validate Input
    // 2. Execute DB / AI Logic
    // 3. Return Success
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Exception in API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
\`\`\`

## 3. Parameter Validation
Validate parameters early. If a required parameter is missing, immediately return a `400 Bad Request`.

\`\`\`typescript
const { searchParams } = new URL(request.url);
const userId = searchParams.get('userId');

if (!userId) {
  return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
}
\`\`\`

## 4. Integration with Credits System
AI generation API routes must always check and deduct credits using `@/lib/credits`.
\`\`\`typescript
import { checkCredits, deductCredits, CREDIT_COSTS } from '@/lib/credits';

// 1. Check
const hasCredits = await checkCredits(userId, CREDIT_COSTS.DESIGN_GENERATION);
if (!hasCredits) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });

// 2. Generate content (e.g. Gemini 2.5 Flash Image Preview)

// 3. Deduct
await deductCredits(userId, CREDIT_COSTS.DESIGN_GENERATION, 'Design generation');
\`\`\`

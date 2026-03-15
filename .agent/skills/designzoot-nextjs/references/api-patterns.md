# API Route Patterns

Conventions for all API routes in `src/app/api/`.

## Standard Structure

Every API route follows this template:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role — created at module scope
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // 1. Extract & validate parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 2. Business logic
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error querying data:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // 3. Return success response
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Exception in API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate required fields
    const { userId, ...params } = body;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Business logic...

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Exception in API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Key Rules

### Response Shape Consistency
- **Success**: `{ data }` or `{ success: true, data }` or domain-specific like `{ balance }`
- **Error**: `{ error: 'Human-readable message' }` with appropriate HTTP status
- Always use `NextResponse.json()`, never raw `Response`

### Error Handling
- Wrap entire handler body in `try/catch`
- Use `console.error()` for logging — include descriptive prefix
- Return 400 for input validation errors
- Return 402 for insufficient credits
- Return 500 for unexpected server errors
- Never expose internal error details to the client

### Supabase Client Creation
Create at module scope (not inside handler) for connection reuse:
```tsx
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```
Alternatively, use `createServerSupabaseClient()` from `@/lib/supabase-server`.

### Credit Integration
For API routes that consume credits:
```tsx
import { checkCredits, deductCredits, CREDIT_COSTS } from '@/lib/credits';

// Check BEFORE doing expensive work
const hasCredits = await checkCredits(userId, CREDIT_COSTS.DESIGN_GENERATION);
if (!hasCredits) {
  return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
}

// Do the expensive operation...

// Deduct AFTER success
const { success, error } = await deductCredits(
  userId,
  CREDIT_COSTS.DESIGN_GENERATION,
  'Design generation - studio',
  designId // optional related entity
);
```

### File/Image Upload Handling
Use `FormData` for file uploads:
```tsx
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  if (!file || !userId) {
    return NextResponse.json({ error: 'File and user ID required' }, { status: 400 });
  }

  // Convert to buffer for processing
  const buffer = Buffer.from(await file.arrayBuffer());
  // ...
}
```

### Route Organization
API routes are organized by feature domain:
```
api/
├── auth/               # Authentication endpoints
├── credits/            # Credit balance, history, packages
├── design-studio/      # Design generation & management
├── diy/                # DIY feature endpoints
├── gemini-image*/      # AI image generation
├── manage/             # User management (likes, history, downloads, uploads)
├── shopify/            # Shopify integration
├── storage/            # File storage operations
├── try-on/             # Virtual try-on
└── video-generation/   # Video generation endpoints
```

## AI Image Generation API Pattern

All AI image generation routes follow this specific pattern:

```tsx
// Headers for Gemini API (NOT Bearer token)
const headers = {
  'Content-Type': 'application/json',
  'x-goog-api-key': process.env.GEMINI_API_KEY!
};

// API endpoint
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

// Response structure
const result = response.candidates[0].content.parts.find(
  (part: { inline_data?: { data: string } }) => part.inline_data
);
const imageBase64 = result.inline_data.data;
```

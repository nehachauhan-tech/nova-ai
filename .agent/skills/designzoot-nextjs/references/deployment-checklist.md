# Deployment Checklist

Step-by-step workflow for deploying DesignZoot changes.

## Branch Strategy

```
main (development) → staging (testing) → production (live)
```

| Branch | Domain | Auto-Deploy |
|---|---|---|
| `main` | — | **Disabled** (via `vercel.json`) |
| `staging` | `design.photozoot.in` | Enabled |
| `production` | `designzoot.com` | Manual only |

## Pre-Commit Checklist

Run these commands in order. All must pass before committing:

```bash
# 1. Build check — catches TypeScript errors and compilation issues
npm run build

# 2. Check for 'any' types — these cause deployment failures
npm run build 2>&1 | grep -i "unexpected any" && echo "❌ Fix 'any' types" || echo "✅ OK"

# 3. Linting
npm run lint

# 4. Type checking
npm run typecheck    # tsc --noEmit
```

### Common Build Errors

| Error | Fix |
|---|---|
| `Unexpected any` | Replace `any` with `Record<string, unknown>` or proper interfaces |
| `Module not found` | Check `@/` import paths resolve to `src/` |
| `Type 'null' is not assignable` | Use optional chaining (`?.`) or null checks |
| Implicit `any` parameter | Add explicit TypeScript types to all function parameters |

## Git Workflow

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "[Brief description]

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to main
git push origin main
```

## Deployment Flow

### 1. Deploy to Staging
```bash
# Merge main into staging
git checkout staging
git merge main
git push origin staging
# Auto-deploys to design.photozoot.in
```

### 2. Test on Staging
- Verify the feature works at `design.photozoot.in`
- Test auth flow, image generation, credits
- Check browser console for errors

### 3. Deploy to Production
```bash
# Only after staging is verified
git checkout production
git merge staging
git push origin production
# Manually trigger deploy in Vercel dashboard if needed
```

## Vercel Configuration

### Settings
- **Framework**: Next.js
- **Region**: ap-south-1 (Mumbai)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: (default)

### `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": {
      "main": false
    }
  }
}
```

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
OPENAI_API_KEY
GEMINI_API_KEY
```

## Post-Deployment Verification

1. **Auth**: Login/logout works
2. **Image Generation**: Gemini API responds correctly
3. **Credits**: Balance displays and deducts properly
4. **Storage**: Images load via signed URLs
5. **Performance**: Page load under 3 seconds

> [!CAUTION]
> **Never deploy without explicit user confirmation.** Always ask before pushing to `staging` or `production`.

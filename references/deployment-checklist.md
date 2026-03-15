# Deployment Checklist

Follow this checklist prior to merging `main` into `production` or deploying via Vercel.

## 1. Pre-Commit Verification
Run the following terminal commands locally:
- [ ] `npm run build` — Must pass without errors.
- [ ] `npm run lint` — Must report 0 warnings or errors.
- [ ] `npm run typecheck` (`tsc --noEmit`) — Zero TypeScript issues.

## 2. Code Quality Rules
- [ ] No `any` types used across the codebase (use `Record<string, unknown>` if absolutely necessary).
- [ ] All `useEffect` data fetching is heavily guarded against infinite re-renders or tab-switching re-fetches.
- [ ] `console.log` statements are completely removed (except `console.error` in API routes).
- [ ] Strict adherence to the UI guidelines (No Emoji icons, use established font hierarchy).

## 3. AWS & Supabase Environment
- [ ] Ensure all local migrations have been pushed to the production Supabase project.
- [ ] Confirm AWS IAM roles provide Bedrock access for Amazon Nova models inside the production account.
- [ ] Vercel Environment Variables (`.env.production`) are updated with the correct production keys.

## 4. Vercel Target
- **Region:** `ap-south-1` (Mumbai)
- **Deployment URL:**
  - `main` -> *do not auto deploy*
  - `staging` -> `design.photozoot.in`
  - `production` -> `designzoot.com`

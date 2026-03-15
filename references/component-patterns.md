# Component Patterns

This document outlines the standard UI Component and Page level conventions for Nova AI.

## 1. Root Layout Structure
Pages should take advantage of the global wrapping order:
\`\`\`html
<html> → <body> → <GoogleAnalytics /> → <AuthProvider> → <SWRProvider> → {children}
\`\`\`

## 2. Typical Page Boilerplate
For authenticated feature pages:

\`\`\`tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { LeftNavigationPanel } from '@/components/LeftNavigationPanel';

export default function FeaturePage() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSkeleton />;
  if (!user) return <AccessDenied />;

  return (
    <div className="flex h-screen bg-background">
      <LeftNavigationPanel />
      <main className="flex-1 overflow-auto p-6">
        {/* Page content */}
      </main>
    </div>
  );
}
\`\`\`

## 3. Data Fetching (SWR) Guarding
To prevent constant refetching on window focus or tab switches, data fetching hooks (`useEffect`) must be guarded tightly.

\`\`\`tsx
// ✅ Do this
useEffect(() => {
  if (!authLoading && user && items.length === 0 && !loading) {
    loadData();
  }
}, [authLoading, user, items.length, loading]);

// ❌ Never do this
useEffect(() => {
  if (!authLoading && user) {
    loadData(); // Refetches infinitely on some renders or tab switch
  }
}, [authLoading, user]);
\`\`\`

## 4. Styling Conventions
- **Tailwind v4**: Rely completely on utility classes or custom `@theme inline` variables.
- **Glass-Cards**: Use the global CSS class `.glass-card` for standard containers over space backdrops.
- **Backgrounds**: The app uses `#0a0a0f` deep space background. Never hardcode `bg-white` over the main layout unless inside a specific isolated component.
- **Icons**: Use `lucide-react` exclusively. No raw SVGs or Emojis where an icon fits.

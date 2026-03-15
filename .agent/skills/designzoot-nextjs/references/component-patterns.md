# Component & Page Patterns

Conventions for frontend components and pages in the DesignZoot app.

## Page Layout Pattern

### Standard Page with Navigation
Most pages use a sidebar + main content layout:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LeftNavigationPanel } from '@/components/LeftNavigationPanel';
import { AccessDenied } from '@/components/AccessDenied';

export default function FeaturePage() {
  const { user, userProfile, loading: authLoading, isAdmin, hasAccess } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guard: only fetch when auth is ready AND data is missing
    if (!authLoading && user && items.length === 0 && !loading) {
      loadData();
    }
  }, [authLoading, user, items.length, loading]);

  if (authLoading) return <LoadingSkeleton />;
  if (!user) return <AccessDenied />;

  return (
    <div className="flex h-screen bg-surface-background">
      <LeftNavigationPanel />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Page header */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Page Title</h1>
          {/* Content */}
        </div>
      </main>
    </div>
  );
}
```

### Navigation Panel Selection
Choose the right navigation panel based on the page's section:
- **Design pages** (`/design/*`): `LeftNavigationPanel`
- **DIY pages** (`/diy/*`): `DIYNavigationPanel`
- **Manage pages** (`/manage/*`): `ManageNavigationPanel`
- **Admin pages** (`/admin/*`): Custom navigation or none

### Access Control
Use `hasAccess()` from auth context for feature gating:
```tsx
if (!hasAccess('design')) {
  return <AccessDenied message="You don't have access to the design studio" />;
}
```

## Component Structure

### Client Components
Always add `'use client'` directive at the top for components that use hooks, state, or browser APIs:

```tsx
'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  imageUrl: string;
  onSelect: (id: string) => void;
}

export function FeatureCard({ title, imageUrl, onSelect }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="rounded-component-card shadow-component-card hover:shadow-component-card-hover transition-shadow duration-250"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Component content */}
    </div>
  );
}
```

### Server Components
Pages that only render static content or fetch data server-side should remain server components (no `'use client'` directive). However, most DesignZoot pages use auth hooks and are therefore client components.

## State Management

### Data Fetching with SWR
The global `SWRProvider` auto-includes auth tokens:
```tsx
import useSWR from 'swr';

function DesignList() {
  const { data, error, isLoading, mutate } = useSWR(
    user ? `/api/designs?userId=${user.id}` : null
  );
  // No need to pass fetcher — global SWR config handles it
}
```

### Data Fetching with useEffect
For data that doesn't benefit from SWR caching:
```tsx
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(false);

const loadData = useCallback(async () => {
  if (!user) return;
  setLoading(true);
  try {
    const response = await fetch(`/api/endpoint?userId=${user.id}`);
    if (response.ok) {
      const result = await response.json();
      setData(result.data);
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    setLoading(false);
  }
}, [user]);
```

## Loading & Error States

### Loading Skeleton Pattern
```tsx
function LoadingSkeleton() {
  return (
    <div className="flex h-screen bg-surface-background">
      <div className="w-80 bg-white border-r animate-pulse" />
      <div className="flex-1 p-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-48 bg-gray-200 rounded-component-card animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Error States
Always handle error states gracefully with retry options:
```tsx
if (error) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="w-12 h-12 text-semantic-error mb-4" />
      <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
      <p className="text-gray-500 mt-2">Failed to load your designs.</p>
      <button
        onClick={() => loadData()}
        className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-component-button hover:bg-brand-primary-hover"
      >
        Try Again
      </button>
    </div>
  );
}
```

## Modal Pattern

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      <div className="absolute inset-0 bg-surface-overlay" onClick={onClose} />
      <div className="relative bg-white rounded-component-modal shadow-component-modal max-w-lg w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

## Styling Rules

### Use Design Tokens
Always use the Tailwind tokens from `tailwind.config.ts`:
- **Border radius**: `rounded-component-card`, `rounded-component-button`, `rounded-component-modal`
- **Shadows**: `shadow-component-card`, `shadow-component-card-hover`, `shadow-component-modal`
- **Z-index**: `z-modal`, `z-overlay`, `z-dropdown`, `z-tooltip`
- **Colors**: `bg-brand-primary`, `text-semantic-error`, `border-surface-border`
- **Transitions**: `duration-150`, `duration-250`, `duration-400`

### Button Styles
```tsx
// Primary button
<button className="px-4 py-2 bg-brand-primary text-white rounded-component-button hover:bg-brand-primary-hover transition-colors duration-150">
  Save
</button>

// Secondary button
<button className="px-4 py-2 bg-interactive-secondary text-gray-700 rounded-component-button hover:bg-interactive-secondary-hover transition-colors duration-150">
  Cancel
</button>
```

### Responsive Design
Use responsive breakpoints for grid layouts:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## Image Handling

### OptimizedImage Component
Use the project's `OptimizedImage` component for all image display:
```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src={imageUrl}
  alt="Design preview"
  className="rounded-component-image"
  width={400}
  height={400}
/>
```

### Masonry Grid
For gallery-style layouts, use the masonry CSS classes defined in `globals.css`:
```tsx
import Masonry from 'react-masonry-css';

<Masonry
  breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
  className="masonry-grid"
  columnClassName="masonry-grid-column"
>
  {items.map(item => <div key={item.id} className="masonry-item">...</div>)}
</Masonry>
```

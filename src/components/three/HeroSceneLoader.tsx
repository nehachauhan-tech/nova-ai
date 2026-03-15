"use client";

import dynamic from "next/dynamic";

/**
 * Client-side wrapper that lazy-loads the 3D HeroScene with SSR disabled.
 * This is needed because `ssr: false` in `next/dynamic` is only allowed
 * inside Client Components (Next.js 16+ / Turbopack).
 */
const HeroScene = dynamic(
  () => import("@/components/three/HeroScene"),
  { ssr: false }
);

export default function HeroSceneLoader() {
  return <HeroScene />;
}

"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import NovaOrb from "./NovaOrb";

/**
 * Full-screen 3D canvas positioned absolutely behind the hero content.
 * Uses Suspense to gracefully handle async loading of the 3D scene.
 */
export default function HeroScene() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 5, 5]} intensity={0.3} />
          <NovaOrb />
        </Suspense>
      </Canvas>
    </div>
  );
}

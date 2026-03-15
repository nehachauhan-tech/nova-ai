"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * An animated wireframe icosahedron that slowly rotates and floats.
 * Serves as the hero background element to add depth and premium feel.
 */
export default function NovaOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);

  // Custom wireframe geometry from an icosahedron
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.2, 2), []);
  const wireframeGeometry = useMemo(
    () => new THREE.WireframeGeometry(geometry),
    [geometry]
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.08;
      meshRef.current.rotation.y = time * 0.12;
      // Gentle breathing scale
      const scale = 1 + Math.sin(time * 0.5) * 0.04;
      meshRef.current.scale.setScalar(scale);
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.x = time * 0.08;
      wireframeRef.current.rotation.y = time * 0.12;
      const scale = 1 + Math.sin(time * 0.5) * 0.04;
      wireframeRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Translucent inner volume */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#6c63ff"
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe overlay */}
      <lineSegments ref={wireframeRef} geometry={wireframeGeometry}>
        <lineBasicMaterial
          color="#6c63ff"
          transparent
          opacity={0.18}
          linewidth={1}
        />
      </lineSegments>

      {/* Glow point light at center */}
      <pointLight color="#6c63ff" intensity={0.6} distance={8} decay={2} />
    </group>
  );
}

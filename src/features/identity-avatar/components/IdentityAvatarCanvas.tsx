import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BunkerAvatarConfig } from '../types/avatar.types';
import { GuardianModel } from './GuardianModel';
import { checkSystemCapabilities } from '../lib/avatar-capabilities';

interface IdentityAvatarCanvasProps {
  config: BunkerAvatarConfig;
  onLoaded?: () => void;
}

// Scene Root with Micro-Parallax Pointer Tracking
function ParallaxScene({
  config,
  prefersReducedMotion,
  onLoaded,
}: {
  config: BunkerAvatarConfig;
  prefersReducedMotion: boolean;
  onLoaded?: () => void;
}) {
  const sceneRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    onLoaded?.();
  }, [onLoaded]);

  // Track pointer movements smoothly on parent window
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handlePointerMove = (e: PointerEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;

      // Restrained micro-parallax (maximum ~3.5 degrees)
      targetRotation.current.y = normalizedX * 0.06;
      targetRotation.current.x = normalizedY * 0.04;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [prefersReducedMotion]);

  useFrame(() => {
    if (!sceneRef.current || prefersReducedMotion) return;
    // Smooth lerp return to target
    sceneRef.current.rotation.y = THREE.MathUtils.lerp(
      sceneRef.current.rotation.y,
      targetRotation.current.y,
      0.05
    );
    sceneRef.current.rotation.x = THREE.MathUtils.lerp(
      sceneRef.current.rotation.x,
      targetRotation.current.x,
      0.05
    );
  });

  return (
    <group ref={sceneRef}>
      <GuardianModel config={config} prefersReducedMotion={prefersReducedMotion} />
    </group>
  );
}

export const IdentityAvatarCanvas: React.FC<IdentityAvatarCanvasProps> = ({
  config,
  onLoaded,
}) => {
  const [capabilities] = useState(() => checkSystemCapabilities());

  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 42 }}
      dpr={capabilities.optimalDpr}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      }}
      style={{ pointerEvents: 'none' }}
    >
      <ParallaxScene
        config={config}
        prefersReducedMotion={capabilities.prefersReducedMotion}
        onLoaded={onLoaded}
      />
    </Canvas>
  );
};

export default IdentityAvatarCanvas;

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { BunkerAvatarConfig } from '../types/avatar.types';
import { resolveGuardianGeometry } from '../lib/guardian-geometry.resolver';

interface GuardianModelProps {
  config: BunkerAvatarConfig;
  prefersReducedMotion?: boolean;
}

export const GuardianModel: React.FC<GuardianModelProps> = ({
  config,
  prefersReducedMotion = false,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const torsoGroupRef = useRef<THREE.Group>(null);

  const {
    primaryColor,
    secondaryColor,
    accentColor,
    visorTint,
    glowColor,
    pose,
    metalness,
    roughness,
  } = config;

  // 1. Resolve Canonical Geometry Sockets & Hierarchy Anchors
  const geom = useMemo(() => resolveGuardianGeometry(config), [config]);

  // Calibrated PBR parameters for bright, crisp studio rendering
  const effectiveMetalness = Math.min(metalness ?? 0.25, 0.28);
  const effectiveRoughness = Math.max(roughness ?? 0.35, 0.3);

  // Base Pose Orientation (art-directed three-quarter view)
  const baseRotationY =
    pose === 'three-quarter-left'
      ? -0.22
      : pose === 'three-quarter-right'
      ? 0.22
      : pose === 'observer'
      ? 0.12
      : pose === 'command'
      ? -0.08
      : 0;
  const baseRotationX = pose === 'command' ? -0.08 : -0.04;

  // Animation Frame Loop: Weighty, stable character with subtle micro gaze drift
  useFrame((state) => {
    if (prefersReducedMotion) return;
    const t = state.clock.getElapsedTime();

    // 1. Micro breathing expansion at torso root (Hierarchy ensures shoulders/neck/head follow cleanly)
    if (torsoGroupRef.current) {
      const breathScale = 1 + Math.sin(t * 1.2) * 0.003;
      torsoGroupRef.current.scale.set(breathScale, breathScale, breathScale);
    }

    // 2. Micro idle gaze drift passing through single HeadPivot (visor & emblem stay strictly locked)
    if (headGroupRef.current) {
      headGroupRef.current.rotation.y = baseRotationY + Math.sin(t * 0.7) * 0.015;
      headGroupRef.current.rotation.x = baseRotationX + Math.cos(t * 0.9) * 0.009;
    }
  });

  return (
    <group ref={rootGroupRef} name="guardian-root" position={[geom.root.position.x, geom.root.position.y, geom.root.position.z]}>
      {/* ========================================================================= */}
      {/* 1. STUDIO LIGHTING & RIM ILLUMINATION                                     */}
      {/* ========================================================================= */}
      <ambientLight intensity={1.2} />
      <hemisphereLight
        color="#FFFFFF"
        groundColor="#475569"
        intensity={0.9}
      />

      {/* Primary Key Light (Crisp Studio Key) */}
      <directionalLight
        position={[3, 4, 3.5]}
        intensity={2.2}
        color="#FFFFFF"
      />

      {/* Secondary Fill Light (Cool Spatial Soft Fill) */}
      <directionalLight
        position={[-3, 2, 2.5]}
        intensity={1.5}
        color="#E2E8F0"
      />

      {/* Front Specular Highlight Light */}
      <directionalLight
        position={[0, 1.2, 4]}
        intensity={1.4}
        color="#FFFFFF"
      />

      {/* Cybernetic Accent Rim Light (Highlighting silhouette edges) */}
      <directionalLight
        position={[0, 3, -3]}
        intensity={2.5}
        color={glowColor || '#06B6D4'}
      />

      {/* Ground Reflected Accent Fill */}
      <pointLight position={[0, -1.8, 1]} intensity={1.0} color={accentColor || '#06B6D4'} />

      {/* ========================================================================= */}
      {/* 2. PLINTH / GROUNDED PEDESTAL (Anchored on Canonical Baseline Y = 0)      */}
      {/* ========================================================================= */}
      <group name="plinth-root" position={[geom.plinth.position.x, geom.plinth.position.y, geom.plinth.position.z]}>
        {geom.plinth.variant === 0 && (
          // Beveled Octagonal Monolith
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.75, 0.9, 0.22, 8]} />
            <meshStandardMaterial
              color="#2D313D"
              roughness={0.4}
              metalness={0.3}
              emissive="#1E222B"
              emissiveIntensity={0.15}
            />
          </mesh>
        )}
        {geom.plinth.variant === 1 && (
          // Magnetic Floating Dual Ring
          <group>
            <mesh castShadow receiveShadow position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.8, 0.9, 0.15, 32]} />
              <meshStandardMaterial
                color="#282C37"
                roughness={0.4}
                metalness={0.3}
                emissive="#1B1F28"
                emissiveIntensity={0.15}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <torusGeometry args={[0.75, 0.02, 16, 32]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={glowColor}
                emissiveIntensity={1.0}
              />
            </mesh>
          </group>
        )}
        {geom.plinth.variant === 2 && (
          // Chiseled Hexagonal Base
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.7, 0.85, 0.25, 6]} />
            <meshStandardMaterial
              color="#2E3340"
              roughness={0.35}
              metalness={0.3}
              emissive="#20242E"
              emissiveIntensity={0.15}
            />
          </mesh>
        )}
        {geom.plinth.variant === 3 && (
          // Minimalist Low Disc
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.72, 0.78, 0.16, 32]} />
            <meshStandardMaterial color="#252936" roughness={0.3} metalness={0.35} />
          </mesh>
        )}
        {geom.plinth.variant === 4 && (
          // Architect Layered Pedestal
          <group>
            <mesh castShadow receiveShadow position={[0, -0.06, 0]}>
              <boxGeometry args={[1.3, 0.14, 1.3]} />
              <meshStandardMaterial color="#2A2E3B" roughness={0.35} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[1.1, 0.08, 1.1]} />
              <meshStandardMaterial color="#1F222C" roughness={0.4} metalness={0.3} />
            </mesh>
          </group>
        )}

        {/* Base Glow Accent Ring */}
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.58, 32]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 3. TORSO ROOT & SHOULDER MANTLE HIERARCHY                                 */}
      {/* ========================================================================= */}
      <group
        ref={torsoGroupRef}
        name="torso-root"
        position={[geom.torso.position.x, geom.torso.position.y, geom.torso.position.z]}
      >
        {/* Symmetrical Shoulder Mantle Geometry */}
        {geom.shoulders.variant === 0 && (
          // Angular High-Collar Mantle
          <group name="mantle-angular">
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[0.85 * geom.archetype.chestWidth, 1.35 * geom.archetype.shoulderWidth, 0.42, 4]} />
              <meshStandardMaterial
                color={secondaryColor}
                roughness={effectiveRoughness}
                metalness={effectiveMetalness}
                emissive={secondaryColor}
                emissiveIntensity={0.12}
              />
            </mesh>
            {/* Accent Shoulder Trim */}
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[1.2 * geom.archetype.shoulderWidth, 0.03, 0.45]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        )}

        {geom.shoulders.variant === 1 && (
          // Curved Minimalist Shoulders
          <group name="mantle-curved">
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.65 * geom.archetype.chestWidth, 0.95 * geom.archetype.shoulderWidth, 0.45, 16]} />
              <meshStandardMaterial
                color={secondaryColor}
                roughness={effectiveRoughness}
                metalness={effectiveMetalness}
                emissive={secondaryColor}
                emissiveIntensity={0.12}
              />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <torusGeometry args={[0.68 * geom.archetype.shoulderWidth, 0.02, 16, 32]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={glowColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        )}

        {geom.shoulders.variant === 2 && (
          // Tiered Command Chassis
          <group name="mantle-tiered">
            <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.9 * geom.archetype.chestWidth, 1.3 * geom.archetype.shoulderWidth, 0.35, 4]} />
              <meshStandardMaterial
                color={primaryColor}
                roughness={effectiveRoughness}
                metalness={effectiveMetalness}
                emissive={primaryColor}
                emissiveIntensity={0.12}
              />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.65 * geom.archetype.chestWidth, 0.85 * geom.archetype.shoulderWidth, 0.2, 4]} />
              <meshStandardMaterial
                color={secondaryColor}
                roughness={effectiveRoughness}
                metalness={effectiveMetalness}
                emissive={secondaryColor}
                emissiveIntensity={0.12}
              />
            </mesh>
          </group>
        )}

        {geom.shoulders.variant === 3 && (
          // Compact Minimalist Guards
          <group name="mantle-compact">
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[0.7 * geom.archetype.chestWidth, 1.05 * geom.archetype.shoulderWidth, 0.38, 8]} />
              <meshStandardMaterial
                color={secondaryColor}
                roughness={effectiveRoughness}
                metalness={effectiveMetalness}
              />
            </mesh>
          </group>
        )}

        {geom.shoulders.variant === 4 && (
          // Citadel Heavy Pauldrons
          <group name="mantle-citadel">
            <mesh castShadow receiveShadow position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.95 * geom.archetype.chestWidth, 1.45 * geom.archetype.shoulderWidth, 0.44, 6]} />
              <meshStandardMaterial
                color={primaryColor}
                roughness={effectiveRoughness}
                metalness={effectiveMetalness}
              />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[1.35 * geom.archetype.shoulderWidth, 0.05, 0.55]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}

        {geom.shoulders.variant === 5 && (
          // Swept Blade Wings
          <group name="mantle-blade">
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[0.75 * geom.archetype.chestWidth, 1.35 * geom.archetype.shoulderWidth, 0.4, 4]} />
              <meshStandardMaterial
                color={secondaryColor}
                roughness={effectiveRoughness}
                metalness={effectiveMetalness}
              />
            </mesh>
          </group>
        )}

        {/* ======================================================================= */}
        {/* 4. NECK PILLAR (Anchored on upper torso, perfectly bridges chest & head)*/}
        {/* ======================================================================= */}
        <group name="neck-base" position={[geom.neck.position.x, geom.neck.position.y, geom.neck.position.z]}>
          <mesh castShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[geom.neck.radius, geom.neck.radius * 1.15, geom.neck.height, 16]} />
            <meshStandardMaterial color="#252833" roughness={0.5} metalness={0.3} />
          </mesh>

          {/* ===================================================================== */}
          {/* 5. HEAD PIVOT (Parent of all cranial elements, visor, & emblems)      */}
          {/* ===================================================================== */}
          <group
            ref={headGroupRef}
            name="head-pivot"
            position={[geom.head.offsetFromNeck.x, geom.head.offsetFromNeck.y, geom.head.offsetFromNeck.z]}
            rotation={[baseRotationX, baseRotationY, 0]}
            scale={[geom.head.scale, geom.head.scale, geom.head.scale]}
          >
            {/* Main Head Shell */}
            {(geom.head.variant === 0 || geom.head.variant === 2) && (
              // Vault Dome Head / Aero Capsule
              <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <capsuleGeometry args={[0.42, 0.44, 24, 32]} />
                <meshStandardMaterial
                  color={primaryColor}
                  roughness={effectiveRoughness}
                  metalness={effectiveMetalness}
                  emissive={primaryColor}
                  emissiveIntensity={0.14}
                />
              </mesh>
            )}

            {(geom.head.variant === 1 || geom.head.variant === 6) && (
              // Angular Crest Crown Head / Prism Facet
              <group>
                <mesh castShadow receiveShadow position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.40, 0.36, 0.88, 8]} />
                  <meshStandardMaterial
                    color={primaryColor}
                    roughness={effectiveRoughness}
                    metalness={effectiveMetalness}
                    emissive={primaryColor}
                    emissiveIntensity={0.14}
                  />
                </mesh>
                <mesh position={[0, 0.46, 0]}>
                  <coneGeometry args={[0.40, 0.16, 8]} />
                  <meshStandardMaterial
                    color={secondaryColor}
                    roughness={effectiveRoughness}
                    metalness={effectiveMetalness}
                    emissive={secondaryColor}
                    emissiveIntensity={0.14}
                  />
                </mesh>
              </group>
            )}

            {(geom.head.variant === 3 || geom.head.variant === 8) && (
              // Hexagonal Monolith / Citadel Bastion
              <group>
                <mesh castShadow receiveShadow position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.43, 0.38, 0.88, 6]} />
                  <meshStandardMaterial
                    color={primaryColor}
                    roughness={effectiveRoughness}
                    metalness={effectiveMetalness}
                    emissive={primaryColor}
                    emissiveIntensity={0.14}
                  />
                </mesh>
                <mesh position={[0, 0.45, 0]}>
                  <coneGeometry args={[0.43, 0.15, 6]} />
                  <meshStandardMaterial
                    color={secondaryColor}
                    roughness={effectiveRoughness}
                    metalness={effectiveMetalness}
                    emissive={secondaryColor}
                    emissiveIntensity={0.14}
                  />
                </mesh>
              </group>
            )}

            {(geom.head.variant === 4 || geom.head.variant === 5) && (
              // Crown Apex / Frame Chassis
              <group>
                <mesh castShadow receiveShadow position={[0, 0, 0]}>
                  <boxGeometry args={[0.76, 0.88, 0.78]} />
                  <meshStandardMaterial
                    color={primaryColor}
                    roughness={effectiveRoughness}
                    metalness={effectiveMetalness}
                  />
                </mesh>
                <mesh position={[0, 0.46, 0]}>
                  <boxGeometry args={[0.68, 0.12, 0.72]} />
                  <meshStandardMaterial color={secondaryColor} roughness={effectiveRoughness} metalness={effectiveMetalness} />
                </mesh>
              </group>
            )}

            {(geom.head.variant === 7 || geom.head.variant === 9) && (
              // Specter Stealth / Signal Telemetry Shell
              <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <capsuleGeometry args={[0.38, 0.48, 20, 28]} />
                <meshStandardMaterial
                  color={primaryColor}
                  roughness={effectiveRoughness}
                  metalness={effectiveMetalness}
                />
              </mesh>
            )}

            {/* Forehead Emblem Socket (Child of Head Shell) */}
            <group name="emblem-socket" position={[geom.emblem.position.x, geom.emblem.position.y, geom.emblem.position.z]}>
              {(geom.emblem.variant === 0 || geom.emblem.variant === 3) && (
                <mesh rotation={[0, 0, Math.PI / 4]}>
                  <planeGeometry args={[0.07, 0.07]} />
                  <meshStandardMaterial
                    color={accentColor}
                    emissive={glowColor}
                    emissiveIntensity={1.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
              {(geom.emblem.variant === 1 || geom.emblem.variant === 4) && (
                <mesh>
                  <circleGeometry args={[0.04, 16]} />
                  <meshStandardMaterial
                    color={accentColor}
                    emissive={glowColor}
                    emissiveIntensity={1.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
              {(geom.emblem.variant === 2 || geom.emblem.variant === 5) && (
                <mesh rotation={[0, 0, Math.PI]}>
                  <circleGeometry args={[0.05, 3]} />
                  <meshStandardMaterial
                    color={accentColor}
                    emissive={glowColor}
                    emissiveIntensity={1.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
            </group>

            {/* Symmetrical Lateral Ear Pods */}
            <mesh position={[geom.earLeft.position.x, geom.earLeft.position.y, 0]} castShadow>
              <boxGeometry args={[0.08, 0.32, 0.22]} />
              <meshStandardMaterial color="#303544" roughness={0.3} metalness={0.4} />
            </mesh>
            <mesh position={[geom.earRight.position.x, geom.earRight.position.y, 0]} castShadow>
              <boxGeometry args={[0.08, 0.32, 0.22]} />
              <meshStandardMaterial color="#303544" roughness={0.3} metalness={0.4} />
            </mesh>

            <mesh position={[geom.earLeft.position.x - 0.04, geom.earLeft.position.y, 0]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color={accentColor} emissive={glowColor} emissiveIntensity={1.8} />
            </mesh>
            <mesh position={[geom.earRight.position.x + 0.04, geom.earRight.position.y, 0]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color={accentColor} emissive={glowColor} emissiveIntensity={1.8} />
            </mesh>

            {/* =================================================================== */}
            {/* 6. LUMINESCENT OPTIC VISOR (Socketed directly on Head Shell)        */}
            {/* =================================================================== */}
            <group name="visor-socket" position={[geom.visor.position.x, geom.visor.position.y, geom.visor.position.z]}>
              {(geom.visor.variant === 0 || geom.visor.variant === 5) && (
                // Horizon Optic Bar / Panoramic Arc
                <group>
                  <mesh>
                    <boxGeometry args={[geom.visor.width, geom.visor.height, 0.09]} />
                    <meshStandardMaterial
                      color="#090D18"
                      roughness={0.1}
                      metalness={0.8}
                    />
                  </mesh>
                  <mesh position={[0, 0, 0.048]}>
                    <planeGeometry args={[geom.visor.width * 0.94, geom.visor.height * 0.65]} />
                    <meshStandardMaterial
                      color={visorTint}
                      emissive={glowColor}
                      emissiveIntensity={2.0}
                    />
                  </mesh>
                  <mesh position={[0, 0, 0.050]}>
                    <planeGeometry args={[geom.visor.width * 0.86, 0.015]} />
                    <meshBasicMaterial color="#FFFFFF" />
                  </mesh>
                </group>
              )}

              {(geom.visor.variant === 1 || geom.visor.variant === 7) && (
                // Dual Slotted Sensor Array / Split
                <group>
                  <mesh position={[-geom.visor.width * 0.26, 0, 0]}>
                    <boxGeometry args={[geom.visor.width * 0.42, geom.visor.height, 0.09]} />
                    <meshStandardMaterial color={visorTint} emissive={glowColor} emissiveIntensity={1.8} />
                  </mesh>
                  <mesh position={[geom.visor.width * 0.26, 0, 0]}>
                    <boxGeometry args={[geom.visor.width * 0.42, geom.visor.height, 0.09]} />
                    <meshStandardMaterial color={visorTint} emissive={glowColor} emissiveIntensity={1.8} />
                  </mesh>
                </group>
              )}

              {(geom.visor.variant === 2 || geom.visor.variant === 4) && (
                // Narrow Aperture Monolith / Laser Blade Strip
                <group>
                  <mesh>
                    <boxGeometry args={[geom.visor.width, geom.visor.height, 0.07]} />
                    <meshStandardMaterial color={visorTint} emissive={glowColor} emissiveIntensity={2.2} />
                  </mesh>
                </group>
              )}

              {(geom.visor.variant === 3 || geom.visor.variant === 6) && (
                // Hexagonal Ocular Core / Halo Perimeter
                <group>
                  <mesh position={[0, 0, 0.015]}>
                    <cylinderGeometry args={[geom.visor.width * 0.28, geom.visor.width * 0.28, 0.08, 6]} />
                    <meshStandardMaterial color={visorTint} emissive={glowColor} emissiveIntensity={2.2} />
                  </mesh>
                </group>
              )}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

export default GuardianModel;

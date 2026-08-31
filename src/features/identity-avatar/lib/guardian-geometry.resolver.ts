import type {
  BunkerAvatarConfig,
  GuardianArchetype,
  GuardianFamily,
} from '../types/avatar.types';

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface GuardianSocket {
  position: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}

export interface GuardianHeadDefinition {
  id: string;
  name: string;
  familyTag: string;
  bounds: {
    width: number;
    height: number;
    depth: number;
  };
  origin: Vector3Tuple;
  sockets: {
    visor: GuardianSocket;
    neck: GuardianSocket;
    emblem: GuardianSocket;
    earLeft: GuardianSocket;
    earRight: GuardianSocket;
  };
  recommendedScale: number;
}

export interface GuardianVisorDefinition {
  id: string;
  name: string;
  widthRatio: number; // proportional to head width
  height: number;
  depthOffset: number;
  curvatureFit: number;
}

export interface GuardianShoulderDefinition {
  id: string;
  name: string;
  widthRatio: number;
  offsetRatio: number;
  collarHeight: number;
  overlap: number;
}

export interface GuardianChestDefinition {
  id: string;
  name: string;
  widthMultiplier: number;
  depthMultiplier: number;
  taperRatio: number;
}

export interface GuardianPlinthDefinition {
  id: string;
  name: string;
  height: number;
  radius: number;
  mountOverlap: number;
}

export interface GuardianFamilyDefinition {
  id: GuardianFamily;
  name: string;
  archetype: GuardianArchetype;
  visualTone: string;
  recommendedHead: number;
  recommendedVisor: number;
  recommendedShoulder: number;
  recommendedMaterial: string;
  recommendedLighting: string;
}

// ============================================================================
// 1. 20 CANONICAL GUARDIAN DESIGN FAMILIES
// ============================================================================
export const GUARDIAN_FAMILIES: Record<GuardianFamily, GuardianFamilyDefinition> = {
  core: {
    id: 'core',
    name: 'Bunker Core',
    archetype: 'guardian',
    visualTone: 'Balanced, minimal, versatile enterprise identity',
    recommendedHead: 0,
    recommendedVisor: 0,
    recommendedShoulder: 0,
    recommendedMaterial: 'graphite',
    recommendedLighting: 'studio',
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    archetype: 'sentinel',
    visualTone: 'Strong, reinforced protective chassis',
    recommendedHead: 1,
    recommendedVisor: 2,
    recommendedShoulder: 4,
    recommendedMaterial: 'titanium',
    recommendedLighting: 'executive',
  },
  architect: {
    id: 'architect',
    name: 'Architect',
    archetype: 'architect',
    visualTone: 'Precise, refined geometric planes',
    recommendedHead: 3,
    recommendedVisor: 1,
    recommendedShoulder: 1,
    recommendedMaterial: 'ceramic',
    recommendedLighting: 'gallery',
  },
  operator: {
    id: 'operator',
    name: 'Operator',
    archetype: 'operator',
    visualTone: 'Compact, high-efficiency technical frame',
    recommendedHead: 2,
    recommendedVisor: 3,
    recommendedShoulder: 3,
    recommendedMaterial: 'satin',
    recommendedLighting: 'signal',
  },
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard',
    archetype: 'guardian',
    visualTone: 'Bold forward leadership profile',
    recommendedHead: 0,
    recommendedVisor: 4,
    recommendedShoulder: 2,
    recommendedMaterial: 'anodized-aluminum',
    recommendedLighting: 'executive',
  },
  monolith: {
    id: 'monolith',
    name: 'Monolith',
    archetype: 'sentinel',
    visualTone: 'Heavy, uninterrupted architectural mass',
    recommendedHead: 3,
    recommendedVisor: 2,
    recommendedShoulder: 4,
    recommendedMaterial: 'black-ceramic',
    recommendedLighting: 'midnight',
  },
  vector: {
    id: 'vector',
    name: 'Vector',
    archetype: 'architect',
    visualTone: 'Sharp, angular, edge-driven contours',
    recommendedHead: 1,
    recommendedVisor: 4,
    recommendedShoulder: 5,
    recommendedMaterial: 'titanium',
    recommendedLighting: 'prism',
  },
  aero: {
    id: 'aero',
    name: 'Aero',
    archetype: 'operator',
    visualTone: 'Swept, lightweight aerodynamic surfaces',
    recommendedHead: 2,
    recommendedVisor: 5,
    recommendedShoulder: 1,
    recommendedMaterial: 'pearlescent-ceramic',
    recommendedLighting: 'soft-product',
  },
  command: {
    id: 'command',
    name: 'Command',
    archetype: 'sentinel',
    visualTone: 'Formal executive presence with structured collar',
    recommendedHead: 4,
    recommendedVisor: 0,
    recommendedShoulder: 2,
    recommendedMaterial: 'dark-chrome',
    recommendedLighting: 'executive',
  },
  forge: {
    id: 'forge',
    name: 'Forge',
    archetype: 'guardian',
    visualTone: 'Industrial precision with layered chassis',
    recommendedHead: 5,
    recommendedVisor: 1,
    recommendedShoulder: 4,
    recommendedMaterial: 'brushed-titanium',
    recommendedLighting: 'metal',
  },
  specter: {
    id: 'specter',
    name: 'Specter',
    archetype: 'operator',
    visualTone: 'Stealth dark profile with ultra-thin visor',
    recommendedHead: 7,
    recommendedVisor: 4,
    recommendedShoulder: 3,
    recommendedMaterial: 'carbon-composite',
    recommendedLighting: 'obsidian',
  },
  halo: {
    id: 'halo',
    name: 'Halo',
    archetype: 'architect',
    visualTone: 'Luminous perimeter accents and pearlescent shell',
    recommendedHead: 0,
    recommendedVisor: 6,
    recommendedShoulder: 1,
    recommendedMaterial: 'white-ceramic',
    recommendedLighting: 'gallery',
  },
  citadel: {
    id: 'citadel',
    name: 'Citadel',
    archetype: 'sentinel',
    visualTone: 'Deep fortress architecture with heavy shoulders',
    recommendedHead: 8,
    recommendedVisor: 2,
    recommendedShoulder: 4,
    recommendedMaterial: 'titanium',
    recommendedLighting: 'architectural',
  },
  signal: {
    id: 'signal',
    name: 'Signal',
    archetype: 'operator',
    visualTone: 'Digital telemetry indicators and thin bands',
    recommendedHead: 9,
    recommendedVisor: 7,
    recommendedShoulder: 3,
    recommendedMaterial: 'graphite',
    recommendedLighting: 'signal',
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    archetype: 'sentinel',
    visualTone: 'Expansive shoulder breadth and grounded weight',
    recommendedHead: 3,
    recommendedVisor: 5,
    recommendedShoulder: 2,
    recommendedMaterial: 'brushed-titanium',
    recommendedLighting: 'metal',
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    archetype: 'architect',
    visualTone: 'Dynamic future-facing curves and crisp highlights',
    recommendedHead: 6,
    recommendedVisor: 5,
    recommendedShoulder: 5,
    recommendedMaterial: 'pearlescent-ceramic',
    recommendedLighting: 'soft-product',
  },
  aegis: {
    id: 'aegis',
    name: 'Aegis',
    archetype: 'guardian',
    visualTone: 'Shield-derived chest armor and dependable presence',
    recommendedHead: 0,
    recommendedVisor: 0,
    recommendedShoulder: 0,
    recommendedMaterial: 'graphite',
    recommendedLighting: 'studio',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    archetype: 'sentinel',
    visualTone: 'Luxury black ceramic with high-contrast edge reflections',
    recommendedHead: 7,
    recommendedVisor: 2,
    recommendedShoulder: 4,
    recommendedMaterial: 'black-ceramic',
    recommendedLighting: 'obsidian',
  },
  prism: {
    id: 'prism',
    name: 'Prism',
    archetype: 'architect',
    visualTone: 'Faceted geometric light interaction',
    recommendedHead: 6,
    recommendedVisor: 6,
    recommendedShoulder: 5,
    recommendedMaterial: 'frosted-glass',
    recommendedLighting: 'prism',
  },
  nexus: {
    id: 'nexus',
    name: 'Nexus',
    archetype: 'operator',
    visualTone: 'Modular interlocking armor and central alignment',
    recommendedHead: 5,
    recommendedVisor: 7,
    recommendedShoulder: 2,
    recommendedMaterial: 'anodized-aluminum',
    recommendedLighting: 'signal',
  },
};

// ============================================================================
// 2. CANONICAL PROPORTION PROFILES
// ============================================================================
export const GUARDIAN_ARCHETYPES: Record<GuardianArchetype, {
  id: GuardianArchetype;
  headScale: number;
  shoulderWidth: number;
  chestWidth: number;
  chestDepth: number;
  neckHeight: number;
}> = {
  guardian: {
    id: 'guardian',
    headScale: 1.0,
    shoulderWidth: 1.0,
    chestWidth: 1.0,
    chestDepth: 1.0,
    neckHeight: 1.0,
  },
  sentinel: {
    id: 'sentinel',
    headScale: 0.96,
    shoulderWidth: 1.14,
    chestWidth: 1.08,
    chestDepth: 1.06,
    neckHeight: 0.95,
  },
  architect: {
    id: 'architect',
    headScale: 1.02,
    shoulderWidth: 0.95,
    chestWidth: 0.94,
    chestDepth: 0.92,
    neckHeight: 1.05,
  },
  operator: {
    id: 'operator',
    headScale: 0.98,
    shoulderWidth: 1.02,
    chestWidth: 1.0,
    chestDepth: 0.96,
    neckHeight: 1.0,
  },
};

// ============================================================================
// 3. EXPANDED HEAD REGISTRY (10 Precision Head Systems)
// ============================================================================
export const HEAD_REGISTRY: Record<number, GuardianHeadDefinition> = {
  0: {
    id: 'vault-dome',
    name: 'Vault Dome Shell',
    familyTag: 'core',
    bounds: { width: 0.84, height: 0.88, depth: 0.82 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.38, z: 0 } },
      visor: { position: { x: 0, y: 0.04, z: 0.39 } },
      emblem: { position: { x: 0, y: 0.32, z: 0.38 } },
      earLeft: { position: { x: -0.46, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.46, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.0,
  },
  1: {
    id: 'angular-crest',
    name: 'Angular Crest Crown',
    familyTag: 'vector',
    bounds: { width: 0.80, height: 0.96, depth: 0.80 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.40, z: 0 } },
      visor: { position: { x: 0, y: 0.02, z: 0.37 } },
      emblem: { position: { x: 0, y: 0.34, z: 0.36 } },
      earLeft: { position: { x: -0.44, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.44, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.0,
  },
  2: {
    id: 'aero-capsule',
    name: 'Aerodynamic Shell',
    familyTag: 'aero',
    bounds: { width: 0.78, height: 0.92, depth: 0.84 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.38, z: 0 } },
      visor: { position: { x: 0, y: 0.05, z: 0.38 } },
      emblem: { position: { x: 0, y: 0.31, z: 0.37 } },
      earLeft: { position: { x: -0.43, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.43, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.0,
  },
  3: {
    id: 'monolith-hex',
    name: 'Hexagonal Monolith',
    familyTag: 'monolith',
    bounds: { width: 0.82, height: 0.94, depth: 0.82 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.40, z: 0 } },
      visor: { position: { x: 0, y: 0.03, z: 0.38 } },
      emblem: { position: { x: 0, y: 0.33, z: 0.37 } },
      earLeft: { position: { x: -0.45, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.45, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.0,
  },
  4: {
    id: 'crown-apex',
    name: 'Crown Apex Shell',
    familyTag: 'command',
    bounds: { width: 0.84, height: 0.98, depth: 0.82 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.40, z: 0 } },
      visor: { position: { x: 0, y: 0.03, z: 0.38 } },
      emblem: { position: { x: 0, y: 0.36, z: 0.37 } },
      earLeft: { position: { x: -0.46, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.46, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.0,
  },
  5: {
    id: 'frame-chassis',
    name: 'Frame Rail Chassis',
    familyTag: 'nexus',
    bounds: { width: 0.80, height: 0.90, depth: 0.80 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.38, z: 0 } },
      visor: { position: { x: 0, y: 0.04, z: 0.38 } },
      emblem: { position: { x: 0, y: 0.32, z: 0.36 } },
      earLeft: { position: { x: -0.44, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.44, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.0,
  },
  6: {
    id: 'prism-facet',
    name: 'Prism Faceted Crown',
    familyTag: 'prism',
    bounds: { width: 0.82, height: 0.92, depth: 0.80 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.38, z: 0 } },
      visor: { position: { x: 0, y: 0.03, z: 0.38 } },
      emblem: { position: { x: 0, y: 0.33, z: 0.36 } },
      earLeft: { position: { x: -0.45, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.45, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.0,
  },
  7: {
    id: 'specter-stealth',
    name: 'Specter Stealth Shell',
    familyTag: 'specter',
    bounds: { width: 0.76, height: 0.90, depth: 0.78 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.38, z: 0 } },
      visor: { position: { x: 0, y: 0.04, z: 0.37 } },
      emblem: { position: { x: 0, y: 0.31, z: 0.35 } },
      earLeft: { position: { x: -0.42, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.42, y: 0.02, z: 0 } },
    },
    recommendedScale: 0.98,
  },
  8: {
    id: 'citadel-bastion',
    name: 'Citadel Heavy Bastion',
    familyTag: 'citadel',
    bounds: { width: 0.86, height: 0.94, depth: 0.86 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.40, z: 0 } },
      visor: { position: { x: 0, y: 0.02, z: 0.40 } },
      emblem: { position: { x: 0, y: 0.33, z: 0.38 } },
      earLeft: { position: { x: -0.47, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.47, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.02,
  },
  9: {
    id: 'signal-array',
    name: 'Signal Telemetry Shell',
    familyTag: 'signal',
    bounds: { width: 0.78, height: 0.90, depth: 0.80 },
    origin: { x: 0, y: 0, z: 0 },
    sockets: {
      neck: { position: { x: 0, y: -0.38, z: 0 } },
      visor: { position: { x: 0, y: 0.04, z: 0.38 } },
      emblem: { position: { x: 0, y: 0.32, z: 0.36 } },
      earLeft: { position: { x: -0.43, y: 0.02, z: 0 } },
      earRight: { position: { x: 0.43, y: 0.02, z: 0 } },
    },
    recommendedScale: 1.0,
  },
};

// ============================================================================
// 4. EXPANDED VISOR REGISTRY (8 Optic Architectures with Auto-Fit Width)
// ============================================================================
export const VISOR_REGISTRY: Record<number, GuardianVisorDefinition> = {
  0: {
    id: 'horizon-bar',
    name: 'Horizon Optic Bar',
    widthRatio: 0.74,
    height: 0.14,
    depthOffset: 0.015,
    curvatureFit: 1.0,
  },
  1: {
    id: 'dual-slotted',
    name: 'Dual Slotted Array',
    widthRatio: 0.68,
    height: 0.12,
    depthOffset: 0.012,
    curvatureFit: 0.95,
  },
  2: {
    id: 'monolith-aperture',
    name: 'Narrow Monolith Slot',
    widthRatio: 0.78,
    height: 0.07,
    depthOffset: 0.014,
    curvatureFit: 1.0,
  },
  3: {
    id: 'hex-core',
    name: 'Hexagonal Ocular Core',
    widthRatio: 0.42,
    height: 0.18,
    depthOffset: 0.02,
    curvatureFit: 0.9,
  },
  4: {
    id: 'blade-edge',
    name: 'Laser Blade Strip',
    widthRatio: 0.72,
    height: 0.05,
    depthOffset: 0.015,
    curvatureFit: 1.0,
  },
  5: {
    id: 'panoramic-arc',
    name: 'Panoramic Curved Visor',
    widthRatio: 0.80,
    height: 0.16,
    depthOffset: 0.016,
    curvatureFit: 1.05,
  },
  6: {
    id: 'halo-perimeter',
    name: 'Halo Luminous Perimeter',
    widthRatio: 0.66,
    height: 0.15,
    depthOffset: 0.018,
    curvatureFit: 0.96,
  },
  7: {
    id: 'split-sensor',
    name: 'Split Digital Sensor',
    widthRatio: 0.70,
    height: 0.10,
    depthOffset: 0.014,
    curvatureFit: 0.95,
  },
};

// ============================================================================
// 5. EXPANDED SHOULDER REGISTRY (6 Symmetrical Armor Packages)
// ============================================================================
export const SHOULDER_REGISTRY: Record<number, GuardianShoulderDefinition> = {
  0: {
    id: 'angular-mantle',
    name: 'Angular High-Collar Mantle',
    widthRatio: 1.08,
    offsetRatio: 0.52,
    collarHeight: 0.22,
    overlap: 0.08,
  },
  1: {
    id: 'curved-aero',
    name: 'Curved Aerodynamic Shoulders',
    widthRatio: 0.96,
    offsetRatio: 0.46,
    collarHeight: 0.18,
    overlap: 0.06,
  },
  2: {
    id: 'tiered-chassis',
    name: 'Tiered Command Chassis',
    widthRatio: 1.14,
    offsetRatio: 0.56,
    collarHeight: 0.24,
    overlap: 0.09,
  },
  3: {
    id: 'compact-guard',
    name: 'Compact Minimalist Guards',
    widthRatio: 0.90,
    offsetRatio: 0.44,
    collarHeight: 0.16,
    overlap: 0.05,
  },
  4: {
    id: 'citadel-heavy',
    name: 'Citadel Heavy Pauldrons',
    widthRatio: 1.22,
    offsetRatio: 0.60,
    collarHeight: 0.26,
    overlap: 0.10,
  },
  5: {
    id: 'blade-sweep',
    name: 'Swept Blade Wings',
    widthRatio: 1.10,
    offsetRatio: 0.54,
    collarHeight: 0.20,
    overlap: 0.07,
  },
};

// ============================================================================
// 6. EXPANDED PLINTH REGISTRY (5 Grounded Pedestals)
// ============================================================================
export const PLINTH_REGISTRY: Record<number, GuardianPlinthDefinition> = {
  0: {
    id: 'octagonal-monolith',
    name: 'Beveled Octagonal Monolith',
    height: 0.22,
    radius: 0.85,
    mountOverlap: 0.06,
  },
  1: {
    id: 'floating-dual-ring',
    name: 'Magnetic Dual Ring Base',
    height: 0.20,
    radius: 0.82,
    mountOverlap: 0.05,
  },
  2: {
    id: 'hexagonal-chiseled',
    name: 'Chiseled Hexagonal Base',
    height: 0.25,
    radius: 0.84,
    mountOverlap: 0.06,
  },
  3: {
    id: 'minimal-disc',
    name: 'Minimalist Low Disc',
    height: 0.16,
    radius: 0.78,
    mountOverlap: 0.04,
  },
  4: {
    id: 'architect-pedestal',
    name: 'Architect Layered Pedestal',
    height: 0.26,
    radius: 0.88,
    mountOverlap: 0.07,
  },
};

// ============================================================================
// 7. RESOLVED GEOMETRY DATA STRUCTURE
// ============================================================================
export interface ResolvedGuardianGeometry {
  archetype: {
    id: GuardianArchetype;
    headScale: number;
    shoulderWidth: number;
    chestWidth: number;
    chestDepth: number;
    neckHeight: number;
  };
  family: GuardianFamilyDefinition;
  headDef: GuardianHeadDefinition;
  visorDef: GuardianVisorDefinition;
  shoulderDef: GuardianShoulderDefinition;
  plinthDef: GuardianPlinthDefinition;

  // Root & Canonical Baseline
  root: {
    position: Vector3Tuple;
    baselineY: number;
  };

  // Plinth Pedestal
  plinth: {
    position: Vector3Tuple;
    variant: number;
    radius: number;
    height: number;
  };

  // Torso / Chest Center
  torso: {
    position: Vector3Tuple;
    width: number;
    height: number;
    depth: number;
  };

  // Symmetrical Shoulders
  leftShoulder: {
    position: Vector3Tuple;
    width: number;
  };
  rightShoulder: {
    position: Vector3Tuple;
    width: number;
  };
  shoulders: {
    variant: number;
    totalSpan: number;
  };

  // Neck Pillar (Bridges chest and head)
  neck: {
    position: Vector3Tuple;
    height: number;
    radius: number;
    topY: number;
  };

  // Head Pivot (Parent of head shell, visor, emblems, ears)
  head: {
    position: Vector3Tuple;
    offsetFromNeck: Vector3Tuple;
    variant: number;
    scale: number;
    bounds: { width: number; height: number; depth: number };
  };

  // Visor Socket (Child of Head Pivot)
  visor: {
    position: Vector3Tuple;
    variant: number;
    width: number;
    height: number;
  };

  // Emblem Socket (Child of Head Pivot or Chest)
  emblem: {
    position: Vector3Tuple;
    variant: number;
    scale: number;
  };

  // Ears / Telemetry Pods (Child of Head Pivot)
  earLeft: { position: Vector3Tuple };
  earRight: { position: Vector3Tuple };

  // Overall Bounding Box
  bounds: {
    minY: number;
    maxY: number;
    totalHeight: number;
    totalWidth: number;
    totalDepth: number;
    visualCenterY: number;
  };
}

// ============================================================================
// 8. CONFIG NORMALIZATION & SAFE GUARDRAILS
// ============================================================================
export function normalizeGuardianConfig(config: BunkerAvatarConfig): BunkerAvatarConfig {
  const familyKey = (config.family || 'core') as GuardianFamily;
  const safeFamily = GUARDIAN_FAMILIES[familyKey] ? familyKey : 'core';
  const familyDef = GUARDIAN_FAMILIES[safeFamily];

  const archetypeKey = (config.archetype || familyDef.archetype || 'guardian') as GuardianArchetype;
  const safeArchetype = GUARDIAN_ARCHETYPES[archetypeKey] ? archetypeKey : 'guardian';

  const maxHead = Object.keys(HEAD_REGISTRY).length - 1;
  const maxVisor = Object.keys(VISOR_REGISTRY).length - 1;
  const maxShoulder = Object.keys(SHOULDER_REGISTRY).length - 1;
  const maxPlinth = Object.keys(PLINTH_REGISTRY).length - 1;

  const headVar = Math.max(0, Math.min(maxHead, config.headVariant ?? familyDef.recommendedHead));
  const visorVar = Math.max(0, Math.min(maxVisor, config.visorVariant ?? familyDef.recommendedVisor));
  const shoulderVar = Math.max(0, Math.min(maxShoulder, config.shoulderVariant ?? familyDef.recommendedShoulder));
  const plinthVar = Math.max(0, Math.min(maxPlinth, config.plinthVariant ?? 0));
  const emblemVar = Math.max(0, Math.min(7, config.emblemVariant ?? 0));

  return {
    ...config,
    family: safeFamily,
    archetype: safeArchetype,
    headVariant: headVar,
    visorVariant: visorVar,
    shoulderVariant: shoulderVar,
    plinthVariant: plinthVar,
    emblemVariant: emblemVar,
    metalness: Math.max(0.1, Math.min(0.85, config.metalness ?? 0.25)),
    roughness: Math.max(0.15, Math.min(0.95, config.roughness ?? 0.35)),
  };
}

// ============================================================================
// 9. CANONICAL GEOMETRY RESOLVER
// ============================================================================
export function resolveGuardianGeometry(rawConfig: BunkerAvatarConfig): ResolvedGuardianGeometry {
  const config = normalizeGuardianConfig(rawConfig);
  const family = GUARDIAN_FAMILIES[config.family || 'core'] || GUARDIAN_FAMILIES.core;
  const archetype = GUARDIAN_ARCHETYPES[config.archetype] || GUARDIAN_ARCHETYPES.guardian;

  const headDef = HEAD_REGISTRY[config.headVariant] || HEAD_REGISTRY[0];
  const visorDef = VISOR_REGISTRY[config.visorVariant] || VISOR_REGISTRY[0];
  const shoulderDef = SHOULDER_REGISTRY[config.shoulderVariant] || SHOULDER_REGISTRY[0];
  const plinthDef = PLINTH_REGISTRY[config.plinthVariant] || PLINTH_REGISTRY[0];

  // 1. Plinth Baseline at Canonical Ground Y = 0 (-1.15 normalized center)
  const plinthY = -1.15;
  const plinthHeight = plinthDef.height;

  // 2. Torso / Chest Physically Mounted atop the Plinth Socket
  const torsoY = plinthY + plinthHeight + 0.32;
  const chestWidth = 1.0 * archetype.chestWidth;
  const chestDepth = 0.8 * archetype.chestDepth;
  const chestHeight = 0.52;

  // 3. Symmetrical Shoulder Placement Derived Directly from Torso Width
  const shoulderSpan = chestWidth * shoulderDef.widthRatio * archetype.shoulderWidth * 1.35;
  const shoulderOffsetX = (shoulderSpan / 2) * shoulderDef.offsetRatio;

  // 4. Neck Base Anchored on Upper Chest Center
  const neckBaseY = 0.28 * archetype.neckHeight;
  const neckHeight = 0.26 * archetype.neckHeight;
  const neckRadius = 0.23;
  const neckTopY = neckBaseY + neckHeight;

  // 5. Head Sits Physically on Top of the Neck (Controlled Overlap)
  const headScale = archetype.headScale * headDef.recommendedScale;
  const headBoundingH = headDef.bounds.height * headScale;
  const controlledOverlap = 0.08;
  const headCenterOffsetY = neckHeight / 2 + headBoundingH / 2 - controlledOverlap;

  const resolvedHeadBounds = {
    width: headDef.bounds.width * headScale,
    height: headBoundingH,
    depth: headDef.bounds.depth * headScale,
  };

  // 6. Visor Socket Fit Directly on Head Curvature (Derived from Head Width & Socket)
  const resolvedVisorWidth = resolvedHeadBounds.width * visorDef.widthRatio;
  const visorSocket = headDef.sockets.visor;
  const visorPosition: Vector3Tuple = {
    x: 0, // Head center line strictly X = 0
    y: visorSocket.position.y,
    z: (resolvedHeadBounds.depth / 2) * 0.92 + visorDef.depthOffset,
  };

  // 7. Emblem Socket (Attached to forehead shell or chest)
  const emblemSocket = headDef.sockets.emblem;
  const emblemPosition: Vector3Tuple = {
    x: 0,
    y: emblemSocket.position.y,
    z: (resolvedHeadBounds.depth / 2) * 0.9 + 0.02,
  };

  // 8. Lateral Ear Telemetry Pods Symmetrical on Head Shell
  const earOffsetX = (resolvedHeadBounds.width / 2) + 0.04;

  // 9. Overall Bounding Box Computation
  const minY = plinthY - plinthHeight / 2;
  const maxY = torsoY + neckBaseY + headCenterOffsetY + headBoundingH / 2;
  const totalHeight = maxY - minY;
  const totalWidth = Math.max(shoulderSpan, resolvedHeadBounds.width);
  const totalDepth = Math.max(chestDepth, resolvedHeadBounds.depth);
  const visualCenterY = (minY + maxY) / 2 + 0.05;

  return {
    archetype,
    family,
    headDef,
    visorDef,
    shoulderDef,
    plinthDef,
    root: {
      position: { x: 0, y: -0.15, z: 0 },
      baselineY: 0,
    },
    plinth: {
      position: { x: 0, y: plinthY, z: 0 },
      variant: config.plinthVariant,
      radius: plinthDef.radius,
      height: plinthHeight,
    },
    torso: {
      position: { x: 0, y: torsoY, z: 0 },
      width: chestWidth,
      height: chestHeight,
      depth: chestDepth,
    },
    leftShoulder: {
      position: { x: -shoulderOffsetX, y: 0, z: 0 },
      width: shoulderSpan / 2,
    },
    rightShoulder: {
      position: { x: shoulderOffsetX, y: 0, z: 0 },
      width: shoulderSpan / 2,
    },
    shoulders: {
      variant: config.shoulderVariant,
      totalSpan: shoulderSpan,
    },
    neck: {
      position: { x: 0, y: neckBaseY, z: 0 },
      height: neckHeight,
      radius: neckRadius,
      topY: neckTopY,
    },
    head: {
      position: { x: 0, y: torsoY + neckBaseY + headCenterOffsetY, z: 0 },
      offsetFromNeck: { x: 0, y: headCenterOffsetY, z: 0 },
      variant: config.headVariant,
      scale: headScale,
      bounds: resolvedHeadBounds,
    },
    visor: {
      position: visorPosition,
      variant: config.visorVariant,
      width: resolvedVisorWidth,
      height: visorDef.height,
    },
    emblem: {
      position: emblemPosition,
      variant: config.emblemVariant,
      scale: 1.0,
    },
    earLeft: {
      position: { x: -earOffsetX, y: headDef.sockets.earLeft.position.y, z: 0 },
    },
    earRight: {
      position: { x: earOffsetX, y: headDef.sockets.earRight.position.y, z: 0 },
    },
    bounds: {
      minY,
      maxY,
      totalHeight,
      totalWidth,
      totalDepth,
      visualCenterY,
    },
  };
}

// ============================================================================
// 10. GEOMETRY INTEGRITY VALIDATION (AUTOMATED QA)
// ============================================================================
export function validateGuardianGeometry(config: BunkerAvatarConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const geom = resolveGuardianGeometry(config);

  // 1. Symmetrical Shoulders Check
  if (Math.abs(geom.leftShoulder.position.x + geom.rightShoulder.position.x) > 0.0001) {
    errors.push('Shoulder symmetry violated: left and right X coordinates are not perfectly mirrored.');
  }

  // 2. Head Center X alignment
  if (geom.head.position.x !== 0) {
    errors.push(`Head is not centered on canonical X=0 axis (current: ${geom.head.position.x}).`);
  }

  // 3. Visor within head bounding width
  if (geom.visor.width > geom.head.bounds.width) {
    errors.push(`Visor width (${geom.visor.width}) exceeds head shell width (${geom.head.bounds.width}).`);
  }

  // 4. Neck-head connection overlap
  if (geom.head.offsetFromNeck.y <= 0) {
    errors.push('Head is sinking into neck or below upper collar.');
  }

  // 5. Total bust height bounds
  if (geom.bounds.totalHeight < 1.4 || geom.bounds.totalHeight > 2.6) {
    errors.push(`Guardian total bust height out of safe canonical range: ${geom.bounds.totalHeight}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

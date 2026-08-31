import { create } from 'zustand';
import type {
  BunkerAvatarConfig,
  AvatarPreviewContext,
  GuardianAvatarDTO,
} from '../../types/avatar.types';
import { generateAvatarConfig, generateCandidateVariants } from '../../lib/avatar-generator';

export type GuardianEditorTool =
  | 'identity'
  | 'structure'
  | 'head'
  | 'visor'
  | 'armor'
  | 'materials'
  | 'colors'
  | 'emblem'
  | 'pose'
  | 'lighting'
  | 'environment'
  | 'variants';

export interface GuardianEditorState {
  // Identity & Target
  mode: 'create' | 'edit';
  avatarId: string | null;
  avatarCode: string;
  name: string;
  projectId: string | null;
  projectName: string | null;
  clientName: string | null;
  publicBrief: string;

  // Configurations & History
  savedConfig: BunkerAvatarConfig;
  draftConfig: BunkerAvatarConfig;
  history: BunkerAvatarConfig[];
  historyIndex: number;
  isDirty: boolean;

  // Viewport & Presentation States
  selectedTool: GuardianEditorTool;
  previewContext: AvatarPreviewContext | 'project' | 'portal';
  isLightMode: boolean;
  isFullscreen: boolean;
  compareMode: boolean;
  cameraPreset: 'front' | 'three-quarter' | 'side' | 'fit';
  zoomLevel: number;

  // Variants & Locks
  lockedAttributes: Set<string>;
  candidateVariants: BunkerAvatarConfig[];
  recentColors: string[];

  // Actions
  initialize: (initialData?: { avatar?: GuardianAvatarDTO | null; defaultProject?: any; mode?: 'create' | 'edit' }) => void;
  setName: (name: string) => void;
  setProjectId: (projectId: string | null, projectName?: string, clientName?: string) => void;
  setPublicBrief: (brief: string) => void;
  setSelectedTool: (tool: GuardianEditorTool) => void;
  setPreviewContext: (ctx: any) => void;
  setIsLightMode: (light: boolean) => void;
  setIsFullscreen: (full: boolean) => void;
  setCompareMode: (compare: boolean) => void;
  setCameraPreset: (preset: 'front' | 'three-quarter' | 'side' | 'fit') => void;
  setZoomLevel: (zoom: number) => void;

  // Config Modifiers with History push
  updateConfig: (updater: (prev: BunkerAvatarConfig) => Partial<BunkerAvatarConfig>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Section & Global Resets
  resetSection: (tool: GuardianEditorTool) => void;
  restoreDeterministicDefault: () => void;

  // Attribute Locking & Variant Generation
  toggleLock: (attribute: string) => void;
  generateVariants: (partialCategory?: string) => void;
  applyVariant: (variantConfig: BunkerAvatarConfig) => void;

  // Colors & Session
  addRecentColor: (hex: string) => void;
  markSaved: (newSavedConfig?: BunkerAvatarConfig) => void;
}

const MAX_HISTORY = 30;

export const useGuardianEditorStore = create<GuardianEditorState>((set, get) => ({
  mode: 'create',
  avatarId: null,
  avatarCode: '0000000000',
  name: 'New Guardian Identity',
  projectId: null,
  projectName: null,
  clientName: null,
  publicBrief: '',

  savedConfig: generateAvatarConfig({ entityId: 'init', entityKind: 'generic', name: 'Guardian' }),
  draftConfig: generateAvatarConfig({ entityId: 'init', entityKind: 'generic', name: 'Guardian' }),
  history: [],
  historyIndex: 0,
  isDirty: false,

  selectedTool: 'identity',
  previewContext: 'studio',
  isLightMode: false,
  isFullscreen: false,
  compareMode: false,
  cameraPreset: 'three-quarter',
  zoomLevel: 1.0,

  lockedAttributes: new Set<string>(),
  candidateVariants: [],
  recentColors: ['#06B6D4', '#E11D48', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6', '#FFFFFF', '#18181B'],

  initialize: ({ avatar, defaultProject, mode = 'create' } = {}) => {
    let baseConfig: BunkerAvatarConfig;
    let initialName = 'New Guardian Identity';
    let initialCode = '';
    let pId = defaultProject?.id || null;
    let pName = defaultProject?.name || null;
    let cName = defaultProject?.clients?.company || defaultProject?.clients?.name || null;

    if (avatar) {
      baseConfig = avatar.config;
      initialName = avatar.name;
      initialCode = avatar.avatarCode;
      pId = avatar.projectId || pId;
      pName = avatar.projectName || pName;
      cName = avatar.clientName || cName;
    } else if (defaultProject) {
      initialName = `${defaultProject.name} Guardian`;
      baseConfig = generateAvatarConfig({
        entityId: defaultProject.id,
        entityKind: 'project',
        name: defaultProject.name,
        preferredColor: defaultProject.color,
      });
      initialCode = 'auto';
    } else {
      baseConfig = generateAvatarConfig({
        entityId: `bunker-${Date.now()}`,
        entityKind: 'generic',
        name: initialName,
      });
      initialCode = 'auto';
    }

    const variants = generateCandidateVariants(baseConfig, 4);

    set({
      mode,
      avatarId: avatar?.id || null,
      avatarCode: initialCode,
      name: initialName,
      projectId: pId,
      projectName: pName,
      clientName: cName,
      publicBrief: 'The project Guardian represents this workspace across cryptographic client deliverables.',
      savedConfig: baseConfig,
      draftConfig: baseConfig,
      history: [baseConfig],
      historyIndex: 0,
      isDirty: false,
      selectedTool: 'identity',
      previewContext: 'studio',
      candidateVariants: variants,
      compareMode: false,
      isFullscreen: false,
    });
  },

  setName: (name) => set({ name, isDirty: true }),
  setProjectId: (projectId, projectName, clientName) =>
    set({ projectId, projectName: projectName || null, clientName: clientName || null, isDirty: true }),
  setPublicBrief: (publicBrief) => set({ publicBrief, isDirty: true }),
  setSelectedTool: (selectedTool) => set({ selectedTool }),
  setPreviewContext: (previewContext) => set({ previewContext }),
  setIsLightMode: (isLightMode) => set({ isLightMode }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setCompareMode: (compareMode) => set({ compareMode }),
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),

  updateConfig: (updater) => {
    const { draftConfig, history, historyIndex } = get();
    const updates = updater(draftConfig);
    const newConfig = { ...draftConfig, ...updates };

    // Slice history up to current index and append new state
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory.length >= MAX_HISTORY) {
      newHistory.shift();
    }
    newHistory.push(newConfig);

    set({
      draftConfig: newConfig,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });
  },

  undo: () => {
    const { history, historyIndex, savedConfig } = get();
    if (historyIndex > 0) {
      const prevConfig = history[historyIndex - 1];
      set({
        draftConfig: prevConfig,
        historyIndex: historyIndex - 1,
        isDirty: JSON.stringify(prevConfig) !== JSON.stringify(savedConfig),
      });
    }
  },

  redo: () => {
    const { history, historyIndex, savedConfig } = get();
    if (historyIndex < history.length - 1) {
      const nextConfig = history[historyIndex + 1];
      set({
        draftConfig: nextConfig,
        historyIndex: historyIndex + 1,
        isDirty: JSON.stringify(nextConfig) !== JSON.stringify(savedConfig),
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  resetSection: (tool) => {
    const { savedConfig, updateConfig } = get();
    switch (tool) {
      case 'colors':
        updateConfig(() => ({
          primaryColor: savedConfig.primaryColor,
          secondaryColor: savedConfig.secondaryColor,
          accentColor: savedConfig.accentColor,
          visorTint: savedConfig.visorTint,
          glowColor: savedConfig.glowColor,
        }));
        break;
      case 'materials':
        updateConfig(() => ({
          material: savedConfig.material,
          metalness: savedConfig.metalness,
          roughness: savedConfig.roughness,
        }));
        break;
      case 'structure':
      case 'head':
        updateConfig(() => ({
          archetype: savedConfig.archetype,
          headVariant: savedConfig.headVariant,
        }));
        break;
      case 'visor':
        updateConfig(() => ({
          visorVariant: savedConfig.visorVariant,
          visorTint: savedConfig.visorTint,
        }));
        break;
      case 'armor':
        updateConfig(() => ({
          shoulderVariant: savedConfig.shoulderVariant,
          plinthVariant: savedConfig.plinthVariant,
        }));
        break;
      case 'pose':
        updateConfig(() => ({
          pose: savedConfig.pose,
        }));
        break;
      case 'environment':
        updateConfig(() => ({
          environmentVariant: savedConfig.environmentVariant,
        }));
        break;
      default:
        break;
    }
  },

  restoreDeterministicDefault: () => {
    const { draftConfig, updateConfig, name } = get();
    const defaultConfig = generateAvatarConfig({
      entityId: `bunker-${draftConfig.seed}`,
      entityKind: 'generic',
      name,
    });
    updateConfig(() => defaultConfig);
  },

  toggleLock: (attribute) => {
    const { lockedAttributes } = get();
    const nextLocks = new Set(lockedAttributes);
    if (nextLocks.has(attribute)) {
      nextLocks.delete(attribute);
    } else {
      nextLocks.add(attribute);
    }
    set({ lockedAttributes: nextLocks });
  },

  generateVariants: (_partialCategory) => {
    const { draftConfig, lockedAttributes } = get();
    const baseVariants = generateCandidateVariants(draftConfig, 4);

    // If attributes are locked, preserve those fields
    const filteredVariants = baseVariants.map((v) => {
      const copy = { ...v };
      if (lockedAttributes.has('material')) {
        copy.material = draftConfig.material;
        copy.metalness = draftConfig.metalness;
        copy.roughness = draftConfig.roughness;
      }
      if (lockedAttributes.has('colors')) {
        copy.primaryColor = draftConfig.primaryColor;
        copy.secondaryColor = draftConfig.secondaryColor;
        copy.accentColor = draftConfig.accentColor;
        copy.visorTint = draftConfig.visorTint;
        copy.glowColor = draftConfig.glowColor;
      }
      if (lockedAttributes.has('structure')) {
        copy.archetype = draftConfig.archetype;
        copy.headVariant = draftConfig.headVariant;
        copy.shoulderVariant = draftConfig.shoulderVariant;
      }
      if (lockedAttributes.has('visor')) {
        copy.visorVariant = draftConfig.visorVariant;
      }
      return copy;
    });

    set({ candidateVariants: filteredVariants });
  },

  applyVariant: (variantConfig) => {
    const { updateConfig } = get();
    updateConfig(() => variantConfig);
  },

  addRecentColor: (hex) => {
    const { recentColors } = get();
    const upper = hex.toUpperCase();
    const updated = [upper, ...recentColors.filter((c) => c.toUpperCase() !== upper)].slice(0, 12);
    set({ recentColors: updated });
  },

  markSaved: (newSavedConfig) => {
    const configToSave = newSavedConfig || get().draftConfig;
    set({
      savedConfig: configToSave,
      draftConfig: configToSave,
      isDirty: false,
    });
  },
}));

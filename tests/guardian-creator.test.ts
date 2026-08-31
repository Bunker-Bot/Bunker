import { describe, it, expect } from 'vitest';
import { useGuardianEditorStore } from '../src/features/identity-avatar/creator/state/useGuardianEditorStore';
import { generateAvatarConfig, generateCandidateVariants } from '../src/features/identity-avatar/lib/avatar-generator';

describe('Guardian Creator & Editor Store Test Suite', () => {
  it('should initialize store with a valid deterministic starting avatar', () => {
    useGuardianEditorStore.getState().initialize({ mode: 'create' });

    const state = useGuardianEditorStore.getState();
    expect(state.mode).toBe('create');
    expect(state.draftConfig).toBeDefined();
    expect(state.draftConfig.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(state.isDirty).toBe(false);
    expect(state.canUndo()).toBe(false);
    expect(state.canRedo()).toBe(false);
  });

  it('should support multi-step undo and redo', () => {
    useGuardianEditorStore.getState().initialize({ mode: 'create' });
    const initialColor = useGuardianEditorStore.getState().draftConfig.primaryColor;

    // Change 1
    useGuardianEditorStore.getState().updateConfig(() => ({ primaryColor: '#E11D48' }));
    expect(useGuardianEditorStore.getState().draftConfig.primaryColor).toBe('#E11D48');
    expect(useGuardianEditorStore.getState().canUndo()).toBe(true);

    // Change 2
    useGuardianEditorStore.getState().updateConfig(() => ({ primaryColor: '#10B981' }));
    expect(useGuardianEditorStore.getState().draftConfig.primaryColor).toBe('#10B981');

    // Undo step 2 -> step 1
    useGuardianEditorStore.getState().undo();
    expect(useGuardianEditorStore.getState().draftConfig.primaryColor).toBe('#E11D48');
    expect(useGuardianEditorStore.getState().canRedo()).toBe(true);

    // Undo step 1 -> initial
    useGuardianEditorStore.getState().undo();
    expect(useGuardianEditorStore.getState().draftConfig.primaryColor).toBe(initialColor);

    // Redo back to step 1
    useGuardianEditorStore.getState().redo();
    expect(useGuardianEditorStore.getState().draftConfig.primaryColor).toBe('#E11D48');
  });

  it('should preserve locked attributes when generating variants', () => {
    useGuardianEditorStore.getState().initialize({ mode: 'create' });

    // Set custom material and lock it
    useGuardianEditorStore.getState().updateConfig(() => ({
      material: 'ceramic',
      roughness: 0.25,
      metalness: 0.15,
    }));
    useGuardianEditorStore.getState().toggleLock('material');

    // Generate variants
    useGuardianEditorStore.getState().generateVariants();
    const variants = useGuardianEditorStore.getState().candidateVariants;

    expect(variants.length).toBe(4);
    for (const v of variants) {
      expect(v.material).toBe('ceramic');
      expect(v.roughness).toBe(0.25);
      expect(v.metalness).toBe(0.15);
    }
  });

  it('should reset specific tool section to saved baseline without corrupting others', () => {
    useGuardianEditorStore.getState().initialize({ mode: 'create' });

    const savedColors = useGuardianEditorStore.getState().savedConfig.primaryColor;

    // Modify head and colors
    useGuardianEditorStore.getState().updateConfig(() => ({
      headVariant: 3,
      primaryColor: '#8B5CF6',
    }));

    // Reset only colors
    useGuardianEditorStore.getState().resetSection('colors');

    const state = useGuardianEditorStore.getState();
    expect(state.draftConfig.primaryColor).toBe(savedColors);
    expect(state.draftConfig.headVariant).toBe(3); // Head remains modified!
  });

  it('should restore deterministic default from seed', () => {
    useGuardianEditorStore.getState().initialize({ mode: 'create' });

    useGuardianEditorStore.getState().updateConfig(() => ({
      archetype: 'operator',
      primaryColor: '#FF00FF',
    }));

    useGuardianEditorStore.getState().restoreDeterministicDefault();
    const state = useGuardianEditorStore.getState();
    expect(state.draftConfig).toBeDefined();
    expect(state.draftConfig.archetype).toBeDefined();
  });
});

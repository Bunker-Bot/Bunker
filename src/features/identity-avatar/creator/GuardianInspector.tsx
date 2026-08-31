import React from 'react';
import { useGuardianEditorStore } from './state/useGuardianEditorStore';
import { IdentityControls } from './controls/IdentityControls';
import { StructureControls } from './controls/StructureControls';
import { HeadControls } from './controls/HeadControls';
import { VisorControls } from './controls/VisorControls';
import { ArmorControls } from './controls/ArmorControls';
import { MaterialControls } from './controls/MaterialControls';
import { ColorControls } from './controls/ColorControls';
import { EmblemControls } from './controls/EmblemControls';
import { PoseControls } from './controls/PoseControls';
import { LightingControls } from './controls/LightingControls';
import { EnvironmentControls } from './controls/EnvironmentControls';
import { VariantControls } from './controls/VariantControls';
import { HugeiconsIcon } from '@hugeicons/react';
import { RotateLeftIcon } from '@hugeicons/core-free-icons';

export const GuardianInspector: React.FC = () => {
  const { selectedTool, resetSection } = useGuardianEditorStore();

  const getToolTitle = () => {
    switch (selectedTool) {
      case 'identity': return 'Identity & Workspace';
      case 'structure': return 'Silhouette Family';
      case 'head': return 'Head Shell Geometry';
      case 'visor': return 'Optic Visor Finish';
      case 'armor': return 'Mantle & Plinth Base';
      case 'materials': return 'PBR Material Archetype';
      case 'colors': return 'Semantic Color Designer';
      case 'emblem': return 'Forehead Seal Emblem';
      case 'pose': return 'Pose & Framing Orientation';
      case 'lighting': return 'Stage Lighting Master';
      case 'environment': return 'Environment Atmosphere';
      case 'variants': return 'Variant Generator Engine';
      default: return 'Customization Inspector';
    }
  };

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col justify-between font-mono text-xs select-none overflow-hidden">
      {/* Inspector Header */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-zinc-850 bg-zinc-900/40 flex items-center justify-between gap-3 shrink-0">
        <div className="space-y-0.5 min-w-0">
          <span className="text-[9.5px] uppercase font-bold text-zinc-500 tracking-wider block">
            Context Inspector
          </span>
          <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
            {getToolTitle()}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => resetSection(selectedTool)}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[10.5px] flex items-center gap-1 shrink-0"
          title="Reset current tool section to saved state"
        >
          <HugeiconsIcon icon={RotateLeftIcon} size={11} />
          <span>Reset</span>
        </button>
      </div>

      {/* Scrollable Controls Body */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar">
        {selectedTool === 'identity' && <IdentityControls />}
        {selectedTool === 'structure' && <StructureControls />}
        {selectedTool === 'head' && <HeadControls />}
        {selectedTool === 'visor' && <VisorControls />}
        {selectedTool === 'armor' && <ArmorControls />}
        {selectedTool === 'materials' && <MaterialControls />}
        {selectedTool === 'colors' && <ColorControls />}
        {selectedTool === 'emblem' && <EmblemControls />}
        {selectedTool === 'pose' && <PoseControls />}
        {selectedTool === 'lighting' && <LightingControls />}
        {selectedTool === 'environment' && <EnvironmentControls />}
        {selectedTool === 'variants' && <VariantControls />}
      </div>
    </div>
  );
};

export default GuardianInspector;

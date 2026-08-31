import React from 'react';
import { useGuardianEditorStore, type GuardianEditorTool } from './state/useGuardianEditorStore';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  Layers01Icon,
  Shield01Icon,
  ViewIcon,
  PaintBucketIcon,
  ColorPickerIcon,
  BadgePercentIcon,
  AlignBoxTopCenterIcon,
  Sun01Icon,
  SparklesIcon,
  CpuIcon,
  Structure01Icon,
} from '@hugeicons/core-free-icons';

interface ToolItem {
  id: GuardianEditorTool;
  label: string;
  icon: any;
  badge?: string;
}

const TOOLS: ToolItem[] = [
  { id: 'identity', label: 'Identity', icon: UserIcon },
  { id: 'structure', label: 'Structure', icon: Structure01Icon },
  { id: 'head', label: 'Head Shell', icon: Shield01Icon },
  { id: 'visor', label: 'Optic Visor', icon: ViewIcon },
  { id: 'armor', label: 'Mantle & Plinth', icon: Layers01Icon },
  { id: 'materials', label: 'Materials', icon: CpuIcon },
  { id: 'colors', label: 'Colors & Glow', icon: ColorPickerIcon },
  { id: 'emblem', label: 'Emblem Mark', icon: BadgePercentIcon },
  { id: 'pose', label: 'Pose & Motion', icon: AlignBoxTopCenterIcon },
  { id: 'lighting', label: 'Lighting', icon: Sun01Icon },
  { id: 'environment', label: 'Environment', icon: PaintBucketIcon },
  { id: 'variants', label: 'Variant Engine', icon: SparklesIcon, badge: 'AI' },
];

export const GuardianToolRail: React.FC = () => {
  const { selectedTool, setSelectedTool } = useGuardianEditorStore();

  return (
    <aside className="w-full lg:w-56 h-12 lg:h-full bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-850 flex flex-row lg:flex-col justify-start lg:justify-between items-center lg:items-stretch px-2 lg:p-2 select-none font-mono text-xs shrink-0 z-20 overflow-x-auto lg:overflow-x-hidden custom-scrollbar">
      <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-1 w-full min-w-max lg:min-w-0">
        <div className="hidden lg:block px-3 py-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
          Studio Tool Rail
        </div>

        <nav className="flex flex-row lg:flex-col gap-1 w-full">
          {TOOLS.map((tool) => {
            const isSelected = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center gap-2 lg:gap-3 px-2.5 py-1.5 lg:py-2 rounded-sm text-left transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
                title={tool.label}
              >
                <div
                  className={`p-0.5 lg:p-1 rounded-sm shrink-0 ${
                    isSelected ? 'text-cyan-400' : 'text-zinc-500'
                  }`}
                >
                  <HugeiconsIcon icon={tool.icon} size={15} />
                </div>

                <span className="text-[11px] lg:text-[11.5px] truncate">
                  {tool.label}
                </span>

                {tool.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[8.5px] lg:text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tool Rail Hint (Desktop only) */}
      <div className="hidden lg:block p-2.5 rounded-sm bg-zinc-900/60 border border-zinc-850 text-[10.5px] text-zinc-400 font-sans leading-tight">
        <span className="font-bold font-mono text-white block mb-0.5 text-[10px] uppercase">
          WYSIWYG Atelier
        </span>
        Draft modifications update live in the 3D viewport without server delays.
      </div>
    </aside>
  );
};

export default GuardianToolRail;

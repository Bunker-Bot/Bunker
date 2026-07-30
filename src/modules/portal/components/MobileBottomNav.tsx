import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Building01Icon,
  Clock01Icon,
  DocumentCodeIcon,
  Download01Icon,
  Menu01Icon
} from '@hugeicons/core-free-icons';

interface MobileBottomNavProps {
  activeModule: string;
  onSelectModule: (id: string) => void;
  onOpenMore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeModule,
  onSelectModule,
  onOpenMore,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building01Icon },
    { id: 'timeline', label: 'Timeline', icon: Clock01Icon },
    { id: 'documentation', label: 'Docs', icon: DocumentCodeIcon },
    { id: 'downloads', label: 'Downloads', icon: Download01Icon },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#09090b]/95 border-t border-zinc-800 backdrop-blur-2xl z-40 flex items-center justify-around font-mono text-[10px] select-none px-2 shadow-2xl">
      {tabs.map((tab) => {
        const isActive = activeModule === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectModule(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-sm transition-all cursor-pointer ${
              isActive ? 'text-cyan-400 font-extrabold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HugeiconsIcon icon={Icon} size={17} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
            <span>{tab.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-sm text-zinc-400 hover:text-white transition-all cursor-pointer"
      >
        <HugeiconsIcon icon={Menu01Icon} size={17} className="text-zinc-500" />
        <span>More</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;

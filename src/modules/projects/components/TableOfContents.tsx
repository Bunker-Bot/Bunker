import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  activeId,
  onSelect,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="w-56 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs select-none shrink-0 font-mono hidden xl:block">
      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-zinc-800/60 text-zinc-400 font-bold text-[11px] uppercase tracking-wider">
        <HugeiconsIcon icon={Menu01Icon} size={13} />
        <span>Table of Contents</span>
      </div>

      <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full text-left truncate rounded px-2 py-1 transition-colors cursor-pointer text-[11px] ${
                item.level === 1
                  ? 'font-semibold'
                  : item.level === 2
                  ? 'pl-4 text-zinc-300'
                  : 'pl-6 text-zinc-400'
              } ${
                isActive
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-white'
              }`}
            >
              {item.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableOfContents;

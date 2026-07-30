import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { MarkdownPreview } from './MarkdownPreview';

interface CollapsibleMarkdownProps {
  content: string;
  defaultExpanded?: boolean;
  maxCollapsedHeight?: number;
  className?: string;
}

export const CollapsibleMarkdown: React.FC<CollapsibleMarkdownProps> = ({
  content,
  defaultExpanded = false,
  maxCollapsedHeight = 130,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!content) return null;

  // Determine if content is long enough or contains rich markdown to need expand/collapse
  const isLong = content.length > 180 || content.includes('\n') || content.includes('```') || content.includes('#');

  return (
    <div className={`space-y-1 ${className}`}>
      <div
        className={`relative transition-all duration-200 ${
          !isExpanded && isLong ? 'overflow-hidden' : ''
        }`}
        style={!isExpanded && isLong ? { maxHeight: `${maxCollapsedHeight}px` } : undefined}
      >
        <MarkdownPreview content={content} compact />

        {!isExpanded && isLong && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
        )}
      </div>

      {isLong && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer py-0.5"
        >
          <span>{isExpanded ? 'Collapse Content' : 'Expand Full Preview'}</span>
          <HugeiconsIcon icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon} size={13} />
        </button>
      )}
    </div>
  );
};

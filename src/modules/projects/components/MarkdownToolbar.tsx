import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  TextBoldIcon,
  TextItalicIcon,
  Heading01Icon,
  CodeIcon,
  QuoteUpIcon,
  CheckListIcon,
  Link01Icon,
  GridIcon,
  Copy01Icon,
  Menu01Icon,
  InformationCircleIcon,
  ArrowExpand01Icon,
} from '@hugeicons/core-free-icons';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string) => void;
  onCopy: () => void;
  viewMode?: 'edit' | 'split' | 'preview';
  onViewModeChange?: (mode: 'edit' | 'split' | 'preview') => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsert,
  onCopy,
  viewMode = 'edit',
  onViewModeChange,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-t-lg bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 text-xs select-none flex-wrap">
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => onInsert('**', '**')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Bold (**text**)"
        >
          <HugeiconsIcon icon={TextBoldIcon} size={15} />
        </button>

        <button
          type="button"
          onClick={() => onInsert('*', '*')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Italic (*text*)"
        >
          <HugeiconsIcon icon={TextItalicIcon} size={15} />
        </button>

        <button
          type="button"
          onClick={() => onInsert('### ')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Heading 3 (### Title)"
        >
          <HugeiconsIcon icon={Heading01Icon} size={15} />
        </button>

        <span className="w-px h-4 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => onInsert('```typescript\n', '\n```')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Code Block (```)"
        >
          <HugeiconsIcon icon={CodeIcon} size={15} />
        </button>

        <button
          type="button"
          onClick={() => onInsert('> [!NOTE]\n> ')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="GitHub Callout (> [!NOTE])"
        >
          <HugeiconsIcon icon={InformationCircleIcon} size={15} />
        </button>

        <button
          type="button"
          onClick={() =>
            onInsert('```mermaid\ngraph TD\n    A[Client Request] --> B[API Gateway]\n    B --> C[Database]\n```\n')
          }
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Mermaid Diagram Block"
        >
          <HugeiconsIcon icon={GridIcon} size={15} />
        </button>

        <button
          type="button"
          onClick={() => onInsert('> ')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Blockquote (> Quote)"
        >
          <HugeiconsIcon icon={QuoteUpIcon} size={15} />
        </button>

        <button
          type="button"
          onClick={() => onInsert('- ')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Bullet List (- Item)"
        >
          <HugeiconsIcon icon={Menu01Icon} size={15} />
        </button>

        <button
          type="button"
          onClick={() => onInsert('- [ ] ')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Task List (- [ ] Task)"
        >
          <HugeiconsIcon icon={CheckListIcon} size={15} />
        </button>

        <button
          type="button"
          onClick={() => onInsert('[Link Label](', ')')}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Hyperlink [label](url)"
        >
          <HugeiconsIcon icon={Link01Icon} size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
            title="Toggle Distraction-Free Fullscreen"
          >
            <HugeiconsIcon icon={ArrowExpand01Icon} size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={onCopy}
          className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer text-xs font-medium"
          title="Copy Markdown Content"
        >
          <HugeiconsIcon icon={Copy01Icon} size={13} />
          <span>Copy</span>
        </button>

        <div className="h-8 flex items-center rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-0.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange?.('edit')}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              viewMode === 'edit'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.('split')}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              viewMode === 'split'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.('preview')}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              viewMode === 'preview'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownToolbar;

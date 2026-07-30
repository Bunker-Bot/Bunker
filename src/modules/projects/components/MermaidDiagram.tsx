import React, { useEffect, useState, useId } from 'react';
import mermaid from 'mermaid';
import { HugeiconsIcon } from '@hugeicons/react';
import { GridIcon } from '@hugeicons/core-free-icons';

interface MermaidDiagramProps {
  code?: string;
  chart?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'monospace',
});

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code = '', chart = '' }) => {
  const chartDefinition = (code || chart || '').trim();
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    if (!chartDefinition) return;

    let isMounted = true;

    async function renderDiagram() {
      try {
        const uniqueId = `mermaid-svg-${reactId}-${Math.floor(Math.random() * 10000)}`;
        const { svg } = await mermaid.render(uniqueId, chartDefinition);
        if (isMounted) {
          setSvgHtml(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to render Mermaid diagram');
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chartDefinition, reactId]);

  if (!chartDefinition) return null;

  return (
    <div className="my-5 p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-2xl space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <HugeiconsIcon icon={GridIcon} size={14} className="text-zinc-400" />
          <span>Architecture Flowchart (Mermaid)</span>
        </div>
        <span className="px-2 py-0.5 text-[10px] rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase font-bold">
          Live Render
        </span>
      </div>

      <div className="flex justify-center items-center py-2 overflow-x-auto custom-scrollbar">
        {error ? (
          <div className="p-3 text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md w-full">
            Failed to render Mermaid diagram.
          </div>
        ) : svgHtml ? (
          <div
            className="mermaid-svg-container w-full flex justify-center text-white"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <div className="text-xs font-mono text-zinc-500 py-4 animate-pulse">
            Rendering diagram...
          </div>
        )}
      </div>
    </div>
  );
};

export default MermaidDiagram;

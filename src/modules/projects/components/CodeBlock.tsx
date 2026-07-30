import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'code', code }) => {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = (code || '').split('\n');
  const displayLang = language && language !== 'code' ? language : 'bash';

  const highlightedHtml = useMemo(() => {
    if (!code) return '';
    try {
      if (displayLang && hljs.getLanguage(displayLang)) {
        return hljs.highlight(code, { language: displayLang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [code, displayLang]);

  return (
    <div className="my-5 w-full max-w-full min-w-0 rounded-sm bg-zinc-950 border border-zinc-800/80 shadow-2xl overflow-hidden text-xs select-none backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <span className="px-2 py-0.5 rounded-sm bg-zinc-800 border border-zinc-700/60 font-semibold text-zinc-200 text-[10px] uppercase tracking-wider truncate">
            {displayLang}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setWrap(!wrap)}
            className={`px-2 py-1 rounded-sm text-[10.5px] font-mono transition-all cursor-pointer border ${
              wrap
                ? 'bg-zinc-800 text-white font-bold border-zinc-700 shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-white hover:bg-zinc-800/50'
            }`}
            title="Toggle word wrap"
          >
            {wrap ? 'Wrapped' : 'Wrap'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-all cursor-pointer text-[11px] font-mono ${
              copied
                ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300 font-bold shadow-sm'
                : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-200 hover:text-white hover:bg-zinc-700/80'
            }`}
            title="Copy code to clipboard"
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              size={13}
              className={copied ? 'text-emerald-400' : 'text-zinc-400'}
            />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="flex w-full max-w-full min-w-0 overflow-x-auto p-4 custom-scrollbar bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed">
        <div className="pr-4 border-r border-zinc-800/70 text-zinc-600 text-right select-none space-y-0.5 shrink-0 font-mono text-[11.5px]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <pre className={`pl-4 flex-1 min-w-0 max-w-full font-mono text-zinc-100 select-text !bg-transparent ${wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>
          <code
            className={`hljs ${displayLang} !bg-transparent`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;

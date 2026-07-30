import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

import { GitHubAlert, type AlertType } from './GitHubAlert';
import { MermaidDiagram } from './MermaidDiagram';
import { CodeBlock } from './CodeBlock';
import { GitHubRepoCard } from './GitHubRepoCard';
import { ImageLightboxModal } from './ImageLightboxModal';
import type { TocItem } from './TableOfContents';

import 'highlight.js/styles/github-dark.css';

interface MarkdownPreviewProps {
  content: string;
  onExtractToc?: (items: TocItem[]) => void;
  compact?: boolean;
  className?: string;
}

function preprocessAlerts(text: string): string {
  if (!text) return '';
  // Clean raw html layout tags (like <div align="center">, <center>, </div>) so they don't leak as raw strings
  const cleaned = text
    .replace(/<\/?(?:div|center|p|span)(?:\s+align=["']?(?:center|left|right)["']?)?\s*\/?>/gi, '')
    .replace(/\r\n/g, '\n');

  const lines = cleaned.split('\n');
  const output: string[] = [];

  let inAlert = false;
  let currentType = '';
  let alertLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s+(.*))?$/i);

    if (match) {
      if (inAlert) {
        output.push(`<div data-alert="${currentType}">${alertLines.join(' ')}</div>\n`);
        alertLines = [];
      }
      inAlert = true;
      currentType = match[1].toUpperCase();
      if (match[2] && match[2].trim()) {
        alertLines.push(match[2].trim());
      }
    } else if (inAlert && line.startsWith('>')) {
      const body = line.replace(/^>\s?/, '').trim();
      if (body) alertLines.push(body);
    } else {
      if (inAlert) {
        output.push(`<div data-alert="${currentType}">${alertLines.join(' ')}</div>\n`);
        inAlert = false;
        currentType = '';
        alertLines = [];
      }
      output.push(line);
    }
  }

  if (inAlert) {
    output.push(`<div data-alert="${currentType}">${alertLines.join(' ')}</div>\n`);
  }

  return output.join('\n');
}

function extractTocItems(text: string): TocItem[] {
  if (!text) return [];
  const items: TocItem[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      items.push({ id, text: rawText, level });
    }
  }

  return items;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  onExtractToc,
  compact = false,
  className = '',
}) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt?: string } | null>(null);

  const processedContent = useMemo(() => {
    if (!content) return '';
    const normalized = content.replace(/\r\n/g, '\n');
    return preprocessAlerts(normalized);
  }, [content]);

  const tocItems = useMemo(() => {
    return extractTocItems(content || '');
  }, [content]);

  useEffect(() => {
    if (onExtractToc) {
      onExtractToc(tocItems);
    }
  }, [tocItems, onExtractToc]);

  const components: Components = useMemo(() => ({
    h1: ({ children, id, ...props }) => (
      <h1
        id={id}
        className="group flex items-center gap-2 text-lg font-bold text-white tracking-tight first:mt-0 mt-5 mb-2 pb-1 border-b border-zinc-800/80 scroll-mt-20"
        {...props}
      >
        <span>{children}</span>
        {id && (
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-white font-mono text-xs no-underline transition-opacity">
            #
          </a>
        )}
      </h1>
    ),
    h2: ({ children, id, ...props }) => (
      <h2
        id={id}
        className="group flex items-center gap-2 text-base font-bold text-white tracking-tight first:mt-0 mt-4 mb-2 scroll-mt-20"
        {...props}
      >
        <span>{children}</span>
        {id && (
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-white font-mono text-xs no-underline transition-opacity">
            #
          </a>
        )}
      </h2>
    ),
    h3: ({ children, id, ...props }) => (
      <h3
        id={id}
        className="group flex items-center gap-2 text-sm font-bold text-zinc-200 tracking-tight first:mt-0 mt-3 mb-1.5 scroll-mt-20"
        {...props}
      >
        <span>{children}</span>
        {id && (
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-white font-mono text-xs no-underline transition-opacity">
            #
          </a>
        )}
      </h3>
    ),
    h4: ({ children, id, ...props }) => (
      <h4 id={id} className="text-xs font-bold text-zinc-300 mt-4 mb-1.5" {...props}>{children}</h4>
    ),

    p: ({ children, ...props }) => {
      const textContent = typeof children === 'string' ? children : '';
      if (textContent.startsWith('https://github.com/')) {
        return <GitHubRepoCard url={textContent.trim()} />;
      }

      return (
        <p className="text-[13px] text-zinc-300 leading-relaxed my-2 font-normal select-text break-words max-w-full" {...props}>
          {children}
        </p>
      );
    },

    div: ({ children, node, ...props }) => {
      const alertType = (props as any)['data-alert'] || (node?.properties as any)?.dataAlert;
      if (alertType) {
        const type = String(alertType).toUpperCase() as AlertType;
        const textContent = typeof children === 'string' ? children : Array.isArray(children) ? children.join(' ') : '';
        return <GitHubAlert type={type} content={textContent || 'Important documentation notice.'} />;
      }
      return <div {...props}>{children}</div>;
    },

    a: ({ children, href, ...props }) => {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noreferrer' : undefined}
          className="text-zinc-100 underline decoration-zinc-600 underline-offset-2 hover:text-white hover:decoration-zinc-400 font-medium transition-colors"
          {...props}
        >
          {children}
          {isExternal && <span className="text-zinc-500 text-[10px] ml-0.5">↗</span>}
        </a>
      );
    },

    img: ({ src, alt, ...props }) => {
      if (!src) return null;
      const isBadge =
        src.includes('shields.io') ||
        src.includes('badge') ||
        src.endsWith('.svg') ||
        src.includes('img.shields.io');

      if (isBadge) {
        return (
          <img
            src={src}
            alt={alt || ''}
            className="inline-block h-5 sm:h-6 align-middle my-0.5 mr-1.5 rounded"
            {...props}
          />
        );
      }

      return (
        <span className="block my-4 space-y-1.5">
          <img
            src={src}
            alt={alt || ''}
            onClick={() => setSelectedImage({ src, alt })}
            className="max-w-full max-h-[500px] rounded-xl border border-zinc-800 object-contain cursor-zoom-in hover:border-zinc-700 transition-all"
            loading="lazy"
            {...props}
          />
          {alt && (
            <span className="block text-[11px] font-mono text-zinc-500 italic text-center">{alt}</span>
          )}
        </span>
      );
    },

    pre: ({ children }) => {
      let codeContent = '';
      let language = 'bash';

      const codeElement = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && (child.type === 'code' || Boolean((child.props as any)?.children))
      );

      const extractText = (node: any): string => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (Array.isArray(node)) return node.map(extractText).join('');
        if (React.isValidElement(node) && (node.props as any)?.children) {
          return extractText(React.Children.toArray((node.props as any).children));
        }
        return '';
      };

      if (codeElement && React.isValidElement(codeElement)) {
        const codeProps = codeElement.props as Record<string, any>;
        const className = codeProps.className || '';
        const langMatch = className.match(/language-(\w+)/) || className.match(/hljs\s+(\w+)/);
        if (langMatch) language = langMatch[1];
        codeContent = extractText(codeProps.children);
      } else {
        codeContent = extractText(children);
      }

      if (language === 'mermaid') {
        return <MermaidDiagram code={codeContent.trim()} />;
      }

      return (
        <CodeBlock
          language={language || 'bash'}
          code={codeContent.replace(/\n$/, '')}
        />
      );
    },

    code: ({ children, className, node, ...props }) => {
      const isParentPre = node && (node as any).parent?.tagName === 'pre';
      if (className || isParentPre) {
        return <code className={className} {...props}>{children}</code>;
      }

      return (
        <code
          className="px-1.5 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/40 text-zinc-200 font-mono text-[11.5px] whitespace-pre-wrap break-words max-w-full inline-block my-0.5 align-baseline"
          {...props}
        >
          {children}
        </code>
      );
    },

    blockquote: ({ children, ...props }) => (
      <blockquote
        className="pl-4 py-2 my-4 border-l-2 border-zinc-600 bg-zinc-900/40 text-zinc-300 italic text-xs rounded-r-lg"
        {...props}
      >
        {children}
      </blockquote>
    ),

    table: ({ children, ...props }) => (
      <div className="my-5 w-full overflow-x-auto custom-scrollbar rounded-sm border border-zinc-800/80 bg-zinc-950/80 shadow-xl backdrop-blur-xl">
        <table className="w-full text-left border-collapse text-xs" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-zinc-900/90 border-b border-zinc-800 font-mono text-[11px] uppercase tracking-wider text-zinc-300" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody className="divide-y divide-zinc-800/60 font-mono text-xs text-zinc-300" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr className="hover:bg-zinc-900/50 transition-colors" {...props}>{children}</tr>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 font-bold border-r border-zinc-800/60 last:border-r-0" {...props}>{children}</th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2.5 border-r border-zinc-800/60 last:border-r-0" {...props}>{children}</td>
    ),

    ul: ({ children, ...props }) => (
      <ul className="ml-4 list-disc space-y-1 my-2 text-[13px] text-zinc-300" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="ml-4 list-decimal space-y-1 my-2 text-[13px] text-zinc-300" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }) => (
      <li className="my-0.5 text-[13px] text-zinc-300 leading-relaxed" {...props}>{children}</li>
    ),

    hr: () => <hr className="my-8 border-t border-zinc-800/80" />,
    strong: ({ children, ...props }) => (
      <strong className="font-bold text-white" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic text-zinc-200" {...props}>{children}</em>
    ),
    del: ({ children, ...props }) => (
      <del className="line-through text-zinc-500" {...props}>{children}</del>
    ),
  }), []);

  if (!content || !content.trim()) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-xs italic">
        No content documented yet for this section.
      </div>
    );
  }

  return (
    <div
      className={`text-[13px] text-zinc-200 select-text overflow-y-auto overflow-x-auto custom-scrollbar w-full max-w-[960px] mx-auto min-w-0 break-words max-w-full markdown-preview ${
        compact ? 'p-0 space-y-2' : 'p-4 sm:p-6'
      } ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {processedContent}
      </ReactMarkdown>

      <ImageLightboxModal
        src={selectedImage?.src}
        alt={selectedImage?.alt}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default MarkdownPreview;

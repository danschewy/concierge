'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  variant?: 'assistant' | 'user';
}

export default function MarkdownMessage({
  content,
  variant = 'assistant',
}: MarkdownMessageProps) {
  const linkColorClass =
    variant === 'assistant'
      ? 'text-emerald-300 hover:text-emerald-200'
      : 'text-violet-200 hover:text-violet-100';

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-2 last:mb-0 list-disc pl-5 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 last:mb-0 list-decimal pl-5 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-2 last:mb-0 border-l-2 border-zinc-600/70 pl-3 italic text-zinc-300">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className={`underline underline-offset-2 transition-colors ${linkColorClass}`}
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isInline =
              !className && !String(children).includes('\n');

            if (isInline) {
              return (
                <code className="rounded bg-zinc-800/80 px-1 py-0.5 font-mono text-[12px] text-zinc-100">
                  {children}
                </code>
              );
            }

            return (
              <code className="font-mono text-[12px] text-zinc-100">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-2 last:mb-0 overflow-x-auto rounded-lg bg-zinc-950/80 px-3 py-2 border border-zinc-800">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="mb-2 last:mb-0 overflow-x-auto">
              <table className="min-w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-zinc-700">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1 text-left font-medium text-zinc-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1 text-zinc-300 border-b border-zinc-800/80">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-zinc-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

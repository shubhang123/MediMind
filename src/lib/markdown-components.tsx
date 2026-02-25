'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

/* ── Code Block with copy button ── */
function CodeBlock({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, '');

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    return (
        <div className="relative group my-3 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-med-navy px-4 py-1.5 border-b border-white/[0.06]">
                <span className="text-[11px] text-muted-foreground font-mono">
                    {className?.replace('language-', '') || 'text'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-med-safe" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="bg-med-dark p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                <code className={className}>{code}</code>
            </pre>
        </div>
    );
}

/* ── Custom component overrides for ReactMarkdown ── */
const markdownComponents = {
    h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 className="text-xl font-serif font-bold text-foreground mt-6 mb-3">
            {children}
        </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 className="text-lg font-serif font-semibold text-foreground mt-5 mb-2 border-b border-white/[0.06] pb-1.5">
            {children}
        </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 className="text-base font-semibold text-foreground mt-4 mb-1.5">
            {children}
        </h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
        <p className="text-sm text-foreground/90 leading-relaxed mb-2">
            {children}
        </p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-foreground/85">
            {children}
        </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-foreground/85">
            {children}
        </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="border-l-2 border-med-teal/50 pl-4 my-3 text-sm text-muted-foreground italic">
            {children}
        </blockquote>
    ),
    code: ({
        inline,
        className,
        children,
    }: {
        inline?: boolean;
        className?: string;
        children?: React.ReactNode;
    }) => {
        if (inline) {
            return (
                <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-med-teal text-[13px] font-mono">
                    {children}
                </code>
            );
        }
        return <CodeBlock className={className}>{children}</CodeBlock>;
    },
    table: ({ children }: { children?: React.ReactNode }) => (
        <div className="overflow-x-auto my-4 rounded-lg border border-white/[0.08]">
            <table className="w-full text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
        <thead className="bg-med-surface sticky top-0 text-left text-muted-foreground">
            {children}
        </thead>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
        <tbody className="divide-y divide-white/[0.06] [&>tr:nth-child(even)]:bg-white/[0.02]">
            {children}
        </tbody>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
        <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wider">
            {children}
        </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
        <td className="px-4 py-2.5 text-foreground/85">{children}</td>
    ),
    a: ({
        href,
        children,
    }: {
        href?: string;
        children?: React.ReactNode;
    }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-med-teal hover:text-med-teal-400 underline underline-offset-2 transition-colors"
        >
            {children}
        </a>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-semibold text-foreground">{children}</strong>
    ),
    hr: () => <hr className="border-white/[0.08] my-4" />,
};

/* ── Main Markdown Renderer Component ── */
interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents as any}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

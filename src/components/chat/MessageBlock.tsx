'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    DiagnosticResponseCard,
    type DiagnosisData,
} from './DiagnosticResponseCard';
import { motionPresets } from '@/lib/design-tokens';

/* ── Types ── */
export interface MessageBlockProps {
    id: string;
    sender: 'user' | 'bot' | 'system' | 'ui';
    /** Plain text content */
    text?: string;
    /** React node content (legacy support for JSX messages) */
    content?: React.ReactNode;
    /** Structured diagnosis data from the backend */
    diagnosisData?: DiagnosisData;
    /** Whether this message is currently streaming */
    isStreaming?: boolean;
    /** Whether this is a loading skeleton */
    isLoading?: boolean;
    /** Timestamp */
    timestamp?: Date;
    /** AI model name */
    modelName?: string;
    /** Called when user clicks Download Report on a diagnostic card */
    onDownloadReport?: () => void;
}

/* ── Skeleton loader for bot messages ── */
function SkeletonCard() {
    return (
        <div className="w-full rounded-xl bg-med-surface/60 border border-white/[0.06] overflow-hidden animate-pulse">
            <div className="diagnostic-border-top opacity-30" />
            <div className="px-4 py-2 border-b border-white/[0.04] flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-med-teal/30" />
                <div className="h-3 w-16 rounded bg-white/[0.06]" />
            </div>
            <div className="px-4 py-4 space-y-3">
                <div className="h-3 w-3/4 rounded bg-white/[0.06]" />
                <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
                <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
                <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
            </div>
        </div>
    );
}

/**
 * A single message block in the conversation thread.
 * - User messages: right-aligned blockquote strip with teal left border
 * - Bot messages: full-width DiagnosticResponseCard
 * - System/UI messages: centered muted text
 */
export function MessageBlock({
    id,
    sender,
    text,
    content,
    diagnosisData,
    isStreaming = false,
    isLoading = false,
    timestamp,
    modelName,
    onDownloadReport,
}: MessageBlockProps) {
    // Loading skeleton
    if (isLoading) {
        return <SkeletonCard />;
    }

    // System / UI messages — centered, muted
    if (sender === 'system' || sender === 'ui') {
        return (
            <motion.div
                {...motionPresets.fadeUp}
                className="flex justify-center py-2"
            >
                <p className="text-xs text-muted-foreground/60 text-center max-w-md">
                    {text || content}
                </p>
            </motion.div>
        );
    }

    // User messages — blockquote strip, right-aligned
    if (sender === 'user') {
        return (
            <motion.div
                {...motionPresets.fadeUp}
                className="flex justify-end"
            >
                <div className="max-w-[75%] relative">
                    {timestamp && (
                        <span className="absolute -top-4 right-0 text-[10px] text-muted-foreground/40">
                            {timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    )}
                    <div className="border-l-2 border-med-teal/60 bg-white/[0.04] rounded-r-lg px-4 py-3">
                        <p className="text-sm text-foreground/90 leading-relaxed">
                            {text || content}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Bot messages — full-width diagnostic cards
    return (
        <DiagnosticResponseCard
            diagnosisData={diagnosisData}
            textContent={typeof text === 'string' ? text : undefined}
            modelName={modelName}
            isStreaming={isStreaming}
            timestamp={timestamp}
            onDownloadReport={onDownloadReport}
        />
    );
}

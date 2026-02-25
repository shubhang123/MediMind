'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBlock, type MessageBlockProps } from './MessageBlock';

/* ── Types ── */
export interface ConversationThreadProps {
    /** Array of messages to render */
    messages: MessageBlockProps[];
    /** Whether the AI is currently generating a response */
    isLoading?: boolean;
    /** Global loading progress 0-100 (for the slim top bar) */
    loadingProgress?: number;
    /** Called when user clicks Download Report on any diagnostic card */
    onDownloadReport?: () => void;
}

/**
 * The main conversation feed rendered as a structured document,
 * not a traditional chat with bubbles. Features:
 * - Slim top progress bar during loading (YouTube-style)
 * - Skeleton placeholder when AI is processing
 * - AnimatePresence for smooth message entry/exit
 */
export function ConversationThread({
    messages,
    isLoading = false,
    loadingProgress,
    onDownloadReport,
}: ConversationThreadProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, isLoading]);

    return (
        <div className="flex flex-col flex-1 min-h-0 relative">
            {/* ── Slim progress bar ── */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 left-0 right-0 z-10 h-[2px] bg-white/[0.04] overflow-hidden"
                    >
                        <motion.div
                            className="h-full bg-med-teal rounded-full"
                            initial={{ width: '0%' }}
                            animate={{
                                width: loadingProgress
                                    ? `${loadingProgress}%`
                                    : ['0%', '70%', '85%', '95%'],
                            }}
                            transition={
                                loadingProgress
                                    ? { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                                    : {
                                        duration: 8,
                                        times: [0, 0.3, 0.6, 1],
                                        ease: 'easeOut',
                                    }
                            }
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Message feed ── */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-32 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                            <MessageBlock
                                {...message}
                                onDownloadReport={onDownloadReport}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Skeleton card while AI is processing */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                        >
                            <MessageBlock
                                id="loading-skeleton"
                                sender="bot"
                                isLoading={true}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={bottomRef} />
            </div>
        </div>
    );
}

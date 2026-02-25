'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { processingSteps } from '@/lib/design-tokens';
import { PipelineStatusFlow } from '@/components/animations/svg/PipelineStatusFlow';
import { PipelineStep } from '@/components/animations/types';

/* ── Types ── */
export interface ProcessingStatusPanelProps {
    /** Whether processing is active */
    isActive: boolean;
    /** Index of the current step (0-based). Steps before this are "complete". */
    currentStepIndex: number;
}

type StepState = 'complete' | 'active' | 'pending';

function getStepState(
    stepIndex: number,
    currentIndex: number
): StepState {
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
}

/**
 * Pipeline status tracker that shows in the right panel during active generation.
 * Displays steps: Transcribing → Analyzing → Generating Report
 * with animated checkmarks as each step completes.
 */
export function ProcessingStatusPanel({
    isActive,
    currentStepIndex,
}: ProcessingStatusPanelProps) {
    // Map existing string steps to PipelineStep format
    const pipelineSteps: PipelineStep[] = useMemo(() => {
        return processingSteps.map((stepName, i) => {
            const state = getStepState(i, currentStepIndex);
            return {
                name: String(stepName),
                status: state
            };
        });
    }, [currentStepIndex]);

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card p-6 w-full flex flex-col justify-center items-center"
                >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6 self-start">
                        Processing Pipeline
                    </p>

                    <div className="w-full flex justify-center pb-4">
                        <PipelineStatusFlow steps={pipelineSteps} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

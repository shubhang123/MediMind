/**
 * MediMind Design Tokens
 * 
 * Re-exports theme.config.ts values for backward compatibility
 * and defines Framer Motion presets.
 */

import { palette, motion, Severity, severityConfig } from '@/config/theme.config';

export const colors = palette;
export { type Severity, severityConfig };
export const easings = { medEase: motion.medEase, spring: motion.spring };
export const durations = motion.durations;

/** Framer Motion animation variants */
export const motionPresets = {
    /** Fade + slide up (8px). Used for route transitions and card entries. */
    fadeUp: {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
        transition: { duration: durations.page, ease: easings.medEase },
    },

    /** Scale fade for modals / overlays */
    scaleFade: {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: { duration: durations.normal, ease: easings.medEase },
    },

    /** Stagger children container */
    staggerContainer: {
        animate: {
            transition: {
                staggerChildren: 0.06,
            },
        },
    },

    /** Individual stagger child */
    staggerChild: {
        initial: { opacity: 0, y: 6 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: durations.normal, ease: easings.medEase },
        },
    },

    /** Slide in from left (sidebar) */
    slideInLeft: {
        initial: { opacity: 0, x: -16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -16 },
        transition: { duration: durations.normal, ease: easings.medEase },
    },

    /** Slide in from right (right panel) */
    slideInRight: {
        initial: { opacity: 0, x: 16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 16 },
        transition: { duration: durations.normal, ease: easings.medEase },
    },
} as const;

/* ── Processing Pipeline Steps ── */
export const processingSteps = [
    'Transcribing',
    'Analyzing',
    'Generating Report',
] as const;

export type ProcessingStep = (typeof processingSteps)[number];

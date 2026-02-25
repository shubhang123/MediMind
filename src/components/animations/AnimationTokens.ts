// Theme Colors for Animations (Dark Theme Native)
export const ANIMATION_COLORS = {
    background: '#0A0E1A',
    textPrimary: '#F1F5F9', // slate-100
    textSecondary: '#94A3B8', // slate-400

    // Severity Colors
    severity: {
        low: '#10B981', // emerald-500
        moderate: '#F59E0B', // amber-500
        critical: '#EF4444', // red-500
        inactive: '#334155', // slate-700
    },

    // State Colors
    states: {
        listening: '#3B82F6', // blue-500
        analyzing: '#8B5CF6', // violet-500
        processing: '#00D4B8', // MediMind Teal
        complete: '#10B981', // green-500
        error: '#EF4444', // red-500
    },

    // Gradients & Glows
    glow: {
        teal: 'rgba(0, 212, 184, 0.4)',
        red: 'rgba(239, 68, 68, 0.4)',
        amber: 'rgba(245, 158, 11, 0.4)',
        emerald: 'rgba(16, 185, 129, 0.4)',
    }
};

import { Easing } from 'framer-motion';

// Common Motion Easing Curves
export const EASING: Record<string, Record<string, any>> = {
    spring: {
        stiff: { type: 'spring', stiffness: 300, damping: 20 },
        bouncy: { type: 'spring', stiffness: 200, damping: 10 },
        smooth: { type: 'spring', stiffness: 100, damping: 15 },
    },
    tween: {
        easeInOut: [0.4, 0, 0.2, 1] as import('framer-motion').Easing,
        easeOut: [0, 0, 0.2, 1] as import('framer-motion').Easing,
        easeIn: [0.4, 0, 1, 1] as import('framer-motion').Easing,
        sharp: [0.4, 0, 0.6, 1] as import('framer-motion').Easing,
    },
};

// Common Motion Variants
export const VARIANTS = {
    pulse: {
        idle: { scale: 1, opacity: 0.8 },
        active: {
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    },
    rotate: {
        idle: { rotate: 0 },
        active: {
            rotate: 360,
            transition: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
            }
        }
    },
    particle: {
        initial: { pathLength: 0, opacity: 0 },
        animate: {
            pathLength: [0, 1],
            opacity: [0, 1, 0],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
            }
        }
    },
    fadeScale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        },
        exit: { opacity: 0, scale: 0.8 }
    }
};

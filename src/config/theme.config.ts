/**
 * MediMind — Centralized Theme Configuration
 *
 * Single source of truth for all visual design tokens.
 * Both Tailwind config and design-tokens.ts import from here.
 *
 * To change the app's look-and-feel, edit this file ONLY.
 */

/* ── Color Palette ── */

export const palette = {
    /* Backgrounds */
    dark: '#0A0E1A',
    navy: '#0D1425',
    surface: '#111827',
    surfaceLight: '#1A2235',

    /* Brand */
    teal: '#00D4B8',
    teal400: '#1ADFC0',
    teal600: '#00AA93',

    /* Semantic */
    info: '#0EA5E9',
    safe: '#10B981',
    warning: '#F59E0B',
    critical: '#EF4444',
    ai: '#8B5CF6',

    /* Text */
    white: '#E8ECF1',
    muted: '#6B7A8D',
    border: '#1E293B',
} as const;

/* ── Typography ── */

export const typography = {
    fontBody: "'Inter', 'Poppins', system-ui, sans-serif",
    fontHeadline: "'Instrument Serif', Georgia, serif",
    fontCode: "'JetBrains Mono', 'Fira Code', monospace",

    /** Tailwind font-family keys */
    tailwind: {
        body: ['Inter', 'Poppins', 'sans-serif'],
        headline: ['Instrument Serif', 'Georgia', 'serif'],
        code: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
} as const;

/* ── Motion Tokens ── */

export const motion = {
    /** Premium ease-out curve for all primary animations */
    medEase: [0.16, 1, 0.3, 1] as const,

    /** Spring configurations */
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
    springBouncy: { type: 'spring' as const, stiffness: 400, damping: 25 },

    /** Duration presets (seconds) */
    durations: {
        fast: 0.15,
        normal: 0.3,
        slow: 0.5,
        page: 0.4,
    },
} as const;

/* ── Severity Config ── */

export type Severity = 'critical' | 'moderate' | 'low';

export const severityConfig: Record<
    Severity,
    { color: string; bg: string; label: string }
> = {
    critical: { color: palette.critical, bg: 'bg-med-critical/15', label: 'Critical' },
    moderate: { color: palette.warning, bg: 'bg-med-warning/15', label: 'Moderate' },
    low: { color: palette.safe, bg: 'bg-med-safe/15', label: 'Low' },
};

/* ── 3D Rendering ── */

export const rendering = {
    /** Device pixel ratio range for Three.js Canvas */
    dpr: [1, 2] as [number, number],
    /** Default point count for <BrainHologram> */
    brainPointCount: 25000,
    /** Default camera FOV */
    cameraFov: 45,
} as const;

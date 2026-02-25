/**
 * MediMind — Centralized Application Configuration
 *
 * All runtime configuration is derived from environment variables.
 * Change values in `.env.local` — never edit this file for secrets.
 *
 * Client-safe values use NEXT_PUBLIC_ prefix.
 * Server-only values (API keys) are accessed via process.env directly.
 */

/* ── API Configuration ── */

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const api = {
    /** Base URL for the backend (ngrok / production) */
    baseUrl: API_BASE_URL,

    /** Endpoints — all paths relative to baseUrl */
    endpoints: {
        composeCase: `${API_BASE_URL}/compose_case`,
        analyzeImage: `${API_BASE_URL}/analyze_image`,
        generateReport: `${API_BASE_URL}/generate_report_image`,
    },
} as const;

/* ── App Metadata ── */

export const appMeta = {
    name: 'MediMind',
    tagline: 'AI-Powered Clinical Intelligence',
    description:
        'Advanced medical diagnostic assistant powered by artificial intelligence.',
    version: '1.0.0',
} as const;

/* ── Feature Flags ── */

export const features = {
    /** Enable the 3D Brain Hologram */
    enable3DBrain: true,
    /** Enable voice recording / transcription */
    enableVoice: true,
    /** Enable image upload for analysis */
    enableImageAnalysis: true,
    /** Show processing pipeline animation */
    showProcessingSteps: true,
} as const;

/* ── Default Settings ── */

export const defaults = {
    /** Default language for transcription */
    language: 'en' as const,
    /** Max lines before textarea scrolls */
    maxTextareaLines: 6,
    /** Supported audio formats */
    audioFormats: ['mp3', 'wav', 'webm', 'ogg', 'flac', 'm4a'] as const,
} as const;

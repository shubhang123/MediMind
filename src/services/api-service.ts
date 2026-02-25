/**
 * Centralized API service for MediMind.
 * Uses the shared api.config.ts layer for fetching.
 */

import { api } from '@/config/app.config';
import { apiPost, apiPostForm } from '@/config/api.config';

/* ── Response Types ── */

export interface DiagnosisResponse {
    final_diagnosis: {
        patient_problem: string;
        diagnosis: string[];
        diagnosis_simplified: string[];
        metadata: Record<string, unknown>;
        treatment_plan: {
            medications: string[];
            lifestyle_modifications: string[];
        };
    };
}

export interface ImageAnalysisResponse {
    analysis: string;
    details?: Record<string, unknown>;
}

export interface ReportResponse {
    image_url?: string;
    [key: string]: unknown;
}

/* ── API Functions ── */

/**
 * Send a symptom description to create a clinical case and receive diagnosis.
 */
export async function createCase(
    symptomDescription: string
): Promise<DiagnosisResponse> {
    return apiPost<DiagnosisResponse>(api.endpoints.composeCase, { symptomDescription });
}

/**
 * Send a base64-encoded image for AI-powered analysis.
 */
export async function analyzeImage(
    base64Image: string
): Promise<ImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', base64Image);

    return apiPostForm<ImageAnalysisResponse>(api.endpoints.analyzeImage, formData);
}

/**
 * Generate a downloadable report from diagnosis data.
 */
export async function generateReport(
    diagnosisData: unknown
): Promise<ReportResponse> {
    return apiPost<ReportResponse>(api.endpoints.generateReport, diagnosisData);
}

/**
 * Trigger a download from a URL.
 */
export function downloadFromUrl(
    url: string,
    filename: string = 'report.png'
): void {
    // Re-export shared download util
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

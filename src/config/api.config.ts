/**
 * MediMind — Centralized API Client Configuration
 *
 * Shared HTTP utilities used by all service files.
 * Eliminates duplicate header definitions and provides
 * consistent error handling across the app.
 */

import { api } from './app.config';

/* ── Shared Headers ── */

/**
 * Returns default headers for API requests.
 * Includes ngrok compatibility header automatically.
 */
export function getApiHeaders(
    contentType: string = 'application/json'
): HeadersInit {
    return {
        'Content-Type': contentType,
        'ngrok-skip-browser-warning': 'true',
    };
}

/** Headers without Content-Type (for FormData requests) */
export function getApiHeadersFormData(): HeadersInit {
    return {
        'ngrok-skip-browser-warning': 'true',
    };
}

/* ── HTTP Helpers ── */

/**
 * POST JSON to a backend endpoint.
 * @param path - Full URL or path segment
 * @param body - JSON-serializable body
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
    const url = path.startsWith('http') ? path : `${api.baseUrl}${path}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error [${response.status}]: ${errorText}`);
    }

    return response.json();
}

/**
 * POST FormData to a backend endpoint.
 * @param path - Full URL or path segment
 * @param formData - FormData body
 */
export async function apiPostForm<T>(
    path: string,
    formData: FormData
): Promise<T> {
    const url = path.startsWith('http') ? path : `${api.baseUrl}${path}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeadersFormData(),
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error [${response.status}]: ${errorText}`);
    }

    return response.json();
}

'use client';

import { useState, useCallback, useRef } from 'react';
import type { DiagnosisData } from '@/components/chat/DiagnosticResponseCard';
import {
    generateServerReport,
    downloadFromUrl,
    downloadElementAsImage,
    defaultReportConfig,
    type ReportConfig,
    type ServerReportResponse,
} from '@/services/report-service';

/* ── Types ── */

export interface UseReportGeneratorReturn {
    /** Whether the report modal is open */
    isOpen: boolean;
    /** Open the modal with diagnosis data */
    openReport: (data: DiagnosisData) => void;
    /** Close the modal */
    closeReport: () => void;
    /** The diagnosis data for the report */
    diagnosisData: DiagnosisData | null;
    /** Report customization config */
    config: ReportConfig;
    /** Update a config field */
    updateConfig: (updates: Partial<ReportConfig>) => void;
    /** Toggle a section on/off */
    toggleSection: (section: keyof ReportConfig['sections']) => void;
    /** Whether report is currently generating */
    isGenerating: boolean;
    /** Generate and download the report */
    generateReport: (previewRef?: React.RefObject<HTMLDivElement | null>) => Promise<void>;
    /** Error message if generation failed */
    error: string | null;
}

/**
 * Hook that manages the report preview modal state and report generation.
 * Supports both server-side generation (returns image URL) and
 * client-side print-based PDF generation.
 */
export function useReportGenerator(): UseReportGeneratorReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [diagnosisData, setDiagnosisData] = useState<DiagnosisData | null>(null);
    const [config, setConfig] = useState<ReportConfig>(defaultReportConfig);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openReport = useCallback((data: DiagnosisData) => {
        setDiagnosisData(data);
        setConfig({
            ...defaultReportConfig,
            reportDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        });
        setError(null);
        setIsOpen(true);
    }, []);

    const closeReport = useCallback(() => {
        setIsOpen(false);
        setDiagnosisData(null);
        setError(null);
    }, []);

    const updateConfig = useCallback((updates: Partial<ReportConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    }, []);

    const toggleSection = useCallback(
        (section: keyof ReportConfig['sections']) => {
            setConfig((prev) => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [section]: !prev.sections[section],
                },
            }));
        },
        []
    );

    const generateReport = useCallback(
        async (previewRef?: React.RefObject<HTMLDivElement | null>) => {
            if (!diagnosisData) return;

            setIsGenerating(true);
            setError(null);

            try {
                // Try server-side generation first
                const response = await generateServerReport(diagnosisData);

                if (response.image_url) {
                    downloadFromUrl(response.image_url, 'medimind-report.png');
                } else if (previewRef?.current) {
                    // Fall back to client-side print
                    downloadElementAsImage(previewRef.current, 'medimind-report');
                }
            } catch (err) {
                console.error('Server report failed, falling back to client-side:', err);

                // Client-side fallback
                if (previewRef?.current) {
                    try {
                        downloadElementAsImage(previewRef.current, 'medimind-report');
                    } catch (clientErr) {
                        setError(
                            clientErr instanceof Error
                                ? clientErr.message
                                : 'Failed to generate report.'
                        );
                    }
                } else {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to generate report.'
                    );
                }
            } finally {
                setIsGenerating(false);
            }
        },
        [diagnosisData]
    );

    return {
        isOpen,
        openReport,
        closeReport,
        diagnosisData,
        config,
        updateConfig,
        toggleSection,
        isGenerating,
        generateReport,
        error,
    };
}

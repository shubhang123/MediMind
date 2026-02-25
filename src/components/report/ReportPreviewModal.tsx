'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Download,
    Loader2,
    Eye,
    Settings2,
    ToggleLeft,
    ToggleRight,
    AlertTriangle,
} from 'lucide-react';
import { ReportRenderer } from './ReportRenderer';
import type { DiagnosisData } from '@/components/chat/DiagnosticResponseCard';
import type { ReportConfig } from '@/services/report-service';
import { motionPresets } from '@/lib/design-tokens';

/* ── Types ── */
interface ReportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    diagnosisData: DiagnosisData;
    config: ReportConfig;
    onUpdateConfig: (updates: Partial<ReportConfig>) => void;
    onToggleSection: (section: keyof ReportConfig['sections']) => void;
    onGenerate: (ref: React.RefObject<HTMLDivElement | null>) => Promise<void>;
    isGenerating: boolean;
    error: string | null;
}

/* ── Section Toggle ── */
function SectionToggle({
    label,
    enabled,
    onToggle,
}: {
    label: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
        >
            <span className="text-xs text-foreground/80">{label}</span>
            {enabled ? (
                <ToggleRight className="h-5 w-5 text-med-teal" />
            ) : (
                <ToggleLeft className="h-5 w-5 text-muted-foreground/40" />
            )}
        </button>
    );
}

/**
 * Full-screen report preview modal.
 * Left: live report preview. Right: customization panel.
 * Features section toggles, patient info fields, and download button.
 */
export function ReportPreviewModal({
    isOpen,
    onClose,
    diagnosisData,
    config,
    onUpdateConfig,
    onToggleSection,
    onGenerate,
    isGenerating,
    error,
}: ReportPreviewModalProps) {
    const previewRef = useRef<HTMLDivElement>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        {...motionPresets.scaleFade}
                        className="fixed inset-4 md:inset-8 z-50 flex flex-col md:flex-row bg-med-dark border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* ── Header (mobile) ── */}
                        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                            <h2 className="text-sm font-semibold text-foreground">
                                Report Preview
                            </h2>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* ── Left: Preview Pane ── */}
                        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                            {/* Preview header */}
                            <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-med-teal" />
                                    <h2 className="text-sm font-medium text-foreground">
                                        Report Preview
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Preview content — scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-med-navy/30">
                                <div className="shadow-xl rounded-lg overflow-hidden">
                                    <ReportRenderer
                                        ref={previewRef}
                                        diagnosisData={diagnosisData}
                                        config={config}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Configuration Panel (280px) ── */}
                        <div className="w-full md:w-[280px] border-t md:border-t-0 md:border-l border-white/[0.06] flex flex-col bg-med-navy">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                                <Settings2 className="h-4 w-4 text-muted-foreground" />
                                <p className="text-xs font-medium text-foreground">
                                    Customize Report
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                                {/* Patient Info */}
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-1">
                                        Patient Information
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Patient Name"
                                        value={config.patientName}
                                        onChange={(e) =>
                                            onUpdateConfig({ patientName: e.target.value })
                                        }
                                        className="w-full px-3 py-2 rounded-lg bg-med-surface border border-white/[0.08] text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-med-teal/40"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Age"
                                            value={config.patientAge}
                                            onChange={(e) =>
                                                onUpdateConfig({ patientAge: e.target.value })
                                            }
                                            className="w-full px-3 py-2 rounded-lg bg-med-surface border border-white/[0.08] text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-med-teal/40"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Gender"
                                            value={config.patientGender}
                                            onChange={(e) =>
                                                onUpdateConfig({ patientGender: e.target.value })
                                            }
                                            className="w-full px-3 py-2 rounded-lg bg-med-surface border border-white/[0.08] text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-med-teal/40"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Referring Physician"
                                        value={config.referringPhysician}
                                        onChange={(e) =>
                                            onUpdateConfig({ referringPhysician: e.target.value })
                                        }
                                        className="w-full px-3 py-2 rounded-lg bg-med-surface border border-white/[0.08] text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-med-teal/40"
                                    />
                                </div>

                                {/* Section Toggles */}
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-1 mb-1">
                                        Sections
                                    </p>
                                    <SectionToggle
                                        label="Diagnosis"
                                        enabled={config.sections.diagnosis}
                                        onToggle={() => onToggleSection('diagnosis')}
                                    />
                                    <SectionToggle
                                        label="Conditions"
                                        enabled={config.sections.conditions}
                                        onToggle={() => onToggleSection('conditions')}
                                    />
                                    <SectionToggle
                                        label="Medications"
                                        enabled={config.sections.medications}
                                        onToggle={() => onToggleSection('medications')}
                                    />
                                    <SectionToggle
                                        label="Lifestyle"
                                        enabled={config.sections.lifestyle}
                                        onToggle={() => onToggleSection('lifestyle')}
                                    />
                                    <SectionToggle
                                        label="Next Steps"
                                        enabled={config.sections.nextSteps}
                                        onToggle={() => onToggleSection('nextSteps')}
                                    />
                                    <SectionToggle
                                        label="Metadata"
                                        enabled={config.sections.metadata}
                                        onToggle={() => onToggleSection('metadata')}
                                    />
                                </div>

                                {/* Branding Toggle */}
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-1 mb-1">
                                        Branding
                                    </p>
                                    <SectionToggle
                                        label="Show MediMind branding"
                                        enabled={config.showBranding}
                                        onToggle={() =>
                                            onUpdateConfig({ showBranding: !config.showBranding })
                                        }
                                    />
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-med-critical/10 border border-med-critical/20">
                                        <AlertTriangle className="h-3.5 w-3.5 text-med-critical flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-med-critical leading-tight">
                                            {error}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Download Button */}
                            <div className="p-3 border-t border-white/[0.06]">
                                <button
                                    onClick={() => onGenerate(previewRef)}
                                    disabled={isGenerating}
                                    className="btn-shimmer w-full py-2.5 rounded-xl bg-med-teal text-med-dark font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Download Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

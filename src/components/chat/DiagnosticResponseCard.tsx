'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Pill,
    Dumbbell,
    ListChecks,
    Sparkles,
    Moon,
    Utensils,
    Heart,
} from 'lucide-react';
import { ConditionCard, type ConditionCardProps } from './ConditionCard';
import { MedicationCard, type MedicationCardProps } from './MedicationCard';
import { MarkdownRenderer } from '@/lib/markdown-components';
import { motionPresets, type Severity } from '@/lib/design-tokens';
import { SymptomNetworkGraph } from '@/components/animations/svg/SymptomNetworkGraph';
import dynamic from 'next/dynamic';

const BrainHologram = dynamic(
    () => import('@/components/3d/BrainHologram').then((mod) => mod.BrainHologram),
    { ssr: false }
);
import { SymptomNode } from '@/components/animations/types';
import { DiagnosticHotspot, BrainRegion } from '@/components/3d/types';

/* ── Types ── */

/** Backend diagnosis response shape */
export interface DiagnosisData {
    patient_problem?: string;
    diagnosis?: string[];
    diagnosis_simplified?: string[];
    metadata?: Record<string, unknown>;
    treatment_plan?: {
        medications: string[];
        lifestyle_modifications: string[];
    };
    severity?: Severity;
}

export interface DiagnosticResponseCardProps {
    /** Raw backend response containing diagnosis data */
    diagnosisData?: DiagnosisData;
    /** Alternative: render raw text/markdown content */
    textContent?: string;
    /** AI model name, e.g. "GPT-4o" or "Llama 3" */
    modelName?: string;
    /** Whether the response is currently streaming */
    isStreaming?: boolean;
    /** Timestamp of the response */
    timestamp?: Date;
    /** Called when user clicks Download Report */
    onDownloadReport?: () => void;
}

/* ── Helper: infer severity from data ── */
function inferSeverity(data: DiagnosisData): Severity {
    if (data.severity) return data.severity;
    // Simple heuristic: check metadata for severity hints
    const meta = data.metadata || {};
    const severityValue = String(
        meta.severity || meta.risk_level || ''
    ).toLowerCase();
    if (
        severityValue.includes('critical') ||
        severityValue.includes('high') ||
        severityValue.includes('severe')
    )
        return 'critical';
    if (
        severityValue.includes('moderate') ||
        severityValue.includes('medium')
    )
        return 'moderate';
    return 'low';
}

/* ── Sub-components ── */

function SeverityBadge({ severity }: { severity: Severity }) {
    const classes: Record<Severity, string> = {
        critical: 'badge-critical',
        moderate: 'badge-warning',
        low: 'badge-safe',
    };
    const labels: Record<Severity, string> = {
        critical: 'Critical',
        moderate: 'Moderate',
        low: 'Low',
    };

    return <span className={classes[severity]}>{labels[severity]}</span>;
}

function SectionTitle({
    icon: Icon,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2 mb-2.5 mt-4 first:mt-0">
            <Icon className="h-4 w-4 text-med-teal" />
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
                {children}
            </h3>
        </div>
    );
}

/* ── Lifestyle icon mapping ── */
const lifestyleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    sleep: Moon,
    diet: Utensils,
    exercise: Dumbbell,
    default: Heart,
};

function getLifestyleIcon(text: string): React.ComponentType<{ className?: string }> {
    const lower = text.toLowerCase();
    if (lower.includes('sleep') || lower.includes('rest')) return lifestyleIcons.sleep;
    if (lower.includes('diet') || lower.includes('food') || lower.includes('eat'))
        return lifestyleIcons.diet;
    if (
        lower.includes('exercise') ||
        lower.includes('walk') ||
        lower.includes('physical')
    )
        return lifestyleIcons.exercise;
    return lifestyleIcons.default;
}

/* ── Main Component ── */

/**
 * Full-width document-style diagnostic response card.
 * Renders structured sections (diagnosis, conditions, medications, lifestyle, next steps)
 * or falls back to markdown text content.
 */
export function DiagnosticResponseCard({
    diagnosisData,
    textContent,
    modelName = 'MediMind AI',
    isStreaming = false,
    timestamp,
    onDownloadReport,
}: DiagnosticResponseCardProps) {
    const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

    const toggleStep = (index: number) => {
        setCheckedSteps((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const severity = diagnosisData ? inferSeverity(diagnosisData) : 'low';
    const hasStructuredData =
        diagnosisData &&
        (diagnosisData.diagnosis ||
            diagnosisData.treatment_plan ||
            diagnosisData.patient_problem);

    return (
        <motion.div
            {...motionPresets.fadeUp}
            className="w-full rounded-xl bg-med-surface/60 border border-white/[0.06] overflow-hidden"
        >
            {/* ── Top gradient border ── */}
            <div className="diagnostic-border-top" />

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    {isStreaming && (
                        <span className="h-2 w-2 rounded-full bg-med-teal animate-pulse" />
                    )}
                    <span className="text-[11px] font-medium text-muted-foreground">
                        MediMind
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                        {modelName}
                    </span>
                </div>
                {timestamp && (
                    <span className="text-[10px] text-muted-foreground/50">
                        {timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                )}
            </div>

            {/* ── 3D Brain Hologram Header ── */}
            {hasStructuredData && (
                <div className="w-full bg-med-dark flex justify-center py-4 border-b border-white/[0.04] relative overflow-hidden" style={{ height: 260 }}>
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                    <BrainHologram
                        mode="report_ready"
                        size="md"
                        hotspots={diagnosisData?.diagnosis?.map((d, i): DiagnosticHotspot => ({
                            region: ['frontal', 'temporal', 'parietal', 'occipital', 'cerebellum'][i % 5] as BrainRegion,
                            severity: severity === 'critical' ? 0.9 : severity === 'moderate' ? 0.6 : 0.3,
                            confidence: 0.8,
                            label: d
                        })) || []}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-med-surface/60 to-transparent pointer-events-none" />
                </div>
            )}

            {/* ── Content ── */}
            <div className="px-4 py-3 space-y-1">
                {hasStructuredData ? (
                    <>
                        {/* Diagnosis section */}
                        {diagnosisData.patient_problem && (
                            <div>
                                <SectionTitle icon={Activity}>Diagnosis</SectionTitle>
                                <div className="flex items-start gap-2">
                                    <SeverityBadge severity={severity} />
                                    <p className="text-sm text-foreground/90 leading-relaxed">
                                        {diagnosisData.patient_problem}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Possible Conditions — horizontal scroll */}
                        {diagnosisData.diagnosis &&
                            diagnosisData.diagnosis.length > 0 && (
                                <div>
                                    <SectionTitle icon={Sparkles}>
                                        Symptom Network & Conditions
                                    </SectionTitle>

                                    {/* Data Visualization Graph */}
                                    <div className="flex justify-center my-4 bg-black/20 rounded-xl border border-white/5 py-4">
                                        <SymptomNetworkGraph
                                            width={typeof window !== 'undefined' && window.innerWidth < 640 ? 300 : 500}
                                            height={300}
                                            symptoms={
                                                diagnosisData.diagnosis.map((d, i): SymptomNode => ({
                                                    id: d,
                                                    name: d,
                                                    severity: i === 0 ? severity : 'low',
                                                    correlations: i === 0
                                                        ? diagnosisData.diagnosis?.slice(1) || []
                                                        : [diagnosisData.diagnosis?.[0] || '']
                                                }))
                                            }
                                            activeSymptom={diagnosisData.diagnosis[0]}
                                        />
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mt-2">
                                        {diagnosisData.diagnosis.map((condition, i) => (
                                            <ConditionCard
                                                key={i}
                                                name={condition}
                                                probability={Math.max(
                                                    20,
                                                    100 - i * 15 - Math.floor(Math.random() * 10)
                                                )}
                                                severity={i === 0 ? severity : 'low'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Medications */}
                        {diagnosisData.treatment_plan?.medications &&
                            diagnosisData.treatment_plan.medications.length > 0 && (
                                <div>
                                    <SectionTitle icon={Pill}>
                                        Recommended Medications
                                    </SectionTitle>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {diagnosisData.treatment_plan.medications.map(
                                            (med, i) => (
                                                <MedicationCard key={i} name={med} />
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Lifestyle Recommendations */}
                        {diagnosisData.treatment_plan?.lifestyle_modifications &&
                            diagnosisData.treatment_plan.lifestyle_modifications.length >
                            0 && (
                                <div>
                                    <SectionTitle icon={Dumbbell}>
                                        Lifestyle Recommendations
                                    </SectionTitle>
                                    <ul className="space-y-1.5">
                                        {diagnosisData.treatment_plan.lifestyle_modifications.map(
                                            (mod, i) => {
                                                const IconComp = getLifestyleIcon(mod);
                                                return (
                                                    <li
                                                        key={i}
                                                        className="flex items-center gap-2.5 text-sm text-foreground/85"
                                                    >
                                                        <IconComp className="h-3.5 w-3.5 text-med-teal/70 flex-shrink-0" />
                                                        {mod}
                                                    </li>
                                                );
                                            }
                                        )}
                                    </ul>
                                </div>
                            )}

                        {/* Next Steps */}
                        {diagnosisData.diagnosis_simplified &&
                            diagnosisData.diagnosis_simplified.length > 0 && (
                                <div>
                                    <SectionTitle icon={ListChecks}>Next Steps</SectionTitle>
                                    <ol className="space-y-1.5">
                                        {diagnosisData.diagnosis_simplified.map((step, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2.5 text-sm"
                                            >
                                                <button
                                                    onClick={() => toggleStep(i)}
                                                    className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${checkedSteps.has(i)
                                                        ? 'bg-med-teal border-med-teal text-med-dark'
                                                        : 'border-white/20 hover:border-med-teal/50'
                                                        }`}
                                                >
                                                    {checkedSteps.has(i) && (
                                                        <svg
                                                            className="h-2.5 w-2.5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={3}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    )}
                                                </button>
                                                <span
                                                    className={
                                                        checkedSteps.has(i)
                                                            ? 'text-muted-foreground line-through'
                                                            : 'text-foreground/85'
                                                    }
                                                >
                                                    {step}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                        {/* Metadata */}
                        {diagnosisData.metadata &&
                            Object.keys(diagnosisData.metadata).length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(diagnosisData.metadata).map(
                                            ([key, value]) => (
                                                <span
                                                    key={key}
                                                    className="badge-ai text-[10px]"
                                                >
                                                    {key}:{' '}
                                                    {Array.isArray(value)
                                                        ? value.join(', ')
                                                        : String(value)}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Download Report CTA */}
                        {onDownloadReport && (
                            <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-end">
                                <button
                                    onClick={onDownloadReport}
                                    className="btn-shimmer text-xs font-medium px-4 py-2 rounded-lg border border-med-teal/30 text-med-teal hover:bg-med-teal/10 transition-colors"
                                >
                                    Generate Report
                                </button>
                            </div>
                        )}
                    </>
                ) : textContent ? (
                    <MarkdownRenderer content={textContent} />
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        No diagnostic data available.
                    </p>
                )}
            </div>
        </motion.div>
    );
}

'use client';

import React from 'react';
import type { DiagnosisData } from '@/components/chat/DiagnosticResponseCard';
import type { ReportConfig } from '@/services/report-service';

/* ── Types ── */
interface ReportRendererProps {
    diagnosisData: DiagnosisData;
    config: ReportConfig;
}

/**
 * Pure presentational component that renders the report as styled HTML.
 * This is what gets converted to a printable PDF / downloadable image.
 * Uses inline styles for portability when opened in a print window.
 */
export const ReportRenderer = React.forwardRef<HTMLDivElement, ReportRendererProps>(
    function ReportRenderer({ diagnosisData, config }, ref) {
        const {
            patientName,
            patientAge,
            patientGender,
            referringPhysician,
            reportDate,
            sections,
            showBranding,
        } = config;

        return (
            <div
                ref={ref}
                className="bg-white text-gray-900 rounded-lg overflow-hidden max-w-3xl mx-auto"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0A0E1A] to-[#0D1425] text-white px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            {showBranding && (
                                <p className="text-xs tracking-[0.15em] text-[#00D4B8] mb-1 uppercase font-medium">
                                    MediMind Clinical Report
                                </p>
                            )}
                            <h1
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                            >
                                Diagnostic Summary
                            </h1>
                        </div>
                        <div className="text-right text-xs text-gray-300 space-y-0.5">
                            <p>{reportDate}</p>
                            <p className="text-[10px] text-gray-500">AI-Assisted Report</p>
                        </div>
                    </div>
                </div>

                {/* Patient Info */}
                {(patientName || patientAge || patientGender || referringPhysician) && (
                    <div className="px-8 py-4 bg-gray-50 border-b border-gray-200 grid grid-cols-2 gap-3 text-sm">
                        {patientName && (
                            <div>
                                <span className="text-gray-500 text-xs">Patient:</span>
                                <p className="font-medium">{patientName}</p>
                            </div>
                        )}
                        {patientAge && (
                            <div>
                                <span className="text-gray-500 text-xs">Age:</span>
                                <p className="font-medium">{patientAge}</p>
                            </div>
                        )}
                        {patientGender && (
                            <div>
                                <span className="text-gray-500 text-xs">Gender:</span>
                                <p className="font-medium">{patientGender}</p>
                            </div>
                        )}
                        {referringPhysician && (
                            <div>
                                <span className="text-gray-500 text-xs">Physician:</span>
                                <p className="font-medium">{referringPhysician}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Report Body */}
                <div className="px-8 py-6 space-y-6">
                    {/* Diagnosis */}
                    {sections.diagnosis && diagnosisData.patient_problem && (
                        <section>
                            <h2
                                className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3 text-[#0A0E1A]"
                                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                            >
                                Primary Diagnosis
                            </h2>
                            <p className="text-sm leading-relaxed text-gray-700">
                                {diagnosisData.patient_problem}
                            </p>
                        </section>
                    )}

                    {/* Conditions */}
                    {sections.conditions &&
                        diagnosisData.diagnosis &&
                        diagnosisData.diagnosis.length > 0 && (
                            <section>
                                <h2
                                    className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3 text-[#0A0E1A]"
                                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                >
                                    Differential Diagnosis
                                </h2>
                                <ul className="space-y-1.5">
                                    {diagnosisData.diagnosis.map((condition, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-2 text-sm text-gray-700"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4B8] flex-shrink-0" />
                                            {condition}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                    {/* Medications */}
                    {sections.medications &&
                        diagnosisData.treatment_plan?.medications &&
                        diagnosisData.treatment_plan.medications.length > 0 && (
                            <section>
                                <h2
                                    className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3 text-[#0A0E1A]"
                                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                >
                                    Recommended Medications
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {diagnosisData.treatment_plan.medications.map((med, i) => (
                                        <div
                                            key={i}
                                            className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 border border-gray-100"
                                        >
                                            {med}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    {/* Lifestyle */}
                    {sections.lifestyle &&
                        diagnosisData.treatment_plan?.lifestyle_modifications &&
                        diagnosisData.treatment_plan.lifestyle_modifications.length > 0 && (
                            <section>
                                <h2
                                    className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3 text-[#0A0E1A]"
                                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                >
                                    Lifestyle Recommendations
                                </h2>
                                <ul className="space-y-1.5">
                                    {diagnosisData.treatment_plan.lifestyle_modifications.map(
                                        (mod, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2 text-sm text-gray-700"
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] flex-shrink-0" />
                                                {mod}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </section>
                        )}

                    {/* Next Steps */}
                    {sections.nextSteps &&
                        diagnosisData.diagnosis_simplified &&
                        diagnosisData.diagnosis_simplified.length > 0 && (
                            <section>
                                <h2
                                    className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3 text-[#0A0E1A]"
                                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                >
                                    Recommended Next Steps
                                </h2>
                                <ol className="space-y-1.5 list-decimal list-inside">
                                    {diagnosisData.diagnosis_simplified.map((step, i) => (
                                        <li key={i} className="text-sm text-gray-700">
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}

                    {/* Metadata */}
                    {sections.metadata &&
                        diagnosisData.metadata &&
                        Object.keys(diagnosisData.metadata).length > 0 && (
                            <section>
                                <h2
                                    className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3 text-[#0A0E1A]"
                                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                >
                                    Clinical Metadata
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(diagnosisData.metadata).map(([key, val]) => (
                                        <div
                                            key={key}
                                            className="text-xs bg-gray-50 rounded px-3 py-2 border border-gray-100"
                                        >
                                            <span className="text-gray-500 capitalize">{key}: </span>
                                            <span className="text-gray-700 font-medium">
                                                {Array.isArray(val) ? val.join(', ') : String(val)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                </div>

                {/* Footer */}
                {showBranding && (
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">
                            Generated by MediMind AI — Decision support tool, not a
                            substitute for clinical judgment.
                        </p>
                        <p className="text-[10px] text-gray-400">{reportDate}</p>
                    </div>
                )}
            </div>
        );
    }
);

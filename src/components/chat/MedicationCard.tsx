'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { motionPresets } from '@/lib/design-tokens';

/* ── Types ── */
export interface MedicationCardProps {
    /** Drug name, e.g. "Amoxicillin" */
    name: string;
    /** Dosage, e.g. "500mg" */
    dosage?: string;
    /** Frequency, e.g. "3 times daily" */
    frequency?: string;
    /** If present, shows a red contraindication warning */
    contraindication?: string;
}

/**
 * A compact card displaying medication details.
 * Shows a red warning badge if a contraindication is present.
 */
export function MedicationCard({
    name,
    dosage,
    frequency,
    contraindication,
}: MedicationCardProps) {
    return (
        <motion.div
            {...motionPresets.staggerChild}
            className="glass-card p-3 space-y-1.5 relative"
        >
            <p className="text-sm font-semibold text-foreground">{name}</p>

            {dosage && (
                <p className="text-xs text-muted-foreground">
                    <span className="text-med-teal">Dosage:</span> {dosage}
                </p>
            )}

            {frequency && (
                <p className="text-xs text-muted-foreground">
                    <span className="text-med-teal">Frequency:</span> {frequency}
                </p>
            )}

            {contraindication && (
                <div className="flex items-center gap-1.5 mt-1.5 p-1.5 rounded-md bg-med-critical/10 border border-med-critical/20">
                    <AlertTriangle className="h-3 w-3 text-med-critical flex-shrink-0" />
                    <p className="text-[11px] text-med-critical leading-tight">
                        {contraindication}
                    </p>
                </div>
            )}
        </motion.div>
    );
}

'use client';

import { motion } from 'framer-motion';
import { motionPresets } from '@/lib/design-tokens';

/* ── Types ── */
export interface ConditionCardProps {
    /** Condition name, e.g. "Acute Bronchitis" */
    name: string;
    /** Probability 0–100 */
    probability: number;
    /** Severity affects the bar color */
    severity?: 'critical' | 'moderate' | 'low';
}

const severityColors: Record<string, string> = {
    critical: 'bg-med-critical',
    moderate: 'bg-med-warning',
    low: 'bg-med-safe',
};

const severityTrackColors: Record<string, string> = {
    critical: 'bg-med-critical/20',
    moderate: 'bg-med-warning/20',
    low: 'bg-med-safe/20',
};

/**
 * Horizontal chip-card showing a condition name + animated probability bar.
 * Designed for horizontal scroll inside DiagnosticResponseCard.
 */
export function ConditionCard({
    name,
    probability,
    severity = 'low',
}: ConditionCardProps) {
    const barColor = severityColors[severity];
    const trackColor = severityTrackColors[severity];

    return (
        <motion.div
            {...motionPresets.staggerChild}
            className="flex-shrink-0 w-[200px] glass-card p-3 space-y-2"
        >
            <p className="text-sm font-medium text-foreground truncate">{name}</p>

            {/* Probability bar */}
            <div className="space-y-1">
                <div className={`h-1.5 w-full rounded-full ${trackColor}`}>
                    <motion.div
                        className={`h-full rounded-full ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${probability}%` }}
                        transition={{
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1],
                            delay: 0.2,
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                    {probability}%
                </p>
            </div>
        </motion.div>
    );
}

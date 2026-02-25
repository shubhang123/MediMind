"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SeverityPulseRingProps } from '../types';
import { ANIMATION_COLORS, EASING } from '../AnimationTokens';
import { cn } from '@/lib/utils'; // Assuming this exists/works

export const SeverityPulseRing: React.FC<SeverityPulseRingProps> = ({ severity, label, className }) => {
    const color = ANIMATION_COLORS.severity[severity];

    // Animation config matches severity
    const animationConfig = useMemo(() => {
        switch (severity) {
            case 'critical':
                return { duration: 1, scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] };
            case 'moderate':
                return { duration: 2, scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] };
            case 'low':
            default:
                return { duration: 3, scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] };
        }
    }, [severity]);

    return (
        <div className={cn("relative flex items-center justify-center inline-flex", className)} style={{ width: 64, height: 64 }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={`Severity: ${severity}`} role="img">
                {/* Outer Ring 2 */}
                <motion.circle
                    cx="32"
                    cy="32"
                    r="16"
                    stroke={color}
                    strokeWidth="1"
                    fill="none"
                    initial={{ scale: 1, opacity: 0.2 }}
                    animate={{
                        scale: animationConfig.scale,
                        opacity: animationConfig.opacity,
                    }}
                    transition={{
                        duration: animationConfig.duration,
                        repeat: Infinity,
                        ease: EASING.tween.easeInOut,
                        delay: animationConfig.duration / 3
                    }}
                />

                {/* Outer Ring 1 */}
                <motion.circle
                    cx="32"
                    cy="32"
                    r="16"
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                    initial={{ scale: 1, opacity: 0.4 }}
                    animate={{
                        scale: animationConfig.scale,
                        opacity: animationConfig.opacity,
                    }}
                    transition={{
                        duration: animationConfig.duration,
                        repeat: Infinity,
                        ease: EASING.tween.easeInOut,
                    }}
                />

                {/* Core Ring */}
                <circle cx="32" cy="32" r="16" stroke={color} strokeWidth="3" fill="none" opacity="0.8" />

                {/* Center Dot */}
                {severity === 'critical' ? (
                    <motion.circle
                        cx="32"
                        cy="32"
                        r="6"
                        fill={color}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                ) : (
                    <circle cx="32" cy="32" r="6" fill={color} />
                )}
            </svg>
            {label && (
                <span className="sr-only">{label}</span>
            )}
        </div>
    );
};

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PipelineStatusFlowProps, PipelineStep } from '../types';
import { ANIMATION_COLORS, EASING } from '../AnimationTokens';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export const PipelineStatusFlow: React.FC<PipelineStatusFlowProps & { className?: string }> = ({ steps, className }) => {
    const width = 600;
    const height = 120;
    const stepWidth = width / Math.max(1, steps.length - 1);

    const getStepColor = (status: PipelineStep['status']) => {
        switch (status) {
            case 'complete': return ANIMATION_COLORS.states.complete;
            case 'active': return ANIMATION_COLORS.states.processing;
            case 'error': return ANIMATION_COLORS.states.error;
            case 'pending':
            default: return ANIMATION_COLORS.severity.inactive;
        }
    };

    return (
        <div className={cn("relative flex flex-col justify-center", className)} style={{ width, height }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
                {/* Background Track */}
                <line x1="40" y1="40" x2={width - 40} y2="40" stroke={ANIMATION_COLORS.severity.inactive} strokeWidth="4" strokeLinecap="round" />

                {/* Filled Track and Nodes */}
                {steps.map((step, index) => {
                    const cx = index * stepWidth + 40;
                    // Scale it to fit inside the 600 width, leaving margins
                    const actualCx = index === steps.length - 1 ? width - 40 : 40 + (index * (width - 80) / (steps.length - 1));

                    return (
                        <g key={step.name}>
                            {/* Connecting Path */}
                            {index < steps.length - 1 && (
                                <motion.line
                                    x1={actualCx}
                                    y1="40"
                                    x2={40 + ((index + 1) * (width - 80) / (steps.length - 1))}
                                    y2="40"
                                    stroke={step.status === 'complete' ? ANIMATION_COLORS.states.complete :
                                        step.status === 'active' ? ANIMATION_COLORS.states.processing : 'transparent'}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.8, ease: EASING.tween.easeInOut }}
                                />
                            )}

                            {/* Node Background */}
                            <circle cx={actualCx} cy="40" r="16" fill={ANIMATION_COLORS.background} />

                            {/* Node Glow (Active) */}
                            {step.status === 'active' && (
                                <motion.circle
                                    cx={actualCx}
                                    cy="40"
                                    r="24"
                                    fill={ANIMATION_COLORS.glow.teal}
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            )}

                            {/* Node Ring */}
                            <motion.circle
                                cx={actualCx}
                                cy="40"
                                r="14"
                                stroke={getStepColor(step.status)}
                                strokeWidth="4"
                                fill={step.status === 'complete' ? ANIMATION_COLORS.states.complete : ANIMATION_COLORS.background}
                                animate={{
                                    scale: step.status === 'active' ? [1, 1.1, 1] : 1,
                                }}
                                transition={{ duration: 1.5, repeat: step.status === 'active' ? Infinity : 0 }}
                            />

                            {/* Label */}
                            <text
                                x={actualCx}
                                y="80"
                                textAnchor="middle"
                                fill={step.status === 'pending' ? ANIMATION_COLORS.textSecondary : ANIMATION_COLORS.textPrimary}
                                className="text-sm font-medium"
                                fontFamily="Inter, sans-serif"
                            >
                                {step.name}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* HTML Checkmarks (easier to animate than inline SVG paths) */}
            <div className="absolute top-0 left-0 w-full h-[80px] pointer-events-none">
                {steps.map((step, index) => {
                    const actualCx = index === steps.length - 1 ? width - 40 : 40 + (index * (width - 80) / (steps.length - 1));
                    return step.status === 'complete' ? (
                        <motion.div
                            key={`check-${step.name}`}
                            className="absolute left-0 top-0 flex items-center justify-center text-white"
                            style={{ left: actualCx - 10, top: 30, width: 20, height: 20 }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', delay: 0.3 }}
                        >
                            <Check size={16} strokeWidth={4} />
                        </motion.div>
                    ) : null;
                })}
            </div>
        </div>
    );
};

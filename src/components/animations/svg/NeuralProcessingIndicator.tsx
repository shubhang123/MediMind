"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NeuralProcessingIndicatorProps } from '../types';
import { ANIMATION_COLORS, EASING } from '../AnimationTokens';
import { cn } from '@/lib/utils';

const GRID_COLS = 4;
const GRID_ROWS = 3;

export const NeuralProcessingIndicator: React.FC<NeuralProcessingIndicatorProps & { className?: string }> = ({ step, progress, className }) => {
    // Map step to color
    const activeColor = useMemo(() => {
        switch (step) {
            case 'listening': return ANIMATION_COLORS.states.listening;
            case 'transcribing': return ANIMATION_COLORS.states.listening; // Or another color
            case 'analyzing': return ANIMATION_COLORS.states.analyzing;
            case 'diagnosing': return ANIMATION_COLORS.states.processing;
            case 'generating': return ANIMATION_COLORS.states.complete;
            default: return ANIMATION_COLORS.states.processing;
        }
    }, [step]);

    // Generate 12 nodes
    const nodes = Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);

        // Nodes light up progressively from left to right, loosely based on progress
        const nodeThreshold = (col / GRID_COLS) * 100;
        const isActive = progress >= nodeThreshold;

        return { id: i, col, row, isActive };
    });

    return (
        <div className={cn("relative flex items-center justify-center inline-flex flex-col gap-4", className)} style={{ width: 300, height: 120 }}>
            <svg width="300" height="80" viewBox="0 0 300 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Draw connections first so they are under nodes */}
                {nodes.map(node => {
                    if (node.col < GRID_COLS - 1) {
                        return (
                            <motion.line
                                key={`conn-h-${node.id}`}
                                x1={node.col * 60 + 60}
                                y1={node.row * 30 + 10}
                                x2={(node.col + 1) * 60 + 60}
                                y2={node.row * 30 + 10}
                                stroke={node.isActive ? activeColor : ANIMATION_COLORS.severity.inactive}
                                strokeWidth={node.isActive ? "2" : "1"}
                                initial={{ pathLength: 0, opacity: 0.2 }}
                                animate={{
                                    pathLength: node.isActive ? 1 : 0,
                                    opacity: node.isActive ? 0.6 : 0.2
                                }}
                                transition={{ duration: 0.5, ease: EASING.tween.easeInOut }}
                            />
                        )
                    }
                    return null;
                })}

                {/* Draw nodes */}
                {nodes.map((node) => {
                    const cx = node.col * 60 + 60;
                    const cy = node.row * 30 + 10;
                    return (
                        <motion.circle
                            key={`node-${node.id}`}
                            cx={cx}
                            cy={cy}
                            r={node.isActive ? 6 : 4}
                            fill={node.isActive ? activeColor : ANIMATION_COLORS.background}
                            stroke={node.isActive ? activeColor : ANIMATION_COLORS.severity.inactive}
                            strokeWidth="2"
                            initial={{ scale: 0.8 }}
                            animate={{
                                scale: node.isActive ? [1, 1.2, 1] : 1,
                                opacity: node.isActive ? 1 : 0.4
                            }}
                            transition={{
                                duration: 2,
                                repeat: node.isActive ? Infinity : 0,
                                delay: node.col * 0.1 // Stagger based on column
                            }}
                        />
                    );
                })}

                {/* Data Particles Flowing */}
                {progress > 0 && progress < 100 && (
                    <motion.circle
                        cx="0"
                        cy="40"
                        r="3"
                        fill="#FFF"
                        style={{ filter: `drop-shadow(0 0 4px ${activeColor})` }}
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 240, opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                )}
            </svg>
            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ backgroundColor: activeColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
                {/* Particle stream on progress bar */}
                <motion.div
                    className="absolute top-0 h-full w-8 bg-white opacity-20 transform -skew-x-12"
                    initial={{ left: '-10%' }}
                    animate={{ left: '110%' }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            </div>
            <div className="flex justify-between w-full px-2">
                <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                    {step}
                </span>
                <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

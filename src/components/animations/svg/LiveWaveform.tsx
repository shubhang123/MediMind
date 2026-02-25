"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LiveWaveformProps } from '../types';
import { ANIMATION_COLORS } from '../AnimationTokens';
import { cn } from '@/lib/utils';

const NUM_BARS = 48;

export const LiveWaveform = React.memo(({ isRecording, audioData, sensitivity = 1, className }: LiveWaveformProps & { className?: string }) => {
    const [bars, setBars] = useState<number[]>(Array(NUM_BARS).fill(0.1));

    useEffect(() => {
        let animationFrameId: number;
        let time = 0;

        const renderLoop = () => {
            time += 0.05;

            if (isRecording) {
                if (audioData && audioData.length > 0) {
                    // Use provided audio data (mocked or real from Web Audio API)
                    // Simplified mapping from Float32Array to bars
                    const newBars = Array.from({ length: NUM_BARS }).map((_, i) => {
                        const index = Math.floor((i / NUM_BARS) * audioData.length);
                        const val = Math.abs(audioData[index]) * sensitivity;
                        return Math.min(Math.max(val, 0.1), 1);
                    });
                    setBars(newBars);
                } else {
                    // Mock physics-based bounce for recording state without real audio data
                    const newBars = Array.from({ length: NUM_BARS }).map((_, i) => {
                        const noise = Math.sin(time * 2 + i * 0.5) * Math.cos(time * 3 - i * 0.2);
                        return Math.abs(noise) * 0.8 + 0.2; // Value between 0.2 and 1.0
                    });
                    setBars(newBars);
                }
            } else {
                // Idle state: ambient breathing animation
                const newBars = Array.from({ length: NUM_BARS }).map((_, i) => {
                    // Create a gentle wave
                    const wave = Math.sin(time + i * 0.2) * 0.5 + 0.5;
                    return wave * 0.2 + 0.1; // Very subtle values between 0.1 and 0.3
                });
                setBars(newBars);
            }

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isRecording, audioData, sensitivity]);

    const barColor = isRecording ? ANIMATION_COLORS.severity.critical : ANIMATION_COLORS.textSecondary;
    const glowShadow = isRecording ? `drop-shadow(0 0 4px ${ANIMATION_COLORS.glow.red})` : 'none';

    return (
        <div className={cn("w-full h-20 flex items-center justify-center relative", className)}>
            {/* Subtle background glow when recording */}
            {isRecording && (
                <motion.div
                    className="absolute inset-0 bg-red-500 opacity-5 blur-xl rounded-full"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ filter: glowShadow }}>
                {bars.map((height, i) => {
                    // Height is 0..1, SVG mapped to 0..100
                    // Center the bars vertically mapping 0..100
                    const barHeight = height * 80; // max 80% height to leave padding
                    const y = 50 - (barHeight / 2);

                    return (
                        <motion.rect
                            key={i}
                            x={`${(i / NUM_BARS) * 100}%`}
                            y={y}
                            width={`${(1 / NUM_BARS) * 60}%`} // Leave some gap between bars
                            height={barHeight}
                            rx="1" // Rounded corners relative to viewBox
                            fill={barColor}
                            animate={{ height: barHeight, y: y }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }} // physics-based bounce
                        />
                    );
                })}
            </svg>
        </div>
    );
});

LiveWaveform.displayName = 'LiveWaveform';

'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { motionPresets } from '@/lib/design-tokens';
import { LiveWaveform } from '@/components/animations/svg/LiveWaveform';

/* ── Types ── */
export interface VoiceRecorderProps {
    /** Whether currently recording */
    isRecording: boolean;
    /** Stop recording callback */
    onStop: () => void;
    /** Optional: audio analyser node for real waveform data */
    analyserNode?: AnalyserNode | null;
}

/**
 * Inline waveform visualizer that replaces the textarea during recording.
 * Uses the premium LiveWaveform SVG component.
 */
export function VoiceRecorder({
    isRecording,
    onStop,
    analyserNode,
}: VoiceRecorderProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(Date.now());
    const [elapsed, setElapsed] = React.useState(0);

    // Timer
    useEffect(() => {
        if (!isRecording) return;
        startTimeRef.current = Date.now();
        const interval = setInterval(() => {
            setElapsed(Date.now() - startTimeRef.current);
        }, 100);
        return () => clearInterval(interval);
    }, [isRecording]);

    // Format elapsed time as mm:ss
    const timeDisplay = useMemo(() => {
        const seconds = Math.floor(elapsed / 1000);
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }, [elapsed]);

    const [audioData, setAudioData] = React.useState<Float32Array>();

    // Mock Audio Data Extraction Loop (since float32 array is needed by LiveWaveform)
    useEffect(() => {
        if (!isRecording || !analyserNode) return;

        let reqId: number;
        const dataArr = new Float32Array(analyserNode.frequencyBinCount);

        const updateData = () => {
            analyserNode.getFloatTimeDomainData(dataArr);
            setAudioData(new Float32Array(dataArr));
            reqId = requestAnimationFrame(updateData);
        };

        updateData();
        return () => cancelAnimationFrame(reqId);
    }, [isRecording, analyserNode]);

    if (!isRecording) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 w-full"
            >
                {/* Pulsing red dot + timer */}
                <div className="flex items-center gap-2 flex-shrink-0 z-10 relative">
                    <span className="h-2.5 w-2.5 rounded-full bg-med-critical animate-pulse" />
                    <span className="text-sm font-mono text-foreground/80 w-12">
                        {timeDisplay}
                    </span>
                </div>

                {/* SVG Live Waveform */}
                <div className="flex-1 overflow-hidden h-14 relative">
                    <LiveWaveform
                        isRecording={isRecording}
                        audioData={audioData}
                        sensitivity={2.0}
                    />
                </div>

                {/* Stop button */}
                <button
                    onClick={onStop}
                    className="flex-shrink-0 h-9 px-4 rounded-full bg-med-critical/20 border border-med-critical/30 text-med-critical text-xs font-medium hover:bg-med-critical/30 transition-colors"
                >
                    Stop
                </button>
            </motion.div>
        </AnimatePresence>
    );
}

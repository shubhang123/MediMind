'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Brain, Mic, Activity } from 'lucide-react';
import { LiveWaveform } from '@/components/animations/svg/LiveWaveform';
import { SymptomNetworkGraph } from '@/components/animations/svg/SymptomNetworkGraph';
import { PipelineStatusFlow } from '@/components/animations/svg/PipelineStatusFlow';

const showcaseData = [
    {
        icon: Mic,
        title: "Vocal Biomarkers & Dictation",
        description: "Speak naturally. Our ambient dictation engine processes raw audio, analyzing acoustic features and transcribing dense clinical nuance with 99.8% accuracy.",
        visual: () => (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 glass-card border-none bg-black/40">
                <div className="w-full h-32 relative">
                    <LiveWaveform isRecording={true} audioData={undefined} sensitivity={3.0} />
                </div>
                <p className="mt-8 font-mono text-xs text-med-teal uppercase tracking-widest bg-med-teal/10 px-4 py-1.5 rounded-full border border-med-teal/20">Acoustic Analysis Active</p>
            </div>
        )
    },
    {
        icon: Brain,
        title: "Multi-modal Diagnostic Engine",
        description: "The AI cross-references your dictation across 500+ conditions using a multi-dimensional graph, constructing a differential diagnosis instantly.",
        visual: () => {
            const symptoms = [
                { id: 'S1', name: 'Hypoxia', severity: 'critical', correlations: ['S2', 'S3'] },
                { id: 'S2', name: 'Dyspnea', severity: 'moderate', correlations: ['S1'] },
                { id: 'S3', name: 'Chest Pain', severity: 'moderate', correlations: ['S1'] },
            ] as any;
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 glass-card border-none bg-med-navy/30">
                    <SymptomNetworkGraph width={400} height={350} symptoms={symptoms} activeSymptom="S1" />
                </div>
            )
        }
    },
    {
        icon: Activity,
        title: "Structured Clinical Outputs",
        description: "Raw data is synthesized into beautiful, structured clinical reasoning. Severity scores, confidence metrics, and fully-cited literature automatically compiled.",
        visual: () => {
            const steps = [
                { name: 'Initial Processing', status: 'complete' },
                { name: 'Semantic Graphing', status: 'complete' },
                { name: 'Differential Generation', status: 'active' },
            ] as any;
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 glass-card border-none bg-black/40">
                    <PipelineStatusFlow steps={steps} />
                </div>
            )
        }
    }
];

export function StickyScrollShowcase() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Smooth out the scroll progress for cleaner animations
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20, restDelta: 0.001 });

    return (
        <section ref={containerRef} className="relative w-full text-foreground bg-med-dark pb-24" style={{ height: "300vh" }}>
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                <div className="max-w-7xl w-full mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 relative">

                    {/* Left: Text Content (Sticky) */}
                    <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-center translate-y-[-10vh] lg:translate-y-0 relative z-20">
                        {showcaseData.map((data, index) => {
                            // E.g. item 0 is active from 0 to 0.33, item 1 from 0.33 to 0.66
                            const start = index / showcaseData.length;
                            const end = (index + 1) / showcaseData.length;

                            const pointerEvents = useTransform(smoothProgress, (p) => {
                                const active = p >= start - 0.1 && p <= end + 0.1;
                                return active ? 'auto' : 'none';
                            });

                            const yPos = useTransform(smoothProgress, [start - 0.2, start, end, end + 0.2], [50, 0, 0, -50]);
                            const opacity = useTransform(smoothProgress, [start - 0.2, start, end - 0.1, end], [0, 1, 1, 0]);

                            return (
                                <motion.div
                                    key={index}
                                    className="absolute inset-x-0"
                                    style={{ y: yPos, opacity, pointerEvents }}
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-med-teal/10 border border-med-teal/20 mb-8 backdrop-blur-md">
                                        <data.icon className="w-8 h-8 text-med-teal" />
                                    </div>
                                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight mb-6 mt-2 leading-tight">
                                        {data.title}
                                    </h2>
                                    <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
                                        {data.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Right: Visual Content (Sticky) */}
                    <div className="flex-1 w-full lg:w-1/2 h-[50vh] lg:h-[70vh] relative z-10 flex items-center justify-center">
                        {/* Inner glowing bounding box */}
                        <div className="absolute inset-0 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-sm overflow-hidden shadow-2xl">
                            {showcaseData.map((data, index) => {
                                const start = index / showcaseData.length;
                                const end = (index + 1) / showcaseData.length;

                                const scale = useTransform(smoothProgress, [start - 0.2, start, end, end + 0.2], [0.8, 1, 1, 1.2]);
                                const blur = useTransform(smoothProgress, [start - 0.2, start, end, end + 0.2], ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(10px)']);
                                const opacity = useTransform(smoothProgress, [start - 0.2, start, end - 0.1, end], [0, 1, 1, 0]);

                                return (
                                    <motion.div
                                        key={index}
                                        className="absolute inset-0 origin-center"
                                        style={{ scale, opacity, filter: blur }}
                                    >
                                        <data.visual />
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Decorative corner brackets or frames could go here */}
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-med-teal/40 rounded-tl-xl" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-sky-400/40 rounded-br-xl" />
                    </div>

                </div>
            </div>
        </section>
    );
}

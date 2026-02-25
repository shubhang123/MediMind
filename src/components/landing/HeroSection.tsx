'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

const BrainHologram = dynamic(
    () => import('@/components/3d/BrainHologram').then((mod) => mod.BrainHologram),
    { ssr: false }
);

/**
 * Full-viewport hero with centered 3D brain, ambient radial gradient
 * that follows the mouse, headline, subheadline, and ghost CTA.
 */
export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const brainOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    // Parallax logic for text layers
    const textY1 = useTransform(scrollYProgress, [0, 0.4], [0, -120]);
    const textY2 = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
    const textY3 = useTransform(scrollYProgress, [0, 0.4], [0, -40]);

    // Track mouse position for radial gradient
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const gx = (e.clientX / window.innerWidth) * 100;
            const gy = (e.clientY / window.innerHeight) * 100;
            setGradientPos({ x: gx, y: gy });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const headlineVariants: any = {
        hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { delay: i * 0.15 + 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }
        })
    };

    return (
        <section
            ref={containerRef}
            className="relative h-[100vh] w-full flex items-center justify-center overflow-hidden bg-med-dark perspective-1000"
        >
            {/* ── Mouse-responsive radial gradient ── */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                style={{
                    background: `
            radial-gradient(
              800px circle at ${gradientPos.x}% ${gradientPos.y}%,
              rgba(0, 212, 184, 0.08),
              transparent 60%
            ),
            radial-gradient(
              1200px circle at 70% 80%,
              rgba(14, 165, 233, 0.04),
              transparent 60%
            )
          `,
                }}
            />

            {/* ── High-Fidelity 3D Brain Point Cloud ── */}
            <motion.div
                style={{ opacity: brainOpacity }}
                className="absolute inset-x-0 bottom-[-15%] top-[10%] z-0"
            >
                <div className="w-full h-full scale-[1.3] md:scale-[1.5] origin-center opacity-80 md:opacity-60 mix-blend-screen">
                    {/* Size XL forces orbit controls with zoom */}
                    <BrainHologram mode="idle" size="xl" interactive={false} />
                </div>
            </motion.div>

            {/* ── Text overlay ── */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl mt-12 md:mt-24">

                {/* Intro Tag */}
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={headlineVariants}
                    style={{ y: textY3 }}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
                >
                    <Sparkles className="w-4 h-4 text-med-teal" />
                    <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">The Future of Medical Analysis</span>
                </motion.div>

                {/* Staggered Headline */}
                <div className="overflow-hidden p-2">
                    <motion.h1
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={headlineVariants}
                        style={{ y: textY1 }}
                        className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] leading-[0.9] font-bold tracking-tight text-foreground select-none flex flex-col"
                    >
                        <span>CLINICAL AI.</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-med-teal via-white to-sky-400 mt-2">
                            REDEFINED.
                        </span>
                    </motion.h1>
                </div>

                <motion.p
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={headlineVariants}
                    style={{ y: textY2 }}
                    className="mt-8 text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl font-light"
                >
                    Experience real-time multimodal diagnosis powered by frontier models. Dictate, upload, and analyze in seconds.
                </motion.p>

                {/* Ghost CTA */}
                <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={headlineVariants}
                    style={{ y: textY3 }}
                    className="mt-12"
                >
                    <Link
                        href="/chat"
                        className="btn-shimmer group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:scale-105 transition-all duration-500 overflow-hidden"
                    >
                        {/* Shimmer sweep */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                        <span className="relative z-10 text-sm md:text-base tracking-wide">Enter Console</span>
                        <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>

            {/* ── Scroll hint ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
            >
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Scroll
                </span>
                <div className="h-7 w-[1px] bg-gradient-to-b from-med-teal/30 to-transparent" />
            </motion.div>
        </section>
    );
}

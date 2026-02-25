'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

/* ── Types ── */
export interface FeatureCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    /** Delay for stagger animation */
    index?: number;
}

/**
 * Premium Feature Card with true 3D hover tilt effects
 * and ambient SVG glow backgrounds.
 */
export function FeatureCard({
    icon: Icon,
    title,
    description,
    index = 0,
}: FeatureCardProps) {
    // 3D Tilt Logic
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to card center
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Max rotation of 10 degrees
        const rotateX = ((centerY - y) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setRotateX(rotateX);
        setRotateY(rotateY);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.8,
                delay: index * 0.1 + 0.1,
                ease: [0.16, 1, 0.3, 1],
            }}
            style={{ perspective: 1000 }}
            className="w-full"
        >
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                animate={{
                    rotateX: rotateX,
                    rotateY: rotateY,
                    scale: rotateX !== 0 || rotateY !== 0 ? 1.02 : 1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group glass-card hover:bg-white/[0.04] p-8 flex flex-col gap-5 cursor-default overflow-hidden h-full border border-white/[0.05] hover:border-med-teal/30 transition-colors duration-500"
            >
                {/* ── Ambient Glow Background ── */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-med-teal/20 rounded-full blur-[60px]" />
                </div>

                {/* ── Animated Background Grid SVG ── */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--med-teal) 1px, transparent 1px)', backgroundSize: '16px 16px', WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)' }} />

                {/* ── Content ── */}
                <div className="relative z-10 flex flex-col gap-4">
                    {/* Icon container */}
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-med-teal/20 to-med-teal/5 flex items-center justify-center border border-med-teal/10 group-hover:shadow-[0_0_24px_rgba(0,212,184,0.3)] transition-all duration-500 group-hover:scale-110 shadow-lg">
                        <Icon className="h-6 w-6 text-med-teal" />
                    </div>

                    <h3 className="text-xl font-semibold text-foreground tracking-tight mt-2">
                        {title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

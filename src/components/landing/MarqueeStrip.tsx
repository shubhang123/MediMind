'use client';

import React from 'react';
import { motion } from 'framer-motion';

const marqueeItems = [
    "CLINICAL AI INTELLIGENCE",
    "//",
    "MULTIMODAL DIAGNOSIS",
    "//",
    "VOCAL BIOMARKERS",
    "//",
    "REAL-TIME STRUCTURING",
    "//",
    "EVIDENCE-BASED OUTCOMES",
    "//",
    "HIPAA COMPLIANT",
    "//"
];

export function MarqueeStrip() {
    return (
        <section className="relative w-full py-12 md:py-20 bg-med-teal text-med-dark overflow-hidden flex items-center">
            {/* Top and Bottom Borders for style */}
            <div className="absolute top-0 inset-x-0 h-px bg-med-dark/20" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-med-dark/20" />

            <div className="flex whitespace-nowrap overflow-hidden">
                {/* 
                   We use two identical motion divs that translate from 0 to -100%.
                   By playing them infinitely with a linear ease, it creates an endless marquee.
                */}
                {[...Array(2)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="flex whitespace-nowrap items-center shrink-0 pr-8"
                        animate={{ x: [0, "-100%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 20,
                        }}
                    >
                        {marqueeItems.map((text, j) => (
                            <span
                                key={j}
                                className={`mx-4 md:mx-8 font-mono tracking-widest uppercase ${text === "//" ? "text-med-dark/30 text-2xl md:text-3xl font-light" : "text-3xl md:text-5xl lg:text-7xl font-bold"
                                    }`}
                            >
                                {text}
                            </span>
                        ))}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

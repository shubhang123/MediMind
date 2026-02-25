'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Stethoscope,
  Brain,
  FileText,
  Shield,
  Activity,
  Mic,
  Image as ImageIcon,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { StickyScrollShowcase } from '@/components/landing/StickyScrollShowcase';
import { MarqueeStrip } from '@/components/landing/MarqueeStrip';
import { Logo } from '@/components/logo';

// Floating animated background elements
const FloatingOrbs = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <motion.div
      animate={{ y: [0, -40, 0], x: [0, 20, 0], rotate: [0, 90, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] rounded-full bg-med-teal/5 blur-[100px]"
    />
    <motion.div
      animate={{ y: [0, 60, 0], x: [0, -30, 0], rotate: [0, -45, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[20%] right-[5%] w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] rounded-full bg-sky-500/5 blur-[120px]"
    />
  </div>
);

/* ── Stats ── */
const stats = [
  { value: '99.2%', label: 'Diagnostic Accuracy' },
  { value: '<3s', label: 'Analysis Time' },
  { value: '500+', label: 'Conditions Covered' },
  { value: 'HIPAA', label: 'Compliant' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-med-dark text-foreground">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-med-dark/60 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7 text-med-teal" />
            <span className="text-base font-semibold tracking-tight text-foreground">
              MediMind
            </span>
          </div>
          <Link
            href="/chat"
            className="text-xs font-medium text-med-teal hover:text-med-teal-400 transition-colors px-4 py-2 rounded-full border border-med-teal/20 hover:border-med-teal/40 hover:bg-med-teal/5"
          >
            Open Console
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <div className="relative z-10">
        <HeroSection />
      </div>

      {/* ── Background Orbs ── */}
      <FloatingOrbs />

      {/* ── Stats Bar ── */}
      <section className="relative z-20 bg-med-navy/50 border-y border-white/[0.04] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
                type: "spring", stiffness: 200, damping: 20
              }}
              className="text-center group"
            >
              <p className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-med-teal to-sky-400 tracking-tight transition-transform group-hover:scale-105 duration-300">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-foreground/70 mt-3 font-semibold uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Marquee Transition ── */}
      <div className="relative z-30 transform -translate-y-12">
        <MarqueeStrip />
      </div>

      {/* ── Awwwards Sticky Scroll Showcase ── */}
      <div className="relative z-20">
        <StickyScrollShowcase />
      </div>

      {/* ── Final Marquee Transition ── */}
      <div className="relative z-30">
        <MarqueeStrip />
      </div>

      {/* ── CTA Section ── */}
      <section className="relative z-10 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ready to transform your diagnostic workflow?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Start a free consultation and experience AI-powered clinical
              intelligence.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/chat"
                className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-med-teal text-med-dark font-semibold text-sm hover:brightness-110 transition-all"
              >
                <Stethoscope className="h-4 w-4" />
                Start Consultation
              </Link>

              <Link
                href="/chat"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                View demo
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] bg-med-navy/30">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5 text-med-teal opacity-60" />
            <span className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} MediMind. Decision support tool
              — not a substitute for clinical judgment.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

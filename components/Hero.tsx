"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Cpu, Layers, Sparkles } from "lucide-react";
import { HeroDashboardMockup } from "./HeroDashboardMockup";

interface HeroProps {
  onOpenDemo: () => void;
  onScrollToSimulator: () => void;
}

export function Hero({ onOpenDemo, onScrollToSimulator }: HeroProps) {
  return (
    <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-industrial-950 grid-bg-overlay">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-safety-orange/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-safety-amber/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-7">
          {/* Tagline Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-industrial-900/90 border border-safety-orange/40 shadow-xl shadow-safety-orange/10"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-orange opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-safety-orange" />
            </span>
            <span className="text-xs sm:text-base font-mono text-industrial-100 tracking-wider font-semibold">
              RULES + XGBOOST + RAG-GROUNDED SAFETY ENGINE
            </span>
          </motion.div>

          {/* Core Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white leading-[1.08]"
          >
            Predict Industrial Accidents{" "}
            <span className="text-gradient-orange">Before They Happen.</span> Not After.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-2xl text-industrial-100 max-w-4xl mx-auto font-sans leading-relaxed text-balance"
          >
            RiskRadar analyzes <strong className="text-white font-semibold">maintenance records, inspection data, sensor telemetry, and safety audits</strong> using a hybrid <strong className="text-white font-semibold">Rules + XGBoost risk engine</strong> and <strong className="text-white font-semibold">RAG-grounded explanations</strong> to identify and prioritize emerging safety risks before failures compound.
          </motion.p>

          {/* CTAs (Priority 13) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3"
          >
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-semibold text-base shadow-xl shadow-safety-orange/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={onScrollToSimulator}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-industrial-900 hover:bg-industrial-850 border border-industrial-700 text-industrial-100 font-semibold text-base transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 text-safety-orange fill-safety-orange" />
              <span>Try RiskRadar Demo</span>
            </button>
          </motion.div>

          {/* Key Value Proof Badges (Priority 1 & 9) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4 flex flex-wrap items-center justify-center gap-y-2.5 gap-x-8 text-xs sm:text-sm text-industrial-300 font-mono"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-safety-emerald" /> RAG-Grounded Recommendations
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-safety-emerald" /> SOP & Safety Manual Grounded
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-safety-emerald" /> Risk × Consequence Prioritization
            </span>
          </motion.div>
        </div>

        {/* Visual Element - Interactive Risk Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-14"
        >
          <HeroDashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

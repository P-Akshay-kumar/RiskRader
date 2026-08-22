"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Lock, ShieldCheck, Code2 } from "lucide-react";

interface CtaBannerProps {
  onOpenDemo: () => void;
}

export function CtaBanner({ onOpenDemo }: CtaBannerProps) {
  return (
    <section className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-safety-orange/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-industrial-950 via-industrial-900 to-industrial-950 border border-safety-orange/30 shadow-2xl relative overflow-hidden">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 grid-bg-overlay opacity-50 pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-safety-orange/10 border border-safety-orange/30 text-xs sm:text-sm font-mono text-safety-orange font-semibold">
              <Sparkles className="w-4 h-4" />
              PRIORITY 37 &bull; PROTOTYPE ACCESS
            </div>

            {/* Headline (Priority 37) */}
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight leading-tight">
              Explore the <span className="text-gradient-orange">RiskRadar Prototype</span>
            </h2>

            {/* Subtitle (Priority 37) */}
            <p className="text-base sm:text-xl text-industrial-200 font-sans leading-relaxed">
              See how maintenance records, inspection data, sensor telemetry, and safety audits become an explainable, evidence-grounded safety priority queue.
            </p>

            {/* Direct Action Buttons (Priority 38) */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-semibold text-base shadow-xl shadow-safety-orange/25 transition-all active:scale-[0.98]"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#tech-stack"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-industrial-900 hover:bg-industrial-850 border border-industrial-700 text-industrial-100 font-semibold text-base transition-all"
              >
                <Code2 className="w-4 h-4 text-safety-orange" />
                <span>View Architecture</span>
              </a>
            </div>

            {/* Priority 2: Replacement for SOC2 claim */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs sm:text-sm font-mono text-industrial-300">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-safety-emerald" /> Local / On-Prem / VPC Deployment Ready
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-safety-cyan" /> Grounded SOP Evidence Retrieval
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileCode2,
  Cpu,
  BookMarked,
  SlidersHorizontal,
  History,
  BellRing,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "Explainable Risk Scoring",
      badge: "Transparent Math",
      desc: "No opaque 'black box' AI guesses. Every risk index (0–100) displays exact contributing factor weightings (temperature, vibration, maintenance lag).",
      icon: FileCode2,
      accent: "text-safety-orange",
      border: "hover:border-safety-orange/50",
      glow: "group-hover:shadow-safety-orange/10",
    },
    {
      title: "Hybrid Rule + ML Engine",
      badge: "Dual Architecture",
      desc: "Combines zero-hallucination deterministic physical thresholds with advanced XGBoost ML spectral anomaly models for ultimate reliability.",
      icon: Cpu,
      accent: "text-safety-amber",
      border: "hover:border-safety-amber/50",
      glow: "group-hover:shadow-safety-amber/10",
    },
    {
      title: "RAG-Grounded Recommendations",
      badge: "Zero Hallucination",
      desc: "Every AI recommendation cites exact clauses from your plant's internal SOPs, equipment manuals, and OSHA 1910 standards.",
      icon: BookMarked,
      accent: "text-safety-cyan",
      border: "hover:border-safety-cyan/50",
      glow: "group-hover:shadow-safety-cyan/10",
    },
    {
      title: "Risk-Based Prioritization",
      badge: "Smart Dispatch",
      desc: "Focus limited maintenance crews and inspectors on highest-risk assets first, cutting critical failure rates by up to 84%.",
      icon: SlidersHorizontal,
      accent: "text-safety-emerald",
      border: "hover:border-safety-emerald/50",
      glow: "group-hover:shadow-safety-emerald/10",
    },
    {
      title: "Full Traceable Audit Trail",
      badge: "Compliance Ready",
      desc: "Every flagged alert, calculated score, and inspector response is permanently logged into an immutable audit ledger for OSHA reviews.",
      icon: History,
      accent: "text-purple-400",
      border: "hover:border-purple-500/50",
      glow: "group-hover:shadow-purple-500/10",
    },
    {
      title: "Early-Warning Predictive Alerts",
      badge: "Proactive Warning",
      desc: "Detect subtle thermal & harmonic drift days or weeks before traditional static alarms trip — preventing cataclysmic outages.",
      icon: BellRing,
      accent: "text-safety-red",
      border: "hover:border-safety-red/50",
      glow: "group-hover:shadow-safety-red/10",
    },
  ];

  return (
    <section id="features" className="py-24 bg-industrial-950 border-t border-industrial-800 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-safety-orange/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-industrial-900 border border-safety-orange/30 text-xs font-mono text-safety-orange">
            <Sparkles className="w-3.5 h-3.5" />
            ENTERPRISE INDUSTRIAL FEATURES
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            Engineered for <span className="text-gradient-orange">Mission-Critical Reliability</span>
          </h2>
          <p className="text-base sm:text-lg text-industrial-300 font-sans leading-relaxed">
            Built specifically for plant managers, safety directors, and reliability engineers who require mathematically verifiable safety intelligence.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`group relative p-7 rounded-2xl bg-industrial-900 border border-industrial-800 ${feat.border} transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl ${feat.glow} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-industrial-950 border border-industrial-800 group-hover:border-industrial-700 transition-colors">
                      <Icon className={`w-6 h-6 ${feat.accent}`} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-industrial-400 px-2 py-0.5 rounded bg-industrial-950 border border-industrial-800">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold font-display text-industrial-50 group-hover:text-white transition-colors">
                    {feat.title}
                  </h3>

                  <p className="mt-3 text-sm text-industrial-400 leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-industrial-800/80 flex items-center justify-between text-xs font-mono text-industrial-400 group-hover:text-industrial-200 transition-colors">
                  <span>CAPABILITY METRIC</span>
                  <ArrowUpRight className="w-4 h-4 text-industrial-500 group-hover:text-safety-orange transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

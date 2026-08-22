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
      badge: "SHAP Feature Attribution",
      desc: "No opaque 'black box' AI guesses. Displays exact contributing factors (temperature delta, vibration, maintenance delay, inspection history) via SHAP explainability.",
      icon: FileCode2,
      accent: "text-safety-orange",
      border: "hover:border-safety-orange/50",
      glow: "group-hover:shadow-safety-orange/10",
    },
    {
      title: "Hybrid Rules + XGBoost",
      badge: "Dual Risk Architecture",
      desc: "Combines physical deterministic threshold guardrails with XGBoost ML degradation models for transparent physical safety bounds.",
      icon: Cpu,
      accent: "text-safety-amber",
      border: "hover:border-safety-amber/50",
      glow: "group-hover:shadow-safety-amber/10",
    },
    {
      title: "RAG-Grounded Recommendations",
      badge: "SOP Document Evidence",
      desc: "Every AI recommendation cites exact procedural clauses from internal plant SOPs, equipment manuals, and safety guidelines.",
      icon: BookMarked,
      accent: "text-safety-cyan",
      border: "hover:border-safety-cyan/50",
      glow: "group-hover:shadow-safety-cyan/10",
    },
    {
      title: "Risk × Consequence Prioritization",
      badge: "Smart Dispatch Queue",
      desc: "Combines predicted asset degradation with operational impact consequence to focus limited inspector hours where failure matters most.",
      icon: SlidersHorizontal,
      accent: "text-safety-emerald",
      border: "hover:border-safety-emerald/50",
      glow: "group-hover:shadow-safety-emerald/10",
    },
    {
      title: "Full Decision Audit Trail",
      badge: "Complete Traceability",
      desc: "Every calculated score, SHAP factor, retrieved SOP passage, and recommendation is logged into a decision trace ledger for full auditability.",
      icon: History,
      accent: "text-purple-400",
      border: "hover:border-purple-500/50",
      glow: "group-hover:shadow-purple-500/10",
    },
    {
      title: "Early Risk Alerts",
      badge: "Proactive Warning",
      desc: "Detect degrading asset conditions before failures compound and automatically alert safety teams when risk index shifts.",
      icon: BellRing,
      accent: "text-safety-red",
      border: "hover:border-safety-red/50",
      glow: "group-hover:shadow-safety-red/10",
    },
  ];

  return (
    <section id="features" className="py-24 bg-industrial-950 border-t border-industrial-800 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-safety-orange/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header (Priority 28) */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-industrial-900 border border-safety-orange/40 text-xs sm:text-sm font-mono text-safety-orange font-semibold">
            <Sparkles className="w-4 h-4" />
            DESIGNED FOR INDUSTRIAL SAFETY DECISIONS
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            Explainable, Grounded, and <span className="text-gradient-orange">Traceable Intelligence</span>
          </h2>
          <p className="text-base sm:text-xl text-industrial-200 font-sans leading-relaxed">
            Built specifically for plant managers, safety directors, and reliability engineers who require transparent, defensible risk prioritisation.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`group relative p-8 rounded-3xl bg-industrial-900 border border-industrial-800 ${feat.border} transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl ${feat.glow} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-industrial-950 border border-industrial-800 group-hover:border-industrial-700 transition-colors">
                      <Icon className={`w-7 h-7 ${feat.accent}`} />
                    </div>
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-industrial-300 px-3 py-1 rounded bg-industrial-950 border border-industrial-800">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl sm:text-2xl font-bold font-display text-industrial-50 group-hover:text-white transition-colors">
                    {feat.title}
                  </h3>

                  <p className="mt-3.5 text-sm sm:text-base text-industrial-300 leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-industrial-800/80 flex items-center justify-between text-xs font-mono text-industrial-400 group-hover:text-industrial-200 transition-colors">
                  <span>PPT ARCHITECTURE FEATURE</span>
                  <ArrowUpRight className="w-4 h-4 text-industrial-400 group-hover:text-safety-orange transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

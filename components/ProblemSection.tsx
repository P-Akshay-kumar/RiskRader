"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database, FileSearch, Layers, ShieldAlert, Sparkles } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      title: "Fragmented Industrial Risk Data",
      desc: "Maintenance records, inspection reports, sensor readings, and safety audits are often reviewed separately, making it difficult to identify which assets require attention first.",
      icon: Database,
      tag: "DATA ISOLATION",
      color: "text-safety-orange",
      bg: "bg-safety-orange/10 border-safety-orange/30",
    },
    {
      title: "Hidden Risk Signals",
      desc: "Minor changes across temperature, vibration, maintenance, and inspection history can become significant when analyzed together, but static alarms evaluate signals in isolation.",
      icon: Layers,
      tag: "MULTI-SIGNAL GAP",
      color: "text-safety-amber",
      bg: "bg-safety-amber/10 border-safety-amber/30",
    },
    {
      title: "Fragmented Manual Review",
      desc: "Safety teams often spend critical hours reviewing scattered inspection logs, maintenance notes, and audit records before identifying which assets need immediate intervention.",
      icon: FileSearch,
      tag: "INSPECTION BOTTLENECK",
      color: "text-safety-yellow",
      bg: "bg-safety-yellow/10 border-safety-yellow/30",
    },
  ];

  return (
    <section id="problem" className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-safety-red/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-safety-orange/10 border border-safety-orange/30 text-xs sm:text-sm font-mono text-safety-orange">
            <ShieldAlert className="w-4 h-4" />
            THE CORE PROBLEM &bull; CHECK EVERYTHING &rarr; CHECK WHAT MATTERS FIRST
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight leading-tight">
            Industrial Risk Data Is Scattered <span className="text-safety-orange">Across Silos.</span>
          </h2>
          <p className="text-base sm:text-xl text-industrial-200 leading-relaxed font-sans">
            Plant managers and safety engineers struggle to synthesize maintenance logs, physical inspection reports, telemetry streams, and compliance audits into a single actionable risk priority queue.
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <motion.div
                key={prob.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-7 sm:p-8 rounded-3xl bg-industrial-950 border border-industrial-800 hover:border-industrial-700 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl border ${prob.bg}`}>
                      <Icon className={`w-7 h-7 ${prob.color}`} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-industrial-400 px-3 py-1 rounded bg-industrial-900 border border-industrial-800">
                      {prob.tag}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl sm:text-2xl font-bold font-display text-industrial-50 group-hover:text-white transition-colors">
                    {prob.title}
                  </h3>

                  <p className="mt-3.5 text-sm sm:text-base text-industrial-300 leading-relaxed">
                    {prob.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-industrial-800/80 flex items-center justify-between text-xs font-mono text-industrial-400">
                  <span>SAFETY CHALLENGE 0{idx + 1}</span>
                  <span className="text-safety-orange font-semibold">REQUIRES FUSION</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Solution Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 p-8 sm:p-10 rounded-3xl bg-industrial-950 border border-safety-orange/40 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-2xl"
        >
          {/* Legacy Approach */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-industrial-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
              <span>UNIFIED RISK PARADIGM</span>
            </div>
            <h4 className="text-2xl font-bold font-display text-industrial-100">
              From &quot;Check Everything&quot; to &quot;Check What Matters First&quot;
            </h4>
            <p className="text-sm sm:text-base text-industrial-300 leading-relaxed">
              Instead of wading through hundreds of independent alarms and paper logs, RiskRadar fuses all 4 data streams to focus inspector hours on high-risk, high-consequence assets.
            </p>
          </div>

          {/* RiskRadar Solution Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-industrial-900 border border-industrial-700 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 text-safety-orange font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> The RiskRadar Approach
            </div>
            <h4 className="text-xl sm:text-2xl font-bold font-display text-industrial-50">
              Rules + XGBoost + RAG SOP Evidence
            </h4>
            <p className="text-sm sm:text-base text-industrial-200 leading-relaxed">
              Analyzes telemetry, maintenance logs, inspection data, and safety audits together — grounding every alert in verified plant SOP evidence.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

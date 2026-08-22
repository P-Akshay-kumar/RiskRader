"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Database,
  Cpu,
  BookOpen,
  CheckSquare,
  ListOrdered,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Data Ingestion",
      desc: "Combines maintenance records, inspection data, sensor telemetry, and safety audits into a unified feature vector.",
      icon: Database,
      tag: "Multi-Source",
    },
    {
      num: "02",
      title: "Rules + XGBoost",
      desc: "Evaluates physical deterministic guardrails alongside XGBoost ML anomaly models for transparent risk index scoring.",
      icon: Cpu,
      tag: "Dual Scoring",
    },
    {
      num: "03",
      title: "RAG SOP Evidence",
      desc: "Retrieves relevant passages from internal plant SOPs, OEM manuals, and safety guidelines using vector embeddings.",
      icon: BookOpen,
      tag: "RAG Grounded",
    },
    {
      num: "04",
      title: "Grounded Advice",
      desc: "Provides clear explanations of risk factors paired with SOP-grounded recommended resolution actions.",
      icon: CheckSquare,
      tag: "Actionable",
    },
    {
      num: "05",
      title: "Risk × Consequence",
      desc: "Combines predicted asset risk with operational consequence to rank which assets inspectors should address first.",
      icon: ListOrdered,
      tag: "Smart Priority",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      {/* Background vector glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-safety-orange/5 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-industrial-950 border border-industrial-700 text-xs sm:text-sm font-mono text-safety-orange font-semibold">
            <ShieldCheck className="w-4 h-4" />
            THE 5-STEP AUTOMATION PIPELINE
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            From Raw Telemetry to <span className="text-gradient-orange">Ranked Safety Action</span>
          </h2>
          <p className="text-base sm:text-xl text-industrial-200 font-sans leading-relaxed">
            RiskRadar transforms chaotic industrial telemetry, inspection logs, and maintenance records into clear, auditable safety priorities.
          </p>
        </div>

        {/* 5-Step Pipeline Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-5 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-industrial-800 via-safety-orange/50 to-industrial-800 -translate-y-6 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative z-10 p-6 rounded-3xl bg-industrial-950 border border-industrial-800 hover:border-safety-orange/60 transition-all group flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-industrial-900 border border-industrial-700/80 group-hover:bg-safety-orange group-hover:border-safety-orange transition-colors">
                      <Icon className="w-6 h-6 text-safety-orange group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-mono text-xs font-bold text-industrial-400 group-hover:text-safety-orange transition-colors">
                      STEP {step.num}
                    </span>
                  </div>

                  <span className="inline-block text-xs font-mono uppercase tracking-wider text-industrial-300 bg-industrial-900 px-2.5 py-1 rounded border border-industrial-800 mb-2 font-semibold">
                    {step.tag}
                  </span>

                  <h3 className="text-lg font-bold font-display text-industrial-50 group-hover:text-white transition-colors">
                    {step.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-industrial-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Footer Arrow Indicator */}
                <div className="mt-5 pt-3 border-t border-industrial-800/80 flex items-center justify-between text-xs font-mono text-industrial-400">
                  <span>{idx === steps.length - 1 ? "PRIORITY QUEUE" : "NEXT STAGE"}</span>
                  <ChevronRight className="w-4 h-4 text-industrial-400 group-hover:text-safety-orange group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Priority 15 & 16: Risk × Consequence Prioritization Matrix Display */}
        <div id="matrix" className="mt-16 p-8 sm:p-10 rounded-3xl bg-industrial-950 border border-industrial-700/80 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-industrial-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-safety-orange/10 text-safety-orange font-mono text-xs font-bold uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" /> KEY INNOVATION &bull; STEP 05
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50">
                Risk × Consequence Prioritization Matrix
              </h3>
              <p className="text-sm sm:text-base text-industrial-300 mt-1">
                <strong>Risk tells us how concerning an asset is. Consequence tells us how much it matters if that asset fails.</strong>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 text-xs font-mono text-industrial-200 shrink-0">
              <span className="text-industrial-400 block text-[11px]">PRIORITY FORMULA:</span>
              <span className="text-safety-orange font-bold text-sm">Priority = f(Predictive Risk, Operational Impact)</span>
            </div>
          </div>

          {/* 2x2 Priority Matrix Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-industrial-900 border border-industrial-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-industrial-400">HIGH RISK &bull; LOW CONSEQUENCE</span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-safety-amber/20 text-safety-amber">
                  MEDIUM PRIORITY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-industrial-300">
                High degradation signal on non-critical secondary filter pump. Scheduled for standard maintenance window.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-industrial-900 border border-safety-red/40 bg-safety-red/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-safety-red font-bold">HIGH RISK &bull; HIGH CONSEQUENCE</span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-safety-red text-white">
                  CRITICAL PRIORITY #1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-industrial-100 font-medium">
                High degradation signal on primary catalytic feed pump. Triggers immediate inspector dispatch & seal cooling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

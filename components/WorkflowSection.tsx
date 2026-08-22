"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Database,
  Cpu,
  BookOpen,
  CheckSquare,
  ListOrdered,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Ingest Messy Telemetry",
      desc: "Streams IoT sensor readings, SCADA logs, past work orders, and PDF inspection reports continuously.",
      icon: Database,
      tag: "Data Pipeline",
    },
    {
      num: "02",
      title: "Score Hybrid Risk",
      desc: "Combines deterministic rule thresholds with ML anomaly detection for 0% hallucinated risk scores.",
      icon: Cpu,
      tag: "Dual Risk Engine",
    },
    {
      num: "03",
      title: "Ground in Safety SOPs",
      desc: "RAG engine queries vector index of plant safety manuals, OEM specs, and OSHA 1910 standards.",
      icon: BookOpen,
      tag: "RAG Retrieval",
    },
    {
      num: "04",
      title: "Explain & Recommend",
      desc: "Generates clear, natural language root causes paired with step-by-step verified action steps.",
      icon: CheckSquare,
      tag: "Action Engine",
    },
    {
      num: "05",
      title: "Rank Priority Queue",
      desc: "Dynamically orders plant assets by risk severity so inspector hours target critical hazards first.",
      icon: ListOrdered,
      tag: "Priority Matrix",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      {/* Background vector glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-safety-orange/5 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-industrial-950 border border-industrial-700 text-xs font-mono text-safety-orange">
            <ShieldCheck className="w-3.5 h-3.5" />
            END-TO-END AUTOMATION FLOW
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            From Raw Sensor Streams to <span className="text-gradient-orange">Ranked Safety Action</span>
          </h2>
          <p className="text-base sm:text-lg text-industrial-300 font-sans leading-relaxed">
            RiskRadar transforms chaotic industrial telemetry into clear, auditable safety prioritiation in 5 automated real-time steps.
          </p>
        </div>

        {/* Steps Flow Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-industrial-800 via-safety-orange/40 to-industrial-800 -translate-y-6 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative z-10 p-5 rounded-2xl bg-industrial-950 border border-industrial-800 hover:border-safety-orange/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-700/80 group-hover:bg-safety-orange group-hover:border-safety-orange transition-colors">
                      <Icon className="w-5 h-5 text-safety-orange group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-mono text-xs font-bold text-industrial-400 group-hover:text-safety-orange transition-colors">
                      STEP {step.num}
                    </span>
                  </div>

                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-industrial-400 bg-industrial-900 px-2 py-0.5 rounded border border-industrial-800 mb-2">
                    {step.tag}
                  </span>

                  <h3 className="text-base font-bold font-display text-industrial-100 group-hover:text-industrial-50 transition-colors">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-xs text-industrial-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow indicator for next step (mobile & desktop) */}
                <div className="mt-4 pt-3 border-t border-industrial-800/80 flex items-center justify-between text-[11px] font-mono text-industrial-400">
                  <span>{idx === steps.length - 1 ? "EXECUTION READY" : "NEXT STEP"}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-industrial-400 group-hover:text-safety-orange group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

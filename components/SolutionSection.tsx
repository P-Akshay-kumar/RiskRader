"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  BookOpenCheck,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  CheckCircle2,
  FileText,
} from "lucide-react";

export function SolutionSection() {
  const [activeTab, setActiveTab] = useState<"hybrid" | "rag">("hybrid");

  return (
    <section id="solution" className="py-24 bg-industrial-950 border-t border-industrial-800 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-safety-orange/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-industrial-900 border border-safety-orange/30 text-xs font-mono text-safety-orange">
            <Layers className="w-3.5 h-3.5" />
            THE DUAL-ENGINE ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            How RiskRadar Works: <span className="text-gradient-orange">Hybrid Precision + RAG Clarity</span>
          </h2>
          <p className="text-base sm:text-lg text-industrial-300 font-sans leading-relaxed">
            Generic LLMs invent advice. Static alarm rules miss subtle anomalies. RiskRadar combines the absolute reliability of deterministic rules with retrieval-augmented intelligence grounded strictly in your plant&apos;s physical safety procedures.
          </p>
        </div>

        {/* Interactive Architecture Tab Selector */}
        <div className="mt-12 max-w-4xl mx-auto flex justify-center p-1.5 rounded-2xl bg-industrial-900 border border-industrial-800">
          <button
            onClick={() => setActiveTab("hybrid")}
            className={`flex-1 py-3 px-6 rounded-xl font-display font-medium text-sm transition-all flex items-center justify-center gap-2.5 ${
              activeTab === "hybrid"
                ? "bg-gradient-to-r from-safety-orange to-safety-amber text-white shadow-lg shadow-safety-orange/20"
                : "text-industrial-400 hover:text-industrial-100"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Layer 1: Hybrid Rule + ML Scoring</span>
          </button>
          <button
            onClick={() => setActiveTab("rag")}
            className={`flex-1 py-3 px-6 rounded-xl font-display font-medium text-sm transition-all flex items-center justify-center gap-2.5 ${
              activeTab === "rag"
                ? "bg-gradient-to-r from-safety-orange to-safety-amber text-white shadow-lg shadow-safety-orange/20"
                : "text-industrial-400 hover:text-industrial-100"
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>Layer 2: RAG Grounded Explanations</span>
          </button>
        </div>

        {/* Dynamic Tab Content Display */}
        <div className="mt-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "hybrid" ? (
              <motion.div
                key="hybrid-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 rounded-3xl bg-industrial-900 border border-industrial-700/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Text Explanation */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-industrial-950 border border-industrial-700 font-mono text-xs text-safety-orange">
                    DETERMINISTIC SAFETY SCORES
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50">
                    Rule-Based Safety Guardrails Meets Machine Learning Anomaly Detection
                  </h3>
                  <p className="text-sm text-industrial-300 leading-relaxed font-sans">
                    Safety regulations cannot depend on probability alone. RiskRadar enforces hard deterministic thresholds for critical safety parameters (e.g. pressure caps, temperature limits, gas PPM), while an ensemble ML classifier analyzes continuous multivariate sensor telemetry to catch complex micro-anomalies weeks before physical breakdown.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-safety-emerald/10 text-safety-emerald mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-industrial-100">0% Hallucination Risk Scoring</h4>
                        <p className="text-xs text-industrial-400">Hard mathematical bounds prevent false safety clearances.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-safety-emerald/10 text-safety-emerald mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-industrial-100">Multi-Signal Telemetry Fusion</h4>
                        <p className="text-xs text-industrial-400">Fuses SCADA feeds, vibration spectral FFT, and maintenance interval delays.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Visual Architecture Box */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-industrial-950 border border-industrial-800 space-y-4">
                  <div className="text-xs font-mono text-industrial-400 uppercase tracking-wider mb-2">
                    // HYBRID ENGINE PIPELINE
                  </div>

                  <div className="p-3.5 rounded-xl bg-industrial-900 border border-industrial-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-safety-cyan" />
                      <div>
                        <div className="text-xs font-mono text-industrial-200">Continuous Ingestion</div>
                        <div className="text-[10px] text-industrial-400">Sensors, Logs, ERP</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-safety-cyan">1,420 Hz</span>
                  </div>

                  <div className="flex justify-center my-1">
                    <ArrowRight className="w-4 h-4 text-industrial-600 rotate-90" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-industrial-900 border border-safety-orange/40 flex items-center justify-between shadow-lg shadow-safety-orange/5">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-safety-orange" />
                      <div>
                        <div className="text-xs font-mono text-industrial-100 font-semibold">Dual Engine Scoring</div>
                        <div className="text-[10px] text-industrial-400">Hard Rules + XGBoost Model</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-safety-orange font-bold">0-100 Score</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="rag-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 rounded-3xl bg-industrial-900 border border-industrial-700/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Text Explanation */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-industrial-950 border border-industrial-700 font-mono text-xs text-safety-amber">
                    RETRIEVAL-AUGMENTED GENERATION (RAG)
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50">
                    Cites Real Plant Standard Operating Procedures (SOPs), Not Invented Text
                  </h3>
                  <p className="text-sm text-industrial-300 leading-relaxed font-sans">
                    When RiskRadar flags an asset, it doesn&apos;t just spit out a raw number. Its RAG layer retrieves exact clauses from your plant&apos;s internal safety manuals, OEM equipment guidelines, and OSHA compliance standards — handing your plant engineers immediate, verified resolution steps.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-safety-emerald/10 text-safety-emerald mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-industrial-100">Exact SOP & OSHA Citation</h4>
                        <p className="text-xs text-industrial-400">Links directly to document section, page number, and procedural clause.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-safety-emerald/10 text-safety-emerald mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-industrial-100">Auditable Explanation Trail</h4>
                        <p className="text-xs text-industrial-400">Every alert explanation is stored with cryptographic vector lineage for compliance.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Visual RAG Vector Citation Box */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-industrial-950 border border-industrial-800 space-y-3">
                  <div className="text-xs font-mono text-industrial-400 uppercase tracking-wider mb-1">
                    // RAG VECTOR GROUNDING PREVIEW
                  </div>

                  <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-800 text-xs font-mono">
                    <div className="text-industrial-400 text-[10px]">RETRIEVED VECTOR CHUNK #402</div>
                    <div className="text-safety-amber font-semibold mt-1">&quot;SOP-702 Section 4.1: Pump Cavitation Emergency Relief&quot;</div>
                  </div>

                  <div className="p-3 rounded-xl bg-industrial-900 border border-safety-emerald/30 text-xs font-mono">
                    <div className="text-safety-emerald text-[10px] font-bold">VERIFIED RECOMMENDED ACTION</div>
                    <div className="text-industrial-100 mt-1">1. Reduce intake manifold valve flow by 15%.</div>
                    <div className="text-industrial-100">2. Engage aux coolant loop within 30 min.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  BookOpenCheck,
  ShieldCheck,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
  Lock,
  Sparkles,
  GitBranch,
} from "lucide-react";

export function SolutionSection() {
  const [activeTab, setActiveTab] = useState<"hybrid" | "rag" | "additive">("hybrid");

  return (
    <section id="solution" className="py-24 bg-industrial-950 border-t border-industrial-800 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-safety-orange/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-industrial-900 border border-safety-orange/40 text-xs sm:text-sm font-mono text-safety-orange">
            <Layers className="w-4 h-4" />
            DUAL-ENGINE ARCHITECTURE
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold font-display text-white tracking-tight">
            How RiskRadar Works: <span className="text-gradient-orange">Rules + XGBoost + RAG Grounding</span>
          </h2>
          <p className="text-lg sm:text-2xl text-industrial-100 font-sans leading-relaxed max-w-4xl mx-auto">
            Combines the mathematical certainty of physical rule boundaries, the pattern-learning power of XGBoost, and retrieval-augmented SOP evidence grounding.
          </p>
        </div>

        {/* Interactive Architecture Tab Selector */}
        <div className="mt-12 max-w-5xl mx-auto flex flex-col sm:flex-row justify-center p-2 rounded-2xl bg-industrial-900 border border-industrial-800 gap-2">
          <button
            onClick={() => setActiveTab("hybrid")}
            className={`flex-1 py-3.5 px-6 rounded-xl font-display font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 ${
              activeTab === "hybrid"
                ? "bg-gradient-to-r from-safety-orange to-safety-amber text-white shadow-lg shadow-safety-orange/20 font-bold"
                : "text-industrial-300 hover:text-industrial-50"
            }`}
          >
            <Cpu className="w-4.5 h-4.5" />
            <span>Layer 1: Rules + XGBoost</span>
          </button>
          <button
            onClick={() => setActiveTab("rag")}
            className={`flex-1 py-3.5 px-6 rounded-xl font-display font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 ${
              activeTab === "rag"
                ? "bg-gradient-to-r from-safety-orange to-safety-amber text-white shadow-lg shadow-safety-orange/20 font-bold"
                : "text-industrial-300 hover:text-industrial-50"
            }`}
          >
            <BookOpenCheck className="w-4.5 h-4.5" />
            <span>Layer 2: RAG SOP Evidence</span>
          </button>
          <button
            onClick={() => setActiveTab("additive")}
            className={`flex-1 py-3.5 px-6 rounded-xl font-display font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 ${
              activeTab === "additive"
                ? "bg-gradient-to-r from-safety-orange to-safety-amber text-white shadow-lg shadow-safety-orange/20 font-bold"
                : "text-industrial-300 hover:text-industrial-50"
            }`}
          >
            <GitBranch className="w-4.5 h-4.5" />
            <span>Additive Layer Design</span>
          </button>
        </div>

        {/* Dynamic Tab Content Display */}
        <div className="mt-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "hybrid" && (
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
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-industrial-950 border border-industrial-700 font-mono text-xs text-safety-orange font-semibold">
                    DETERMINISTIC & ML HYBRID
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50">
                    Deterministic Safety Guardrails Meets XGBoost Risk Classification
                  </h3>
                  <p className="text-sm sm:text-base text-industrial-200 leading-relaxed font-sans">
                    Safety boundaries cannot rely on probability alone. RiskRadar enforces hard deterministic thresholds for critical physical limits (pressure, temperature, valve state), while an XGBoost classifier analyzes multivariate sensor telemetry and maintenance history to detect degrading asset conditions.
                  </p>

                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-safety-emerald/10 text-safety-emerald mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-industrial-100">Deterministic Threshold Boundaries</h4>
                        <p className="text-xs sm:text-sm text-industrial-300">Hard rules enforce physical safety limits with zero ambiguity.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-safety-emerald/10 text-safety-emerald mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-industrial-100">XGBoost Degradation Classifier</h4>
                        <p className="text-xs sm:text-sm text-industrial-300">Learns complex degradation patterns across telemetry, inspection, and maintenance history.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Visual Architecture Box */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-industrial-950 border border-industrial-800 space-y-4 shadow-xl">
                  <div className="text-xs font-mono text-industrial-300 uppercase tracking-wider font-semibold">
                    // HYBRID ENGINE PIPELINE
                  </div>

                  <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-safety-cyan" />
                      <div>
                        <div className="text-xs font-mono text-industrial-100 font-bold">Multi-Source Data Ingestion</div>
                        <div className="text-xs text-industrial-400">Maintenance, Inspection, SCADA</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-safety-cyan font-bold">Fused Data</span>
                  </div>

                  <div className="flex justify-center my-1">
                    <ArrowRight className="w-4 h-4 text-industrial-500 rotate-90" />
                  </div>

                  <div className="p-4 rounded-xl bg-industrial-900 border border-safety-orange/40 flex items-center justify-between shadow-lg shadow-safety-orange/10">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-safety-orange" />
                      <div>
                        <div className="text-xs font-mono text-industrial-50 font-bold">Dual Engine Scoring</div>
                        <div className="text-xs text-industrial-300">Rules + XGBoost Model</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-safety-orange font-bold">0-100 Score</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "rag" && (
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
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-industrial-950 border border-industrial-700 font-mono text-xs text-safety-amber font-semibold">
                    RAG-GROUNDED SAFETY DECISIONS
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50">
                    Cites Real Plant Standard Operating Procedures (SOPs) & OEM Manuals
                  </h3>
                  <p className="text-sm sm:text-base text-industrial-200 leading-relaxed font-sans">
                    When RiskRadar flags an asset, it retrieves exact relevant passages from your plant&apos;s internal SOPs, equipment manuals, and safety guidelines — providing engineers with grounded, actionable resolution steps.
                  </p>

                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-safety-emerald/10 text-safety-emerald mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-industrial-100">Exact SOP & Manual Document Retrieval</h4>
                        <p className="text-xs sm:text-sm text-industrial-300">Retrieves specific procedural clauses from ChromaDB vector index.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-safety-emerald/10 text-safety-emerald mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-industrial-100">Traceable Explanation Trail</h4>
                        <p className="text-xs sm:text-sm text-industrial-300">Every recommendation records the retrieved source document for full auditability.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Visual RAG Vector Citation Box */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-industrial-950 border border-industrial-800 space-y-4 shadow-xl">
                  <div className="text-xs font-mono text-industrial-300 uppercase tracking-wider font-semibold">
                    // RAG VECTOR EVIDENCE PREVIEW
                  </div>

                  <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 text-xs font-mono">
                    <div className="text-industrial-400 text-xs font-semibold">RETRIEVED DOCUMENT EVIDENCE:</div>
                    <div className="text-safety-amber font-semibold mt-1 text-sm">&quot;SOP-402 Section 3.2: High-Pressure Bearing Cavitation Relief&quot;</div>
                  </div>

                  <div className="p-4 rounded-xl bg-industrial-900 border border-safety-emerald/30 text-xs font-mono">
                    <div className="text-safety-emerald text-xs font-bold">RECOMMENDED ACTION</div>
                    <div className="text-industrial-100 mt-1 text-xs sm:text-sm leading-relaxed">
                      Trigger immediate seal cooling & isolate secondary bypass valve.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "additive" && (
              <motion.div
                key="additive-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 rounded-3xl bg-industrial-900 border border-industrial-700/80 shadow-2xl space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-industrial-950 border border-industrial-700 font-mono text-xs text-safety-cyan font-semibold">
                  PRIORITY 45 &bull; SAFETY-FIRST DESIGN
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50">
                  RAG is an Additive Layer — Core Risk Scoring Operates Independently
                </h3>

                <p className="text-base sm:text-lg text-industrial-200 leading-relaxed font-sans">
                  The core Rules + XGBoost risk engine operates independently of the generative AI layer. RAG enhances the system with evidence-grounded explanations and recommendations without becoming the sole source of safety decisions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-2xl bg-industrial-950 border border-industrial-800 space-y-2">
                    <div className="flex items-center gap-2 text-safety-emerald text-sm font-bold font-mono">
                      <ShieldCheck className="w-5 h-5" /> Independent Risk Engine
                    </div>
                    <p className="text-xs sm:text-sm text-industrial-300 leading-relaxed">
                      If the RAG LLM service is offline or unavailable, the deterministic rules and XGBoost risk model continue scoring asset risk and calculating priority uninterrupted.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-industrial-950 border border-industrial-800 space-y-2">
                    <div className="flex items-center gap-2 text-safety-cyan text-sm font-bold font-mono">
                      <Sparkles className="w-5 h-5" /> Grounded Evidence Enrichment
                    </div>
                    <p className="text-xs sm:text-sm text-industrial-300 leading-relaxed">
                      When available, RAG fetches verified SOP text and generates clear recommendations, ensuring zero reliance on ungrounded AI generation.
                    </p>
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

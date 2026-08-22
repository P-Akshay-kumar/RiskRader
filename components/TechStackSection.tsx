"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Database, Server, ShieldCheck, Zap, Code2, Check, Sparkles } from "lucide-react";

export function TechStackSection() {
  const stack = [
    {
      category: "Risk & ML Engine",
      items: ["Python", "Pandas", "XGBoost", "SHAP Explainability"],
      icon: Cpu,
      color: "text-safety-orange",
      border: "border-safety-orange/30",
    },
    {
      category: "RAG & Vector Retrieval",
      items: ["Sentence Transformers", "ChromaDB Vector Store", "Ollama Local LLM"],
      icon: Database,
      color: "text-safety-amber",
      border: "border-safety-amber/30",
    },
    {
      category: "Application & API",
      items: ["FastAPI", "Streamlit", "SQLite Ledger", "Next.js 14 Dashboard"],
      icon: Server,
      color: "text-safety-cyan",
      border: "border-safety-cyan/30",
    },
  ];

  const feasibility = [
    {
      title: "Local First & Zero Cost",
      desc: "Runs locally using lightweight vector retrieval and CPU-based embeddings without depending on paid LLM APIs.",
      tag: "$0 LOW-COST MVP",
    },
    {
      title: "Build-Safe Architecture",
      desc: "Core deterministic rules and XGBoost risk models operate independently even if the RAG layer is offline.",
      tag: "INDEPENDENT RISK LAYER",
    },
    {
      title: "VPC / On-Prem Deployment",
      desc: "Air-gapped deployment path protects sensitive plant operational telemetry and proprietary maintenance logs.",
      tag: "DATA PRIVACY FIRST",
    },
  ];

  const mitigations = [
    { challenge: "Imbalanced failure data", solution: "Cost-sensitive XGBoost training + deterministic rule fallbacks" },
    { challenge: "RAG generation risks", solution: "Constrained retrieval-grounded generation strictly from plant SOP chunks" },
    { challenge: "Alert fatigue", solution: "Risk × Consequence prioritization matrix ordering attention" },
    { challenge: "LLM response latency", solution: "Short constrained generation + async background vector indexing" },
    { challenge: "Missing telemetry data", solution: "Graceful rule-engine handling and default baseline feature imputation" },
    { challenge: "Data privacy & security", solution: "Local / On-Prem / VPC deployment architecture" },
  ];

  return (
    <section id="tech-stack" className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
        
        {/* 1. Tech Stack Section (Priority 20) */}
        <div>
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-industrial-950 border border-industrial-700 text-xs sm:text-sm font-mono text-safety-orange font-semibold">
              <Code2 className="w-4 h-4" />
              PRIORITY 20 &bull; TECHNICAL STACK ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
              Built for <span className="text-gradient-orange">Hackathon & Enterprise Feasibility</span>
            </h2>
            <p className="text-base sm:text-xl text-industrial-200 font-sans leading-relaxed">
              Full transparency on the exact machine learning, vector retrieval, and application stack powering RiskRadar.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {stack.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.category}
                  className={`p-7 rounded-3xl bg-industrial-950 border ${item.border} space-y-5 shadow-xl hover:border-industrial-700 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-industrial-900 border border-industrial-800">
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="text-lg font-bold font-display text-industrial-50">
                      {item.category}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {item.items.map((tech) => (
                      <li key={tech} className="flex items-center gap-2.5 text-xs sm:text-sm font-mono text-industrial-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-safety-orange" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Feasibility Section (Priority 43) */}
        <div className="p-8 sm:p-12 rounded-3xl bg-industrial-950 border border-industrial-800 space-y-8 shadow-2xl">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-safety-amber/10 text-safety-amber font-mono text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> PRIORITY 43 &bull; LOW-COST HACKATHON MVP
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold font-display text-industrial-50">
              Engineered for Low-Cost Implementation & High Reliability
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feasibility.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-industrial-900 border border-industrial-800 space-y-3">
                <span className="inline-block text-xs font-mono text-safety-amber font-semibold bg-industrial-950 px-2.5 py-1 rounded border border-industrial-800">
                  {item.tag}
                </span>
                <h4 className="text-lg font-bold font-display text-industrial-100">{item.title}</h4>
                <p className="text-xs sm:text-sm text-industrial-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Challenge vs Mitigation Table (Priority 44) */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-industrial-950 border border-industrial-800 font-mono text-xs text-industrial-300">
              // TECHNICAL MITIGATION MATRIX
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50">
              Anticipating & Resolving Real Engineering Challenges
            </h3>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-industrial-700 bg-industrial-950 shadow-xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-industrial-800 bg-industrial-900/80 text-xs sm:text-sm font-mono text-industrial-300">
                  <th className="py-4 px-6 font-bold w-1/3">Engineering Challenge</th>
                  <th className="py-4 px-6 font-bold text-safety-orange">RiskRadar Architectural Solution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800 text-xs sm:text-sm">
                {mitigations.map((row) => (
                  <tr key={row.challenge} className="hover:bg-industrial-900/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-industrial-200 font-semibold">{row.challenge}</td>
                    <td className="py-4 px-6 text-industrial-100 font-sans flex items-center gap-2">
                      <Check className="w-4 h-4 text-safety-emerald shrink-0" />
                      <span>{row.solution}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}

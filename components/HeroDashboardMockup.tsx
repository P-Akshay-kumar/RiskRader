"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  Cpu,
  TrendingUp,
  Flame,
  CheckCircle2,
  Layers,
  Sparkles,
  BarChart3,
  ClipboardList,
} from "lucide-react";

export function HeroDashboardMockup() {
  const [activeAsset, setActiveAsset] = useState(0);

  const assets = [
    {
      tag: "PUMP-408B",
      name: "High-Pressure Catalytic Feed Pump",
      unit: "Cracker Unit 3",
      score: 87,
      level: "CRITICAL HAZARD",
      vibration: "7.8 mm/s (+140% vs baseline)",
      temp: "112.4°C (+34°C over threshold)",
      inspectionStatus: "Minor seal weeping noted in last inspection",
      ragCitation: "SOP-402 (Bearing Cavitation & Seal Inspection Protocol)",
      action: "Trigger immediate seal cooling & isolate secondary bypass valve.",
      ruleScore: "HIGH (92/100)",
      mlScore: "HIGH (84/100)",
      consequence: "CRITICAL",
      shapFactors: [
        { name: "Vibration Delta", impact: "+38%", color: "bg-safety-red" },
        { name: "Temperature Overheat", impact: "+29%", color: "bg-safety-orange" },
        { name: "Maintenance Delay (14d)", impact: "+18%", color: "bg-safety-amber" },
        { name: "Inspection History", impact: "+15%", color: "bg-safety-cyan" },
      ],
    },
    {
      tag: "COMP-102",
      name: "Turbine Gas Compressor A",
      unit: "Reformer Deck B",
      score: 64,
      level: "ELEVATED RISK",
      vibration: "4.2 mm/s (+45% vs baseline)",
      temp: "88.1°C (+12°C over threshold)",
      inspectionStatus: "Filter particulate accumulation flagged",
      ragCitation: "API 617 8th Ed & Plant SOP-112 (Compressor Maintenance)",
      action: "Schedule thermal imaging scan during next 12h shift cycle.",
      ruleScore: "MEDIUM (58/100)",
      mlScore: "HIGH (70/100)",
      consequence: "HIGH",
      shapFactors: [
        { name: "Filter Inspection", impact: "+32%", color: "bg-safety-orange" },
        { name: "Vibration Spike", impact: "+28%", color: "bg-safety-amber" },
        { name: "Temperature Drift", impact: "+24%", color: "bg-safety-cyan" },
        { name: "Operating Hours", impact: "+16%", color: "bg-industrial-400" },
      ],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAsset((prev) => (prev === 0 ? 1 : 0));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const current = assets[activeAsset];

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl border border-industrial-700/90 bg-industrial-950/95 shadow-2xl overflow-hidden backdrop-blur-xl group">
      {/* Representative Data Disclaimer Banner (Priority 11) */}
      <div className="bg-safety-orange/15 border-b border-safety-orange/30 px-4 py-2 text-center text-xs font-mono text-safety-orange flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="font-bold">PROTOTYPE DEMONSTRATION &bull; REPRESENTATIVE INDUSTRIAL DATA</span>
      </div>

      {/* Top Header of Dashboard (Priority 12) */}
      <div className="px-5 py-3.5 bg-industrial-900/90 border-b border-industrial-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-safety-red/80" />
            <div className="w-3 h-3 rounded-full bg-safety-amber/80" />
            <div className="w-3 h-3 rounded-full bg-safety-emerald/80" />
          </div>
          <div className="h-4 w-[1px] bg-industrial-800 mx-1" />
          <div className="flex items-center gap-2 text-xs font-mono text-industrial-200">
            <Cpu className="w-4 h-4 text-safety-orange" />
            <span className="font-semibold text-industrial-100">RISK_ENGINE // DEMO_FACILITY</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-safety-emerald/10 border border-safety-emerald/30 text-safety-emerald">
            <span className="w-2 h-2 rounded-full bg-safety-emerald animate-ping" />
            Multi-Source Ingestion Active
          </span>
          <span className="text-xs font-mono text-industrial-300">DEMO MODE</span>
        </div>
      </div>

      {/* Main Dashboard Body */}
      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Asset Risk Assessment & SHAP Explainability (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Risk Banner */}
          <motion.div
            key={current.tag}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-5 rounded-2xl border ${
              current.level.includes("CRITICAL")
                ? "bg-safety-red/10 border-safety-red/40 text-safety-red"
                : "bg-safety-amber/10 border-safety-amber/40 text-safety-amber"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-industrial-950 border border-current">
                    {current.tag}
                  </span>
                  <span className="text-xs font-mono font-bold tracking-wider uppercase">
                    {current.level}
                  </span>
                </div>
                <h4 className="text-lg font-bold font-display text-industrial-50">
                  {current.name}
                </h4>
                <p className="text-xs text-industrial-300 font-mono mt-0.5">{current.unit}</p>
              </div>

              {/* Risk Score Dial */}
              <div className="text-right flex flex-col items-end">
                <div className="text-3xl font-bold font-mono text-industrial-50 flex items-baseline gap-1">
                  <span>{current.score}</span>
                  <span className="text-xs text-industrial-400">/100</span>
                </div>
                <span className="text-[11px] font-mono text-industrial-300">HYBRID RISK SCORE</span>
              </div>
            </div>
          </motion.div>

          {/* Telemetry & Inspection Metrics */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800">
              <div className="flex items-center justify-between text-xs text-industrial-300 font-mono">
                <span className="flex items-center gap-1.5 font-medium">
                  <Activity className="w-4 h-4 text-safety-orange" /> Sensor Telemetry
                </span>
                <span className="text-safety-red text-xs font-bold">ELEVATED</span>
              </div>
              <div className="mt-2 text-xs font-mono font-semibold text-industrial-100">
                Vib: {current.vibration}
              </div>
              <div className="text-xs font-mono text-industrial-300 mt-1">
                Temp: {current.temp}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800">
              <div className="flex items-center justify-between text-xs text-industrial-300 font-mono">
                <span className="flex items-center gap-1.5 font-medium">
                  <ClipboardList className="w-4 h-4 text-safety-amber" /> Inspection Logs
                </span>
                <span className="text-safety-amber text-xs font-bold">FLAGGED</span>
              </div>
              <div className="mt-2 text-xs font-sans text-industrial-200 leading-snug">
                {current.inspectionStatus}
              </div>
            </div>
          </div>

          {/* SHAP Feature Contribution Breakdown (Priority 14) */}
          <div className="p-4.5 rounded-xl bg-industrial-900 border border-industrial-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-industrial-200 font-semibold">
                <BarChart3 className="w-4 h-4 text-safety-orange" />
                SHAP EXPLAINABILITY &bull; TOP RISK FACTORS
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-industrial-950 border border-industrial-700 text-safety-amber">
                SHAP Attribution
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {current.shapFactors.map((factor) => (
                <div key={factor.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-industrial-300">
                    <span>{factor.name}</span>
                    <span className="font-bold text-industrial-100">{factor.impact}</span>
                  </div>
                  <div className="w-full h-1.5 bg-industrial-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${factor.color} rounded-full`}
                      style={{ width: factor.impact.replace("+", "") }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RAG SOP Citation (Priority 35) */}
          <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-safety-amber font-semibold">
              <span className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-safety-orange" />
                RETRIEVED SOP EVIDENCE
              </span>
              <span className="text-xs font-mono text-industrial-400">RAG GROUNDED</span>
            </div>
            <div className="p-3 rounded-lg bg-industrial-950 border border-industrial-800 text-xs font-mono text-industrial-200">
              <span className="text-industrial-400 text-[11px] block">Source Document:</span>
              <p className="text-industrial-100 font-sans font-medium mt-0.5">{current.ragCitation}</p>
              <div className="mt-2 pt-2 border-t border-industrial-800 text-xs text-safety-emerald flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-safety-emerald" />
                <span><strong>Recommended Action:</strong> {current.action}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Decision Audit Trace Log (Priority 22) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Priority Queue Selection */}
          <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-industrial-300">
              <span className="flex items-center gap-1.5 text-industrial-200 font-semibold">
                <TrendingUp className="w-4 h-4 text-safety-orange" /> RISK PRIORITY QUEUE
              </span>
              <span className="text-xs text-industrial-400">RISK × CONSEQUENCE</span>
            </div>

            <div className="space-y-2">
              {assets.map((item, idx) => (
                <button
                  key={item.tag}
                  onClick={() => setActiveAsset(idx)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    activeAsset === idx
                      ? "bg-industrial-800 border-safety-orange text-industrial-50 shadow-md"
                      : "bg-industrial-950/70 border-industrial-800 text-industrial-400 hover:border-industrial-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-industrial-100">
                        {item.tag}
                      </span>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded ${
                          item.level.includes("CRITICAL")
                            ? "bg-safety-red/20 text-safety-red"
                            : "bg-safety-amber/20 text-safety-amber"
                        }`}
                      >
                        {item.consequence}
                      </span>
                    </div>
                    <p className="text-xs text-industrial-300 truncate max-w-[180px] mt-1">
                      {item.name}
                    </p>
                  </div>
                  <div className="font-mono text-base font-bold text-industrial-100">
                    {item.score}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Decision Audit Trail Trace Box (Priority 22) */}
          <div className="p-4 rounded-xl bg-industrial-950 border border-industrial-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-industrial-300 border-b border-industrial-800 pb-2">
              <span className="text-safety-orange font-bold">// DECISION AUDIT TRACE</span>
              <span className="text-[11px] text-industrial-400">TRACEABLE LOG</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs text-industrial-300">
              <div className="flex justify-between">
                <span className="text-industrial-400">Asset:</span>
                <span className="text-industrial-100 font-bold">{current.tag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-industrial-400">Rule Score:</span>
                <span className="text-industrial-200">{current.ruleScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-industrial-400">XGBoost ML Score:</span>
                <span className="text-industrial-200">{current.mlScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-industrial-400">Operational Consequence:</span>
                <span className="text-safety-orange font-semibold">{current.consequence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-industrial-400">SOP Evidence:</span>
                <span className="text-safety-amber truncate max-w-[140px]">{current.ragCitation.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

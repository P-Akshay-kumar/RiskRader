"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  Cpu,
  TrendingUp,
  Zap,
  CheckCircle2,
  Flame,
  Gauge,
  Layers,
  Sparkles,
} from "lucide-react";

export function HeroDashboardMockup() {
  const [activeAsset, setActiveAsset] = useState(0);

  const assets = [
    {
      tag: "PUMP-408B",
      name: "High-Pressure Catalytic Feed Pump",
      unit: "Cracker Unit 3",
      score: 87,
      level: "CRITICAL",
      vibration: "7.8 mm/s (+140%)",
      temp: "112.4°C (+34°C)",
      ragCitation: "OSHA 1910.119 Appendix C & SOP-402 (Bearing Cavitation Warning)",
      action: "Trigger immediate seal cooling & isolate secondary bypass valve within 45 mins.",
      ruleTrigger: "Rule #304: Temp > 105°C AND Vibration delta > 2.5x threshold",
    },
    {
      tag: "COMP-102",
      name: "Turbine Gas Compressor A",
      unit: "Reformer Deck B",
      score: 64,
      level: "ELEVATED",
      vibration: "4.2 mm/s (+45%)",
      temp: "88.1°C (+12°C)",
      ragCitation: "API 617 8th Ed - Compressor Safety SOP-112",
      action: "Schedule thermal imaging check during next 12h shift cycle.",
      ruleTrigger: "ML Anomaly Detection: Spectral harmonics shift (0.89 confidence)",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAsset((prev) => (prev === 0 ? 1 : 0));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const current = assets[activeAsset];

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl border border-industrial-700/80 bg-industrial-950/90 shadow-2xl overflow-hidden backdrop-blur-xl group">
      {/* Top Bar Header of Dashboard */}
      <div className="px-4 sm:px-6 py-3 bg-industrial-900/90 border-b border-industrial-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-safety-red/80" />
            <div className="w-3 h-3 rounded-full bg-safety-amber/80" />
            <div className="w-3 h-3 rounded-full bg-safety-emerald/80" />
          </div>
          <div className="h-4 w-[1px] bg-industrial-800 mx-1" />
          <div className="flex items-center gap-2 text-xs font-mono text-industrial-300">
            <Cpu className="w-3.5 h-3.5 text-safety-orange" />
            <span>RISK_ENGINE // FACILITY_NORTH_AMERICA</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-safety-emerald/10 border border-safety-emerald/20 text-safety-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-safety-emerald animate-ping" />
            Continuous Ingestion (1,420 Hz)
          </span>
          <span className="text-xs font-mono text-industrial-400">19:42:43 UTC</span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Asset Risk Detail (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Alert Banner */}
          <motion.div
            key={current.tag}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-xl border ${
              current.level === "CRITICAL"
                ? "bg-safety-red/10 border-safety-red/30 text-safety-red"
                : "bg-safety-amber/10 border-safety-amber/30 text-safety-amber"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-industrial-950/80 border border-current">
                    {current.tag}
                  </span>
                  <span className="text-xs font-mono tracking-wider font-semibold">
                    {current.level} RISK DETECTED
                  </span>
                </div>
                <h4 className="mt-2 text-base font-semibold text-industrial-50 font-display">
                  {current.name}
                </h4>
                <p className="text-xs text-industrial-400 font-mono mt-0.5">{current.unit}</p>
              </div>

              {/* Score Meter Dial */}
              <div className="text-right flex flex-col items-end">
                <div className="text-2xl font-bold font-mono text-industrial-50 flex items-baseline gap-1">
                  <span>{current.score}</span>
                  <span className="text-xs text-industrial-400">/100</span>
                </div>
                <span className="text-[10px] font-mono text-industrial-400">RISK INDEX</span>
              </div>
            </div>
          </motion.div>

          {/* Real-time Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-800">
              <div className="flex items-center justify-between text-xs text-industrial-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-safety-orange" /> Vibration Delta
                </span>
                <span className="text-safety-red text-[10px] font-bold">HIGH</span>
              </div>
              <div className="mt-2 text-sm font-mono font-semibold text-industrial-100">
                {current.vibration}
              </div>
              {/* Simulated Sine Wave Telemetry SVG */}
              <div className="mt-2 h-6 w-full flex items-end">
                <svg className="w-full h-full text-safety-orange" viewBox="0 0 100 25">
                  <path
                    d="M 0 12 Q 10 2, 20 12 T 40 12 T 60 2 T 80 22 T 100 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-800">
              <div className="flex items-center justify-between text-xs text-industrial-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-safety-amber" /> Thermal Sensor
                </span>
                <span className="text-safety-amber text-[10px] font-bold">ELEVATED</span>
              </div>
              <div className="mt-2 text-sm font-mono font-semibold text-industrial-100">
                {current.temp}
              </div>
              <div className="mt-2 h-6 w-full flex items-end">
                <svg className="w-full h-full text-safety-amber" viewBox="0 0 100 25">
                  <path
                    d="M 0 18 Q 15 5, 30 15 T 60 8 T 90 20 T 100 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* RAG Citation Box */}
          <div className="p-3.5 rounded-xl bg-industrial-900/90 border border-industrial-700/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-safety-amber font-semibold">
                <FileCheck2 className="w-4 h-4 text-safety-orange" />
                <span>RAG EXPLANATION LAYER (GROUNDED IN SOP)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-safety-orange/10 text-safety-orange border border-safety-orange/20">
                100% CITED
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-industrial-950 border border-industrial-800 text-xs font-mono text-industrial-200 leading-relaxed">
              <span className="text-industrial-400 block mb-1">Citation Reference:</span>
              <p className="text-industrial-100 font-sans font-medium">&quot;{current.ragCitation}&quot;</p>
              <div className="mt-2 pt-2 border-t border-industrial-800 text-[11px] text-safety-emerald flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span><strong>Recommended Procedure:</strong> {current.action}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Asset Queue & Hybrid Engine Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-industrial-300">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-safety-orange" /> RISK PRIORITY QUEUE
              </span>
              <span className="text-[10px] text-industrial-400">42 ASSETS MONITORED</span>
            </div>

            <div className="space-y-2">
              {assets.map((item, idx) => (
                <button
                  key={item.tag}
                  onClick={() => setActiveAsset(idx)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                    activeAsset === idx
                      ? "bg-industrial-800 border-safety-orange text-industrial-50 shadow-md"
                      : "bg-industrial-950/60 border-industrial-800 text-industrial-400 hover:border-industrial-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-industrial-100">
                        {item.tag}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          item.level === "CRITICAL"
                            ? "bg-safety-red/20 text-safety-red"
                            : "bg-safety-amber/20 text-safety-amber"
                        }`}
                      >
                        {item.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-industrial-300 truncate max-w-[170px] mt-0.5">
                      {item.name}
                    </p>
                  </div>
                  <div className="font-mono text-sm font-bold text-industrial-100">
                    {item.score}
                  </div>
                </button>
              ))}

              <div className="p-2.5 rounded-lg bg-industrial-950/40 border border-industrial-800/60 flex items-center justify-between text-xs text-industrial-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-safety-emerald" />
                  <span>VALVE-881 (Boiler Line B)</span>
                </div>
                <span className="text-industrial-400 font-bold">12 / NORMAL</span>
              </div>
            </div>
          </div>

          {/* Engine Multi-layer architecture status */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-industrial-900 to-industrial-850 border border-industrial-800">
            <div className="flex items-center justify-between text-xs font-mono text-industrial-300 mb-2">
              <span className="flex items-center gap-1.5 text-safety-orange">
                <Layers className="w-3.5 h-3.5" /> ENGINE ARCHITECTURE
              </span>
              <span className="text-[10px] text-industrial-400">HYBRID MODE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-industrial-950 border border-industrial-800">
                <div className="text-industrial-400 text-[9px]">LAYER 1</div>
                <div className="text-industrial-200 font-medium">Rule + ML Engine</div>
                <div className="text-safety-emerald text-[9px] mt-0.5">0% Hallucination</div>
              </div>
              <div className="p-2 rounded bg-industrial-950 border border-industrial-800">
                <div className="text-industrial-400 text-[9px]">LAYER 2</div>
                <div className="text-industrial-200 font-medium">RAG SOP Grounding</div>
                <div className="text-safety-cyan text-[9px] mt-0.5">Vector Retr. Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

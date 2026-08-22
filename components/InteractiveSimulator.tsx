"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  Gauge,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export function InteractiveSimulator() {
  // Slider states
  const [vibration, setVibration] = useState(4.8); // mm/s (0.5 to 12.0)
  const [temperature, setTemperature] = useState(82); // °C (30 to 140)
  const [daysOverdue, setDaysOverdue] = useState(14); // Days (0 to 90)

  // Calculate dynamic risk score mathematically
  // Base normal baseline: Vib 2.0, Temp 60, Days 0 => Score ~ 10
  const vibFactor = Math.min(100, (vibration / 10) * 40);
  const tempFactor = Math.min(100, (temperature / 120) * 35);
  const daysFactor = Math.min(100, (daysOverdue / 60) * 25);
  const rawScore = Math.round(vibFactor + tempFactor + daysFactor);
  const riskScore = Math.min(99, Math.max(8, rawScore));

  // Determine risk tier
  let riskTier = "LOW";
  let tierColor = "text-safety-emerald";
  let tierBg = "bg-safety-emerald/10 border-safety-emerald/30";
  let ragSop = "SOP-101: Routine Visual & Lubrication Check (Quarterly)";
  let ragAction = "Equipment operating within normal physical parameters. Next inspection on schedule.";

  if (riskScore >= 75) {
    riskTier = "CRITICAL HAZARD";
    tierColor = "text-safety-red";
    tierBg = "bg-safety-red/15 border-safety-red/40";
    ragSop = "OSHA 1910.119 App C & Plant SOP-408: Critical Thermal/Vibration Isolation";
    ragAction = "IMMEDIATE ACTION REQUIRED: Reduce manifold pressure by 20% & dispatch Level 3 technician within 30 minutes.";
  } else if (riskScore >= 45) {
    riskTier = "ELEVATED RISK";
    tierColor = "text-safety-amber";
    tierBg = "bg-safety-amber/15 border-safety-amber/40";
    ragSop = "SOP-204 Section 3.2: Secondary Bearing Alignment & Lubrication Flush";
    ragAction = "Schedule thermal imaging scan and bearing vibration analysis during upcoming 12-hour shift.";
  }

  const handleReset = () => {
    setVibration(2.2);
    setTemperature(58);
    setDaysOverdue(2);
  };

  return (
    <section id="simulator" className="py-24 bg-industrial-950 border-t border-industrial-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-safety-orange/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-industrial-900 border border-safety-orange/40 text-xs font-mono text-safety-orange">
            <Sliders className="w-3.5 h-3.5" />
            INTERACTIVE RISK ENGINE SANDBOX
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            Test the <span className="text-gradient-orange">Risk Engine</span> Yourself
          </h2>
          <p className="text-base sm:text-lg text-industrial-300 font-sans leading-relaxed">
            Adjust telemetry variables below and observe how RiskRadar recalculates asset risk scores and retrieves grounded SOP recommendations in real time.
          </p>
        </div>

        {/* Sandbox Simulator Interface Card */}
        <div className="mt-12 max-w-5xl mx-auto p-6 sm:p-10 rounded-3xl bg-industrial-900 border border-industrial-700/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Input Controls (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-industrial-400 uppercase tracking-wider">
                // INPUT TELEMETRY PARAMETERS
              </span>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-industrial-400 hover:text-industrial-100 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Parameters
              </button>
            </div>

            {/* Slider 1: Vibration Level */}
            <div className="space-y-2 p-4 rounded-xl bg-industrial-950 border border-industrial-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-industrial-300">Vibration Level (FFT Delta)</span>
                <span className="text-safety-orange font-bold">{vibration.toFixed(1)} mm/s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.1"
                value={vibration}
                onChange={(e) => setVibration(parseFloat(e.target.value))}
                className="w-full h-2 bg-industrial-800 rounded-lg appearance-none cursor-pointer accent-safety-orange"
              />
              <div className="flex justify-between text-[10px] font-mono text-industrial-500">
                <span>0.5 mm/s (Normal)</span>
                <span>6.0 (Elevated)</span>
                <span>12.0 (Extreme)</span>
              </div>
            </div>

            {/* Slider 2: Bearing Temperature */}
            <div className="space-y-2 p-4 rounded-xl bg-industrial-950 border border-industrial-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-industrial-300">Bearing Temperature</span>
                <span className="text-safety-amber font-bold">{temperature}°C</span>
              </div>
              <input
                type="range"
                min="30"
                max="140"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value))}
                className="w-full h-2 bg-industrial-800 rounded-lg appearance-none cursor-pointer accent-safety-amber"
              />
              <div className="flex justify-between text-[10px] font-mono text-industrial-500">
                <span>30°C (Ambient)</span>
                <span>85°C (Threshold)</span>
                <span>140°C (Critical)</span>
              </div>
            </div>

            {/* Slider 3: Days Overdue for Service */}
            <div className="space-y-2 p-4 rounded-xl bg-industrial-950 border border-industrial-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-industrial-300">Days Since Last Service Audit</span>
                <span className="text-industrial-100 font-bold">{daysOverdue} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={daysOverdue}
                onChange={(e) => setDaysOverdue(parseInt(e.target.value))}
                className="w-full h-2 bg-industrial-800 rounded-lg appearance-none cursor-pointer accent-industrial-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-industrial-500">
                <span>0 (Serviced Today)</span>
                <span>30 Days</span>
                <span>90 Days Overdue</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Output & RAG Grounding Box (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-mono text-industrial-400 uppercase tracking-wider">
              // ENGINE COMPUTATION OUTPUT
            </div>

            {/* Calculated Risk Dial & Banner */}
            <div className={`p-6 rounded-2xl border transition-all ${tierBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-mono font-bold tracking-wider uppercase ${tierColor}`}>
                    {riskTier}
                  </span>
                  <h4 className="text-xl font-bold font-display text-industrial-50 mt-1">
                    Asset #PUMP-408B Assessment
                  </h4>
                </div>

                <div className="text-right">
                  <div className={`text-4xl font-bold font-mono ${tierColor}`}>
                    {riskScore}
                  </div>
                  <span className="text-[10px] font-mono text-industrial-400">RISK SCORE / 100</span>
                </div>
              </div>
            </div>

            {/* Live RAG Citation Grounding Output */}
            <div className="p-5 rounded-2xl bg-industrial-950 border border-industrial-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-safety-cyan">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> RAG DOCUMENT CITATION
                </span>
                <span className="text-[10px] text-industrial-400">0% HALLUCINATION</span>
              </div>

              <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-800 text-xs font-mono text-industrial-200">
                <div className="text-industrial-400 text-[10px] mb-1">CITING MANUAL SECTION:</div>
                <div className="font-semibold text-industrial-100">&quot;{ragSop}&quot;</div>
              </div>

              <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-800 text-xs font-sans text-industrial-300 space-y-1">
                <div className="font-mono text-[10px] text-safety-emerald font-bold">RECOMMENDED INSTRUCTION:</div>
                <p className="text-industrial-100 leading-relaxed font-medium">{ragAction}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

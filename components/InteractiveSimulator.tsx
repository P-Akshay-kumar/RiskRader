"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  FileCheck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Flame,
  Activity,
  BarChart2,
} from "lucide-react";

export function InteractiveSimulator() {
  // Input parameters
  const [vibration, setVibration] = useState(4.8); // mm/s
  const [temperature, setTemperature] = useState(82); // °C
  const [daysOverdue, setDaysOverdue] = useState(14); // days
  const [inspectionCondition, setInspectionCondition] = useState<"Normal" | "Minor Abnormality" | "Severe Defect">("Minor Abnormality");
  const [consequence, setConsequence] = useState<"Low" | "Medium" | "High" | "Critical">("Critical");

  // Calculate dynamic risk score mathematically
  const vibFactor = Math.min(100, (vibration / 12) * 35);
  const tempFactor = Math.min(100, (temperature / 140) * 30);
  const daysFactor = Math.min(100, (daysOverdue / 90) * 20);
  const inspFactor = inspectionCondition === "Severe Defect" ? 25 : inspectionCondition === "Minor Abnormality" ? 12 : 0;
  
  const rawScore = Math.round(vibFactor + tempFactor + daysFactor + inspFactor);
  const riskScore = Math.min(99, Math.max(10, rawScore));

  // Determine risk level
  let riskLevel = "LOW";
  let tierColor = "text-safety-emerald";
  let tierBg = "bg-safety-emerald/10 border-safety-emerald/30";
  let ragSop = "SOP-101 Section 2.1: Quarterly Visual Inspection & Lubrication";
  let ragAction = "Equipment operating within normal parameters. Next routine inspection on schedule.";

  if (riskScore >= 70) {
    riskLevel = "HIGH RISK";
    tierColor = "text-safety-red";
    tierBg = "bg-safety-red/15 border-safety-red/40";
    ragSop = "SOP-402 Section 3.2: High-Pressure Seal & Cavitation Protocol";
    ragAction = "Dispatch Level 3 inspector immediately. Trigger seal cooling loop & inspect primary intake manifold.";
  } else if (riskScore >= 40) {
    riskLevel = "ELEVATED RISK";
    tierColor = "text-safety-amber";
    tierBg = "bg-safety-amber/15 border-safety-amber/40";
    ragSop = "SOP-204 Section 4.1: Bearing Alignment & Thermal Monitoring";
    ragAction = "Schedule thermal imaging scan and vibration spectral check during next 12-hour shift.";
  }

  // Determine Final Priority (Risk x Consequence) - Priority 34
  let finalPriority = "LOW PRIORITY";
  let priorityBadgeBg = "bg-industrial-800 text-industrial-300";

  if (riskLevel === "HIGH RISK" && (consequence === "Critical" || consequence === "High")) {
    finalPriority = "CRITICAL PRIORITY #1";
    priorityBadgeBg = "bg-safety-red text-white font-bold";
  } else if (riskLevel === "HIGH RISK" || (riskLevel === "ELEVATED RISK" && (consequence === "Critical" || consequence === "High"))) {
    finalPriority = "HIGH PRIORITY";
    priorityBadgeBg = "bg-safety-orange text-white font-bold";
  } else if (riskLevel === "ELEVATED RISK" || consequence === "Medium") {
    finalPriority = "MEDIUM PRIORITY";
    priorityBadgeBg = "bg-safety-amber/30 text-safety-amber font-bold border border-safety-amber/40";
  }

  const handleReset = () => {
    setVibration(2.2);
    setTemperature(58);
    setDaysOverdue(2);
    setInspectionCondition("Normal");
    setConsequence("Low");
  };

  return (
    <section id="simulator" className="py-24 bg-industrial-950 border-t border-industrial-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-safety-orange/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header (Priority 32) */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-industrial-900 border border-safety-orange/40 text-xs sm:text-sm font-mono text-safety-orange font-semibold">
            <Sliders className="w-4 h-4" />
            PROTOTYPE DEMONSTRATION &bull; REPRESENTATIVE DATA
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            Test the <span className="text-gradient-orange">Risk Engine</span> Yourself
          </h2>
          <p className="text-base sm:text-xl text-industrial-200 font-sans leading-relaxed">
            Adjust telemetry, inspection condition, and operational consequence variables below to observe real-time calculation of <strong className="text-industrial-50 font-semibold">Risk × Consequence</strong> priority and retrieved SOP evidence.
          </p>
        </div>

        {/* Sandbox Simulator Card */}
        <div className="mt-12 max-w-5xl mx-auto p-6 sm:p-10 rounded-3xl bg-industrial-900 border border-industrial-700/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Inputs (6 Cols - Priority 33 & 34) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-industrial-300 font-bold uppercase tracking-wider">
                // INPUT VARIABLES (4 DATA STREAMS)
              </span>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-industrial-400 hover:text-industrial-100 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Controls
              </button>
            </div>

            {/* Slider 1: Vibration Level */}
            <div className="space-y-2 p-4 rounded-2xl bg-industrial-950 border border-industrial-800">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-industrial-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-safety-orange" /> Vibration Level (Sensor)
                </span>
                <span className="text-safety-orange font-bold">{vibration.toFixed(1)} mm/s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.1"
                value={vibration}
                onChange={(e) => setVibration(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-industrial-800 rounded-lg appearance-none cursor-pointer accent-safety-orange"
              />
            </div>

            {/* Slider 2: Bearing Temperature */}
            <div className="space-y-2 p-4 rounded-2xl bg-industrial-950 border border-industrial-800">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-industrial-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-safety-amber" /> Temperature (°C Sensor)
                </span>
                <span className="text-safety-amber font-bold">{temperature}°C</span>
              </div>
              <input
                type="range"
                min="30"
                max="140"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value))}
                className="w-full h-2.5 bg-industrial-800 rounded-lg appearance-none cursor-pointer accent-safety-amber"
              />
            </div>

            {/* Slider 3: Maintenance Delay */}
            <div className="space-y-2 p-4 rounded-2xl bg-industrial-950 border border-industrial-800">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-industrial-200">Maintenance / Service Delay</span>
                <span className="text-industrial-100 font-bold">{daysOverdue} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={daysOverdue}
                onChange={(e) => setDaysOverdue(parseInt(e.target.value))}
                className="w-full h-2.5 bg-industrial-800 rounded-lg appearance-none cursor-pointer accent-industrial-400"
              />
            </div>

            {/* Selector 4: Inspection Condition (Priority 33) */}
            <div className="space-y-2 p-4 rounded-2xl bg-industrial-950 border border-industrial-800">
              <div className="flex justify-between text-xs sm:text-sm font-mono mb-1">
                <span className="text-industrial-200 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-safety-cyan" /> Physical Inspection Condition
                </span>
              </div>
              <select
                value={inspectionCondition}
                onChange={(e) => setInspectionCondition(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-industrial-900 border border-industrial-700 rounded-xl text-xs sm:text-sm text-industrial-50 focus:outline-none focus:border-safety-orange font-mono"
              >
                <option value="Normal">Normal (No Defects)</option>
                <option value="Minor Abnormality">Minor Abnormality (Weeping/Wear)</option>
                <option value="Severe Defect">Severe Defect (Cracks/Leaks)</option>
              </select>
            </div>

            {/* Selector 5: Operational Consequence (Priority 34) */}
            <div className="space-y-2 p-4 rounded-2xl bg-industrial-950 border border-industrial-800">
              <div className="flex justify-between text-xs sm:text-sm font-mono mb-1">
                <span className="text-industrial-200 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-safety-yellow" /> Operational Consequence (Impact)
                </span>
              </div>
              <select
                value={consequence}
                onChange={(e) => setConsequence(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-industrial-900 border border-industrial-700 rounded-xl text-xs sm:text-sm text-industrial-50 focus:outline-none focus:border-safety-orange font-mono"
              >
                <option value="Low">Low Consequence (Non-Critical Auxiliary)</option>
                <option value="Medium">Medium Consequence (Secondary Loop)</option>
                <option value="High">High Consequence (Primary Process Line)</option>
                <option value="Critical">Critical Consequence (Plant-Wide Shutdown Risk)</option>
              </select>
            </div>
          </div>

          {/* Right Column: Engine Output & Prioritization Matrix (6 Cols - Priority 34 & 35) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-mono text-industrial-300 font-bold uppercase tracking-wider">
              // ENGINE COMPUTATION OUTPUT
            </div>

            {/* Calculated Risk x Consequence Card */}
            <div className={`p-6 rounded-3xl border transition-all space-y-4 ${tierBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-mono font-bold tracking-wider uppercase ${tierColor}`}>
                    RISK LEVEL: {riskLevel}
                  </span>
                  <h4 className="text-xl font-bold font-display text-industrial-50 mt-1">
                    Asset #PUMP-408B Assessment
                  </h4>
                </div>

                <div className="text-right">
                  <div className={`text-4xl font-bold font-mono ${tierColor}`}>
                    {riskScore}
                  </div>
                  <span className="text-xs font-mono text-industrial-300">RISK INDEX / 100</span>
                </div>
              </div>

              {/* Risk x Consequence Final Priority Pill (Priority 34) */}
              <div className="p-3.5 rounded-2xl bg-industrial-950 border border-industrial-800 flex items-center justify-between text-xs sm:text-sm font-mono">
                <span className="text-industrial-300 font-semibold">RISK × CONSEQUENCE:</span>
                <span className={`px-3 py-1 rounded-xl ${priorityBadgeBg}`}>
                  {finalPriority}
                </span>
              </div>
            </div>

            {/* RAG Citation Box (Priority 35 & 36) */}
            <div className="p-5 rounded-2xl bg-industrial-950 border border-industrial-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-safety-cyan font-bold">
                <span className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" /> RETRIEVED SOP EVIDENCE
                </span>
                <span className="text-[11px] text-industrial-400">RAG GROUNDED</span>
              </div>

              <div className="p-3.5 rounded-xl bg-industrial-900 border border-industrial-800 text-xs sm:text-sm font-mono">
                <div className="text-industrial-400 text-xs mb-1 font-semibold">SOURCE DOCUMENT:</div>
                <div className="font-semibold text-industrial-100">&quot;{ragSop}&quot;</div>
              </div>

              <div className="p-3.5 rounded-xl bg-industrial-900 border border-industrial-800 text-xs sm:text-sm font-sans text-industrial-200 space-y-1">
                <div className="font-mono text-xs text-safety-emerald font-bold">SOP-GROUNDED RECOMMENDED ACTION:</div>
                <p className="text-industrial-100 leading-relaxed font-medium">{ragAction}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

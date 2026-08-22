"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, ShieldAlert, Zap, Layers, Sparkles } from "lucide-react";

export function WhyDifferentSection() {
  const comparison = [
    {
      feature: "Risk Engine Methodology",
      riskRadar: "Hybrid Rule + Ensemble ML (0% Hallucination)",
      genericDashboards: "Static SCADA Upper/Lower Bound Alarms",
      manualChecklists: "Subjective Visual Inspections",
      highlight: true,
    },
    {
      feature: "Safety Procedure Explanations",
      riskRadar: "Exact Vector RAG SOP & OSHA Section Citation",
      genericDashboards: "None (Raw sensor values only)",
      manualChecklists: "Memory or Paper Binder Lookup",
      highlight: true,
    },
    {
      feature: "Early Detection Window",
      riskRadar: "7–21 Days Before Physical Failure",
      genericDashboards: "Seconds After Threshold Tripped",
      manualChecklists: "Post-Incident Audit Review",
      highlight: true,
    },
    {
      feature: "Inspector Prioritization",
      riskRadar: "Automated Dynamic Risk Index Ranking",
      genericDashboards: "Flat Equal-Priority Alarm Wall",
      manualChecklists: "Static Calendar Routing",
      highlight: false,
    },
    {
      feature: "Compliance Audit Trail",
      riskRadar: "Immutable Vector Lineage Ledger",
      genericDashboards: "Ephemeral Telemetry Logs",
      manualChecklists: "Handwritten Paper Folders",
      highlight: false,
    },
  ];

  return (
    <section id="why-us" className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-safety-amber/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-industrial-950 border border-industrial-700 text-xs font-mono text-safety-amber">
            <Zap className="w-3.5 h-3.5" />
            THE COMPETITIVE ADVANTAGE
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            Why RiskRadar Stands <span className="text-gradient-orange">Apart</span>
          </h2>
          <p className="text-base sm:text-lg text-industrial-300 font-sans leading-relaxed">
            See how RiskRadar contrasts against legacy SCADA alarm screens and manual paper checklist safety routines.
          </p>
        </div>

        {/* Comparison Table / Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 overflow-x-auto rounded-2xl border border-industrial-700 bg-industrial-950 shadow-2xl"
        >
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-industrial-800 bg-industrial-900/90 text-xs font-mono">
                <th className="py-4 px-6 text-industrial-400 font-normal uppercase tracking-wider w-1/4">
                  Evaluation Dimension
                </th>
                <th className="py-4 px-6 bg-safety-orange/10 border-x border-safety-orange/30 text-safety-orange font-bold text-sm">
                  RiskRadar (Hybrid AI + RAG)
                </th>
                <th className="py-4 px-6 text-industrial-300 font-semibold w-1/4">
                  Generic SCADA Dashboards
                </th>
                <th className="py-4 px-6 text-industrial-300 font-semibold w-1/4">
                  Manual Paper Checklists
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800 text-sm">
              {comparison.map((row) => (
                <tr key={row.feature} className="hover:bg-industrial-900/50 transition-colors">
                  <td className="py-4 px-6 font-display font-medium text-industrial-200">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 bg-safety-orange/5 border-x border-safety-orange/20 font-semibold text-industrial-50">
                    <div className="flex items-center gap-2">
                      <span className="p-0.5 rounded bg-safety-orange/20 text-safety-orange">
                        <Check className="w-4 h-4" />
                      </span>
                      <span>{row.riskRadar}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-industrial-400">
                    <div className="flex items-center gap-2">
                      <span className="p-0.5 rounded bg-industrial-800 text-industrial-500">
                        <X className="w-3.5 h-3.5" />
                      </span>
                      <span>{row.genericDashboards}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-industrial-400">
                    <div className="flex items-center gap-2">
                      <span className="p-0.5 rounded bg-industrial-800 text-industrial-500">
                        <X className="w-3.5 h-3.5" />
                      </span>
                      <span>{row.manualChecklists}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

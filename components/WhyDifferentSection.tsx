"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";

export function WhyDifferentSection() {
  const comparison = [
    {
      feature: "Risk Detection Methodology",
      riskRadar: "Rules + XGBoost Classifier",
      genericDashboards: "Threshold alarms (static limits)",
      manualChecklists: "Human visual judgment",
    },
    {
      feature: "Explainability Model",
      riskRadar: "Risk factors + SHAP feature attribution",
      genericDashboards: "Limited (Raw sensor value only)",
      manualChecklists: "Manual inspection notes",
    },
    {
      feature: "Safety Evidence Retrieval",
      riskRadar: "RAG vector retrieval of plant SOPs & OEM manuals",
      genericDashboards: "Usually none",
      manualChecklists: "Manual binder lookup",
    },
    {
      feature: "Action Prioritization",
      riskRadar: "Risk × Consequence Smart Matrix",
      genericDashboards: "Alarm severity (flat wall)",
      manualChecklists: "Manual calendar scheduling",
    },
    {
      feature: "Auditability & Traceability",
      riskRadar: "Decision audit log (full reasoning trace)",
      genericDashboards: "System logs (raw telemetry)",
      manualChecklists: "Paper inspection folders",
    },
    {
      feature: "Safety Recommendations",
      riskRadar: "Grounded SOP guidance steps",
      genericDashboards: "Alerts only (no guidance)",
      manualChecklists: "Manual technician experience",
    },
  ];

  return (
    <section className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-safety-amber/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-industrial-950 border border-industrial-700 text-xs sm:text-sm font-mono text-safety-amber font-semibold">
            <Zap className="w-4 h-4" />
            PRIORITY 31 &bull; DEFENSIBLE COMPARATIVE EVALUATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight">
            How RiskRadar Compares <span className="text-gradient-orange">Side-by-Side</span>
          </h2>
          <p className="text-base sm:text-xl text-industrial-200 font-sans leading-relaxed">
            Contrasting RiskRadar&apos;s hybrid architecture against conventional SCADA monitoring screens and manual paper checklist routines.
          </p>
        </div>

        {/* Comparison Table / Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 overflow-x-auto rounded-3xl border border-industrial-700 bg-industrial-950 shadow-2xl"
        >
          <table className="w-full min-w-[750px] text-left border-collapse">
            <thead>
              <tr className="border-b border-industrial-800 bg-industrial-900/90 text-sm font-mono">
                <th className="py-5 px-6 text-industrial-300 font-bold uppercase tracking-wider w-1/4">
                  Evaluation Dimension
                </th>
                <th className="py-5 px-6 bg-safety-orange/10 border-x border-safety-orange/40 text-safety-orange font-bold text-base">
                  RiskRadar (Rules + XGBoost + RAG)
                </th>
                <th className="py-5 px-6 text-industrial-200 font-bold w-1/4">
                  Traditional Monitoring
                </th>
                <th className="py-5 px-6 text-industrial-200 font-bold w-1/4">
                  Manual Paper Review
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800 text-sm sm:text-base">
              {comparison.map((row) => (
                <tr key={row.feature} className="hover:bg-industrial-900/50 transition-colors">
                  <td className="py-5 px-6 font-display font-semibold text-industrial-100">
                    {row.feature}
                  </td>
                  <td className="py-5 px-6 bg-safety-orange/5 border-x border-safety-orange/20 font-bold text-industrial-50">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1 rounded bg-safety-orange/20 text-safety-orange shrink-0">
                        <Check className="w-4 h-4" />
                      </span>
                      <span>{row.riskRadar}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-industrial-300 font-normal">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1 rounded bg-industrial-850 text-industrial-400 shrink-0">
                        <X className="w-4 h-4" />
                      </span>
                      <span>{row.genericDashboards}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-industrial-300 font-normal">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1 rounded bg-industrial-850 text-industrial-400 shrink-0">
                        <X className="w-4 h-4" />
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

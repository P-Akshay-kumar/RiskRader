"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Clock, DollarSign, FileWarning, ShieldX, TrendingDown } from "lucide-react";

export function ProblemSection() {
  const stats = [
    {
      value: "$1.4M",
      label: "Average Cost per Unplanned Outage",
      subtext: "Direct loss from emergency shutdowns, equipment destruction, and OSHA fine penalties.",
      icon: DollarSign,
      color: "text-safety-red",
      bg: "bg-safety-red/10 border-safety-red/20",
    },
    {
      value: "78%",
      label: "Unflagged Anomaly Signals",
      subtext: "Minor thermal shifts and vibration spikes ignored by conventional static alarm thresholds.",
      icon: TrendingDown,
      color: "text-safety-orange",
      bg: "bg-safety-orange/10 border-safety-orange/20",
    },
    {
      value: "4.2 Hours",
      label: "Daily Manual Audit Lag",
      subtext: "Time safety officers waste manually sifting through PDF inspection logs & scattered ERP records.",
      icon: Clock,
      color: "text-safety-amber",
      bg: "bg-safety-amber/10 border-safety-amber/20",
    },
  ];

  return (
    <section id="problem" className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-safety-red/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-safety-red/10 border border-safety-red/20 text-xs font-mono text-safety-red mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            THE REACTIVE SAFETY CRISIS
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight leading-tight">
            Industrial Plants Are Managing Risk <span className="text-safety-red">In Reverse.</span>
          </h2>
          <p className="mt-4 text-lg text-industrial-300 leading-relaxed font-sans">
            Most industrial facilities rely on periodic manual inspections and post-mortem incident reviews after something has already broken. By the time a traditional alarm sounds, equipment is already damaged and lives are put at risk.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-6 sm:p-8 rounded-2xl bg-industrial-950 border border-industrial-800 hover:border-industrial-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="text-xs font-mono text-industrial-400">METRIC // 0{idx + 1}</span>
                  </div>

                  <div className={`mt-6 text-4xl sm:text-5xl font-bold font-mono tracking-tight ${stat.color}`}>
                    {stat.value}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold font-display text-industrial-100">
                    {stat.label}
                  </h3>
                  <p className="mt-2 text-sm text-industrial-400 leading-relaxed">
                    {stat.subtext}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-industrial-800/80 flex items-center justify-between text-xs font-mono text-industrial-400">
                  <span>STATUS: CONVENTIONAL RISK</span>
                  <span className="text-safety-red font-semibold">REACTIVE</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparative Contrast Box: Manual vs RiskRadar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 p-6 sm:p-8 rounded-2xl bg-industrial-950 border border-industrial-700/80 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          {/* Legacy Approach */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-safety-red font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldX className="w-4 h-4" /> Legacy Manual Audits
            </div>
            <h4 className="text-xl font-bold font-display text-industrial-100">
              Fragmented PDFs & Post-Accident Audits
            </h4>
            <p className="text-sm text-industrial-400 leading-relaxed">
              Paper checklists and isolated SCADA dashboards hide compounding multi-variable risks until cataclysmic structural or mechanical failure occurs.
            </p>
          </div>

          {/* RiskRadar Approach */}
          <div className="p-6 rounded-xl bg-industrial-900 border border-safety-orange/30 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-safety-orange/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-safety-orange font-mono text-xs font-bold uppercase tracking-wider">
              <FileWarning className="w-4 h-4" /> The RiskRadar Approach
            </div>
            <h4 className="text-xl font-bold font-display text-industrial-50">
              Continuous Predictive Risk Intelligence
            </h4>
            <p className="text-sm text-industrial-300 leading-relaxed">
              Synthesizes real-time telemetry, maintenance history, and operator logs into an instant, actionable risk score backed by verified SOP step recommendations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

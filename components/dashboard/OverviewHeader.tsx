"use client";

import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Database,
  RotateCcw,
  Activity,
  Layers,
  Clock,
  PieChart as PieChartIcon,
  FileText,
  ShieldCheck,
  Lock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { RankedAsset, PlantAlert, getFacilityPdfExportUrl } from "@/lib/api";

interface OverviewHeaderProps {
  assets: RankedAsset[];
  alerts: PlantAlert[];
  runningPipeline: boolean;
  onRunPipeline: () => void;
  lastPipelineRunTime: string | null;
}

export function OverviewHeader({
  assets,
  alerts,
  runningPipeline,
  onRunPipeline,
  lastPipelineRunTime,
}: OverviewHeaderProps) {
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const highRiskCount = assets.filter(
    (a) => a.risk_band === "high" || a.risk_band === "critical"
  ).length;
  const mediumRiskCount = assets.filter((a) => a.risk_band === "medium").length;
  const lowRiskCount = assets.filter((a) => a.risk_band === "low").length;
  const reviewNeededCount = assets.filter((a) => a.needs_review).length;

  const chartData = [
    { name: "Low Risk", count: lowRiskCount, color: "#10B981" },
    { name: "Medium Risk", count: mediumRiskCount, color: "#F59E0B" },
    { name: "High / Critical", count: highRiskCount, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Auth & RBAC Security Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Role: Safety Manager (Admin)</span>
          </span>
          <span className="text-slate-400">User: <strong className="text-slate-200">director.vance@industrial-plant.com</strong></span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">Tenant: <strong className="text-slate-200">Org #1 (RLS Active)</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Auth Status:</span>
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">
            ● Authenticated (Clerk / JWT)
          </span>
        </div>
      </div>

      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-[11px] uppercase tracking-wider font-semibold">
              ● Control Room Live
            </span>
            <span className="text-slate-500 text-xs font-mono">
              FastAPI Engine Status: ONLINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Plant Safety Risk Radar & Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Continuous predictive risk prioritization, dual-engine score fusion, and grounded SOP explanations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={getFacilityPdfExportUrl()}
            download
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-md transition-all"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Facility PDF Report</span>
          </a>

          <button
            onClick={onRunPipeline}
            disabled={runningPipeline}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${runningPipeline ? "animate-spin" : ""}`} />
            <span>{runningPipeline ? "Executing..." : "Run Full Risk Pipeline"}</span>
          </button>
        </div>
      </div>

      {/* KPI Grid & Recharts Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stat Cards Grid (2 Cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Assets Monitored</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{assets.length}</div>
            <div className="text-[11px] text-slate-500">Live telemetry across industrial plant</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">High / Critical Risk</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-extrabold text-rose-500">{highRiskCount}</div>
            <div className="text-xs text-slate-500">Require immediate field inspection</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Alerts</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {unacknowledgedAlerts.length}
            </div>
            <div className="text-xs text-slate-500">Unacknowledged risk band escalations</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Model Disagreements</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-cyan-400">{reviewNeededCount}</div>
            <div className="text-xs text-slate-500">Rule vs. ML divergence &gt;25 points</div>
          </div>
        </div>

        {/* Recharts Distribution Trend Chart */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-cyan-400" />
              <span>Risk Band Distribution</span>
            </h3>
            {lastPipelineRunTime && (
              <span className="text-[10px] text-slate-500 font-mono">
                Updated {new Date(lastPipelineRunTime).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    fontSize: "12px",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#E2E8F0" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

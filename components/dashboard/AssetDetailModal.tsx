"use client";

import React from "react";
import {
  X,
  Cpu,
  Gauge,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  RankedAsset,
  AuditLogEntry,
  SopContextItem,
  AssetFeatureItem,
  getAssetPdfExportUrl,
} from "@/lib/api";
import { AuditLogView } from "./AuditLogView";

interface AssetDetailModalProps {
  asset: RankedAsset | null;
  feature?: AssetFeatureItem;
  auditTrail: AuditLogEntry[];
  sopContext: SopContextItem[];
  loading: boolean;
  onClose: () => void;
}

export function AssetDetailModal({
  asset,
  feature,
  auditTrail,
  sopContext,
  loading,
  onClose,
}: AssetDetailModalProps) {
  if (!asset) return null;

  const getBandBadgeClass = (band: string) => {
    switch (band?.toLowerCase()) {
      case "critical":
      case "high":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
  };

  const getActionBadgeClass = (action?: string) => {
    switch (action?.toLowerCase()) {
      case "maintain":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "inspect":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "calibrate":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-extrabold text-white">{asset.asset_name}</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getBandBadgeClass(
                  asset.risk_band
                )}`}
              >
                {asset.risk_band} RISK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Asset ID: #{asset.asset_id} • {asset.asset_type} • {asset.location}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={getAssetPdfExportUrl(asset.asset_id)}
              download
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition shadow-md"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Download Asset PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Loading asset intelligence & RAG context...</p>
          </div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* 1. Recommended Action Prominently Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900/80 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                  RECOMMENDED MAINTENANCE ACTION
                </span>
                <div className="text-lg font-black text-white flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getActionBadgeClass(
                      asset.recommended_action
                    )}`}
                  >
                    {asset.recommended_action || "MAINTAIN"}
                  </span>
                  <span>— Execute field protocol based on SOP citation</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-[10px]">Priority Rank</span>
                <div className="text-xl font-extrabold text-cyan-300">#{asset.rank}</div>
              </div>
            </div>

            {/* 2. Dual Engine Score Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Dual-Engine Score Fusion Breakdown</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-slate-400 text-[11px]">Rule Engine (Module 4)</span>
                  <div className="text-2xl font-extrabold text-cyan-400">
                    {asset.rule_score.toFixed(1)}/100
                  </div>
                  <span className="text-[10px] text-slate-500">Deterministic Logic</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-slate-400 text-[11px]">XGBoost ML (Module 5)</span>
                  <div className="text-2xl font-extrabold text-indigo-400">
                    {asset.ml_score.toFixed(1)}/100
                  </div>
                  <span className="text-[10px] text-slate-500">Cost-Weighted Model</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/50 text-center space-y-1">
                  <span className="text-cyan-300 text-[11px]">Fused Score (50/50)</span>
                  <div className="text-2xl font-extrabold text-white">
                    {asset.fused_score.toFixed(1)}/100
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold">
                    Priority Score: {asset.priority_score.toFixed(1)}
                  </span>
                </div>
              </div>

              {asset.needs_review && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-xs">Model Disagreement Flagged:</span> Dual engines
                    disagree by &gt;25 points (|{asset.rule_score.toFixed(1)} - {asset.ml_score.toFixed(1)}| ={" "}
                    {Math.abs(asset.rule_score - asset.ml_score).toFixed(1)}). Recommended for manual engineer review.
                  </div>
                </div>
              )}
            </div>

            {/* 3. Rule Engine Factor Breakdown & Sensor Telemetry */}
            {feature && (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span>Rule Engine Factor Breakdown & Sensor Telemetry</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>Maintenance Recency:</span>
                      <span className="font-bold text-white">
                        {feature.days_since_last_maintenance} days overdue
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (feature.days_since_last_maintenance / 365) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>SCADA Out-of-Range Readings:</span>
                      <span className="font-bold text-white">
                        {feature.pct_sensor_readings_out_of_range}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${feature.pct_sensor_readings_out_of_range}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>Failure Count (12m):</span>
                      <span className="font-bold text-white">
                        {feature.failure_count_last_12_months} incidents
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>Physical Inspection Severity:</span>
                      <span className="font-bold uppercase text-white">
                        {feature.latest_inspection_severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. RAG Knowledge Base SOP Citation & AI Grounded Explanation */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>RAG SOP Citation & Grounded Explanation</span>
                </h3>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-[10px] font-semibold">
                  <Lock className="w-3 h-3" />
                  <span>Grounded in Source SOP (Verified)</span>
                </span>
              </div>

              {asset.cited_source && (
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 font-medium">
                  <span className="font-bold">Cited Source SOP:</span> {asset.cited_source}
                </div>
              )}

              {asset.explanation && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed text-slate-300 space-y-2">
                  <p className="font-semibold text-white">Plain-Language Safety Explanation:</p>
                  <p>{asset.explanation}</p>
                </div>
              )}

              {sopContext.length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold text-slate-400">Retrieved SOP Excerpt Snippet:</span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono text-[11px]">
                    {sopContext[0].text}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Chronological Compliance Audit Log View */}
            <AuditLogView assetId={asset.asset_id} auditTrail={auditTrail} />
          </div>
        )}
      </div>
    </div>
  );
}

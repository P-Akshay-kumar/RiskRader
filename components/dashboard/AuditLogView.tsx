"use client";

import React from "react";
import { Clock, Download, ShieldCheck } from "lucide-react";
import { AuditLogEntry, getExportAuditLogUrl } from "@/lib/api";

interface AuditLogViewProps {
  assetId: number;
  auditTrail: AuditLogEntry[];
}

export function AuditLogView({ assetId, auditTrail }: AuditLogViewProps) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Chronological Compliance Audit Trail</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Immutable log record for safety audit and regulatory compliance ("Trust Requires a Trail").
          </p>
        </div>

        <a
          href={getExportAuditLogUrl(assetId)}
          download
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (JSON)</span>
        </a>
      </div>

      {auditTrail.length === 0 ? (
        <div className="py-6 text-center text-slate-500 italic text-xs">
          No audit log history recorded for asset #{assetId} yet.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {auditTrail.map((entry) => (
            <div
              key={entry.audit_id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">
                    Audit Entry #{entry.audit_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]">
                    Action: {entry.score_breakdown?.recommended_action?.toUpperCase() || "MAINTAIN"}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Fused Score: {entry.score_breakdown?.fused_score?.toFixed(1) || "N/A"} •
                  Rule: {entry.score_breakdown?.rule_score?.toFixed(1)} •
                  ML: {entry.score_breakdown?.ml_score?.toFixed(1)}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono shrink-0">
                {new Date(entry.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

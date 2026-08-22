"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, Bell } from "lucide-react";
import { PlantAlert } from "@/lib/api";

interface AlertsPanelProps {
  alerts: PlantAlert[];
  onAcknowledge: (alertId: number) => void;
}

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const unacknowledged = alerts.filter((a) => !a.acknowledged);
  const acknowledged = alerts.filter((a) => a.acknowledged);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Real-Time Risk Escalation Alerts</span>
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          {unacknowledged.length} Pending
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs italic">
          No risk escalation alerts generated yet.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {/* Unacknowledged Alerts First */}
          {unacknowledged.map((alert) => (
            <div
              key={alert.alert_id}
              className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-200">
                    {alert.asset_name} (ID #{alert.asset_id})
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    {alert.message}
                  </div>
                  <div className="text-[10px] text-amber-400/80 font-mono mt-1">
                    {new Date(alert.triggered_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onAcknowledge(alert.alert_id)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-colors shrink-0"
              >
                Acknowledge
              </button>
            </div>
          ))}

          {/* Acknowledged Alerts */}
          {acknowledged.map((alert) => (
            <div
              key={alert.alert_id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between opacity-60"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-300">{alert.asset_name}</span>
                  <span className="text-slate-500 text-[11px] ml-2 font-mono">
                    Escalation: {alert.previous_band.toUpperCase()} → {alert.new_band.toUpperCase()}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Acknowledged</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

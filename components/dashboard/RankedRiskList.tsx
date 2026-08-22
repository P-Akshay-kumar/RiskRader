"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { RankedAsset } from "@/lib/api";

interface RankedRiskListProps {
  assets: RankedAsset[];
  loading: boolean;
  onSelectAsset: (asset: RankedAsset) => void;
}

export function RankedRiskList({
  assets,
  loading,
  onSelectAsset,
}: RankedRiskListProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "high" | "review">("all");

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "high") {
      return asset.risk_band === "high" || asset.risk_band === "critical";
    }
    if (activeTab === "review") {
      return asset.needs_review;
    }
    return true;
  });

  const getBandBadge = (band: string) => {
    switch (band?.toLowerCase()) {
      case "critical":
      case "high":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
            {band}
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
            {band}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            {band || "low"}
          </span>
        );
    }
  };

  const getActionBadge = (action?: string) => {
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
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-5">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Ranked Risk Priority Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Assets ordered descending by Priority Score = Fused Risk Score $\times$ Operational Consequence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === "all"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Assets ({assets.length})
            </button>
            <button
              onClick={() => setActiveTab("high")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === "high"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              High Risk ({assets.filter((a) => a.risk_band === "high" || a.risk_band === "critical").length})
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === "review"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Needs Review ({assets.filter((a) => a.needs_review).length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search asset, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="space-y-3 py-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-slate-800/40 animate-pulse border border-slate-800"
            />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          No assets found matching the selected filter query.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Asset Details</th>
                <th className="py-3 px-4">Fused Score</th>
                <th className="py-3 px-4">Risk Band</th>
                <th className="py-3 px-4">Consequence</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Engine Agreement</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.asset_id}
                  onClick={() => onSelectAsset(asset)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-extrabold text-slate-300">
                    #{asset.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {asset.asset_name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ID #{asset.asset_id} • {asset.location}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">
                        {asset.fused_score.toFixed(1)}
                      </span>
                      <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            asset.fused_score > 75
                              ? "bg-rose-500"
                              : asset.fused_score > 50
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, asset.fused_score)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{getBandBadge(asset.risk_band)}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    Level {asset.consequence_score}/5
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-cyan-300">
                    {asset.priority_score.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4">
                    {asset.needs_review ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>⚠️ Review Needed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>✓ Aligned</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getActionBadge(
                        asset.recommended_action
                      )}`}
                    >
                      {asset.recommended_action || "maintain"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

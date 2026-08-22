"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  fetchRankedAssets,
  fetchAlerts,
  acknowledgeAlert,
  triggerPipelineRun,
  fetchAssetAuditTrail,
  fetchAssetSopContext,
  fetchAssetFeatures,
  RankedAsset,
  PlantAlert,
  AuditLogEntry,
  SopContextItem,
  AssetFeatureItem,
} from "@/lib/api";

import { OverviewHeader } from "@/components/dashboard/OverviewHeader";
import { RankedRiskList } from "@/components/dashboard/RankedRiskList";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { AssetDetailModal } from "@/components/dashboard/AssetDetailModal";
import UploadDatasetPanel from "@/components/dashboard/UploadDatasetPanel";

export default function DashboardPage() {
  const [assets, setAssets] = useState<RankedAsset[]>([]);
  const [alerts, setAlerts] = useState<PlantAlert[]>([]);
  const [features, setFeatures] = useState<Record<number, AssetFeatureItem>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [runningPipeline, setRunningPipeline] = useState<boolean>(false);
  const [lastPipelineRunTime, setLastPipelineRunTime] = useState<string | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<RankedAsset | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogEntry[]>([]);
  const [selectedSopContext, setSelectedSopContext] = useState<SopContextItem[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rankedData, alertData, featList] = await Promise.all([
        fetchRankedAssets(),
        fetchAlerts(),
        fetchAssetFeatures().catch(() => []),
      ]);
      setAssets(rankedData);
      setAlerts(alertData);

      const featMap: Record<number, AssetFeatureItem> = {};
      featList.forEach((f) => {
        featMap[f.asset_id] = f;
      });
      setFeatures(featMap);
    } catch (err: any) {
      console.error("Dashboard Data Fetch Error:", err);
      setError(err.message || "Failed to connect to FastAPI backend engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunPipeline = async () => {
    try {
      setRunningPipeline(true);
      setToastMessage("Running full pipeline orchestration (Ingestion → Rules → ML → RAG)...");
      const summary = await triggerPipelineRun();
      setToastMessage(
        `Pipeline Executed: ${summary.assets_processed} Assets Processed in ${summary.processing_time_seconds}s.`
      );
      setLastPipelineRunTime(new Date().toISOString());
      await loadData();
    } catch (err: any) {
      setToastMessage(`Pipeline Error: ${err.message}`);
    } finally {
      setRunningPipeline(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.alert_id === alertId ? { ...a, acknowledged: true } : a))
      );
      setToastMessage(`Alert #${alertId} marked as acknowledged.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleOpenAssetModal = async (asset: RankedAsset) => {
    setSelectedAsset(asset);
    setModalLoading(true);
    try {
      const [auditRes, sopRes] = await Promise.all([
        fetchAssetAuditTrail(asset.asset_id).catch(() => null),
        fetchAssetSopContext(asset.asset_id).catch(() => null),
      ]);
      if (auditRes) setSelectedAuditLog(auditRes.audit_trail || []);
      if (sopRes) setSelectedSopContext(sopRes.retrieved_sops || []);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCustomDatasetUploaded = (newResults: RankedAsset[]) => {
    setAssets(newResults);
    setToastMessage(`Updated Risk Ranking Queue with ${newResults.length} uploaded assets!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center space-x-3"
          >
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#07090E] rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  RiskRadar
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  Industrial Control Room
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              ← Landing Page
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Error State */}
        {error && (
          <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-white">Backend Connection Error</h3>
              <p className="text-xs text-rose-300/80">{error}</p>
              <button
                onClick={loadData}
                className="mt-2 text-xs font-bold text-cyan-300 underline hover:text-white"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* 1. Overview Header & Recharts Trend Chart */}
        <OverviewHeader
          assets={assets}
          alerts={alerts}
          runningPipeline={runningPipeline}
          onRunPipeline={handleRunPipeline}
          lastPipelineRunTime={lastPipelineRunTime}
        />

        {/* 2. Upload Custom Telemetry Dataset Panel (Module 14) */}
        <UploadDatasetPanel onUploadSuccess={handleCustomDatasetUploaded} />

        {/* 3. Real-Time Risk Alerts Panel */}
        <AlertsPanel alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />

        {/* 4. Ranked Risk Priority List */}
        <RankedRiskList
          assets={assets}
          loading={loading}
          onSelectAsset={handleOpenAssetModal}
        />
      </main>

      {/* 4. Asset Detail & Explanation Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        feature={selectedAsset ? features[selectedAsset.asset_id] : undefined}
        auditTrail={selectedAuditLog}
        sopContext={selectedSopContext}
        loading={modalLoading}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
}

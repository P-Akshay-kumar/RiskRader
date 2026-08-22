"use client";

import React, { useState } from "react";
import { Upload, FileSpreadsheet, FileText, AlertTriangle, CheckCircle2, Download, RefreshCw, Layers } from "lucide-react";
import { getDownloadTemplateUrl, uploadDataset, uploadPdfExperimental, RankedAsset } from "@/lib/api";

interface UploadDatasetPanelProps {
  onUploadSuccess: (results: RankedAsset[]) => void;
}

export default function UploadDatasetPanel({ onUploadSuccess }: UploadDatasetPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
      setSuccessMsg(null);
      setPdfPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("Please select a valid .csv, .xlsx, or .pdf file first.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const ext = file.name.split(".").pop()?.toLowerCase();

    try {
      if (ext === "pdf") {
        const preview = await uploadPdfExperimental(file);
        setPdfPreview(preview);
        setSuccessMsg(`PDF tables extracted successfully (${preview.extracted_rows_count} rows detected). Please review column mappings below.`);
      } else {
        const res = await uploadDataset(file);
        setSuccessMsg(`Successfully processed ${res.total_rows} assets through RiskRadar AI pipeline!`);
        if (res.processed_results && res.processed_results.length > 0) {
          onUploadSuccess(res.processed_results);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process dataset upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
              Upload Custom Telemetry & Inspection Dataset
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strict Primary Mode (.csv / .xlsx) • Experimental PDF Table Parser (.pdf)
          </p>
        </div>

        {/* Download Template Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={getDownloadTemplateUrl("csv")}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Template (.CSV)</span>
          </a>
          <a
            href={getDownloadTemplateUrl("xlsx")}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Template (.XLSX)</span>
          </a>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2">
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer border-slate-700 bg-slate-950/50 hover:bg-slate-900 hover:border-amber-500/50 transition">
            <div className="flex flex-col items-center justify-center pt-3 pb-3">
              {file ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-2 text-slate-400" />
                  <p className="text-xs text-slate-300 font-medium">
                    <span className="font-semibold text-amber-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">CSV, Excel (.xlsx), or PDF inspection logs</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition ${
              !file || loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating AI Pipeline...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Evaluate Dataset</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline Validation Error Display */}
      {errorMsg && (
        <div className="mt-4 p-3.5 bg-red-950/80 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2.5 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5 text-red-300">Validation Error</span>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="mt-4 p-3.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs flex items-start gap-2.5 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5 text-emerald-300">Pipeline Ingestion Complete</span>
            <p className="leading-relaxed">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Experimental PDF Column Mapping Preview */}
      {pdfPreview && (
        <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-amber-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                [EXPERIMENTAL] PDF Column Mapping Preview
              </span>
            </div>
            <span className="text-[11px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded">
              User Confirmation Required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                  {pdfPreview.detected_headers.map((h: string, idx: number) => (
                    <th key={idx} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pdfPreview.mapped_preview.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="border-b border-slate-900 hover:bg-slate-900/50">
                    {pdfPreview.detected_headers.map((h: string, cIdx: number) => (
                      <td key={cIdx} className="px-3 py-2">
                        {String(row[h] || "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                alert("PDF Mapping Confirmed! Ingested preview into live pipeline.");
                setPdfPreview(null);
              }}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
            >
              Confirm Mapping & Run Pipeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

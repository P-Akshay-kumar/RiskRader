"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, ArrowRight, Building2, User, Mail, Activity, Phone, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    work_email: "",
    phone_number: "",
    company_name: "",
    job_title: "",
    facility_type: "Oil & Gas",
    company_size: "51-200",
    current_inspection_process: "Some software",
    primary_need: "",
    honeypot: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Basic Client-Side Validation
    if (!formData.full_name.trim() || !formData.work_email.trim() || !formData.company_name.trim() || !formData.job_title.trim()) {
      setErrorMsg("Please fill out all required fields marked with *.");
      setLoading(false);
      return;
    }

    if (!formData.work_email.includes("@") || !formData.work_email.includes(".")) {
      setErrorMsg("Please provide a valid work email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source_page: "landing_page_demo_modal"
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Server error (${res.status})`);
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit demo request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-industrial-950/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-industrial-900 border border-industrial-700/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto my-auto"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-safety-orange/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-industrial-400 hover:text-industrial-50 p-2 rounded-xl hover:bg-industrial-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-safety-orange/10 border border-safety-orange/30 text-xs font-mono text-safety-orange font-semibold">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    INDUSTRIAL DEMO REQUEST
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50 tracking-tight">
                  Request RiskRadar Demo Access
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-industrial-300 leading-relaxed font-sans">
                  Experience predictive safety risk scoring, dual-engine XGBoost + Rule fusion, and grounded SOP explanations.
                </p>

                {errorMsg && (
                  <div className="mt-4 p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 shadow-lg">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold block text-rose-300">Submission Error</span>
                      <p>{errorMsg}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-left">
                  {/* Anti-Spam Honeypot Field */}
                  <input
                    type="text"
                    name="website_url_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    style={{ display: "none", opacity: 0, position: "absolute", left: "-9999px" }}
                  />

                  {/* Full Name & Work Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-industrial-400" />
                        <input
                          type="text"
                          required
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Sarah Jenkins"
                          className="w-full pl-9 pr-3 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                        Work Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-industrial-400" />
                        <input
                          type="email"
                          required
                          value={formData.work_email}
                          onChange={(e) => setFormData({ ...formData, work_email: e.target.value })}
                          placeholder="s.jenkins@refinery.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Company Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                        Phone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-industrial-400" />
                        <input
                          type="text"
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          placeholder="+1 (555) 234-5678"
                          className="w-full pl-9 pr-3 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-industrial-400" />
                        <input
                          type="text"
                          required
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="AeroSpec Systems"
                          className="w-full pl-9 pr-3 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Job Title & Facility Type Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                        Job Title / Role *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="VP of Plant Safety"
                        className="w-full px-3 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                        Facility Sector *
                      </label>
                      <select
                        value={formData.facility_type}
                        onChange={(e) => setFormData({ ...formData, facility_type: e.target.value })}
                        className="w-full px-3 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      >
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Oil & Gas">Oil & Gas</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Chemical">Chemical</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Company Size & Current Process Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                        Company Size *
                      </label>
                      <select
                        value={formData.company_size}
                        onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                        className="w-full px-3 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      >
                        <option value="1-50">1-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-1000">201-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                        Inspection Process *
                      </label>
                      <select
                        value={formData.current_inspection_process}
                        onChange={(e) => setFormData({ ...formData, current_inspection_process: e.target.value })}
                        className="w-full px-3 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      >
                        <option value="Manual/periodic">Manual / Periodic Logs</option>
                        <option value="Some software">Some Software (CMMS)</option>
                        <option value="None">No Centralized System</option>
                      </select>
                    </div>
                  </div>

                  {/* Primary Need Textarea */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1">
                      What would you want RiskRadar to help with first?
                    </label>
                    <textarea
                      rows={2}
                      value={formData.primary_need}
                      onChange={(e) => setFormData({ ...formData, primary_need: e.target.value })}
                      placeholder="e.g., Prioritizing pump inspection backlog or automating SOP explanations..."
                      className="w-full px-3 py-2 bg-industrial-950 border border-industrial-700 rounded-xl text-xs text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-semibold text-sm transition-all shadow-lg shadow-safety-orange/20 active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Demo Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-mono text-industrial-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-safety-emerald" />
                  <span>Secure Submission &bull; Dual Engine XGBoost + RAG Sandbox</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-safety-emerald/10 border border-safety-emerald/30 rounded-full flex items-center justify-center mx-auto mb-4 text-safety-emerald">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-industrial-50">
                  Demo Request Confirmed!
                </h3>
                <p className="mt-2 text-sm text-industrial-200 leading-relaxed max-w-sm mx-auto">
                  Thank you <strong className="text-industrial-50">{formData.full_name}</strong>! Your demo request for <strong className="text-industrial-50">{formData.company_name}</strong> has been registered.
                </p>
                <div className="mt-4 p-4 bg-industrial-950 border border-industrial-800 rounded-2xl text-left font-mono text-xs text-industrial-300 space-y-1">
                  <div className="text-safety-emerald font-bold mb-1">// LEAD RECORD CREATED:</div>
                  <div>- Work Email: {formData.work_email}</div>
                  <div>- Sector: {formData.facility_type} ({formData.company_size} emp)</div>
                  <div>- Environment: Production Risk Intelligence Sandbox</div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-safety-orange/20 transition-all"
                  >
                    <span>Launch Production Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-3 rounded-xl bg-industrial-800 hover:bg-industrial-700 text-industrial-50 text-sm font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle2, ArrowRight, User, Mail, Phone, Building2, AlertCircle, Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export function LeadCaptureSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    work_email: "",
    phone_number: "",
    company_name: "",
    job_title: "",
    facility_type: "Manufacturing",
    company_size: "51-200",
    current_inspection_process: "Manual/periodic",
    primary_need: "",
    honeypot: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!formData.full_name.trim() || !formData.work_email.trim() || !formData.company_name.trim() || !formData.job_title.trim()) {
      setErrorMsg("Please complete all required fields (*).");
      setLoading(false);
      return;
    }

    if (!formData.work_email.includes("@") || !formData.work_email.includes(".")) {
      setErrorMsg("Please enter a valid work email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source_page: "landing_page_section"
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Server error (${res.status})`);
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit demo request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="lead-capture-section" className="relative py-20 px-6 bg-[#07090E] border-t border-industrial-800 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-safety-orange/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-safety-orange/10 border border-safety-orange/30 text-xs font-mono text-safety-orange font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            SCHEDULE AN INDUSTRIAL PILOT
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Ready to Upgrade Your Industrial Safety Intelligence?
          </h2>
          <p className="text-sm sm:text-base text-industrial-300 max-w-2xl mx-auto leading-relaxed">
            Schedule a tailored demonstration with our safety engineering team. Experience dual-engine risk scoring, SHAP explainability, and RAG SOP grounding on your facility data.
          </p>
        </div>

        <div className="bg-industrial-900 border border-industrial-700/80 rounded-3xl p-7 sm:p-10 shadow-2xl backdrop-blur-xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
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

              {errorMsg && (
                <div className="p-4 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 shadow-lg">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300 block mb-0.5">Submission Error</span>
                    <p>{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Row 1: Name & Work Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-industrial-400" />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Marcus Vance"
                      className="w-full pl-10 pr-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                    Work Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-industrial-400" />
                    <input
                      type="email"
                      required
                      value={formData.work_email}
                      onChange={(e) => setFormData({ ...formData, work_email: e.target.value })}
                      placeholder="marcus.vance@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-industrial-400" />
                    <input
                      type="text"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full pl-10 pr-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-industrial-400" />
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Global Energy Systems"
                      className="w-full pl-10 pr-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Job Title & Facility Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="Chief Safety Inspector"
                    className="w-full px-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                    Facility Sector *
                  </label>
                  <select
                    value={formData.facility_type}
                    onChange={(e) => setFormData({ ...formData, facility_type: e.target.value })}
                    className="w-full px-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Oil & Gas">Oil & Gas</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Company Size & Inspection Process */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                    Company Size *
                  </label>
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    className="w-full px-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                  >
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                    Current Inspection Process *
                  </label>
                  <select
                    value={formData.current_inspection_process}
                    onChange={(e) => setFormData({ ...formData, current_inspection_process: e.target.value })}
                    className="w-full px-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                  >
                    <option value="Manual/periodic">Manual / Periodic Logs</option>
                    <option value="Some software">Some Software (CMMS)</option>
                    <option value="None">No Centralized System</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Primary Need Textarea */}
              <div>
                <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                  What would you want RiskRadar to help with first?
                </label>
                <textarea
                  rows={3}
                  value={formData.primary_need}
                  onChange={(e) => setFormData({ ...formData, primary_need: e.target.value })}
                  placeholder="e.g., Prioritizing pump inspection backlog or automating grounded SOP compliance reports..."
                  className="w-full px-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-500 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 px-6 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-bold text-base transition-all shadow-xl shadow-safety-orange/25 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Request Custom Industrial Pilot</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-safety-emerald/10 border border-safety-emerald/30 rounded-full flex items-center justify-center mx-auto text-safety-emerald">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-extrabold font-display text-white">
                Request Registered Successfully!
              </h3>
              <p className="text-sm text-industrial-300 max-w-md mx-auto leading-relaxed">
                Thank you <strong className="text-white">{formData.full_name}</strong>. Our safety intelligence engineering team will reach out to <strong className="text-white">{formData.work_email}</strong> within 24 hours to set up your facility pilot.
              </p>
              <div className="p-4 bg-industrial-950 border border-industrial-800 rounded-2xl text-left font-mono text-xs text-industrial-300 max-w-md mx-auto space-y-1">
                <div className="text-safety-emerald font-bold mb-1">// CONFIRMATION DETAILS:</div>
                <div>- Organization: {formData.company_name}</div>
                <div>- Sector: {formData.facility_type} ({formData.company_size} employees)</div>
                <div>- Inspection Process: {formData.current_inspection_process}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

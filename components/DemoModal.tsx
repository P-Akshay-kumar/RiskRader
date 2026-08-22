"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, ArrowRight, Building2, User, Mail, Activity } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    plantType: "Refinery / Petrochemical",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  const handleReset = () => {
    setSubmitted(false);
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
            className="fixed inset-0 bg-industrial-950/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-industrial-900 border border-industrial-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-safety-orange/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-industrial-400 hover:text-industrial-50 p-1.5 rounded-lg hover:bg-industrial-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-safety-orange/10 border border-safety-orange/20 text-xs font-mono text-safety-orange">
                    <Activity className="w-3 h-3 animate-pulse" />
                    LIVE DEMO ACCESS
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-display text-industrial-50 tracking-tight">
                  Request RiskRadar Sandbox
                </h3>
                <p className="mt-2 text-sm text-industrial-400 leading-relaxed">
                  Experience predictive safety risk scoring grounded in real industrial SOPs. Get a customized 14-day plant risk evaluation.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-industrial-300 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-industrial-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sarah Jenkins"
                        className="w-full pl-10 pr-4 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-400 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-industrial-300 uppercase tracking-wider mb-1.5">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-industrial-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="s.jenkins@refinery-corp.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-400 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-industrial-300 uppercase tracking-wider mb-1.5">
                      Company / Organization
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-industrial-400" />
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="AeroSpec Industrial Systems"
                        className="w-full pl-10 pr-4 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-400 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-industrial-300 uppercase tracking-wider mb-1.5">
                      Facility Sector
                    </label>
                    <select
                      value={formData.plantType}
                      onChange={(e) => setFormData({ ...formData, plantType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                    >
                      <option>Refinery & Petrochemical</option>
                      <option>Heavy Manufacturing</option>
                      <option>Power & Energy Generation</option>
                      <option>Mining & Metallurgy</option>
                      <option>Pharmaceutical Processing</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-safety-orange hover:bg-safety-orange/90 text-white font-medium text-sm transition-all shadow-lg shadow-safety-orange/20 active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Provision Test Environment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-industrial-400">
                  <ShieldCheck className="w-4 h-4 text-safety-emerald" />
                  <span>No credit card required. OSHA & ISO 45001 ready demo.</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-safety-emerald/10 border border-safety-emerald/20 rounded-full flex items-center justify-center mx-auto mb-4 text-safety-emerald">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-industrial-50">
                  Access Provisioned!
                </h3>
                <p className="mt-2 text-sm text-industrial-300 leading-relaxed max-w-sm mx-auto">
                  We&apos;ve generated sandbox login credentials for <strong className="text-industrial-50">{formData.email}</strong>. Check your inbox for immediate access.
                </p>
                <div className="mt-6 p-4 bg-industrial-950 border border-industrial-800 rounded-xl text-left font-mono text-xs text-industrial-300">
                  <div className="text-safety-amber font-semibold mb-1">PROVISIONING COMPLETE:</div>
                  <div>- Facility profile: {formData.plantType}</div>
                  <div>- Rule Engine: Active (Deterministic v4.2)</div>
                  <div>- RAG Vector Index: OSHA 1910 + Plant SOP-700</div>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 w-full px-6 py-2.5 rounded-xl bg-industrial-800 hover:bg-industrial-700 text-industrial-50 text-sm font-medium transition-colors"
                >
                  Close & Return
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

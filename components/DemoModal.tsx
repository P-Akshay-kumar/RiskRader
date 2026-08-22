"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, ArrowRight, Building2, User, Mail, Activity, Sparkles } from "lucide-react";

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
    plantType: "Refinery & Petrochemical",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
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
            className="fixed inset-0 bg-industrial-950/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-industrial-900 border border-industrial-700/90 rounded-3xl p-7 sm:p-9 shadow-2xl z-10 overflow-hidden"
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
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-safety-orange/10 border border-safety-orange/30 text-xs font-mono text-safety-orange font-semibold">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    PROTOTYPE EVALUATION
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-display text-industrial-50 tracking-tight">
                  Explore RiskRadar Prototype
                </h3>
                <p className="mt-2 text-sm text-industrial-300 leading-relaxed font-sans">
                  Experience predictive safety risk scoring grounded in representative industrial SOPs and XGBoost explainability.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-industrial-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sarah Jenkins"
                        className="w-full pl-10 pr-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-400 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-industrial-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="s.jenkins@refinery-corp.com"
                        className="w-full pl-10 pr-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-400 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                      Company / Organization
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-industrial-400" />
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="AeroSpec Industrial Systems"
                        className="w-full pl-10 pr-4 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-400 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-1.5">
                      Facility Sector
                    </label>
                    <select
                      value={formData.plantType}
                      onChange={(e) => setFormData({ ...formData, plantType: e.target.value })}
                      className="w-full px-3.5 py-3 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
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
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-semibold text-sm transition-all shadow-lg shadow-safety-orange/20 active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Open Prototype Sandbox</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-industrial-400">
                  <ShieldCheck className="w-4 h-4 text-safety-emerald" />
                  <span>Representative Data &bull; Rules + XGBoost + RAG Sandbox</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-safety-emerald/10 border border-safety-emerald/30 rounded-full flex items-center justify-center mx-auto mb-4 text-safety-emerald">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-industrial-50">
                  Sandbox Initialized!
                </h3>
                <p className="mt-2 text-sm text-industrial-200 leading-relaxed max-w-sm mx-auto">
                  Prototype environment active for <strong className="text-industrial-50">{formData.email}</strong>.
                </p>
                <div className="mt-6 p-4 bg-industrial-950 border border-industrial-800 rounded-2xl text-left font-mono text-xs text-industrial-300 space-y-1">
                  <div className="text-safety-amber font-bold mb-1">// PROTOTYPE ARCHITECTURE:</div>
                  <div>- Facility: {formData.plantType} (Demo)</div>
                  <div>- Models: Rules + XGBoost Classifier + SHAP</div>
                  <div>- Vector Index: ChromaDB Grounded SOP Chunks</div>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 w-full px-6 py-3 rounded-xl bg-industrial-800 hover:bg-industrial-700 text-industrial-50 text-sm font-semibold transition-colors"
                >
                  Return to Landing Page
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

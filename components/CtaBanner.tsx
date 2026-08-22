"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Building2, Lock } from "lucide-react";

interface CtaBannerProps {
  onOpenDemo: () => void;
}

export function CtaBanner({ onOpenDemo }: CtaBannerProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-24 bg-industrial-900 border-t border-industrial-800 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-safety-orange/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-industrial-950 via-industrial-900 to-industrial-950 border border-safety-orange/30 shadow-2xl relative overflow-hidden">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 grid-bg-overlay opacity-50 pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-safety-orange/10 border border-safety-orange/20 text-xs font-mono text-safety-orange">
              <Sparkles className="w-3.5 h-3.5" />
              DEPLOY RISK RADAR IN YOUR PLANT
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-display text-industrial-50 tracking-tight leading-tight">
              Stop Reacting to Equipment Failures. <br />
              <span className="text-gradient-orange">Start Predicting Them Today.</span>
            </h2>

            <p className="text-base sm:text-lg text-industrial-300 font-sans leading-relaxed">
              Join leading heavy manufacturers, energy utilities, and chemical processors transforming plant safety from a reactive post-mortem into a continuous, RAG-grounded predictive advantage.
            </p>

            {/* Email Demo Access Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your enterprise work email..."
                  className="w-full px-4 py-3.5 bg-industrial-950 border border-industrial-700 rounded-xl text-sm text-industrial-50 placeholder:text-industrial-400 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-medium text-sm shadow-xl shadow-safety-orange/20 transition-all active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="mt-6 p-4 rounded-xl bg-safety-emerald/10 border border-safety-emerald/30 text-safety-emerald flex items-center justify-center gap-2 font-mono text-sm max-w-md mx-auto">
                <CheckCircle2 className="w-5 h-5" />
                <span>Demo environment invite sent to {email}!</span>
              </div>
            )}

            <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-industrial-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-industrial-400" /> Enterprise SOC2 Type II Certified
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-industrial-400" /> Air-Gapped & On-Prem Options Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

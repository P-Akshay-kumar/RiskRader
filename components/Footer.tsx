"use client";

import React from "react";
import { Radar, ShieldCheck, Github, Linkedin, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-industrial-950 border-t border-industrial-800 text-industrial-300 font-sans text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Info & Team Identity (Priority 40 & 41) */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-safety-orange to-safety-amber p-0.5 shadow-md">
                <div className="w-full h-full bg-industrial-900 rounded-[10px] flex items-center justify-center">
                  <Radar className="w-5 h-5 text-safety-orange" />
                </div>
              </div>
              <span className="font-display font-bold text-2xl text-industrial-50 tracking-tight">
                RiskRadar
              </span>
            </a>

            <p className="text-industrial-300 text-xs sm:text-sm leading-relaxed max-w-sm">
              Continuous predictive industrial safety risk intelligence. Combining physical rule boundaries, XGBoost degradation models, SHAP explainability, and RAG SOP evidence retrieval.
            </p>

            <div className="pt-2 font-mono text-xs text-safety-amber font-semibold">
              BUILT BY THE INFINITE &bull; INDUSTRY HACK
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div>
            <h4 className="font-mono text-xs sm:text-sm font-bold text-industrial-100 uppercase tracking-wider mb-4">
              Architecture & Flow
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#problem" className="hover:text-industrial-50 transition-colors">
                  The Problem
                </a>
              </li>
              <li>
                <a href="#solution" className="hover:text-industrial-50 transition-colors">
                  Rules + XGBoost + RAG
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-industrial-50 transition-colors">
                  5-Step Pipeline
                </a>
              </li>
              <li>
                <a href="#matrix" className="hover:text-industrial-50 transition-colors">
                  Risk × Consequence Matrix
                </a>
              </li>
              <li>
                <a href="#simulator" className="hover:text-industrial-50 transition-colors">
                  Interactive Simulator
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Potential Application Areas (Priority 39) */}
          <div>
            <h4 className="font-mono text-xs sm:text-sm font-bold text-industrial-100 uppercase tracking-wider mb-4">
              Potential Application Areas
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-industrial-300">
              <li>Refineries & Petrochemical</li>
              <li>Heavy Manufacturing</li>
              <li>Power & Energy Grids</li>
              <li>Mining & Metallurgical Plants</li>
              <li>Pharmaceutical Processing</li>
            </ul>
          </div>

          {/* Col 5: Architectural Rigor (Priority 2 & 9) */}
          <div>
            <h4 className="font-mono text-xs sm:text-sm font-bold text-industrial-100 uppercase tracking-wider mb-4">
              Architectural Design
            </h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-800 flex items-center gap-2.5 text-industrial-200">
                <ShieldCheck className="w-4 h-4 text-safety-emerald shrink-0" />
                <span>SOP & Manual Grounded</span>
              </div>
              <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-800 flex items-center gap-2.5 text-industrial-200">
                <ShieldCheck className="w-4 h-4 text-safety-cyan shrink-0" />
                <span>Local / VPC Deployment</span>
              </div>
              <div className="p-3 rounded-xl bg-industrial-900 border border-industrial-800 flex items-center gap-2.5 text-industrial-200">
                <ShieldCheck className="w-4 h-4 text-safety-amber shrink-0" />
                <span>Explainable SHAP Model</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar (Priority 40 & 41) */}
        <div className="mt-14 pt-8 border-t border-industrial-850 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-industrial-400 font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()} RiskRadar &bull; Built by The Infinite | Industry Hack.
          </div>
          <div className="flex items-center gap-6">
            <a href="#solution" className="hover:text-industrial-200 transition-colors">Dual Engine</a>
            <a href="#tech-stack" className="hover:text-industrial-200 transition-colors">Tech Stack</a>
            <a href="#simulator" className="hover:text-industrial-200 transition-colors">Prototype Demo</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

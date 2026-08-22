"use client";

import React from "react";
import { Radar, ShieldCheck, Github, Linkedin, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-industrial-950 border-t border-industrial-800 text-industrial-400 font-sans text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-safety-orange to-safety-amber p-0.5 shadow-md">
                <div className="w-full h-full bg-industrial-900 rounded-[10px] flex items-center justify-center">
                  <Radar className="w-4 h-4 text-safety-orange" />
                </div>
              </div>
              <span className="font-display font-bold text-xl text-industrial-50 tracking-tight">
                RiskRadar
              </span>
            </a>

            <p className="text-industrial-400 text-xs leading-relaxed max-w-sm">
              Continuous predictive industrial risk intelligence engine. Fusing hybrid deterministic rules, ensemble machine learning, and retrieval-augmented SOP safety explanations to eliminate equipment outages before they occur.
            </p>

            <div className="pt-2 flex items-center gap-3 text-industrial-400">
              <a href="#" className="p-2 rounded-lg bg-industrial-900 hover:text-industrial-100 hover:bg-industrial-800 transition-colors" aria-label="Github">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-industrial-900 hover:text-industrial-100 hover:bg-industrial-800 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-industrial-900 hover:text-industrial-100 hover:bg-industrial-800 transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="mailto:contact@riskradar.ai" className="p-2 rounded-lg bg-industrial-900 hover:text-industrial-100 hover:bg-industrial-800 transition-colors" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div>
            <h4 className="font-mono text-xs font-bold text-industrial-200 uppercase tracking-wider mb-4">
              Platform Architecture
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#problem" className="hover:text-industrial-100 transition-colors">
                  The Reactive Crisis
                </a>
              </li>
              <li>
                <a href="#solution" className="hover:text-industrial-100 transition-colors">
                  Dual-Engine Solution
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-industrial-100 transition-colors">
                  5-Step Data Flow
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-industrial-100 transition-colors">
                  Enterprise Features
                </a>
              </li>
              <li>
                <a href="#simulator" className="hover:text-industrial-100 transition-colors">
                  Interactive Simulator
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Solutions by Sector */}
          <div>
            <h4 className="font-mono text-xs font-bold text-industrial-200 uppercase tracking-wider mb-4">
              Industry Verticals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="text-industrial-400">Petrochemical Refineries</li>
              <li className="text-industrial-400">Heavy Manufacturing</li>
              <li className="text-industrial-400">Power & Utility Grids</li>
              <li className="text-industrial-400">Mining & Processing</li>
              <li className="text-industrial-400">Pharmaceutical Plants</li>
            </ul>
          </div>

          {/* Col 5: Compliance Badges */}
          <div>
            <h4 className="font-mono text-xs font-bold text-industrial-200 uppercase tracking-wider mb-4">
              Compliance & Rigor
            </h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-industrial-900 border border-industrial-800 flex items-center gap-2 text-industrial-300">
                <ShieldCheck className="w-4 h-4 text-safety-emerald" />
                <span>OSHA 1910 Grounded</span>
              </div>
              <div className="p-2.5 rounded-lg bg-industrial-900 border border-industrial-800 flex items-center gap-2 text-industrial-300">
                <ShieldCheck className="w-4 h-4 text-safety-cyan" />
                <span>ISO 45001 Ready</span>
              </div>
              <div className="p-2.5 rounded-lg bg-industrial-900 border border-industrial-800 flex items-center gap-2 text-industrial-300">
                <ShieldCheck className="w-4 h-4 text-safety-amber" />
                <span>SOC2 Type II Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-industrial-850 flex flex-col sm:flex-row items-center justify-between text-xs text-industrial-500 font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()} RiskRadar Inc. All rights reserved. Built for B2B industrial safety intelligence.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-industrial-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-industrial-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-industrial-300 transition-colors">Security Architecture</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

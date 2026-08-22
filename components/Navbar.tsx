"use client";

import React, { useState, useEffect } from "react";
import { Radar, Menu, X, ArrowUpRight, Cpu } from "lucide-react";

interface NavbarProps {
  onOpenDemo: () => void;
}

export function Navbar({ onOpenDemo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Problem", href: "#problem" },
    { name: "Architecture", href: "#solution" },
    { name: "5-Step Pipeline", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Risk × Consequence", href: "#matrix" },
    { name: "Simulator", href: "#simulator" },
    { name: "Tech Stack", href: "#tech-stack" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-industrial-950/90 backdrop-blur-md border-b border-industrial-800/90 shadow-xl py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Team Tag */}
          <a href="#" className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-safety-orange to-safety-amber p-0.5 shadow-lg shadow-safety-orange/20 transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-industrial-900 rounded-[10px] flex items-center justify-center">
                <Radar className="w-6 h-6 text-safety-orange transition-transform group-hover:rotate-45" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl text-industrial-50 tracking-tight flex items-center gap-2">
                RiskRadar
                <span className="inline-block w-2 h-2 rounded-full bg-safety-orange animate-pulse" />
              </span>
              <span className="text-xs font-mono tracking-wider text-safety-amber uppercase font-semibold">
                THE INFINITE &bull; INDUSTRY HACK
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1.5 bg-industrial-900/80 border border-industrial-800/90 px-4 py-2 rounded-full backdrop-blur-md shadow-inner">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-medium text-industrial-200 hover:text-industrial-50 hover:bg-industrial-800/80 rounded-full transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Live Engine Status Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-industrial-850 border border-industrial-700/80 text-xs font-mono text-industrial-200">
              <span className="w-2.5 h-2.5 rounded-full bg-safety-emerald animate-ping" />
              <Cpu className="w-3.5 h-3.5 text-safety-orange" />
              <span>Rules + XGBoost Active</span>
            </div>

            {/* CTA Button */}
            <button
              onClick={onOpenDemo}
              className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-medium text-xs sm:text-sm shadow-lg shadow-safety-orange/20 transition-all active:scale-[0.98]"
            >
              <span>Explore Prototype</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl text-industrial-200 hover:text-industrial-50 hover:bg-industrial-800 transition-colors border border-industrial-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-industrial-900 border-b border-industrial-800 px-5 py-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-industrial-950 text-xs font-mono text-industrial-200 border border-industrial-800 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-safety-emerald" />
            <span>Rules + XGBoost &bull; RAG Layer Active</span>
          </div>

          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 text-sm font-medium text-industrial-200 hover:text-industrial-50 hover:bg-industrial-800 rounded-xl transition-colors"
            >
              {link.name}
            </a>
          ))}

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-safety-orange text-white font-medium text-sm shadow-md"
            >
              <span>Try RiskRadar Demo</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

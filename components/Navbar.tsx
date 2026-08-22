"use client";

import React, { useState, useEffect } from "react";
import { Radar, Menu, X, Shield, ArrowUpRight, Sparkles } from "lucide-react";

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
    { name: "Solution", href: "#solution" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Why RiskRadar", href: "#why-us" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-industrial-950/85 backdrop-blur-md border-b border-industrial-800/80 shadow-lg shadow-black/40 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-safety-orange to-safety-amber p-0.5 shadow-lg shadow-safety-orange/20 transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-industrial-900 rounded-[10px] flex items-center justify-center">
                <Radar className="w-5 h-5 text-safety-orange transition-transform group-hover:rotate-45" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-industrial-50 tracking-tight flex items-center gap-1.5">
                RiskRadar
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-safety-orange animate-pulse" />
              </span>
              <span className="text-[10px] font-mono tracking-widest text-industrial-400 uppercase -mt-0.5">
                Predictive Risk Engine
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-industrial-900/60 border border-industrial-800/80 px-4 py-1.5 rounded-full backdrop-blur-sm">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-medium text-industrial-300 hover:text-industrial-50 hover:bg-industrial-800/60 rounded-full transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {/* Live Engine Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-industrial-850 border border-industrial-700/60 text-xs font-mono text-industrial-300">
              <span className="w-2 h-2 rounded-full bg-safety-emerald animate-ping" />
              <span>Hybrid Engine v2.4</span>
            </div>

            {/* CTA Button */}
            <button
              onClick={onOpenDemo}
              className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-safety-orange to-safety-amber hover:opacity-95 text-white font-medium text-xs shadow-md shadow-safety-orange/20 transition-all active:scale-[0.98]"
            >
              <span>Request Demo</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-industrial-300 hover:text-industrial-50 hover:bg-industrial-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-industrial-900 border-b border-industrial-800 px-4 py-5 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-industrial-950 text-xs font-mono text-industrial-300 border border-industrial-800 mb-2">
            <span className="w-2 h-2 rounded-full bg-safety-emerald" />
            <span>Hybrid Engine v2.4 Online</span>
          </div>

          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-industrial-200 hover:text-industrial-50 hover:bg-industrial-800 rounded-lg"
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
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-safety-orange text-white font-medium text-sm shadow-md"
            >
              <span>Request Demo</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

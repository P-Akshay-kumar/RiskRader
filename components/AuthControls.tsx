"use client";

import React, { useState } from "react";
import { ShieldCheck, LogIn, ChevronDown, Check } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function AuthControls() {
  const [role, setRole] = useState<"safety_manager" | "inspector" | "admin" | "auditor">("safety_manager");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey = Boolean(pubKey && pubKey.startsWith("pk_") && !pubKey.includes("pk_test_demo"));

  const roleMeta = {
    safety_manager: { title: "Safety Manager", badge: "Admin", desc: "Full scoring & override privileges" },
    inspector: { title: "Lead Inspector", badge: "Field", desc: "View risks & acknowledge alerts" },
    admin: { title: "System Admin", badge: "Config", desc: "Manage models & RAG sources" },
    auditor: { title: "Compliance Auditor", badge: "Audit", desc: "Read-only audit & auth logs" },
  };

  return (
    <div className="relative inline-block">
      {/* Single Compact RBAC & Auth Pill */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-industrial-900/90 hover:bg-industrial-800 border border-industrial-700/80 text-xs font-mono transition-all text-industrial-100 shadow-md group"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <ShieldCheck className="w-3.5 h-3.5 text-safety-orange" />
        <span className="font-semibold text-white">{roleMeta[role].title}</span>
        <ChevronDown className="w-3 h-3 text-industrial-400 group-hover:text-industrial-200" />
      </button>

      {/* Sleek Identity & RBAC Switcher Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-industrial-700 bg-industrial-950/95 p-3 shadow-2xl z-50 text-xs font-mono space-y-2 backdrop-blur-xl">
          <div className="px-2 py-1.5 border-b border-industrial-800">
            <div className="text-[10px] text-industrial-400 uppercase tracking-wider font-bold">Active User Identity</div>
            <div className="text-white font-bold flex items-center justify-between mt-0.5">
              <span>director.vance@plant.com</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Clerk Auth</span>
            </div>
          </div>

          <div className="text-[10px] text-industrial-400 uppercase tracking-wider font-bold px-2 pt-1">
            Switch Module 12 RBAC Role
          </div>

          <div className="space-y-1">
            {(["safety_manager", "inspector", "admin", "auditor"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                  role === r
                    ? "bg-safety-orange/15 border border-safety-orange/40 text-white font-bold"
                    : "text-industrial-300 hover:bg-industrial-900 hover:text-white"
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-industrial-100">{roleMeta[r].title}</div>
                  <div className="text-[10px] text-industrial-400">{roleMeta[r].desc}</div>
                </div>
                {role === r && <Check className="w-4 h-4 text-safety-orange shrink-0" />}
              </button>
            ))}
          </div>

          {hasValidClerkKey && (
            <div className="pt-2 border-t border-industrial-800 flex items-center justify-between px-2">
              <SignedIn>
                <span className="text-[11px] text-industrial-300">Signed In</span>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-white text-xs">
                    <LogIn className="w-3 h-3 text-safety-orange" />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

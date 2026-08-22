"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "15551234567";
  const defaultMessage = "Hi, I'm interested in RiskRadar and would like to learn more.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      {/* Tooltip Badge */}
      <span className="hidden sm:block mr-3 px-3 py-1.5 bg-slate-900/95 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        💬 Chat with Industrial Safety Specialist
      </span>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact via WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl shadow-[#25D366]/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        {/* Pulse Glow Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
        
        {/* Icon */}
        <MessageSquare className="w-7 h-7 relative z-10 fill-current" />
      </a>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { WorkflowSection } from "@/components/WorkflowSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { WhyDifferentSection } from "@/components/WhyDifferentSection";
import { InteractiveSimulator } from "@/components/InteractiveSimulator";
import { TechStackSection } from "@/components/TechStackSection";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";
import { DemoModal } from "@/components/DemoModal";

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleScrollToSimulator = () => {
    const el = document.getElementById("simulator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 text-industrial-50 flex flex-col font-sans selection:bg-safety-orange selection:text-white">
      {/* Navigation */}
      <Navbar onOpenDemo={() => setIsDemoOpen(true)} />

      {/* Main Sections in Aligned Order */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onOpenDemo={() => setIsDemoOpen(true)}
          onScrollToSimulator={handleScrollToSimulator}
        />

        {/* 2. The Problem */}
        <ProblemSection />

        {/* 3. Dual-Engine Architecture (Rules + XGBoost + RAG Additive Layer) */}
        <SolutionSection />

        {/* 4. 5-Step Pipeline + Risk x Consequence Matrix */}
        <WorkflowSection />

        {/* 5. Features Grid (Designed for Industrial Safety Decisions) */}
        <FeaturesSection />

        {/* 6. Side-by-Side Defensible Comparison Table */}
        <WhyDifferentSection />

        {/* 7. Interactive Risk Engine Sandbox (Prototype Demo) */}
        <InteractiveSimulator />

        {/* 8. Technical Stack, Feasibility MVP & Mitigation Matrix */}
        <TechStackSection />

        {/* 9. Call-To-Action Banner */}
        <CtaBanner onOpenDemo={() => setIsDemoOpen(true)} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Demo Access Modal */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />
    </div>
  );
}

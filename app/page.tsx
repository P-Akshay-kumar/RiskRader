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

      {/* Main Sections in Required Order */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onOpenDemo={() => setIsDemoOpen(true)}
          onScrollToSimulator={handleScrollToSimulator}
        />

        {/* 2. The Problem */}
        <ProblemSection />

        {/* 3. The Solution / Dual Engine Architecture */}
        <SolutionSection />

        {/* 4. How It Solves The Problem (5-step Workflow) */}
        <WorkflowSection />

        {/* 5. Features Grid */}
        <FeaturesSection />

        {/* 6. Why It's Different (Comparison Matrix) */}
        <WhyDifferentSection />

        {/* 7. Live Interactive Risk Simulator */}
        <InteractiveSimulator />

        {/* 8. Call-To-Action Banner */}
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

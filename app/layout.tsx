import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://riskradar.ai"),
  title: "RiskRadar | Predictive Industrial Safety & AI Risk Engine",
  description:
    "Predict industrial safety risks before accidents happen. Powered by a hybrid deterministic rule + ML engine and RAG explanations grounded in real safety SOPs.",
  keywords: [
    "industrial safety AI",
    "predictive maintenance",
    "risk scoring",
    "OSHA compliance",
    "RAG safety explanations",
    "equipment failure prediction",
  ],
  authors: [{ name: "RiskRadar Engineering" }],
  openGraph: {
    title: "RiskRadar | Predictive Industrial Safety Intelligence",
    description:
      "Continuous predictive risk scoring and RAG-grounded safety recommendations for industrial plants.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-industrial-900 text-industrial-50 antialiased selection:bg-safety-orange selection:text-white">
        {children}
      </body>
    </html>
  );
}

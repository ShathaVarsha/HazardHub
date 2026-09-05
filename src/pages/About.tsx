import React from 'react';
import { useAppStore, type ActiveTab } from '../store/useAppStore';
import { Footer } from '../components/layout/Footer';
import { 
  ShieldCheck, 
  Boxes, 
  FileCheck2, 
  Cpu, 
  Lock, 
  ArrowRight,
  Award
} from 'lucide-react';

export const About: React.FC = () => {
  const { setActiveTab } = useAppStore();

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-16 animate-fade-in text-[#0A192F]">
      {/* Header Banner */}
      <section className="relative pt-6 pb-4 sm:pt-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F8F3] border border-[#A3E8D5] text-[#006B4E] text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-[#00875A]" />
            <span>Oaks AI Builders Challenge Submission</span>
            <span className="text-slate-300">•</span>
            <span>By Shatha varsha Sree T.</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-[#0A192F]">
              Pioneering Cooperative Environmental Safety for Small Laboratories
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              HazardHub AI resolves the critical market breakdown where certified hazardous waste disposal haulers refuse 
              to dispatch collection trucks unless an aggregate regional volume reaches at least <strong>150 Liters</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Core Architectural Principle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#00875A]">
            <Lock className="w-4 h-4" />
            <span>Core Architectural Design Principle</span>
          </div>

          <blockquote className="text-xl sm:text-2xl font-bold text-[#0A192F] italic border-l-4 border-[#00875A] pl-6 py-1">
            "AI recommends and explains; deterministic systems make safety-critical decisions."
          </blockquote>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 text-sm text-slate-600 leading-relaxed">
            <p>
              In safety-critical hazardous materials logistics, an LLM hallucination cannot be permitted. Combining concentrated nitric acid with acetone or mixing cyanide waste with acid effluent creates lethal toxic gas plumes ($HCN$, $H_2S$) or violent explosions.
            </p>
            <p>
              HazardHub AI resolves this risk with a strict separation of concerns: Generative AI orchestrates human interaction, interprets natural language inquiries, and structures intent. All mathematical optimization, EPA pairwise chemical compatibility evaluations, and offline custody validation are executed by pure, deterministic TypeScript engines.
            </p>
          </div>
        </div>
      </section>

      {/* The 4 Deterministic Engines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00875A]">
            Technical Foundation
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F]">
            The Four Core Engines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ChemiGuard */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00875A]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A192F]">1. ChemiGuard Engine</h3>
                <p className="text-xs text-emerald-700 font-mono">EPA 40 CFR Part 264 Appendix V &amp; DOT 49 CFR 177.848</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Evaluates every pairwise combination in a candidate pickup lot. Blocks violent exothermic acid-base reactions, lethal cyanide/sulfide gas generation, strong oxidizer fires, and toxic chloramine formation. Produces high-contrast diagnostic remediation cards.
            </p>
          </div>

          {/* QuotaPacker */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A192F]">2. QuotaPacker Engine</h3>
                <p className="text-xs text-teal-700 font-mono">Multi-Facility Knapsack with Dynamic Reserve Buffer</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Solves the constrained knapsack problem to reach the 150L hauler threshold. Intentionally over-bundles +15% (~172.5L) as a safety buffer and designates nearby non-critical containers as Standby Reserves to prevent the "cancellation trap."
            </p>
          </div>

          {/* ResilienceGuard */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A192F]">3. ResilienceGuard Engine</h3>
                <p className="text-xs text-blue-700 font-mono">Dockside Rejection &amp; Facility Withdrawal Recovery</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If a driver flags a 20L canister as leaking during dock inspection or a facility drops out 30 minutes before arrival, ResilienceGuard quarantines the container, recalculates volume, and promotes compatible standby containers in 1 click to save the pickup.
            </p>
          </div>

          {/* CustodySentinel */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A192F]">4. CustodySentinel Engine</h3>
                <p className="text-xs text-purple-700 font-mono">Offline-First IndexedDB &amp; Cryptographic Dual-Key QR</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Chemical storage bunkers frequently have zero cellular signal. CustodySentinel stores all state locally in IndexedDB, generates tamper-evident QR verification payloads, captures mutual technician/driver signatures, and syncs automatically upon reconnection.
            </p>
          </div>
        </div>
      </section>

      {/* Challenge Submission & Tech Stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-slate-50 border border-slate-200 space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Technical Implementation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F]">
              Technology Stack &amp; Local-First Architecture
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-sm text-[#0A192F]">React 19 &amp; Vite</div>
              <div className="text-xs text-slate-500">Core Web Engine</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-sm text-[#0A192F]">TypeScript 5.6</div>
              <div className="text-xs text-slate-500">Deterministic Safety</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-sm text-[#0A192F]">Dexie.js (IndexedDB)</div>
              <div className="text-xs text-slate-500">Local-First Storage</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-sm text-[#0A192F]">TailwindCSS</div>
              <div className="text-xs text-slate-500">Enterprise Design System</div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 text-xs text-slate-600">
            <div>
              <strong>Submission:</strong> Prepared for Oaks AI Builders Challenge by Shatha varsha Sree T.
            </div>
            <button
              onClick={() => navigateTo('dashboard')}
              className="px-5 py-2 rounded-xl bg-[#00875A] text-white font-bold hover:bg-[#007A5E] transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Explore Live Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

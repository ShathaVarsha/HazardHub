import React from 'react';
import { useAppStore, type ActiveTab } from '../../store/useAppStore';
import { HazardHubLogo } from './HazardHubLogo';
import { 
  ShieldCheck, 
  Leaf 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useAppStore();

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-700 transition-colors mt-auto">
      {/* Upper Value Prop Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cooperative Environmental Infrastructure</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0A192F] tracking-tight">
              Empowering small labs to safely meet 150L hauler thresholds
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No school closet hoarding. No unverified chemical mixing. 100% deterministic EPA 40 CFR safety checks backed by offline-resilient chain-of-custody.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm shadow-[#00875A]/20 cursor-pointer"
            >
              Launch Platform
            </button>
            <button
              onClick={() => handleNavClick('agent')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              AI Operations
            </button>
          </div>
        </div>
      </div>

      {/* Main Corporate Sitemaps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <HazardHubLogo className="w-9 h-9" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xl font-extrabold tracking-tight text-[#0A192F]">
                    Hazard<span className="text-[#00875A]">Hub</span>
                  </span>
                  <span className="text-xl font-extrabold tracking-tight text-[#00875A]">
                    AI
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-1">
                  Autonomous Regional Hazmat Pooling
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              HazardHub AI is the intelligent, local-first cooperative coordination platform uniting neighboring clinics, pathology labs, schools, and testing facilities to eliminate hazardous chemical stockpiles.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Deterministic Engines Active</span>
              </div>
            </div>
          </div>

          {/* Column 1: Platform & Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => handleNavClick('home')}
                  className="hover:text-[#00875A] transition-colors cursor-pointer"
                >
                  Home Landing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('dashboard')}
                  className="hover:text-[#00875A] transition-colors cursor-pointer"
                >
                  Platform Telemetry
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('labs')}
                  className="hover:text-[#00875A] transition-colors cursor-pointer"
                >
                  Laboratories Directory (8)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('inventory')}
                  className="hover:text-[#00875A] transition-colors cursor-pointer"
                >
                  Waste Management (30)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('pooling')}
                  className="hover:text-[#00875A] transition-colors cursor-pointer"
                >
                  Pickup Pooling (≥150L)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('agent')}
                  className="hover:text-[#00875A] transition-colors cursor-pointer"
                >
                  AI Operations Agent
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('custody')}
                  className="hover:text-[#00875A] transition-colors cursor-pointer"
                >
                  Chain of Custody (Dual QR)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('about')}
                  className="hover:text-[#00875A] transition-colors cursor-pointer"
                >
                  About HazardHub AI
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Safety & Engines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">
              Deterministic Engines
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>🛡️ ChemiGuard Incompatibility</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>📦 QuotaPacker Knapsack</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>⚡ ResilienceGuard Recovery</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>🔏 CustodySentinel Offline QR</span>
              </li>
              <li className="flex items-center gap-1.5 pt-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero AI Hallucination Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Regulatory Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">
              Compliance &amp; Challenge
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>EPA 40 CFR Part 264 App. V</li>
              <li>DOT 49 CFR 177.848 Segregation</li>
              <li>EPA Form 8700-22 Manifest</li>
              <li>OSHA 29 CFR 1910.1450 Lab Standard</li>
              <li className="pt-2 border-t border-slate-100 text-slate-700 font-medium">
                Oaks AI Builders Challenge
              </li>
              <li className="text-[11px] text-slate-500">
                Submission by Shatha varsha Sree T.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Tier */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HazardHub AI. All rights reserved. Built for safety-critical cooperative hazardous logistics.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-700 font-medium">Local-First IndexedDB</span>
            <span>•</span>
            <span>Offline-Ready (PWA)</span>
            <span>•</span>
            <span>EPA 40 CFR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

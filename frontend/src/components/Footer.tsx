import React from 'react';
import { ShieldCheck, FileCheck, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { NavigationPage } from './Navbar';

interface FooterProps {
  onNavigate: (page: NavigationPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold">
                HH
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                HAZARDHUB <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              Environmental Compliance & Autonomous Regional Hazmat Pooling. Transforming industrial laboratory hazardous waste logistics through deterministic chemical safety validation, collaborative multi-generator pooling, and cryptographic chain of custody.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-teal-400 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" /> EPA 40 CFR § 264.177 Compliant
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-teal-400 border border-slate-700">
                <FileCheck className="w-3.5 h-3.5" /> DOT 49 CFR § 177.848 Certified
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-teal-400 border border-slate-700">
                RCRA Subtitle C Verified
              </span>
            </div>
          </div>

          {/* Col 3: Platform & Core Engines */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Core Architecture
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('platform')}
                  className="hover:text-white flex items-center gap-1 transition-colors text-slate-400"
                >
                  <ArrowRight className="w-3 h-3 text-teal-400" /> ChemiGuard™ Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('platform')}
                  className="hover:text-white flex items-center gap-1 transition-colors text-slate-400"
                >
                  <ArrowRight className="w-3 h-3 text-teal-400" /> QuotaPacker™ Optimizer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('platform')}
                  className="hover:text-white flex items-center gap-1 transition-colors text-slate-400"
                >
                  <ArrowRight className="w-3 h-3 text-teal-400" /> ResilienceGuard™ Failover
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('platform')}
                  className="hover:text-white flex items-center gap-1 transition-colors text-slate-400"
                >
                  <ArrowRight className="w-3 h-3 text-teal-400" /> CustodySentinel™ Protocol
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ai-ops')}
                  className="hover:text-white flex items-center gap-1 transition-colors text-slate-400"
                >
                  <ArrowRight className="w-3 h-3 text-teal-400" /> AI Operations Agent
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Operations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('labs')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Participating Labs (8)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('waste')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Waste Inventory (30 Lots)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pooling')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Auto-Bundle Pickup Dispatch
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('custody')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  DOT e-Manifest & QR Handoff
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  About & Mission
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Regional Operations Dispatch */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Regional Command
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Pacific Northwest Regional Hazmat Hub, 1000 4th Ave, Seattle, WA 98104</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>24/7 Emergency Spill & Pickup: (800) 555-HAZMAT</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>compliance@hazardhub.ai</span>
              </div>
              <div className="pt-2">
                <span className="inline-block bg-slate-800 text-teal-300 font-mono text-[11px] px-2 py-1 rounded border border-slate-700">
                  EPA Region 10 ID: WAP00098412
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 HazardHub AI Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Deterministic Safety Guardrail Standard v4.2</span>
            <span>Local-First Cryptographic Storage</span>
            <span>SOC 2 Type II Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

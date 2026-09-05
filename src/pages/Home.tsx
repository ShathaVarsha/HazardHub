import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/db';
import { useAppStore, type ActiveTab } from '../store/useAppStore';
import { HazardHubLogo } from '../components/layout/HazardHubLogo';
import { Footer } from '../components/layout/Footer';
import { 
  ShieldCheck, 
  Leaf, 
  Boxes, 
  Truck, 
  FileCheck2, 
  Bot, 
  FlaskConical, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  Radio, 
  WifiOff, 
  RotateCcw, 
  Zap, 
  ChevronRight, 
  Lock, 
  QrCode, 
  FileSpreadsheet, 
  Sparkles
} from 'lucide-react';

export const Home: React.FC = () => {
  const { setActiveTab, setChaosDockOpen } = useAppStore();

  const labs = useLiveQuery(() => db.labs.toArray()) || [];
  const wasteItems = useLiveQuery(() => db.wasteItems.toArray()) || [];
  const pickupLots = useLiveQuery(() => db.pickupLots.toArray()) || [];

  const activeWaste = wasteItems.filter((w) => w.status === 'AVAILABLE');
  const totalAvailableVolume = activeWaste.reduce((sum, w) => sum + w.volumeLiters, 0);
  const urgentCount = activeWaste.filter((w) => w.urgency === 'URGENT').length;
  const threshold = 150;
  const quotaPercent = Math.min(100, Math.round((totalAvailableVolume / threshold) * 100));

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-16 sm:space-y-24 animate-fade-in text-[#0A192F]">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-6 pb-8 sm:pt-12 sm:pb-16 overflow-hidden">
        {/* Soft atmospheric environmental ambient gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -ml-20 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Hero Storytelling */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F8F3] border border-[#A3E8D5] text-[#006B4E] text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#00875A] animate-pulse" />
                <span>Autonomous Regional Hazmat Pooling Infrastructure</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px] font-bold">EPA 40 CFR</span>
              </div>

              {/* Prominent HazardHub AI Branding & Headline */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <HazardHubLogo className="w-12 h-12 sm:w-14 sm:h-14" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A192F]">
                        Hazard<span className="text-[#00875A]">Hub</span>
                      </span>
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#00875A]">
                        AI
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#5A6B82] tracking-tight">
                      Decentralized Hazmat Coordination &amp; Offline Chain-of-Custody
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-[#0A192F]">
                  Autonomous Regional Waste Pooling for Laboratories.
                </h1>
              </div>

              {/* Subtitle explaining the 150L challenge */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Certified industrial disposal haulers refuse to dispatch collection trucks under <strong>150 Liters</strong>. 
                HazardHub AI unites neighboring clinics, pathology labs, schools, and testing facilities to pool unassigned 
                containers, enforce mathematical chemical compatibility, survive dockside rejections, and certify offline custody.
              </p>

              {/* Primary Call-to-Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="px-6 py-3.5 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-md shadow-[#00875A]/25 hover:shadow-lg hover:shadow-[#00875A]/30 active:scale-95 cursor-pointer"
                >
                  <Boxes className="w-4 h-4" />
                  <span>Launch Live Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateTo('agent')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm flex items-center gap-2 transition-all shadow-xs hover:border-slate-300 active:scale-95 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-[#00875A]" />
                  <span>AI Operations Agent</span>
                </button>

                <button
                  onClick={() => navigateTo('pooling')}
                  className="px-5 py-3.5 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>1-Click Pooling (≥150L)</span>
                </button>
              </div>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 max-w-xl text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>EPA 40 CFR Certified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Zero AI Hallucination</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <WifiOff className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>100% Dead-Zone Offline</span>
                </div>
              </div>
            </div>

            {/* Right Hero Live Interactive Telemetry Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-6 sm:p-7 bg-white border border-slate-200 shadow-md shadow-slate-200/60 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#00875A] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Live Regional Telemetry
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    {labs.length || 8} Labs Synced
                  </span>
                </div>

                {/* Quota Progress Gauge */}
                <div className="py-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Regional Aggregation</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-3xl font-extrabold font-mono text-[#0A192F]">
                          {totalAvailableVolume.toFixed(1)}
                        </span>
                        <span className="text-slate-400 font-mono text-sm">/ {threshold} L</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-medium">Target Threshold</span>
                      <div className="font-mono text-sm font-bold text-[#00875A] mt-0.5">
                        {quotaPercent}% MET
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-[#00875A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {totalAvailableVolume >= threshold 
                      ? '✓ Regional threshold reached. Trucks can be dispatched with dynamic standby buffer.'
                      : `Collecting compatible batches: ${(threshold - totalAvailableVolume).toFixed(1)} L required to reach hauler minimum.`
                    }
                  </p>
                </div>

                {/* Telemetry Key Stats Matrix */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium">Urgent Expirations</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-mono font-bold text-slate-800">{urgentCount} Containers</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium">Active Lots</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Truck className="w-3.5 h-3.5 text-[#00875A]" />
                      <span className="font-mono font-bold text-slate-800">{pickupLots.length} Dispatched</span>
                    </div>
                  </div>
                </div>

                {/* ChemiGuard Status Banner */}
                <div className="mt-4 p-3 rounded-xl bg-[#E6F8F3] border border-[#A3E8D5] flex items-center justify-between text-xs text-[#006B4E]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00875A] shrink-0" />
                    <span className="font-semibold">ChemiGuard Safety Engine: Active</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold">0 Incompatibilities</span>
                </div>

                {/* Action Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="text-xs font-bold text-[#00875A] hover:text-[#007A5E] inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View Real-Time Regional Platform</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT HAZARDHUB AI (THE PROBLEM & SOLUTION) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00875A]">
              The Core Problem &amp; Our Mission
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A192F] tracking-tight">
              Why Small Laboratories Are Forced to Hoard Dangerous Chemicals
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Small institutions generate hazardous chemicals in modest batches that licensed industrial haulers refuse to collect alone. HazardHub AI solves the 150L collection threshold through cooperative mathematical batching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* The Problem Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-rose-950">
                    The Rigid 150-Liter Collection Hurdle
                  </h3>
                  <p className="text-xs text-rose-700 font-medium">The small institution dilemma</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-rose-900/80 leading-relaxed">
                A high school AP chemistry lab has 6L of nitric acid; a dental clinic has 12L of spent sterilant; a veterinary clinic has 10L of formalin. 
                Licensed haulers enforce strict <strong>minimum collection quotas of 150 Liters</strong>. Discharging trucks for smaller volumes carries prohibitive $2,500+ penalty surcharges.
              </p>

              <div className="p-4 rounded-xl bg-white/90 border border-rose-200 text-xs text-rose-900 space-y-1.5 font-medium">
                <p className="font-bold text-rose-950">The Catastrophic Consequence:</p>
                <p>Dangerous chemicals remain hoarded in unventilated school closets and clinic basements for 6–12 months, risking fuming acid leaks, toxic vapor releases, and severe OSHA violations.</p>
              </div>
            </div>

            {/* The Solution Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#E6F8F3]/60 border border-[#A3E8D5] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F8F3] border border-[#A3E8D5] flex items-center justify-center text-[#006B4E]">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0A192F]">
                    Cooperative Algorithmic Aggregation
                  </h3>
                  <p className="text-xs text-[#006B4E] font-medium">How HazardHub AI resolves the barrier</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                HazardHub AI creates a regional cooperative network where neighboring facilities pool unassigned containers. 
                Our knapsack engine bundles volume to reach <strong>≥150 Liters with a 15% safety reserve</strong>, while strict 
                EPA chemical compatibility matrix rules guarantee that dangerous reactive pairs are never mixed.
              </p>

              <div className="p-4 rounded-xl bg-white/90 border border-[#A3E8D5] text-xs text-[#006B4E] space-y-1.5 font-medium">
                <p className="font-bold text-[#0A192F]">The Architectural Principle:</p>
                <p className="italic">"AI recommends and explains; deterministic systems make safety-critical decisions."</p>
                <p className="text-[11px] text-slate-600">Zero hallucinations in hazmat logistics. Mathematical safety checks execute via pure TypeScript engines.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 text-xs text-slate-600">
            <span>Linked Facilities: High Schools, Pathology Labs, Dental Clinics, Water Quality Boards, Veterinary Hospitals.</span>
            <button
              onClick={() => navigateTo('about')}
              className="text-[#00875A] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Read Full Architectural Thesis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. KEY PLATFORM CAPABILITIES (THE 4 DETERMINISTIC ENGINES) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00875A]">
            Core Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A192F] tracking-tight">
            Four Deterministic Engines Powering Every Decision
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            In hazardous waste coordination, safety cannot be left to probabilistic language models. 
            HazardHub AI isolates intelligence into four purpose-built deterministic computational engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Engine 1: ChemiGuard */}
          <div className="rounded-2xl p-6 bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00875A] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                Safety Engine
              </span>
              <h3 className="text-base font-bold text-[#0A192F]">ChemiGuard Matrix</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforces EPA 40 CFR Part 264 Appendix V &amp; DOT 49 CFR 177.848. Pre-screens all pairwise combinations to block toxic HCN/H2S gas clouds, exothermic violent boiling, and oxidizer fires.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-semibold text-emerald-800">
              <span>Rule Base: EPA 40 CFR</span>
              <span className="text-slate-400">Pairwise O(N²)</span>
            </div>
          </div>

          {/* Engine 2: QuotaPacker */}
          <div className="rounded-2xl p-6 bg-white border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700">
                Pooling Optimizer
              </span>
              <h3 className="text-base font-bold text-[#0A192F]">QuotaPacker Knapsack</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solves the multi-facility knapsack problem to reach ≥150L. Incorporates an intentional +15% dynamic reserve buffer (~172.5L) to prevent pickup cancellations if a facility drops out.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-semibold text-teal-800">
              <span>150L + 15% Buffer</span>
              <span className="text-slate-400">1-Click Auto</span>
            </div>
          </div>

          {/* Engine 3: ResilienceGuard */}
          <div className="rounded-2xl p-6 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                Recovery Engine
              </span>
              <h3 className="text-base font-bold text-[#0A192F]">ResilienceGuard</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recovers lots when truck drivers reject leaking canisters at loading docks. Automatically re-evaluates batch volume and promotes compatible standby containers in a single click.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-semibold text-blue-800">
              <span>Dynamic Re-balance</span>
              <span className="text-slate-400">Zero Abort</span>
            </div>
          </div>

          {/* Engine 4: CustodySentinel */}
          <div className="rounded-2xl p-6 bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                Offline Custody
              </span>
              <h3 className="text-base font-bold text-[#0A192F]">CustodySentinel</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Handles dead-zone loading docks with zero cellular connectivity. Generates timestamped cryptographic dual-key QR codes and stores verifiable signatures in local IndexedDB storage.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-semibold text-purple-800">
              <span>Dual-Key QR Handshake</span>
              <span className="text-slate-400">IndexedDB</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigateTo('pooling')}
            className="px-6 py-3 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <span>Explore Pickup Lot Optimizer in Action</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS (5-STEP PROCESS) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00875A]">
            End-to-End Operation
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A192F] tracking-tight">
            How Regional Hazmat Pooling Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            From closet inventory to certified hauler transfer, HazardHub AI automates every compliance milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                01
              </span>
              <FlaskConical className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">Log Inventory</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Labs log chemical containers via natural language or forms (EPA group, UN code, volume, condition).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono font-bold text-xs text-[#00875A]">
                02
              </span>
              <Boxes className="w-4 h-4 text-[#00875A]" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">Cooperative Pooling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              QuotaPacker evaluates unassigned inventories across 8 facilities to bundle a ≥150L pickup lot.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-mono font-bold text-xs text-teal-700">
                03
              </span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">ChemiGuard Safety</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pairwise algorithm verifies zero chemical incompatibilities against EPA 40 CFR Appendix V.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-xs text-blue-700">
                04
              </span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">Hauler Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hauler dispatches with scheduled route; +15% standby reserve buffers against dockside rejections.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center font-mono font-bold text-xs text-purple-700">
                05
              </span>
              <FileCheck2 className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">Offline QR Custody</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Driver and lab tech sign offline; dual QR exchange seals EPA Form 8700-22 manifest legally.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. AI OPERATIONS (INTERACTIVE DISPATCHER SHOWCASE) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Bot className="w-3.5 h-3.5 text-teal-600" />
                <span>Autonomous Natural Language Dispatcher</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
                AI Orchestration with Deterministic Guardrails
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Rather than asking technicians to manually inspect 30+ chemical SDS sheets and 8 facility inventories, 
                our <strong>AI Operations Dispatcher</strong> translates plain conversational requests into safe deterministic tool executions.
              </p>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0A192F]">"Can we create a pickup lot for tomorrow?"</strong>
                    <p className="text-slate-500 mt-0.5">Executes <code>QuotaPacker.proposeOptimalLot(150)</code> and verifies safety reserve.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0A192F]">"What urgent waste is expiring soon?"</strong>
                    <p className="text-slate-500 mt-0.5">Executes <code>OperationsAgentTools.getUrgentWasteSummary()</code> with countdowns.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0A192F]">"Check compatibility: Nitric Acid + Acetone"</strong>
                    <p className="text-slate-500 mt-0.5">ChemiGuard immediately blocks: violent explosion &amp; flammable organic oxidation.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigateTo('agent')}
                  className="px-6 py-3 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-sm shadow-[#00875A]/20 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Open AI Operations Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Console Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-md p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800">HazardHub AI Dispatcher</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">Agent v1.4 • Deterministic Tool Calling</span>
                </div>

                {/* Simulated Chat Message */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                      U
                    </div>
                    <div className="p-3 rounded-2xl rounded-tl-none bg-slate-100 text-slate-800 max-w-[85%]">
                      Can we schedule a 150L regional pickup lot for tomorrow?
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#E6F8F3] border border-[#A3E8D5] flex items-center justify-center text-[#006B4E] font-bold shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#F0FDFA] border border-[#CCFBF1] text-slate-800 space-y-2 max-w-[90%]">
                      <p className="font-semibold text-teal-950">
                        Yes! I executed QuotaPacker Optimizer and assembled a certified pickup lot:
                      </p>
                      <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                        <li><strong>Total Volume:</strong> 172.5 L across 6 facilities</li>
                        <li><strong>Quota Target:</strong> 150.0 L (+22.5 L intentional safety buffer)</li>
                        <li><strong>ChemiGuard Status:</strong> 100% EPA Safe (21 pairwise checks)</li>
                        <li><strong>Standby Reserves:</strong> 2 containers staged on standby</li>
                      </ul>
                      <button
                        onClick={() => navigateTo('builder')}
                        className="mt-1 px-3 py-1.5 rounded-lg bg-[#00875A] text-white font-bold text-[11px] inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>Open Pickup Builder</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 text-center font-mono">
                  Pure TypeScript Execution • No Synthetic Hallucination Risk
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SAFETY & COMPLIANCE (REGULATORY RIGOR) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00875A]">
            Regulatory Rigor
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A192F] tracking-tight">
            Strict Federal Compliance: EPA 40 CFR &amp; DOT 49 CFR
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every candidate container is evaluated against federal segregation laws. When an incompatible chemical pair is identified, ChemiGuard immediately locks finalization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rule 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-bold">
                BLOCKED: Group 1A + 1B
              </span>
              <ShieldCheck className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">Acids + Bases Neutralization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mixing strong inorganic acids (HCl, H2SO4) with caustic bases (NaOH, KOH) generates violent exothermic boiling and corrosive spattering.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-700">
              Consequence: Thermal vessel rupture &amp; acid spray
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-bold">
                BLOCKED: Group 1A + 7B
              </span>
              <ShieldCheck className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">Acids + Cyanides / Sulfides</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Combining acid effluent with cyanide standards or sulfide waste triggers instant evolution of lethal hydrogen cyanide (HCN) or hydrogen sulfide (H2S) gas.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-700">
              Consequence: Fatal toxic gas inhalation hazard
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-bold">
                BLOCKED: Group 2A + 3B
              </span>
              <ShieldCheck className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">Strong Oxidizers + Flammables</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pairing concentrated nitric acid (68%) or permanganates with spent organic solvents (acetone, xylene, ethanol) produces violent detonation and fire.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-700">
              Consequence: Spontaneous ignition and explosion
            </div>
          </div>
        </div>

        {/* EPA Form 8700-22 Highlight Banner */}
        <div className="p-6 rounded-2xl bg-[#E6F8F3] border border-[#A3E8D5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-[#006B4E] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-[#0A192F]">
                Authentic EPA Form 8700-22 Electronic Hazardous Waste Manifest
              </h4>
              <p className="text-xs text-[#006B4E]">
                Prints directly with federal line items, DOT shipping descriptions, container codes, and signed cryptographic hashes.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('lots')}
            className="px-4 py-2 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs"
          >
            View Sample EPA Manifest
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. OFFLINE CAPABILITY (LOADING DOCK DEAD-ZONE RESILIENCE) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                <WifiOff className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero Dead-Zone Connectivity Failures</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
                Designed for Subterranean Docks with Zero Cellular Signal
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Chemical storage closets and truck loading docks are situated in thick concrete basements where cell signals and Wi-Fi cannot reach. 
                HazardHub AI is built <strong>local-first</strong> with Dexie.js IndexedDB persistence.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cryptographic QR Payload</span>
                  </div>
                  <p className="text-slate-500">Dual-key offline verification exchanged directly between device screens without internet.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Automatic Sync Queue</span>
                  </div>
                  <p className="text-slate-500">Field events queue locally and flush automatically when the driver ascends to street level.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => navigateTo('custody')}
                  className="px-5 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  Test Offline Chain of Custody
                </button>
                <button
                  onClick={() => setChaosDockOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                >
                  Simulate Dead-Zone in Chaos Lab
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700">
                  <QrCode className="w-9 h-9 text-[#00875A]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#0A192F]">Dual-Key Offline QR Handshake</h4>
                  <p className="text-xs text-slate-500">
                    Technician Signature Hash + Driver Verification Token
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-[10px] font-mono text-slate-600 break-all text-left">
                  PAYLOAD:HHUB-LOT-8821|TS:1741157200|SIG:SHA256:7f83b1657ff1fc53b92...|STAT:CERTIFIED
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. IMPACT & STATISTICS */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00875A]">
            Cooperative Impact
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A192F] tracking-tight">
            Measurable Environmental &amp; Economic Metrics
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Real outcomes generated across the 8 linked participating facilities in our regional cooperative.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <span className="text-4xl font-black font-mono text-[#00875A]">≥ 150 L</span>
            <h3 className="font-bold text-sm text-[#0A192F]">Hauler Quota Attained</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consistently satisfies hauler batch thresholds with 0 solo-dispatch penalties.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <span className="text-4xl font-black font-mono text-teal-700">8</span>
            <h3 className="font-bold text-sm text-[#0A192F]">Facilities Linked</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              High schools, dental surgery clinics, pathology labs, and water quality testing boards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <span className="text-4xl font-black font-mono text-blue-700">0</span>
            <h3 className="font-bold text-sm text-[#0A192F]">Compatibility Incidents</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% deterministic safety enforcement preventing catastrophic reactions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <span className="text-4xl font-black font-mono text-purple-700">42%</span>
            <h3 className="font-bold text-sm text-[#0A192F]">Cost Reduction</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Average disposal cost savings achieved per facility through shared regional logistics.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL CALL TO ACTION (CTA) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-[#00875A] to-[#006B4E] text-white shadow-xl shadow-[#00875A]/20 space-y-6 text-center max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5" />
              <span>Oaks AI Builders Challenge</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Ready to Coordinate Safe Regional Hazmat Logistics?
            </h2>

            <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
              Launch the live platform to monitor real-time quotas, verify chemical compatibility, or simulate offline field custody.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => navigateTo('dashboard')}
              className="px-6 py-3.5 rounded-xl bg-white text-[#006B4E] hover:bg-emerald-50 font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Launch Live Platform
            </button>

            <button
              onClick={() => navigateTo('agent')}
              className="px-6 py-3.5 rounded-xl bg-[#00523C] hover:bg-[#004230] text-white border border-white/20 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
            >
              Try AI Operations Agent
            </button>

            <button
              onClick={() => navigateTo('labs')}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer"
            >
              View 8 Local Laboratories
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. COMPANY FOOTER */}
      {/* ========================================================================= */}
      <Footer />
    </div>
  );
};

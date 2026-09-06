import React from 'react';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  Cpu,
  RefreshCw,
  QrCode,
  Bot,
  AlertTriangle,
  Building2,
  Boxes,
  FileCheck2,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NavigationPage } from '../components/Navbar';
import { Lab, WasteItem, PoolingRun } from '../types';

interface HomePageProps {
  onNavigate: (page: NavigationPage) => void;
  labs: Lab[];
  wasteItems: WasteItem[];
  poolingRuns: PoolingRun[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  labs,
  wasteItems,
  poolingRuns,
}) => {
  const totalVolume = wasteItems.reduce((acc, it) => acc + it.volumeGal, 0);
  const activeLabsCount = labs.filter((l) => l.operationalStatus !== 'cancelled').length;
  const criticalWasteCount = wasteItems.filter((w) => w.urgency === 'critical').length;

  return (
    <div className="space-y-24 py-6 bg-slate-50 text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              <span>Regional Operational Status: Pacific Northwest Bio-Corridor Active</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Autonomous Regional <br />
              <span className="text-teal-700">Hazmat Pooling</span> &amp; Compliance
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
              HazardHub AI empowers research laboratories, biotech foundries, and regional institutions to autonomously consolidate hazardous chemical waste into certified, non-reactive pickup runs with mathematical safety verification.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-cta-build-pickup"
                onClick={() => onNavigate('pooling')}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-md text-base font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-sm transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                <Truck className="w-5 h-5 mr-2" />
                Build a Pickup
              </button>

              <button
                id="hero-cta-explore-platform"
                onClick={() => onNavigate('platform')}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-md text-base font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 shadow-xs transition-all cursor-pointer"
              >
                Explore Platform
                <ArrowRight className="w-4 h-4 ml-2 text-slate-500" />
              </button>
            </div>

            {/* Key Assurance Badges */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Deterministic ChemiGuard™ Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>EPA 40 CFR § 264.177 Enforced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Offline-First QR Handoff</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card: Live Corridor Snapshot */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-700" />
                  <span className="font-bold text-sm text-slate-900">Corridor Dispatch Pulse</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  REAL-TIME SYNC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Participating Labs</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{activeLabsCount}</div>
                  <div className="text-[11px] text-teal-700 font-semibold mt-0.5">100% compliant</div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Staged Waste Volume</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{totalVolume} L</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">30 monitored lots</div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Active Pooling Runs</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{poolingRuns.length} Runs</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">QuotaPacker optimal</div>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200/60">
                  <div className="text-xs text-amber-900 font-medium">Critical Urgency</div>
                  <div className="text-2xl font-black text-amber-900 mt-1">{criticalWasteCount} Lots</div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-0.5">Priority routing</div>
                </div>
              </div>

              {/* Sample Live Run Mini Item */}
              <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Next Scheduled Regional Run</div>
                  <div className="text-[11px] text-slate-600">Run #HH-POOL-RUN-2026-001 • CleanHarbors #CH-409</div>
                </div>
                <button
                  onClick={() => onNavigate('pooling')}
                  className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1"
                >
                  View Plan <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT HAZARDHUB AI */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              The Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Solving Hazardous Waste Inefficiencies with Deterministic Safety
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Problem */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">The Problem</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Individual research labs operate in silos. Each orders solitary hauler dispatches, paying 400% inflated LTL freight fees while diesel trucks travel under-utilized. Incompatible chemicals occasionally mix in transit due to manual paper manifest errors.
              </p>
            </div>

            {/* Solution */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">The Solution</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Autonomous regional pooling. HazardHub AI consolidates multiple labs within an industrial cluster into synchronized pickup corridors, filling certified trucks to 90%+ legal volume while cutting logistical carbon emissions by 54%.
              </p>
            </div>

            {/* Safety & Local-First */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Safety &amp; Local-First</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chemical safety is never left to probabilistic guesses. The ChemiGuard™ deterministic matrix computes exact EPA reactive compatibility. If an incompatible pair is staged, it is mathematically blocked. Works 100% offline at remote loading docks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Engineered For Zero Violations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The Five Core Systems
          </h2>
          <p className="text-slate-600 text-base">
            Every layer of HazardHub AI is decoupled into specialized deterministic micro-engines paired with natural-language operational intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ChemiGuard */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-teal-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ChemiGuard™</h3>
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Deterministic Mixing Validation
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              EPA 40 CFR § 264.177 &amp; DOT 49 CFR § 177.848 rule engine. Checks pH differentials, exothermic enthalpies, toxic gas liberation, and oxidizer-organic reactivity before any container is loaded.
            </p>
          </div>

          {/* QuotaPacker */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-teal-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">QuotaPacker™</h3>
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Autonomous Bin-Packing
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Multi-constraint knapsack optimizer that bundles compatible waste lots up to truck limits (3028 L / 16 drums) while respecting lab dock schedules, physical segregation, and urgency tiers.
            </p>
          </div>

          {/* ResilienceGuard */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-teal-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ResilienceGuard™</h3>
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Real-Time Dock Failover
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instantly absorbs dock anomalies. If a lab cancels or a hauler rejects a damaged bung, routes are dynamically rebalanced in sub-seconds with compatible reserve drums from neighboring facilities.
            </p>
          </div>

          {/* CustodySentinel */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-teal-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">CustodySentinel™</h3>
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Cryptographic QR Manifesting
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Local-first chain of custody. Generates tamper-evident QR handoffs that sign transfer steps with ECDSA digital keys on mobile scanners without needing active internet connection.
            </p>
          </div>

          {/* AI Operations Agent */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-teal-500/40 transition-colors space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                GOVERNED BY DETERMINISTIC GUARDRAILS
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Operations Agent</h3>
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Natural Language Operator Interface
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Facilitates plain-English inquiries regarding complex EPA regulations, schedule adjustments, and chemical reactivity. Always executes the underlying deterministic engine first and reveals the exact tool invocation for full enterprise auditability.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Step-by-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From Lab Accumulation to Safe TSDF Final Disposal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Waste Logging',
                desc: 'Labs catalog drums with CAS, pH, flash point, volume, and EPA waste codes.',
              },
              {
                step: '02',
                title: 'Compatibility Check',
                desc: 'ChemiGuard™ runs pairwise matrix validation to prevent exothermic mixing.',
              },
              {
                step: '03',
                title: 'Smart Pooling',
                desc: 'QuotaPacker™ groups compatible lots across nearby labs to optimize hauler loads.',
              },
              {
                step: '04',
                title: 'Pickup Coordination',
                desc: 'Synchronized dock windows dispatched to licensed certified hazmat carriers.',
              },
              {
                step: '05',
                title: 'Chain of Custody',
                desc: 'ECDSA cryptographic QR handoffs seal the EPA Form 8700-22 e-manifest.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-lg bg-slate-50 border border-slate-200 relative space-y-2"
              >
                <div className="text-2xl font-black text-teal-700/60 font-mono">
                  {item.step}
                </div>
                <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SAFETY & COMPLIANCE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-3xl space-y-5 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4" /> REGULATORY ASSURANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Deterministic Safety Blocking: Zero Hallucinations in Chemical Logistics
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Large language models are inherently probabilistic and cannot be trusted with lethal chemical reactions. In HazardHub AI, compatibility is computed purely through deterministic code based on the EPA Mixing Incompatibility Chart (40 CFR § 264 Appendix V) and DOT 49 CFR § 177.848.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-teal-400 text-sm mb-1">Catastrophic Reaction Prevention</div>
                <div className="text-xs text-slate-300">
                  Blocks Strong Acids from contact with Cyanides, Sulfides, and Caustic Bases (preventing deadly HCN/Cl2 gas &amp; explosive boilover).
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-teal-400 text-sm mb-1">DOT Class Segregation</div>
                <div className="text-xs text-slate-300">
                  Enforces strict partition rules between Class 5.1 Oxidizers and Class 3 Flammables to eliminate in-transit spontaneous combustion risks.
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onNavigate('waste')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Test Chemical Matrix in Waste Manager <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OFFLINE OPERATIONS */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Resilient Infrastructure
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Offline-First Loading Dock Architecture
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Hazardous waste staging bays, concrete containment bunkers, and rural transfer yards frequently suffer from zero cellular or Wi-Fi signal. CustodySentinel™ stores verified cryptographic manifests directly inside local browser memory.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Air-Gapped QR Handoff</h4>
                    <p className="text-xs text-slate-600">The driver scans the generator's screen; the payload contains a complete self-verifying digital seal.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Local Tamper-Proof Storage</h4>
                    <p className="text-xs text-slate-600">Custody logs are queued in local key-value state with ECDSA hardware timestamping.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Zero-Friction Cloud Sync</h4>
                    <p className="text-xs text-slate-600">Once the vehicle reaches cellular coverage, all queued transfers automatically sync to the regional cloud registry.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-teal-700" />
                    <span className="font-bold text-sm text-slate-900">CustodySentinel™ Mobile Preview</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    AIR-GAPPED COMPATIBLE
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-white border border-slate-200 font-mono text-xs space-y-2">
                  <div className="text-slate-500">// Protocol: HAZARDHUB-CUSTODY-V1</div>
                  <div className="text-teal-900 font-semibold">
                    {`{"manifest": "EPA-8700-WA-482910", "drums": 16, "vol_L": 785}`}
                  </div>
                  <div className="text-slate-500">// Digital Signature:</div>
                  <div className="text-xs text-slate-700 break-all bg-slate-50 p-2 rounded border border-slate-200">
                    ECDSA-P256-GEN-VANCE-89421-SEALED
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('custody')}
                  className="w-full py-2.5 rounded-md bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Open Chain of Custody &amp; Test Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. OPERATIONAL IMPACT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Regional Environmental Metrics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Corridor Performance &amp; Savings
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{labs.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Participating Labs</div>
            <div className="text-xs text-teal-700 font-medium pt-1">Pacific NW Research Cluster</div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{totalVolume} L</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Available Waste Volume</div>
            <div className="text-xs text-teal-700 font-medium pt-1">Across 30 monitored lots</div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{poolingRuns.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pickup Lots / Runs</div>
            <div className="text-xs text-teal-700 font-medium pt-1">94% average truck utilization</div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-emerald-700">100%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Safety Segregation</div>
            <div className="text-xs text-emerald-700 font-medium pt-1">Zero EPA mixing violations</div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-10 sm:p-12 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ready to Consolidate Regional Hazmat Logistics?
            </h2>
            <p className="text-slate-600 text-base">
              Run the autonomous optimizer or consult the AI compliance agent to review real-time chemical compatibility.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id="final-cta-build-safe-pickup"
              onClick={() => onNavigate('pooling')}
              className="px-6 py-3.5 rounded-md font-bold text-base bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-5 h-5" />
              Build a Safe Pickup
            </button>

            <button
              id="final-cta-ask-ai-agent"
              onClick={() => onNavigate('ai-ops')}
              className="px-6 py-3.5 rounded-md font-bold text-base bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-5 h-5 text-teal-700" />
              Ask the AI Operations Agent
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

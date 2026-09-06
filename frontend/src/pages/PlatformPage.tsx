import React, { useState } from 'react';
import {
  ShieldAlert,
  Boxes,
  RefreshCw,
  QrCode,
  Bot,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Sliders,
  Database,
  Cpu,
} from 'lucide-react';
import { NavigationPage } from '../components/Navbar';

interface PlatformPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const PlatformPage: React.FC<PlatformPageProps> = ({ onNavigate }) => {
  const [activeEngineTab, setActiveEngineTab] = useState<'chemiguard' | 'quotapacker' | 'resilience' | 'custody' | 'ai'>('chemiguard');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          SYSTEM ARCHITECTURE SPECIFICATION v4.2
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Platform Architecture &amp; Deterministic Engine Workflow
        </h1>
        <p className="text-slate-600 text-base max-w-3xl leading-relaxed">
          HazardHub AI bridges the gap between decentralized industrial laboratories and licensed hazmat logistics carriers. Our core philosophy decouples probabilistic language intelligence from authoritative deterministic chemical safety verification.
        </p>
      </div>

      {/* Complete System Workflow Visual Flow */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-700" />
          End-to-End Autonomous Hazmat Pooling Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 relative">
            <span className="text-xs font-bold text-teal-700 font-mono">STAGE 01</span>
            <h4 className="text-sm font-bold text-slate-900">Lab Waste Staging</h4>
            <p className="text-xs text-slate-600">
              Participating labs catalog waste drums with CAS numbers, pH values, flashpoints, and EPA codes in local key-value state.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">Output: Verified Drum Profile</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 relative">
            <span className="text-xs font-bold text-teal-700 font-mono">STAGE 02</span>
            <h4 className="text-sm font-bold text-slate-900">ChemiGuard™ Validation</h4>
            <p className="text-xs text-slate-600">
              Deterministic O(N²) pairwise check validates EPA 40 CFR § 264.177 compatibility before any bundle formation is allowed.
            </p>
            <div className="text-[11px] text-emerald-700 font-semibold font-mono">Zero-Tolerance Blocking Gate</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 relative">
            <span className="text-xs font-bold text-teal-700 font-mono">STAGE 03</span>
            <h4 className="text-sm font-bold text-slate-900">QuotaPacker™ Pooling</h4>
            <p className="text-xs text-slate-600">
              Multi-constraint knapsack algorithm auto-packs compatible items into certified truck batches up to 3028 L/vehicle.
            </p>
            <div className="text-[11px] text-teal-700 font-semibold font-mono">Payload &gt;90% Capacity</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 relative">
            <span className="text-xs font-bold text-teal-700 font-mono">STAGE 04</span>
            <h4 className="text-sm font-bold text-slate-900">CustodySentinel™ Handoff</h4>
            <p className="text-xs text-slate-600">
              Cryptographic QR codes signed with ECDSA-P256 hardware tokens seal the EPA Form 8700-22 e-Manifest air-gapped at the dock.
            </p>
            <div className="text-[11px] text-slate-700 font-mono">DOT e-Manifest Sealed</div>
          </div>
        </div>
      </div>

      {/* Interactive Engine Deep Dive Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'chemiguard', label: '1. ChemiGuard™ Engine', icon: <ShieldAlert className="w-4 h-4" /> },
            { id: 'quotapacker', label: '2. QuotaPacker™ Optimizer', icon: <Boxes className="w-4 h-4" /> },
            { id: 'resilience', label: '3. ResilienceGuard™ Failover', icon: <RefreshCw className="w-4 h-4" /> },
            { id: 'custody', label: '4. CustodySentinel™ Protocol', icon: <QrCode className="w-4 h-4" /> },
            { id: 'ai', label: '5. AI Operations Guardrail', icon: <Bot className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveEngineTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeEngineTab === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: ChemiGuard */}
        {activeEngineTab === 'chemiguard' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">ChemiGuard™ Deterministic Chemical Safety Engine</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Enforces EPA 40 CFR § 264 Appendix V and DOT 49 CFR § 177.848 Hazmat Segregation Tables.
                </p>
              </div>
              <button
                onClick={() => onNavigate('waste')}
                className="px-4 py-2 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 flex items-center gap-1 shrink-0"
              >
                Launch Matrix Tester <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Incompatible Pair</th>
                    <th className="px-4 py-3">Regulatory Code</th>
                    <th className="px-4 py-3">Deterministic Reaction Hazard</th>
                    <th className="px-4 py-3">System Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      Mineral Acids (pH &lt; 2) + Cyanides / Sulfides (P106)
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">EPA Group 1-A / 7-A</td>
                    <td className="px-4 py-3.5 text-red-700 font-medium">
                      Lethal Hydrogen Cyanide (HCN) / H2S gas evolution
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[11px]">
                        HARD BLOCK
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      Strong Mineral Acids + Caustic Bases (pH &gt; 12.5)
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">EPA Group 1-A / 1-B</td>
                    <td className="px-4 py-3.5 text-amber-900 font-medium">
                      Violent exothermic neutralization, flash boiling, drum rupture
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[11px]">
                        HARD BLOCK
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      Strong Oxidizers (Div 5.1) + Flammable Organics (Class 3)
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">DOT Table "X" Mandate</td>
                    <td className="px-4 py-3.5 text-amber-900 font-medium">
                      Hypergolic ignition, spontaneous combustion in cargo hold
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[11px]">
                        HARD BLOCK
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      Hypochlorite Bleach + Mineral Acids or Ammonia
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">40 CFR § 264.177</td>
                    <td className="px-4 py-3.5 text-red-700 font-medium">
                      Immediate release of toxic Chlorine (Cl2) or Chloramine gas
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[11px]">
                        HARD BLOCK
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      Water-Reactive Hydrides (D003) + Aqueous Solutions
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">EPA Group 3-A / 3-B</td>
                    <td className="px-4 py-3.5 text-red-700 font-medium">
                      Rapid generation of explosive Hydrogen gas (H2)
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[11px]">
                        HARD BLOCK
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: QuotaPacker */}
        {activeEngineTab === 'quotapacker' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">QuotaPacker™ Mathematical Bin-Packing Model</h3>
            <p className="text-sm text-slate-600">
              Transforms regional hazardous waste collection from ad-hoc single-facility dispatching into an optimal multi-stop traveling salesperson &amp; multidimensional knapsack problem.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Vehicle Capacity Bounds</div>
                <p className="text-xs text-slate-600">
                  Strictly caps cargo at 3028 L or 16 drums per standardized DOT Class-A straight truck to avoid axle weight and volumetric overfill violations.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Urgency Scheduling Heuristics</div>
                <p className="text-xs text-slate-600">
                  Applies dynamic weight ranking: Critical lots (e.g. ether peroxide risks, unstable monomers) are forced into the primary batch, followed by High and Medium lots.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Cluster Stop Sequencing</div>
                <p className="text-xs text-slate-600">
                  Calculates geographic corridor routes among Seattle, Bellevue, Redmond, Renton, and Tacoma to minimize deadhead miles and driver duty hours.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('pooling')}
                className="px-4 py-2.5 rounded-md bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors flex items-center gap-2"
              >
                <Boxes className="w-4 h-4" /> Go to Auto-Bundle Dispatcher
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: ResilienceGuard */}
        {activeEngineTab === 'resilience' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">ResilienceGuard™ Real-Time Anomaly Absorption</h3>
            <p className="text-sm text-slate-600">
              Unlike static logistics systems that crash when an appointment is missed, ResilienceGuard is built for dock realities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-teal-700" /> Scenario A: Emergency Lab Cancellation
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If a scheduled lab has a dock failure or facility emergency, the engine immediately purges that lab’s items from the manifest, recalculates route times, and queries standby compatible drums from adjacent cluster labs to avoid carrier "empty run" penalties.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-amber-700" /> Scenario B: Hauler Dock Drum Rejection
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  During pre-trip inspection, if a driver flags a drum for a damaged bung gasket, dented chime, or smudged DOT label, the item is quarantined into the lab's rejection bay. ResilienceGuard drafts an alternate certified drum to fulfill the carrier's minimum booking tonnage.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: CustodySentinel */}
        {activeEngineTab === 'custody' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">CustodySentinel™ Cryptographic QR Chain</h3>
            <p className="text-sm text-slate-600">
              Replaces vulnerable multi-page paper carbons with a tamper-evident digital protocol verified across all transport handoffs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">ECDSA-P256 Digital Signatures</div>
                <p className="text-xs text-slate-600">
                  Each custody transfer is signed by the generator, driver, and TSDF facility receiver with a hardware-anchored private key.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Air-Gapped Loading Docks</div>
                <p className="text-xs text-slate-600">
                  Functions with zero internet connectivity. The QR code embeds all manifest codes, volume counts, and cryptographic hashes in the 2D matrix.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">EPA e-Manifest Standard</div>
                <p className="text-xs text-slate-600">
                  Compliant with EPA hazardous waste manifest registry specifications under the federal e-Manifest Act (Public Law 112-195).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: AI Operations */}
        {activeEngineTab === 'ai' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">AI Operations Agent &amp; Deterministic Primacy</h3>
            <p className="text-sm text-slate-600">
              The AI Operations Agent is governed by a strict architectural constraint:
              <strong className="text-slate-900 font-semibold"> Natural language models interpret user intent, but deterministic code makes all safety decisions.</strong>
            </p>

            <div className="p-5 rounded-lg bg-teal-50/60 border border-teal-200 space-y-3">
              <h4 className="font-bold text-teal-900 text-sm">Auditability &amp; Tool Transparency</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Whenever a user asks a question in the AI Operations interface (e.g. "Can I co-load Nitric Acid with Acetone?"), the system first calls `ChemiGuard.validatePair()`. The deterministic response is returned and displayed with an explicit engine badge (`[ChemiGuard: CRITICAL_BLOCK]`). The language model then explains the chemical thermodynamics and cites the relevant CFR sections without ever overriding the block.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('ai-ops')}
                className="px-4 py-2.5 rounded-md bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors flex items-center gap-2"
              >
                <Bot className="w-4 h-4" /> Open AI Operations Console
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Technical Standards Bar */}
      <div className="p-6 rounded-xl bg-slate-900 text-slate-200 space-y-4">
        <h4 className="font-bold text-white text-base">Federal &amp; State Compliance Frameworks Enforced</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded bg-slate-800 border border-slate-700">
            <div className="font-bold text-teal-400">EPA 40 CFR § 264.177</div>
            <div className="text-slate-400 mt-0.5">Incompatible Waste Mixing Segregation</div>
          </div>
          <div className="p-3 rounded bg-slate-800 border border-slate-700">
            <div className="font-bold text-teal-400">DOT 49 CFR § 177.848</div>
            <div className="text-slate-400 mt-0.5">Segregation Table for Hazardous Materials</div>
          </div>
          <div className="p-3 rounded bg-slate-800 border border-slate-700">
            <div className="font-bold text-teal-400">RCRA Subtitle C</div>
            <div className="text-slate-400 mt-0.5">Cradle-to-Grave Toxic Waste Accounting</div>
          </div>
          <div className="p-3 rounded bg-slate-800 border border-slate-700">
            <div className="font-bold text-teal-400">WAC 173-303</div>
            <div className="text-slate-400 mt-0.5">Washington State Dangerous Waste Regulations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

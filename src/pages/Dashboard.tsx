import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/db';
import { useAppStore } from '../store/useAppStore';
import { 
  Boxes, 
  FlaskConical, 
  Building2, 
  AlertTriangle, 
  Truck, 
  ArrowRight, 
  Clock, 
  Radio,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  ChevronRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setActiveTab, setActiveLabFilter } = useAppStore();
  const [activeSubView, setActiveSubView] = useState<'critical' | 'facilities' | 'compliance'>('critical');

  const labs = useLiveQuery(() => db.labs.toArray()) || [];
  const wasteItems = useLiveQuery(() => db.wasteItems.toArray()) || [];
  const pickupLots = useLiveQuery(() => db.pickupLots.toArray()) || [];

  // Metrics
  const activeWaste = wasteItems.filter((w) => w.status === 'AVAILABLE');
  const totalAvailableVolume = activeWaste.reduce((sum, w) => sum + w.volumeLiters, 0);
  const urgentItems = activeWaste.filter((w) => w.urgency === 'URGENT');
  const participatingLabsCount = labs.filter((l) => l.isParticipating).length;

  const threshold = 150;
  const progressPercent = Math.min(100, Math.round((totalAvailableVolume / threshold) * 100));

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Hero Section: Bright Environmental Telemetry */}
      <section className="relative rounded-3xl p-6 sm:p-8 md:p-10 bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Subtle decorative environmental ambient gradients */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              <span>Cooperative Logistics Telemetry</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="font-mono text-[11px] text-teal-700 font-bold">8 Regional Facilities Linked</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A192F] tracking-tight leading-tight">
              Regional Pickup Quota:{' '}
              <span className="text-[#00875A] font-mono">
                {totalAvailableVolume.toFixed(1)}
              </span>{' '}
              <span className="text-slate-400 text-xl sm:text-2xl font-normal font-mono">/ {threshold} L</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Certified hazardous disposal haulers require a minimum <strong>150 Liter volume threshold</strong> for cost-effective dispatch. HazardHub AI consolidates unbundled inventories across neighborhood clinics and research labs into certified, co-compatible pickup manifests.
            </p>
          </div>

          {/* Quick Action & Readiness State */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5 shrink-0">
            <button
              onClick={() => setActiveTab('builder')}
              className="px-6 py-3.5 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm shadow-[#00875A]/20 active:scale-95 cursor-pointer"
            >
              <Boxes className="w-4 h-4" />
              <span>Launch Pickup Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center sm:justify-end">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>ChemiGuard Matrix Active (EPA 40 CFR)</span>
            </div>
          </div>
        </div>

        {/* 150L Quota Progress Meter */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-1">
            <span className="text-slate-700 flex items-center gap-2">
              <span className="text-slate-500">Regional Pool Aggregation:</span>
              <strong className="text-teal-800 font-mono text-sm">{totalAvailableVolume.toFixed(1)} L</strong>
              <span className="text-slate-400 font-mono text-[11px]">({progressPercent}%)</span>
            </span>
            <span className={`font-mono text-xs flex items-center gap-1.5 ${progressPercent >= 100 ? 'text-emerald-700 font-bold' : 'text-teal-700'}`}>
              {progressPercent >= 100 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                  <span>QUOTA FULFILLED — READY FOR DISPATCH HANDOFF</span>
                </>
              ) : (
                <span>{(threshold - totalAvailableVolume).toFixed(1)} L remaining to trigger cooperative dispatch</span>
              )}
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-100 border border-slate-200 p-0.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                progressPercent >= 100
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-xs'
                  : 'bg-gradient-to-r from-teal-600 to-teal-500 shadow-xs'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* KPI Stats Cards */}
      <section aria-label="Operational Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Volume */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Unbundled Ready Waste
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono">
            {totalAvailableVolume.toFixed(1)} <span className="text-xs font-normal text-slate-400 uppercase font-sans">Liters</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Across {activeWaste.length} eligible canisters</span>
          </p>
        </div>

        {/* Card 2: Urgent Items */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all duration-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Urgent Expirations
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-rose-600 font-mono">
            {urgentItems.length} <span className="text-xs font-normal text-slate-400 uppercase font-sans">Canisters</span>
          </div>
          <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Expiring within 14 days or deteriorating</span>
          </p>
        </div>

        {/* Card 3: Participating Labs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Member Labs
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono">
            {participatingLabsCount} <span className="text-xs font-normal text-slate-400 uppercase font-sans">/ {labs.length} Facilities</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Cooperative mutual-aid corridor</span>
          </p>
        </div>

        {/* Card 4: Scheduled Lots */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bundled Pickup Lots
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-emerald-700 font-mono">
            {pickupLots.length} <span className="text-xs font-normal text-slate-400 uppercase font-sans">Lots Dispatched</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Cryptographic QR & EPA Manifested</span>
          </p>
        </div>
      </section>

      {/* Progressive Disclosure Section: Interactive Sub-view Tabs */}
      <section aria-label="Operational Feeds" className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSubView('critical')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubView === 'critical'
                  ? 'bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#00875A]" />
              <span>Critical Attention Queue</span>
              {urgentItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                  {urgentItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubView('facilities')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubView === 'facilities'
                  ? 'bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#00875A]" />
              <span>Facility Readiness Matrix</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                {labs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubView('compliance')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubView === 'compliance'
                  ? 'bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00875A]" />
              <span>EPA Regulatory Compliance</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-bold text-[#00875A] hover:text-[#007A5E] flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <span>Full Inventory ({wasteItems.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Content 1: Critical Attention Feed */}
        {activeSubView === 'critical' && (
          <div className="space-y-3">
            {urgentItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">No urgent chemical expirations pending</p>
                <p className="text-xs text-slate-500 mt-1">All ready waste canisters are within standard storage window.</p>
              </div>
            ) : (
              urgentItems.slice(0, 6).map((item) => {
                const lab = labs.find((l) => l.id === item.labId);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-mono text-[10px] font-bold">
                          {item.daysUntilExpiring}d remaining
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">
                          {item.unCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-semibold text-teal-700">{lab?.name || item.labId}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">{item.epaGroup.replace('GROUP_', 'EPA Group ')}</span>
                        <span>•</span>
                        <span className="text-slate-500">{item.containerType}</span>
                        {item.condition === 'LEAKING' && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 font-bold font-mono text-[10px] uppercase">LEAKING BUNG DETECTED</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 font-mono text-base">
                          {item.volumeLiters.toFixed(1)} L
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {item.chemicalFormula || item.containerType}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('builder')}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-700 hover:text-teal-800 border border-slate-200 hover:border-teal-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Bundle into Lot
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Content 2: Facilities Grid */}
        {activeSubView === 'facilities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {labs.map((lab) => {
              const labWaste = wasteItems.filter((w) => w.labId === lab.id && w.status === 'AVAILABLE');
              const vol = labWaste.reduce((s, w) => s + w.volumeLiters, 0);

              return (
                <div
                  key={lab.id}
                  onClick={() => {
                    setActiveLabFilter(lab.id);
                    setActiveTab('inventory');
                  }}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:bg-white cursor-pointer flex flex-col justify-between transition-all duration-200 group hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                        {lab.name}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-white text-teal-700 font-mono text-[9px] font-bold border border-slate-200 uppercase">
                        {lab.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mb-3">{lab.epaFacilityId}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">{vol.toFixed(1)} L</span>
                      <span className="text-[10px] text-slate-500 block">{labWaste.length} canisters</span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                      Filter →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Content 3: Regulatory Compliance Snapshot */}
        {activeSubView === 'compliance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-teal-700">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">EPA 40 CFR Appendix V</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic binary safety matrix prevents lethal reactions (exothermic mixing, toxic hydrogen cyanide liberation, fire) before canister co-loading.
              </p>
              <div className="pt-2 text-[11px] font-mono text-teal-700 font-semibold">
                12 Validated Hazard Groups Enabled
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-teal-700">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">QuotaPacker Reserve</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic Knapsack optimization enforces an autonomous 15% safety buffer. If any canister fails pre-trip dock inspection, fallback waste seamlessly takes its place.
              </p>
              <div className="pt-2 text-[11px] font-mono text-teal-700 font-semibold">
                15% Standby Contingency Enforced
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-teal-700">
                <FileCheck2 className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Offline QR Handshake</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates self-contained, air-gapped QR payloads with cryptographic checksum verification. Driver scan executes zero-network transfer without cloud reliance.
              </p>
              <div className="pt-2 text-[11px] font-mono text-teal-700 font-semibold">
                Form 8700-22 Certified Manifest
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

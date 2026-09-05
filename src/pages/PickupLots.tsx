import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/db';
import { useAppStore } from '../store/useAppStore';
import { ResilienceGuardEngine, type RecoveryPlan } from '../engines/resilienceguard/resilienceguard';
import { EPA8700Manifest } from '../components/manifest/EPA8700Manifest';
import type { PickupLot, WasteItem } from '../types';
import { 
  Truck, 
  Calendar, 
  User, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  X, 
  ShieldCheck, 
  CheckCircle2,
  Printer,
  ChevronDown,
  ChevronUp,
  FileCheck2
} from 'lucide-react';

export const PickupLots: React.FC = () => {
  const { setSelectedLotId, setActiveTab, addToast } = useAppStore();

  const lots = useLiveQuery(() => db.pickupLots.toArray()) || [];
  const wasteItems = useLiveQuery(() => db.wasteItems.toArray()) || [];
  const labs = useLiveQuery(() => db.labs.toArray()) || [];

  // Active manifest modal
  const [manifestLot, setManifestLot] = useState<PickupLot | null>(null);

  // Active recovery plan modal
  const [activePlan, setActivePlan] = useState<{
    lot: PickupLot;
    plan: RecoveryPlan;
    offendingItemIds: string[];
  } | null>(null);

  // Rejection modal selector
  const [rejectionTargetLot, setRejectionTargetLot] = useState<PickupLot | null>(null);

  // Cancellation modal selector
  const [cancellationTargetLot, setCancellationTargetLot] = useState<PickupLot | null>(null);

  // Track expanded item drawers per lot
  const [expandedLotIds, setExpandedLotIds] = useState<Record<string, boolean>>({});

  const toggleLotExpansion = (lotId: string) => {
    setExpandedLotIds((prev) => ({ ...prev, [lotId]: !prev[lotId] }));
  };

  // Handle simulating a container rejection
  const handleSimulateRejection = (lot: PickupLot, item: WasteItem) => {
    const lotItems = wasteItems.filter((w) => lot.wasteItemIds.includes(w.id));
    const availablePool = wasteItems.filter((w) => w.status === 'AVAILABLE' || w.status === 'RESERVED');

    const plan = ResilienceGuardEngine.planCanisterRejectionRecovery(
      lot,
      item,
      'DAMAGED_LEAKING',
      lotItems,
      availablePool
    );

    setActivePlan({
      lot,
      plan,
      offendingItemIds: [item.id],
    });
    setRejectionTargetLot(null);
  };

  // Handle simulating a lab cancellation
  const handleSimulateLabCancellation = (lot: PickupLot, labId: string) => {
    const lotItems = wasteItems.filter((w) => lot.wasteItemIds.includes(w.id));
    const availablePool = wasteItems.filter((w) => w.status === 'AVAILABLE' || w.status === 'RESERVED');

    const plan = ResilienceGuardEngine.planLabCancellationRecovery(
      lot,
      labId,
      lotItems,
      availablePool
    );

    const cancelledItems = lotItems.filter((i) => i.labId === labId);

    setActivePlan({
      lot,
      plan,
      offendingItemIds: cancelledItems.map((i) => i.id),
    });
    setCancellationTargetLot(null);
  };

  // Confirm recovery execution
  const handleExecuteRecovery = async () => {
    if (!activePlan) return;

    await ResilienceGuardEngine.executeRecoveryPlan(
      activePlan.lot,
      activePlan.plan,
      activePlan.offendingItemIds
    );

    addToast('success', `ResilienceGuard: Recovery applied! Lot volume restored to ${activePlan.plan.newProjectedVolume.toFixed(1)} L.`);
    setActivePlan(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              Bundled Pickup Lots &amp; Dispatches
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5]">
              {lots.length} Active Lots
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            EPA Form 8700-22 certified multi-facility pooling lots with automated standby recovery resilience against field rejections.
          </p>
        </div>

        {lots.length === 0 && (
          <button
            onClick={() => setActiveTab('builder')}
            className="px-4 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Pickup Builder</span>
          </button>
        )}
      </div>

      {lots.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-200 bg-white text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F8F3] text-[#007A5E] flex items-center justify-center mx-auto border border-[#A3E8D5]">
            <Truck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">No Pickup Lots Staged Yet</h3>
            <p className="text-xs text-slate-500">
              Launch the Pickup Builder to assemble compatible containers across local clinics and labs to satisfy the mandatory 150 L hauler quota.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('builder')}
            className="px-6 py-3 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            Launch 1-Click Auto-Bundle
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {lots.map((lot) => {
            const lotItems = wasteItems.filter((w) => lot.wasteItemIds.includes(w.id));
            const standbyItems = wasteItems.filter((w) => lot.standbyWasteItemIds?.includes(w.id));
            const participatingLabs = labs.filter((l) => lot.participatingLabIds.includes(l.id));
            const isExpanded = expandedLotIds[lot.id] !== false; // expanded by default

            return (
              <div
                key={lot.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6"
              >
                {/* Lot Header & Telemetry */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-200 pb-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight">
                        {lot.lotNumber}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border font-mono ${
                          lot.isThresholdMet
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                        }`}
                      >
                        {lot.isThresholdMet ? '✓ 150L Quota Fulfilled' : '⚠️ Below Quota'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-teal-800 font-mono text-xs uppercase tracking-wider font-semibold">
                        {lot.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-teal-600" />
                        <strong className="text-slate-800">{lot.haulerName}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Driver: {lot.haulerDriverName}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pickup: {lot.scheduledDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Volume Gauge & Primary Lot CTAs */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Manifest Aggregation
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-700">
                        {lot.totalVolumeLiters.toFixed(1)}{' '}
                        <span className="text-xs font-normal text-slate-400 font-sans">/ {lot.targetThresholdLiters} L</span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => setManifestLot(lot)}
                        className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all border border-slate-300 shadow-xs cursor-pointer"
                        title="View & Print Official EPA Form 8700-22 Manifest"
                      >
                        <Printer className="w-4 h-4 text-teal-600" />
                        <span>EPA 8700-22</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedLotId(lot.id);
                          setActiveTab('custody');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>Chain-of-Custody</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resilience Edge-Case Simulator Toolbar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-teal-800 text-xs font-bold">
                      <Zap className="w-4 h-4 text-teal-600" />
                      <span>ResilienceGuard Stress-Test Simulator (Judge Demonstration Hub)</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Simulate dock disruptions and observe zero-cloud autonomous recovery
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Trigger Rejection */}
                    <button
                      onClick={() => setRejectionTargetLot(lot)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Simulate Canister Rejection (Leaking/Damaged Bung)</span>
                    </button>

                    {/* Trigger Lab Cancellation */}
                    <button
                      onClick={() => setCancellationTargetLot(lot)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                      <span>Simulate Last-Minute Facility Withdrawal</span>
                    </button>
                  </div>
                </div>

                {/* Progressive Disclosure: Manifest Canister Grid with Collapse Toggle */}
                <div className="space-y-3">
                  <div 
                    onClick={() => toggleLotExpansion(lot.id)}
                    className="flex items-center justify-between cursor-pointer select-none py-1 group"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-teal-700 transition-colors flex items-center gap-2 font-mono">
                      <span>Manifest Waste Canisters ({lotItems.length} Canisters across {participatingLabs.length} Facilities)</span>
                    </h4>
                    <span className="text-xs text-slate-500 group-hover:text-teal-700 flex items-center gap-1 font-semibold">
                      <span>{isExpanded ? 'Collapse' : 'Show Canisters'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
                      {lotItems.map((item) => {
                        const lab = labs.find((l) => l.id === item.labId);
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs shadow-xs hover:border-teal-300 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{item.name}</p>
                              <p className="text-[11px] text-teal-700 mt-0.5 truncate font-semibold">{lab?.name}</p>
                              <div className="flex items-center gap-2 mt-1.5 font-mono text-[10px] text-slate-500">
                                <span className="text-teal-700 font-semibold">{item.unCode}</span>
                                <span>•</span>
                                <span>{item.containerType}</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900 shrink-0 text-sm">
                              {item.volumeLiters.toFixed(1)} L
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Standby Buffer Reserves Preview */}
                {standbyItems.length > 0 && (
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-teal-900 font-bold">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-teal-600" />
                        <span>Pre-Approved Standby Reserve Contingency</span>
                      </div>
                      <span className="font-mono text-teal-800 font-bold">
                        +{standbyItems.reduce((s, i) => s + i.volumeLiters, 0).toFixed(1)} L Standby Buffer Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Standby containers remain staged at nearby participating labs. If any primary drum fails loading dock verification, ResilienceGuard auto-promotes these replacements instantly.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Target Selection Modal */}
      {rejectionTargetLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Simulate Driver Drum Rejection</h3>
              </div>
              <button
                onClick={() => setRejectionTargetLot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select a container to simulate a physical inspection failure at the dock (e.g. leaking gasket or damaged bung):
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {wasteItems
                .filter((w) => rejectionTargetLot.wasteItemIds.includes(w.id))
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSimulateRejection(rejectionTargetLot, item)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 flex items-center justify-between text-left text-xs transition-all group cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-rose-700">{item.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">{item.unCode} ({item.containerType})</span>
                    </div>
                    <span className="font-bold text-rose-600 font-mono text-sm">
                      -{item.volumeLiters.toFixed(1)} L
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Lab Cancellation Selection Modal */}
      {cancellationTargetLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-700">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Simulate Facility Withdrawal</h3>
              </div>
              <button
                onClick={() => setCancellationTargetLot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select a participating facility to simulate emergency withdrawal right before dispatch:
            </p>

            <div className="space-y-2">
              {labs
                .filter((l) => cancellationTargetLot.participatingLabIds.includes(l.id))
                .map((lab) => {
                  const labItems = wasteItems.filter(
                    (w) => w.labId === lab.id && cancellationTargetLot.wasteItemIds.includes(w.id)
                  );
                  const labVolume = labItems.reduce((s, i) => s + i.volumeLiters, 0);

                  return (
                    <button
                      key={lab.id}
                      onClick={() => handleSimulateLabCancellation(cancellationTargetLot, lab.id)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 flex items-center justify-between text-left text-xs transition-all group cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-teal-700">{lab.name}</span>
                        <span className="text-[11px] text-slate-500">{labItems.length} containers contributed</span>
                      </div>
                      <span className="font-bold text-rose-600 font-mono text-sm">
                        -{labVolume.toFixed(1)} L
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Resilience Recovery Plan Modal */}
      {activePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ResilienceGuard: Autonomous Recovery Plan</h3>
                  <p className="text-xs text-teal-700 font-semibold">{activePlan.plan.description}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePlan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Impact Metric Row */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center font-mono">
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Lost Volume</span>
                <span className="text-rose-600 font-bold text-sm">-{activePlan.plan.affectedVolumeLiters.toFixed(1)} L</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Remaining</span>
                <span className="text-slate-800 font-bold text-sm">{activePlan.plan.remainingVolumeBeforeRecovery.toFixed(1)} L</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Recovered Target</span>
                <span className="text-emerald-700 font-bold text-sm">{activePlan.plan.newProjectedVolume.toFixed(1)} L</span>
              </div>
            </div>

            {/* Explanation card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-1">
              <strong className="text-teal-800 block font-bold">Resilience Analysis:</strong>
              <p>{activePlan.plan.explanation}</p>
            </div>

            {/* Promoted Standby Items */}
            {activePlan.plan.replacementItems.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block font-mono">
                  Promoted Standby Replacements (+{activePlan.plan.replacementItems.reduce((s, i) => s + i.volumeLiters, 0).toFixed(1)} L):
                </span>
                <div className="space-y-1.5">
                  {activePlan.plan.replacementItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="block text-[10px] font-mono text-emerald-700">{item.unCode}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">+{item.volumeLiters.toFixed(1)} L</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActivePlan(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRecovery}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Recovery & Update Manifest</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable EPA Form 8700-22 Manifest Modal */}
      {manifestLot && (
        <EPA8700Manifest
          lot={manifestLot}
          items={wasteItems.filter((w) => manifestLot.wasteItemIds.includes(w.id))}
          labs={labs}
          onClose={() => setManifestLot(null)}
        />
      )}
    </div>
  );
};

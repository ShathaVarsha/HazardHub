import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import confetti from 'canvas-confetti';
import { db } from '../storage/db';
import { useAppStore } from '../store/useAppStore';
import { QuotaPackerEngine, type ProposedLotBundle } from '../engines/quotapacker/quotapacker';
import { ChemiGuardEngine } from '../engines/chemiguard/chemiguard';
import { ChemiGuardAlert } from '../components/common/ChemiGuardAlert';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  RotateCcw,
  CheckSquare,
  Square,
  Layers,
  Settings2,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';

export const PickupBuilder: React.FC = () => {
  const { setActiveTab, setSelectedLotId, addToast } = useAppStore();

  const labs = useLiveQuery(() => db.labs.toArray()) || [];
  const wasteItems = useLiveQuery(() => db.wasteItems.toArray()) || [];

  // Configurable threshold setting (default 150L as per prompt)
  const [minThreshold, setMinThreshold] = useState<number>(150);
  const [bufferPercent, setBufferPercent] = useState<number>(15);

  // Staged item selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [standbyIds, setStandbyIds] = useState<string[]>([]);

  // Filter for the builder pool
  const [filterLab, setFilterLab] = useState<string>('ALL');
  const [isStandbyDrawerOpen, setIsStandbyDrawerOpen] = useState(true);

  // Available eligible containers (unassigned, not leaking)
  const eligiblePool = useMemo(() => {
    return wasteItems.filter((w) => w.status === 'AVAILABLE' && w.condition !== 'LEAKING');
  }, [wasteItems]);

  // Selected Waste Items
  const selectedItems = useMemo(() => {
    return wasteItems.filter((w) => selectedIds.includes(w.id));
  }, [wasteItems, selectedIds]);

  // Standby Waste Items
  const standbyItems = useMemo(() => {
    return wasteItems.filter((w) => standbyIds.includes(w.id));
  }, [wasteItems, standbyIds]);

  // Calculations
  const currentVolume = selectedItems.reduce((acc, i) => acc + i.volumeLiters, 0);
  const isThresholdMet = currentVolume >= minThreshold;
  const progressPercent = Math.min(100, Math.round((currentVolume / minThreshold) * 100));

  // ChemiGuard compatibility evaluation on current selection
  const compatibility = useMemo(() => {
    return ChemiGuardEngine.evaluateLot(selectedItems);
  }, [selectedItems]);

  // Participating labs
  const participatingLabIds = Array.from(new Set(selectedItems.map((i) => i.labId)));

  // Trigger 1-Click Auto-Bundle
  const handleAutoBundle = () => {
    const proposal: ProposedLotBundle = QuotaPackerEngine.autoBundle(eligiblePool, {
      minThresholdLiters: minThreshold,
      reserveBufferPercent: bufferPercent,
    });

    if (proposal.selectedItems.length === 0) {
      addToast('warning', 'No compatible available containers found to build a lot.');
      return;
    }

    setSelectedIds(proposal.selectedItems.map((i) => i.id));
    setStandbyIds(proposal.standbyReserveItems.map((i) => i.id));

    if (proposal.isThresholdMet && proposal.compatibility.isSafe) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#059669', '#0284c7'],
      });
      addToast(
        'success',
        `Auto-Bundle assembled ${proposal.totalVolumeLiters.toFixed(1)}L across ${proposal.participatingLabIds.length} labs! 100% EPA Safe.`
      );
    } else {
      addToast(
        'info',
        `Auto-Bundle proposed ${proposal.totalVolumeLiters.toFixed(1)}L (${proposal.selectedItems.length} items).`
      );
    }
  };

  // Toggle container selection
  const handleToggleItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      setSelectedIds(selectedIds.filter((id) => id !== itemId));
    } else {
      setSelectedIds([...selectedIds, itemId]);
    }
  };

  // Remove item from ChemiGuard alert
  const handleRemoveIncompatibleItem = (itemId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== itemId));
    addToast('info', 'Offending container removed from lot.');
  };

  // Clear builder
  const handleClearSelection = () => {
    setSelectedIds([]);
    setStandbyIds([]);
  };

  // Finalize lot and persist to IndexedDB
  const handleFinalizeLot = async () => {
    if (!isThresholdMet) {
      addToast('error', `Cannot dispatch hauler: Minimum quota is ${minThreshold} L (Current: ${currentVolume.toFixed(1)} L).`);
      return;
    }

    if (!compatibility.isSafe) {
      addToast('error', 'Safety Violation: ChemiGuard has blocked finalization due to chemical incompatibility.');
      return;
    }

    const proposedBundle: ProposedLotBundle = {
      selectedItems,
      standbyReserveItems: standbyItems,
      totalVolumeLiters: currentVolume,
      targetThresholdLiters: minThreshold,
      reserveBufferLiters: Math.max(0, currentVolume - minThreshold),
      isThresholdMet: true,
      participatingLabIds,
      compatibility,
      urgencyBreakdown: {
        urgentCount: selectedItems.filter((i) => i.urgency === 'URGENT').length,
        highCount: selectedItems.filter((i) => i.urgency === 'HIGH').length,
        mediumCount: selectedItems.filter((i) => i.urgency === 'MEDIUM').length,
        lowCount: selectedItems.filter((i) => i.urgency === 'LOW').length,
      },
    };

    const newLot = QuotaPackerEngine.createLotRecord(proposedBundle);

    // Save lot
    await db.pickupLots.add(newLot);

    // Update status of selected items to IN_LOT
    for (const item of selectedItems) {
      await db.wasteItems.update(item.id, {
        status: 'IN_LOT',
        assignedLotId: newLot.id,
      });
    }

    // Update status of standby items to RESERVED
    for (const item of standbyItems) {
      await db.wasteItems.update(item.id, {
        status: 'RESERVED',
      });
    }

    addToast('success', `Pickup Lot #${newLot.lotNumber} created successfully! Dispatched to hauler.`);
    setSelectedLotId(newLot.id);
    setActiveTab('lots');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              Pickup Lot Builder
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5]">
              Target: {minThreshold} L
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consolidate chemical containers from neighboring facilities into certified hauler-ready pickup manifests with live EPA 40 CFR safety verification.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAutoBundle}
            className="px-4 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-[#00875A]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click AI Auto-Bundle</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleClearSelection}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleFinalizeLot}
            disabled={!isThresholdMet || !compatibility.isSafe}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm ${
              isThresholdMet && compatibility.isSafe
                ? 'bg-[#00875A] hover:bg-[#007A5E] text-white shadow-[#00875A]/20 active:scale-95 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Finalize &amp; Dispatch Manifest</span>
          </button>
        </div>
      </div>

      {/* Threshold Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Settings2 className="w-4 h-4 text-teal-600" />
          <span className="font-bold">Hauler Quota Parameters:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Min Threshold:</span>
            <select
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value={100}>100 Liters (Pilot Test)</option>
              <option value={150}>150 Liters (Standard Mandate)</option>
              <option value={200}>200 Liters (Bulk Commercial)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Reserve Standby Buffer:</span>
            <select
              value={bufferPercent}
              onChange={(e) => setBufferPercent(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value={10}>+10% Buffer ({(minThreshold * 1.1).toFixed(1)}L)</option>
              <option value={15}>+15% Buffer ({(minThreshold * 1.15).toFixed(1)}L - Recommended)</option>
              <option value={20}>+20% Buffer ({(minThreshold * 1.2).toFixed(1)}L)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Quota Progress & Environmental Safety Status HUD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-2xl border flex items-center justify-center font-mono font-extrabold text-xl shadow-xs ${
                isThresholdMet
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-teal-50 text-teal-800 border-teal-200'
              }`}
            >
              {currentVolume.toFixed(1)} L
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-base font-bold text-slate-900">
                  Current Bundled Volume: {currentVolume.toFixed(1)} / {minThreshold} L
                </span>
                {isThresholdMet ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Quota Reached
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                    <Zap className="w-3.5 h-3.5 text-teal-600" /> Need {(minThreshold - currentVolume).toFixed(1)} L more
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedItems.length} canisters selected across {participatingLabIds.length} facilities.
                {standbyItems.length > 0 && ` (${standbyItems.length} reserve containers on standby).`}
              </p>
            </div>
          </div>

          {/* Safety Status Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                compatibility.isSafe
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
              }`}
            >
              {compatibility.isSafe ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ChemiGuard: 100% EPA Compatible</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ChemiGuard: {compatibility.issues.length} Incompatibility Conflict(s)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live Progress Bar with Reserve Buffer Indicator */}
        <div className="space-y-2">
          <div className="w-full h-3.5 rounded-full bg-slate-100 border border-slate-200 p-0.5 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isThresholdMet
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-xs'
                  : 'bg-gradient-to-r from-teal-600 to-teal-500 shadow-xs'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>0 L</span>
            <span className="text-teal-700 font-bold">Mandatory Hauler Quota: {minThreshold} L</span>
            <span>Standby Contingency Target: {(minThreshold * (1 + bufferPercent / 100)).toFixed(1)} L</span>
          </div>
        </div>
      </div>

      {/* ChemiGuard Conflict Diagnostic (if safety violation) */}
      {!compatibility.isSafe && (
        <ChemiGuardAlert
          issues={compatibility.issues}
          onRemoveItem={handleRemoveIncompatibleItem}
        />
      )}

      {/* Progressive Disclosure: Collapsible Standby Reserve Drawer */}
      {standbyItems.length > 0 && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 sm:p-5 shadow-xs">
          <div 
            onClick={() => setIsStandbyDrawerOpen(!isStandbyDrawerOpen)}
            className="flex items-center justify-between cursor-pointer select-none group"
          >
            <div className="flex items-center gap-2.5 text-teal-900 text-xs sm:text-sm font-bold">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Designated Standby Reserve Containers ({standbyItems.length})</span>
              <span className="text-[11px] font-mono text-teal-800 px-2 py-0.5 rounded-full bg-teal-100 border border-teal-200 font-semibold">
                +{standbyItems.reduce((s, i) => s + i.volumeLiters, 0).toFixed(1)} L Buffer Protection
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-teal-700 transition-colors">
              <span>{isStandbyDrawerOpen ? 'Collapse' : 'Expand'}</span>
              {isStandbyDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {isStandbyDrawerOpen && (
            <div className="mt-3.5 pt-3 border-t border-teal-200 space-y-2 animate-fade-in">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                These co-compatible canisters remain on automated standby. If a container leaks or is rejected at the dock during pre-trip driver inspection, ResilienceGuard auto-promotes these items to protect the 150L threshold.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {standbyItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white border border-teal-100 text-xs flex items-center justify-between shadow-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                      <span className="block text-[10px] text-teal-700 font-mono font-medium">{item.epaGroup.replace('GROUP_', 'GRP ')}</span>
                    </div>
                    <span className="font-mono text-teal-800 font-extrabold text-sm shrink-0">
                      {item.volumeLiters.toFixed(1)} L
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Eligible Container Selection Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Eligible Waste Pool ({eligiblePool.length} Containers)</h3>
            <p className="text-xs text-slate-500">Toggle checkboxes to manually add or remove waste from the staged manifest</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Lab:</span>
            <select
              value={filterLab}
              onChange={(e) => setFilterLab(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="ALL">All Facilities</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-10 text-center">Stage</th>
                <th className="py-2.5 px-3">Chemical & UN Spec</th>
                <th className="py-2.5 px-3">Origin Facility</th>
                <th className="py-2.5 px-3">EPA Group</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">Urgency</th>
                <th className="py-2.5 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {eligiblePool
                .filter((i) => filterLab === 'ALL' || i.labId === filterLab)
                .map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isStandby = standbyIds.includes(item.id);
                  const lab = labs.find((l) => l.id === item.labId);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-teal-50/70 hover:bg-teal-100/50'
                          : isStandby
                          ? 'bg-sky-50/70 hover:bg-sky-100/50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-teal-600 mx-auto" />
                        ) : isStandby ? (
                          <span className="w-4 h-4 rounded bg-sky-100 text-sky-800 font-mono text-[9px] font-bold flex items-center justify-center mx-auto border border-sky-300">
                            SB
                          </span>
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>

                      {/* Chemical name & UN */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 leading-snug">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          <span className="text-teal-700 font-semibold">{item.unCode}</span> {item.chemicalFormula && `(${item.chemicalFormula})`}
                        </div>
                      </td>

                      {/* Lab */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium truncate max-w-[150px]">
                          {lab?.name}
                        </div>
                      </td>

                      {/* EPA Group */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.epaGroup.replace('GROUP_', 'GRP ')}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-3 font-mono">
                        <span className="text-sm font-bold text-slate-900">{item.volumeLiters.toFixed(1)} L</span>
                        <span className="block text-[10px] text-slate-400">{item.containerType}</span>
                      </td>

                      {/* Urgency */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.urgency === 'URGENT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : item.urgency === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{item.urgency}</span>
                          <span className="font-mono">({item.daysUntilExpiring}d)</span>
                        </span>
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleItem(item.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {isSelected ? 'Remove' : '+ Stage in Lot'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

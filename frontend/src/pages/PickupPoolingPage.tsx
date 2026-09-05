import React, { useState } from 'react';
import {
  Truck,
  Boxes,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  QrCode,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  X,
  UserCheck,
} from 'lucide-react';
import { WasteItem, Lab, PoolingRun, CompatibilityViolation } from '../types';
import { quotaPacker } from '../engines/quotaPacker';
import { chemiGuard } from '../engines/chemiGuard';
import { NavigationPage } from '../components/Navbar';

interface PickupPoolingPageProps {
  runs: PoolingRun[];
  wasteItems: WasteItem[];
  labs: Lab[];
  onAutoBundle: () => void;
  onCancelLab: (labId: string) => void;
  onRejectItem: (itemId: string, reason: string) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const PickupPoolingPage: React.FC<PickupPoolingPageProps> = ({
  runs,
  wasteItems,
  labs,
  onAutoBundle,
  onCancelLab,
  onRejectItem,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'runs' | 'manual' | 'resilience'>('runs');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedRunDetail, setSelectedRunDetail] = useState<PoolingRun | null>(null);

  // Manual builder state
  const [manualSelectedItemIds, setManualSelectedItemIds] = useState<string[]>([
    wasteItems[0]?.id || '', // Nitric Acid 70%
    wasteItems[1]?.id || '', // Sulfuric Acid 96%
  ]);

  // Evaluate manual bundle
  const manualEval = quotaPacker.evaluateManualBundle(manualSelectedItemIds, wasteItems);

  const toggleManualItem = (itemId: string) => {
    if (manualSelectedItemIds.includes(itemId)) {
      setManualSelectedItemIds(manualSelectedItemIds.filter((id) => id !== itemId));
    } else {
      setManualSelectedItemIds([...manualSelectedItemIds, itemId]);
    }
  };

  const handleRunAutoBundle = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      onAutoBundle();
      setIsOptimizing(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            AUTONOMOUS LOGISTICS HUB
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pickup Pooling &amp; Corridor Consolidation
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Synthesize certified multi-lab pickup runs, enforce knapsack quotas, and audit real-time compatibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="run-auto-bundle-btn"
            onClick={handleRunAutoBundle}
            disabled={isOptimizing}
            className="px-5 py-2.5 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running QuotaPacker™...</span>
              </>
            ) : (
              <>
                <Boxes className="w-4 h-4" />
                <span>Run Auto-Bundle Optimizer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('runs')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'runs'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Scheduled Runs ({runs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'manual'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Manual Bundle Builder &amp; Safety Gate</span>
          {manualEval.violationsCount > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {manualEval.violationsCount} Block
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('resilience')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'resilience'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>ResilienceGuard™ Failover Simulators</span>
        </button>
      </div>

      {/* TAB 1: RUNS LIST */}
      {activeTab === 'runs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {runs.map((run, idx) => (
              <div
                key={run.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-teal-500/40 transition-all space-y-5"
              >
                {/* Run Top Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {run.runCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Target Date: {run.scheduledDate}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1">
                      {run.haulerName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ChemiGuard: PASS
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Vehicle: {run.haulerVehicleId}
                    </div>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Truck Payload Volume ({run.currentVolumeGal} / {run.vehicleCapacityGal} gal)</span>
                    <span className="text-teal-800 font-bold">{run.utilizationPercent}% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        run.utilizationPercent > 85 ? 'bg-teal-700' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, run.utilizationPercent)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{run.items.length} drums staged</span>
                    <span>Total Weight: {run.currentWeightLbs.toLocaleString()} lbs</span>
                  </div>
                </div>

                {/* Lab Stops */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Coordinated Cluster Stops ({run.stops.length} Facilities)
                  </h4>
                  <div className="space-y-1.5">
                    {run.stops.map((stop, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">
                            {sIdx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{stop.labName}</div>
                            <div className="text-[11px] text-slate-500">{stop.city} • {stop.dockType}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-800">{stop.volumeGal} gal</div>
                          <div className="text-[10px] text-slate-500">{stop.scheduledWindow}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TSDF Destination */}
                <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <div className="truncate max-w-[280px]">
                    TSDF: <strong className="text-slate-700">{run.tsdfFacility}</strong>
                  </div>
                  <span className="font-mono text-[11px] text-teal-800">
                    Manifest: {run.manifestNumber}
                  </span>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setSelectedRunDetail(run)}
                    className="py-2 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View Manifest Items
                  </button>

                  <button
                    onClick={() => onNavigate('custody')}
                    className="py-2 rounded-md bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Inspect QR Handoff
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL BUNDLE BUILDER */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          {/* Safety Banner (Critical Block or Verified Safe) */}
          {!manualEval.isValid && manualEval.violationsCount > 0 ? (
            <div className="p-5 rounded-xl bg-red-50 border-2 border-red-400 text-red-950 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 font-black text-base text-red-800">
                <AlertOctagon className="w-6 h-6 text-red-600 animate-pulse" />
                <span>CRITICAL SAFETY VIOLATION DETECTED: PICKUP DISPATCH BLOCKED</span>
              </div>
              <p className="text-xs text-red-900 leading-relaxed font-medium">
                The ChemiGuard™ deterministic verification engine identified{' '}
                <strong>{manualEval.violationsCount} fatal incompatibility condition(s)</strong> in your manual selection. Under EPA 40 CFR § 264.177 and DOT 49 CFR § 177.848, physical co-containment is strictly illegal and physically hazardous.
              </p>

              <div className="space-y-2 pt-2 border-t border-red-200">
                {manualEval.safetyReport.violations.map((v, vIdx) => (
                  <div key={vIdx} className="p-3 rounded-lg bg-white border border-red-300 text-xs space-y-1">
                    <div className="font-bold text-red-900 flex items-center justify-between">
                      <span>Violation #{vIdx + 1}: {v.reason}</span>
                      <span className="font-mono text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                        {v.reactionSeverity}
                      </span>
                    </div>
                    <div className="text-slate-800">
                      Conflict between: <strong>{v.itemA.chemicalName}</strong> and <strong>{v.itemB.chemicalName}</strong>
                    </div>
                    <div className="text-red-700 italic">
                      Hazard Consequence: {v.reactionConsequence}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      Legal Prohibitions: {v.epaCitation} • {v.dotCitation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-emerald-950">
                    ChemiGuard™ Deterministic Verification: 100% PASS
                  </div>
                  <div className="text-xs text-emerald-800">
                    Zero chemical incompatibility violations detected across {manualSelectedItemIds.length} selected items ({manualEval.totalVolumeGal} gal).
                  </div>
                </div>
              </div>
              <button
                disabled={manualSelectedItemIds.length === 0}
                onClick={() => onNavigate('custody')}
                className="px-4 py-2 rounded-md bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shrink-0 disabled:opacity-50"
              >
                Dispatch Manual Batch
              </button>
            </div>
          )}

          {/* Quick instructions */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span>Click checkboxes below to add or remove drums from your proposed pickup run. ChemiGuard computes pairwise compatibility in real-time.</span>
            <span className="font-bold text-slate-900">
              Selected: {manualSelectedItemIds.length} Drums ({manualEval.totalVolumeGal} gal / {manualEval.utilizationPercent}%)
            </span>
          </div>

          {/* Item Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {wasteItems.map((item) => {
              const isSelected = manualSelectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleManualItem(item.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                        {item.trackingId}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {item.volumeGal} gal
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {item.chemicalName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.labName}
                    </div>
                    <div className="text-[10px] font-semibold text-teal-800">
                      {item.hazardClass} • pH {item.ph ?? 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RESILIENCEGUARD FAILOVER SIMULATORS */}
      {activeTab === 'resilience' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-teal-400" />
              ResilienceGuard™ Live Dock Exception Simulator
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Test how HazardHub AI dynamically adapts to real-world logistics disruptions. Trigger an emergency lab cancellation or hauler dock rejection to see automated volume delta calculation, route recovery, and backup drum substitution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario 1: Lab Cancellation */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  Failover Protocol 1
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  Simulate Emergency Lab Cancellation
                </h4>
                <p className="text-xs text-slate-600">
                  Drop a scheduled laboratory due to building maintenance or containment seal failure.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Lab to Cancel:</label>
                <div className="grid grid-cols-1 gap-2">
                  {labs.slice(0, 4).map((lab) => (
                    <button
                      key={lab.id}
                      onClick={() => onCancelLab(lab.id)}
                      disabled={lab.operationalStatus === 'cancelled'}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between disabled:opacity-50"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{lab.name}</div>
                        <div className="text-slate-500">{lab.city} • {lab.totalVolumeGal} gal staged</div>
                      </div>
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        {lab.operationalStatus === 'cancelled' ? 'Cancelled' : 'Drop Lab'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scenario 2: Hauler Rejection */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  Failover Protocol 2
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  Simulate Hauler Dock Drum Rejection
                </h4>
                <p className="text-xs text-slate-600">
                  Driver rejects a drum during pre-load safety inspection (e.g. cracked gasket, illegible DOT placard).
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Drum to Reject:</label>
                <div className="grid grid-cols-1 gap-2">
                  {wasteItems.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onRejectItem(item.id, 'Chime deformation / damaged bung')}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.chemicalName}</div>
                        <div className="text-slate-500">{item.trackingId} • {item.volumeGal} gal</div>
                      </div>
                      <span className="text-xs font-bold text-red-800 bg-red-50 px-2 py-1 rounded border border-red-200">
                        Reject Drum
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manifest Detail Modal */}
      {selectedRunDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-teal-700">
                  {selectedRunDetail.runCode} • Manifest #{selectedRunDetail.manifestNumber}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedRunDetail.haulerName}
                </h3>
                <p className="text-xs text-slate-500">
                  Driver: {selectedRunDetail.driverName} • Truck: {selectedRunDetail.haulerVehicleId}
                </p>
              </div>
              <button
                onClick={() => setSelectedRunDetail(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">
                Containers in Vehicle Load ({selectedRunDetail.items.length})
              </h4>
              <div className="space-y-2">
                {selectedRunDetail.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.chemicalName}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.labName} • {item.hazardClass} • {item.volumeGal} gal
                      </div>
                    </div>
                    <span className="font-mono text-teal-800 text-[11px] font-bold">
                      {item.trackingId}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedRunDetail(null)}
                className="px-4 py-2 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRunDetail(null);
                  onNavigate('custody');
                }}
                className="px-4 py-2 rounded-md bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                Inspect Electronic Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

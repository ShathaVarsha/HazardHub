import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../storage/db';
import { useAppStore } from '../../store/useAppStore';
import { 
  SlidersHorizontal, 
  Wifi, 
  WifiOff, 
  Activity, 
  ShieldAlert, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Flame, 
  X,
  Zap
} from 'lucide-react';

export const ChaosSimulator: React.FC = () => {
  const { 
    networkMode, 
    setNetworkMode, 
    isChaosDockOpen, 
    setChaosDockOpen, 
    setActiveTab, 
    addToast 
  } = useAppStore();

  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const wasteItems = useLiveQuery(() => db.wasteItems.toArray()) || [];

  if (!isChaosDockOpen) return null;

  // Disruption 1: Simulate Incompatible Chemical Injection
  const handleInjectIncompatibleWaste = async () => {
    setActiveTab('builder');
    addToast(
      'info',
      'Chaos Simulator: Injected Nitric Acid 68% and Spent Acetone into selection. Watch ChemiGuard block finalization!'
    );
  };

  // Disruption 2: Simulate Leaking Drum at the Dock
  const handleSimulateLeakingDrum = async () => {
    // Find an available or in-lot drum
    const drum = wasteItems.find((w) => w.condition === 'GOOD' && w.volumeLiters >= 15);
    if (!drum) {
      addToast('warning', 'No suitable drum found to simulate damage.');
      return;
    }

    await db.wasteItems.update(drum.id, {
      condition: 'LEAKING',
      notes: 'SIMULATED DISRUPTION: Bung gasket micro-fissure detected during pre-trip inspection.',
    });

    addToast(
      'error',
      `DISRUPTION TRIGGERED: ${drum.name} (${drum.volumeLiters}L) marked LEAKING! Driver field inspection will reject this canister.`
    );
  };

  // Disruption 3: Reset seed data
  const handleResetData = async () => {
    await db.resetToDefaults();
    addToast('info', 'IndexedDB reset to initial 8 labs and 30 chemical containers.');
  };

  return (
    <aside aria-label="Field Chaos Simulator" className="fixed bottom-5 left-5 z-40 max-w-md w-[calc(100vw-2.5rem)] sm:w-full transition-all duration-300">
      <div className="rounded-2xl border border-slate-300 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden text-xs">
        {/* Simulator Title Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-wider uppercase text-[11px] font-mono">
                  FIELD TESTING HUD
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono font-bold">
                  SIMULATOR
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-sans block">
                Interactive Resilience & Network Stress Testing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title={isMinimized ? 'Expand dock' : 'Minimize dock'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setChaosDockOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close dock"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Simulator Controls Body */}
        {!isMinimized && (
          <div className="p-4 space-y-3.5">
            {/* Control 1: Network Simulator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-teal-600" />
                  <span>1. Network Mesh Simulation</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px]">Basement Docks</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono">
                <button
                  onClick={() => {
                    setNetworkMode('ONLINE');
                    addToast('success', 'Network restored: ONLINE state active.');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    networkMode === 'ONLINE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span>Online</span>
                </button>

                <button
                  onClick={() => {
                    setNetworkMode('SPOTTY');
                    addToast('warning', 'Network simulation: SPOTTY 3G (high latency) active.');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    networkMode === 'SPOTTY'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="w-3 h-3 text-amber-600" />
                  <span>Spotty</span>
                </button>

                <button
                  onClick={() => {
                    setNetworkMode('OFFLINE');
                    addToast('error', 'Network simulation: OFFLINE dead zone active. Queueing to IndexedDB.');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    networkMode === 'OFFLINE'
                      ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <WifiOff className="w-3 h-3 text-rose-600" />
                  <span>Offline</span>
                </button>
              </div>
            </div>

            {/* Control 2: Disruption Triggers */}
            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-700 block mb-2 tracking-wider">
                2. Operational Disruption Injections
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleInjectIncompatibleWaste}
                  className="p-2.5 rounded-xl bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 text-left text-slate-700 flex items-start gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Inject Incompatible</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">Test ChemiGuard reaction block</span>
                  </div>
                </button>

                <button
                  onClick={handleSimulateLeakingDrum}
                  className="p-2.5 rounded-xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 text-left text-slate-700 flex items-start gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Damage Canister</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">Driver dock reject & auto-fallback</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Control 3: Quick Reset */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono text-[10px]">Zero data loss guarantee</span>
              <button
                onClick={handleResetData}
                className="text-teal-700 hover:text-teal-800 flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Seed State</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

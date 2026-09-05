import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { PickupBuilder } from './PickupBuilder';
import { PickupLots } from './PickupLots';
import { 
  Boxes, 
  Truck 
} from 'lucide-react';

export const PickupPooling: React.FC = () => {
  const { poolingSubTab, setPoolingSubTab } = useAppStore();

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#0A192F]">
      {/* Top Header Hub Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F8F3] border border-[#A3E8D5] text-[#006B4E] text-xs font-semibold">
              <Boxes className="w-3.5 h-3.5 text-[#00875A]" />
              <span>QuotaPacker &amp; ResilienceGuard Logistics Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A192F]">
              Regional Pickup Pooling (≥150L)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Consolidate chemical containers from 8 regional facilities to meet commercial hauler volume quotas. 
              Optimize batches with a dynamic +15% reserve buffer, enforce ChemiGuard compatibility, and recover from field canister rejections.
            </p>
          </div>

          {/* Sub-tab Switcher Pill */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shrink-0 self-start md:self-center">
            <button
              onClick={() => setPoolingSubTab('builder')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                poolingSubTab === 'builder'
                  ? 'bg-white text-[#006B4E] shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Boxes className="w-4 h-4 text-[#00875A]" />
              <span>Lot Builder &amp; Optimizer</span>
            </button>

            <button
              onClick={() => setPoolingSubTab('lots')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                poolingSubTab === 'lots'
                  ? 'bg-white text-[#006B4E] shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Truck className="w-4 h-4 text-[#00875A]" />
              <span>Active Lots &amp; Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Sub-View */}
      <div className="transition-all duration-200">
        {poolingSubTab === 'builder' ? <PickupBuilder /> : <PickupLots />}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/db';
import { useAppStore } from '../store/useAppStore';
import { 
  MapPin, 
  Phone, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FlaskConical,
  RotateCcw,
  Building2,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import type { Lab } from '../types';

export const LabsDirectory: React.FC = () => {
  const { setActiveLabFilter, setActiveTab, addToast } = useAppStore();
  
  const labs = useLiveQuery(() => db.labs.toArray()) || [];
  const wasteItems = useLiveQuery(() => db.wasteItems.toArray()) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [expandedLabId, setExpandedLabId] = useState<string | null>(null);

  const handleToggleParticipation = async (labId: string, currentStatus: boolean, labName: string) => {
    await db.labs.update(labId, { isParticipating: !currentStatus });
    addToast(
      !currentStatus ? 'success' : 'warning',
      `${labName} is now ${!currentStatus ? 'ACTIVE in' : 'WITHDRAWN from'} regional pickup pool.`
    );
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all mock data to defaults (8 labs, 28+ waste items)?')) {
      await db.resetToDefaults();
      addToast('info', 'IndexedDB reset to initial 8 labs and 28+ waste containers.');
    }
  };

  // Filtered labs
  const filteredLabs = labs.filter((lab) => {
    const matchesSearch = 
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.epaFacilityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'ALL' || lab.type === selectedType;

    return matchesSearch && matchesType;
  });

  const totalPooledVolume = wasteItems
    .filter((w) => w.status === 'AVAILABLE' || w.status === 'IN_LOT')
    .reduce((sum, item) => sum + item.volumeLiters, 0);

  const totalUrgentCount = wasteItems
    .filter((w) => (w.status === 'AVAILABLE' || w.status === 'IN_LOT') && w.urgency === 'URGENT')
    .length;

  const activeLabsCount = labs.filter((l) => l.isParticipating).length;

  const labTypes = ['ALL', 'SCHOOL', 'DENTAL', 'PATHOLOGY', 'WATER', 'DERMATOLOGY', 'VET', 'FORENSIC', 'INCUBATOR'];

  const typeBadges: Record<string, { bg: string; text: string; border: string }> = {
    SCHOOL: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    DENTAL: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
    PATHOLOGY: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    WATER: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    DERMATOLOGY: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    VET: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    FORENSIC: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    INCUBATOR: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Hero Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E6F8F3] text-[#007A5E] border border-[#A3E8D5] shadow-xs">
              <Building2 className="w-5 h-5 text-[#007A5E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#0A192F] tracking-tight">
                  Regional Co-Op Facilities
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5]">
                  {labs.length} Facilities
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                8 neighborhood laboratories cooperating on shared 150L regional hazardous pickup thresholds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      </div>

      {/* Metric Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Active Regional Pool
            </span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              {activeLabsCount} <span className="text-xs font-normal text-slate-400">/ {labs.length} facilities</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Total Pooled Inventory
            </span>
            <span className="text-xl font-extrabold text-teal-700 font-mono">
              {totalPooledVolume.toFixed(1)} <span className="text-xs font-normal text-slate-400">Liters</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Urgent Pickups Pending
            </span>
            <span className="text-xl font-extrabold text-rose-600 font-mono">
              {totalUrgentCount} <span className="text-xs font-normal text-slate-400">Canisters</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, EPA ID, address, contact..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-200 transition-all shadow-xs"
          />
        </div>

        {/* Lab Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {labTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredLabs.map((lab: Lab) => {
          const labWaste = wasteItems.filter((w) => w.labId === lab.id);
          const activeWaste = labWaste.filter((w) => w.status === 'AVAILABLE' || w.status === 'IN_LOT');
          const totalVolume = activeWaste.reduce((sum, item) => sum + item.volumeLiters, 0);
          const urgentCount = activeWaste.filter((w) => w.urgency === 'URGENT').length;
          const badge = typeBadges[lab.type] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
          const isExpanded = expandedLabId === lab.id;

          return (
            <div
              key={lab.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                lab.isParticipating
                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  : 'bg-slate-50 border-slate-200 opacity-65'
              }`}
            >
              <div>
                {/* Header with Type & Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {lab.type}
                  </span>
                  
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      lab.isParticipating ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {lab.isParticipating ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Pool
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                      </>
                    )}
                  </span>
                </div>

                {/* Lab Title */}
                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                  {lab.name}
                </h3>
                <p className="text-[11px] font-mono text-teal-700 font-semibold mb-3">
                  EPA: {lab.epaFacilityId}
                </p>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] line-clamp-1">{lab.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] line-clamp-1">{lab.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-mono">{lab.phone}</span>
                  </div>
                </div>
              </div>

              {/* Volume & Urgent Footer */}
              <div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">
                      Buffered Waste
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {totalVolume.toFixed(1)} L
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({labWaste.length} containers)
                    </span>
                  </div>

                  {urgentCount > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {urgentCount} Urgent
                    </span>
                  )}
                </div>

                {/* Quick Toggle Drawer Button for Containers */}
                {labWaste.length > 0 && (
                  <button
                    onClick={() => setExpandedLabId(isExpanded ? null : lab.id)}
                    className="w-full mb-3 text-[11px] font-semibold text-slate-600 hover:text-teal-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Containers' : `View ${labWaste.length} Containers`}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Collapsible Container Drawer */}
                {isExpanded && (
                  <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 max-h-40 overflow-y-auto">
                    {labWaste.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] flex items-center justify-between shadow-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="text-slate-900 font-bold block truncate">{item.name}</span>
                          <span className="text-[9px] font-mono text-slate-400">{item.unCode} • {item.dotClass}</span>
                        </div>
                        <span className="font-mono font-bold text-teal-800 shrink-0">{item.volumeLiters} L</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveLabFilter(lab.id);
                      setActiveTab('inventory');
                    }}
                    className="px-2.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                    <span>Inventory</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleToggleParticipation(lab.id, lab.isParticipating, lab.name)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      lab.isParticipating
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {lab.isParticipating ? 'Withdraw' : 'Re-join Pool'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

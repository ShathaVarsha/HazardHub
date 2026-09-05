import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/db';
import { useAppStore } from '../store/useAppStore';
import type { WasteItem, EPAGroup, UrgencyLevel, ContainerCondition } from '../types';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  X,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck
} from 'lucide-react';

export const WasteInventory: React.FC = () => {
  const { activeLabFilter, setActiveLabFilter, addToast } = useAppStore();

  const labs = useLiveQuery(() => db.labs.toArray()) || [];
  const wasteItems = useLiveQuery(() => db.wasteItems.toArray()) || [];

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Add container modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'natural' | 'form'>('natural');
  const [naturalInput, setNaturalInput] = useState('');
  
  // Form fields
  const [formLabId, setFormLabId] = useState('lab-1');
  const [formName, setFormName] = useState('');
  const [formFormula, setFormFormula] = useState('');
  const [formGroup, setFormGroup] = useState<EPAGroup>('GROUP_3B_FLAMMABLES_ORGANIC');
  const [formDotClass, setFormDotClass] = useState('Class 3: Flammable Liquid');
  const [formUnCode, setFormUnCode] = useState('UN1993');
  const [formVolume, setFormVolume] = useState<number>(10);
  const [formContainer, setFormContainer] = useState<WasteItem['containerType']>('10L Carboy');
  const [formCondition, setFormCondition] = useState<ContainerCondition>('GOOD');
  const [formUrgency, setFormUrgency] = useState<UrgencyLevel>('HIGH');
  const [formExpDate, setFormExpDate] = useState('2026-09-30');
  const [formNotes, setFormNotes] = useState('');

  // Natural Language heuristic extractor
  const handleParseNaturalLanguage = () => {
    if (!naturalInput.trim()) return;
    const input = naturalInput.toLowerCase();

    // 1. Detect Lab
    const matchedLab = labs.find((l) => 
      input.includes(l.name.toLowerCase()) || 
      input.includes(l.type.toLowerCase()) ||
      input.includes(l.id.toLowerCase()) ||
      (input.includes('dental') && l.id === 'lab-2') ||
      (input.includes('high school') && l.id === 'lab-1') ||
      (input.includes('pathology') && l.id === 'lab-3') ||
      (input.includes('water') && l.id === 'lab-4') ||
      (input.includes('dermatology') && l.id === 'lab-5') ||
      (input.includes('vet') && l.id === 'lab-6') ||
      (input.includes('forensic') && l.id === 'lab-7') ||
      (input.includes('incubator') && l.id === 'lab-8')
    );
    if (matchedLab) setFormLabId(matchedLab.id);

    // 2. Detect Volume
    const volumeMatch = input.match(/(\d+(\.\d+)?)\s*(l|liter|liters|litre|litres)/);
    if (volumeMatch) {
      const vol = parseFloat(volumeMatch[1]);
      setFormVolume(vol);
      if (vol <= 2.5) setFormContainer('2.5L Glass');
      else if (vol <= 5) setFormContainer('5L Carboy');
      else if (vol <= 10) setFormContainer('10L Carboy');
      else setFormContainer('20L Drum');
    }

    // 3. Detect Chemical & EPA Group
    if (input.includes('nitric')) {
      setFormName('Spent Nitric Acid Solution');
      setFormFormula('HNO3');
      setFormGroup('GROUP_3A_OXIDIZERS');
      setFormDotClass('Class 8 (Sub-risk 5.1): Corrosive Oxidizer');
      setFormUnCode('UN2031');
      setFormUrgency('URGENT');
    } else if (input.includes('acetic') || input.includes('vinegar')) {
      setFormName('Glacial Acetic Acid Waste');
      setFormFormula('CH3COOH');
      setFormGroup('GROUP_1A_ACIDS');
      setFormDotClass('Class 8 (Sub-risk 3): Corrosive Organic');
      setFormUnCode('UN2789');
    } else if (input.includes('sulfuric') || input.includes('battery acid')) {
      setFormName('Spent Sulfuric Acid Effluent');
      setFormFormula('H2SO4');
      setFormGroup('GROUP_1A_ACIDS');
      setFormDotClass('Class 8: Corrosive Acid');
      setFormUnCode('UN1830');
    } else if (input.includes('acetone')) {
      setFormName('HPLC Spent Acetone');
      setFormFormula('C3H6O');
      setFormGroup('GROUP_3B_FLAMMABLES_ORGANIC');
      setFormDotClass('Class 3: Flammable Liquid');
      setFormUnCode('UN1090');
    } else if (input.includes('xylene')) {
      setFormName('Spent Histology Xylene');
      setFormFormula('C8H10');
      setFormGroup('GROUP_3B_FLAMMABLES_ORGANIC');
      setFormDotClass('Class 3: Flammable Liquid');
      setFormUnCode('UN1307');
    } else if (input.includes('cyanide')) {
      setFormName('Dilute Sodium Cyanide Waste');
      setFormFormula('NaCN');
      setFormGroup('GROUP_2B_CYANIDES_SULFIDES');
      setFormDotClass('Class 6.1: Toxic Poison');
      setFormUnCode('UN3414');
      setFormUrgency('URGENT');
    } else if (input.includes('bleach') || input.includes('hypochlorite')) {
      setFormName('Sodium Hypochlorite Waste');
      setFormFormula('NaOCl');
      setFormGroup('GROUP_5_BLEACH');
      setFormDotClass('Class 8: Corrosive Liquid');
      setFormUnCode('UN1791');
    } else if (input.includes('ammonia')) {
      setFormName('Aqueous Ammonia Solution');
      setFormFormula('NH4OH');
      setFormGroup('GROUP_5_AMMONIA');
      setFormDotClass('Class 8: Corrosive Alkaline Solution');
      setFormUnCode('UN2672');
    } else if (input.includes('formalin') || input.includes('formaldehyde')) {
      setFormName('Formaldehyde Tissue Fixative Waste');
      setFormFormula('CH2O');
      setFormGroup('GROUP_3B_FLAMMABLES_ORGANIC');
      setFormDotClass('Class 9: Toxic Carcinogen');
      setFormUnCode('UN2209');
    } else {
      setFormName(naturalInput.charAt(0).toUpperCase() + naturalInput.slice(1));
    }

    if (input.includes('urgent') || input.includes('expired') || input.includes('leaking')) {
      setFormUrgency('URGENT');
    }
    if (input.includes('leaking') || input.includes('crack')) {
      setFormCondition('LEAKING');
    } else if (input.includes('damaged')) {
      setFormCondition('DAMAGED');
    }

    setEntryMode('form');
    addToast('success', 'Natural language parsed successfully! Review and confirm parameters.');
  };

  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formVolume <= 0) {
      addToast('error', 'Please provide a valid chemical name and positive volume.');
      return;
    }

    const newItem: WasteItem = {
      id: `waste-${Date.now()}`,
      labId: formLabId,
      name: formName,
      chemicalFormula: formFormula || undefined,
      epaGroup: formGroup,
      dotClass: formDotClass,
      unCode: formUnCode || 'UN1993',
      volumeLiters: formVolume,
      containerType: formContainer,
      condition: formCondition,
      urgency: formUrgency,
      expirationDate: formExpDate,
      daysUntilExpiring: Math.max(1, Math.round((new Date(formExpDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      status: 'AVAILABLE',
      notes: formNotes || undefined,
    };

    await db.wasteItems.add(newItem);
    addToast('success', `Added ${newItem.volumeLiters}L of ${newItem.name} to local inventory.`);
    setIsAddModalOpen(false);
    setNaturalInput('');
    setFormName('');
  };

  // Filter computation
  const filteredItems = wasteItems.filter((item) => {
    if (activeLabFilter !== 'ALL' && item.labId !== activeLabFilter) return false;
    if (urgencyFilter !== 'ALL' && item.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (conditionFilter !== 'ALL' && item.condition !== conditionFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesCode = item.unCode.toLowerCase().includes(q);
      const matchesFormula = item.chemicalFormula?.toLowerCase().includes(q);
      if (!matchesName && !matchesCode && !matchesFormula) return false;
    }
    return true;
  });

  const totalFilteredVolume = filteredItems.reduce((acc, i) => acc + i.volumeLiters, 0);

  const groupColors: Record<EPAGroup, { bg: string; text: string; border: string }> = {
    GROUP_1A_ACIDS: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    GROUP_1B_BASES: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    GROUP_2A_ACIDS_REACTIVE: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    GROUP_2B_CYANIDES_SULFIDES: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    GROUP_3A_OXIDIZERS: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    GROUP_3B_FLAMMABLES_ORGANIC: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    GROUP_4A_HALOGENATED: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    GROUP_4B_REACTIVE_METALS: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    GROUP_5_BLEACH: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    GROUP_5_AMMONIA: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              Hazardous Waste Inventory
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5]">
              {wasteItems.length} Canisters
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized inventory across all 8 regional member facilities with EPA 40 CFR compatibility classification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEntryMode('natural');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00875A] hover:bg-[#007A5E] text-white flex items-center gap-2 transition-all shadow-sm shadow-[#00875A]/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Waste Container</span>
          </button>
        </div>
      </div>

      {/* Modern Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search chemical name, UN code (e.g. UN2031), formula (e.g. HNO3)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-200 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Facility Filter */}
          <div className="w-full md:w-56">
            <select
              value={activeLabFilter}
              onChange={(e) => setActiveLabFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Facilities (8 Labs)</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isFilterPanelOpen || urgencyFilter !== 'ALL' || conditionFilter !== 'ALL'
                ? 'bg-teal-50 text-teal-800 border-teal-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Filters</span>
            {(urgencyFilter !== 'ALL' || conditionFilter !== 'ALL') && (
              <span className="w-2 h-2 rounded-full bg-teal-600" />
            )}
            {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Advanced Filter Drawer */}
        {isFilterPanelOpen && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
            {/* Filter by Urgency */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Expiration Urgency
              </label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                <option value="ALL">All Urgency Windows</option>
                <option value="URGENT">🔴 Urgent (&lt; 14 days)</option>
                <option value="HIGH">🟠 High (&lt; 30 days)</option>
                <option value="MEDIUM">🟡 Medium (&lt; 90 days)</option>
                <option value="LOW">🟢 Low (&gt; 90 days)</option>
              </select>
            </div>

            {/* Filter by Container Condition */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Canister Condition
              </label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                <option value="ALL">All Container Conditions</option>
                <option value="GOOD">Good / Seal Intact</option>
                <option value="DAMAGED">⚠️ Damaged Bung / Fissure</option>
                <option value="LEAKING">🛑 Leaking (Simulated Dock Rejection)</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Pool Bundling Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                <option value="ALL">All Lifecycle States</option>
                <option value="AVAILABLE">AVAILABLE (Unassigned)</option>
                <option value="IN_LOT">IN_LOT (Scheduled)</option>
                <option value="RESERVED">RESERVED (Buffer)</option>
              </select>
            </div>
          </div>
        )}

        {/* Dynamic Metric & Filter Badges Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-4 font-medium">
            <span>
              Showing <strong className="text-slate-900">{filteredItems.length}</strong> of {wasteItems.length} canisters
            </span>
            <span>
              Cumulative Volume:{' '}
              <strong className="text-teal-700 font-mono text-sm">{totalFilteredVolume.toFixed(1)} L</strong>
            </span>
          </div>

          {(activeLabFilter !== 'ALL' || urgencyFilter !== 'ALL' || conditionFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setActiveLabFilter('ALL');
                setUrgencyFilter('ALL');
                setConditionFilter('ALL');
                setStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="text-teal-700 hover:text-teal-900 text-xs flex items-center gap-1 font-bold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter Restrictions</span>
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table with Expandable Row Drawers */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Chemical & UN Spec</th>
                <th className="py-3 px-3">Laboratory Origin</th>
                <th className="py-3 px-3">EPA Compatibility Group</th>
                <th className="py-3 px-3">Volume</th>
                <th className="py-3 px-3">Expiry Window</th>
                <th className="py-3 px-3">Integrity</th>
                <th className="py-3 px-4 text-right">Pool Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredItems.map((item) => {
                const lab = labs.find((l) => l.id === item.labId);
                const isExpanded = expandedItemId === item.id;
                const groupStyle = groupColors[item.epaGroup] || {
                  bg: 'bg-slate-100',
                  text: 'text-slate-700',
                  border: 'border-slate-200',
                };

                const urgencyBadges: Record<UrgencyLevel, string> = {
                  URGENT: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
                  HIGH: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
                  MEDIUM: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold',
                  LOW: 'bg-slate-100 text-slate-600 border-slate-200 font-medium',
                };

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors duration-150 ${
                        isExpanded ? 'bg-slate-50' : ''
                      }`}
                    >
                      {/* Chemical & UN code */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.chemicalFormula && (
                            <span className="text-[11px] font-mono text-slate-400">
                              ({item.chemicalFormula})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-500">
                          <span className="text-teal-700 font-semibold">{item.unCode}</span>
                          <span>•</span>
                          <span className="text-slate-500 truncate max-w-[180px]">{item.dotClass}</span>
                        </div>
                      </td>

                      {/* Origin Lab */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-900 font-medium line-clamp-1">
                          {lab ? lab.name : item.labId}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {lab?.epaFacilityId}
                        </div>
                      </td>

                      {/* EPA Group */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${groupStyle.bg} ${groupStyle.text} ${groupStyle.border}`}
                        >
                          {item.epaGroup.replace('GROUP_', 'GRP ')}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-sm font-bold text-slate-900">
                          {item.volumeLiters.toFixed(1)} L
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {item.containerType}
                        </span>
                      </td>

                      {/* Urgency & Expiry */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] border ${
                            urgencyBadges[item.urgency]
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{item.urgency}</span>
                          <span className="font-mono">({item.daysUntilExpiring}d)</span>
                        </span>
                      </td>

                      {/* Condition */}
                      <td className="py-3.5 px-3">
                        {item.condition === 'GOOD' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Good
                          </span>
                        ) : item.condition === 'DAMAGED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Damaged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            <ShieldAlert className="w-3 h-3 text-rose-600" /> Leaking
                          </span>
                        )}
                      </td>

                      {/* Pool Status */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              item.status === 'AVAILABLE'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : item.status === 'IN_LOT'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : item.status === 'RESERVED'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-slate-400 hover:text-slate-700">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Progressive Disclosure: Accordion Drawer for Canister Details */}
                    {isExpanded && (
                      <tr className="bg-slate-50 border-b border-slate-200 animate-fade-in">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 mb-2">
                                <Info className="w-3.5 h-3.5 text-teal-600" />
                                <span>Canister Specifications</span>
                              </div>
                              <dl className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <dt className="text-slate-500">Container Packaging:</dt>
                                  <dd className="font-mono text-slate-800 font-semibold">{item.containerType}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-500">Chemical Formula:</dt>
                                  <dd className="font-mono text-slate-800">{item.chemicalFormula || 'N/A'}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-500">DOT Hazard Class:</dt>
                                  <dd className="font-mono text-slate-800">{item.dotClass}</dd>
                                </div>
                              </dl>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 mb-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                                <span>Regulatory & Handling</span>
                              </div>
                              <dl className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <dt className="text-slate-500">EPA Facility Code:</dt>
                                  <dd className="font-mono text-slate-800">{lab?.epaFacilityId || 'Pending'}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-500">Expiration Date:</dt>
                                  <dd className="font-mono text-slate-800 font-semibold">{item.expirationDate}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-500">Special Notes:</dt>
                                  <dd className="text-slate-700 italic truncate max-w-[200px]">
                                    {item.notes || 'Standard protocol'}
                                  </dd>
                                </div>
                              </dl>
                            </div>

                            <div className="flex flex-col justify-between items-start md:items-end">
                              <div className="text-right w-full">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                                  Canister ID
                                </span>
                                <span className="text-xs font-mono text-slate-700 select-all font-semibold">
                                  {item.id}
                                </span>
                              </div>
                              
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const nextCondition: ContainerCondition = 
                                    item.condition === 'GOOD' ? 'LEAKING' : 'GOOD';
                                  await db.wasteItems.update(item.id, { condition: nextCondition });
                                  addToast(
                                    nextCondition === 'LEAKING' ? 'error' : 'success',
                                    `Toggled ${item.name} condition to ${nextCondition}.`
                                  );
                                }}
                                className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-all cursor-pointer"
                              >
                                Toggle Condition ({item.condition})
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Container */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Log Hazardous Waste Container</h3>
                  <p className="text-xs text-slate-500">Register new chemicals into the regional pooling inventory</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode switch tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEntryMode('natural')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  entryMode === 'natural'
                    ? 'bg-white text-teal-800 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI Natural Language Parser</span>
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('form')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  entryMode === 'form'
                    ? 'bg-white text-teal-800 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Manual Hazmat Fields</span>
              </button>
            </div>

            {/* Natural language entry mode */}
            {entryMode === 'natural' ? (
              <div className="space-y-3.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Describe chemical waste in natural terms:
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    placeholder="e.g.: 'Apex Dental has 15 liters of spent xylene solvent in a 20L drum, expiring in 10 days'"
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white leading-relaxed"
                  />
                </div>

                {/* Example Quick-Pick Prompts */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Quick Simulation Examples:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNaturalInput('Lincoln High School has 10L of spent nitric acid solution in 10L carboy, urgent')}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-200 transition-colors cursor-pointer"
                    >
                      10L Nitric Acid (Acid Oxidizer)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNaturalInput('Metro Pathology Lab has 20 liters of HPLC spent acetone, good condition')}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-200 transition-colors cursor-pointer"
                    >
                      20L HPLC Acetone (Flammable)
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Auto-detects volume, lab, UN code, and EPA group.</span>
                  <button
                    type="button"
                    onClick={handleParseNaturalLanguage}
                    disabled={!naturalInput.trim()}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & Auto-Fill</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Structured form mode */
              <form onSubmit={handleCreateContainer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">Origin Lab</label>
                    <select
                      value={formLabId}
                      onChange={(e) => setFormLabId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                    >
                      {labs.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">Chemical Waste Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Spent Acetone Wash"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">EPA Compatibility Group</label>
                    <select
                      value={formGroup}
                      onChange={(e) => setFormGroup(e.target.value as EPAGroup)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                    >
                      <option value="GROUP_1A_ACIDS">Group 1-A: Mineral Acids (HCl, H2SO4, HF)</option>
                      <option value="GROUP_1B_BASES">Group 1-B: Caustic Alkalis (NaOH, KOH)</option>
                      <option value="GROUP_2B_CYANIDES_SULFIDES">Group 2-B: Cyanides & Sulfides (NaCN)</option>
                      <option value="GROUP_3A_OXIDIZERS">Group 3-A: Strong Oxidizers (HNO3, KMnO4)</option>
                      <option value="GROUP_3B_FLAMMABLES_ORGANIC">Group 3-B: Flammable Organics (Acetone, Xylene)</option>
                      <option value="GROUP_4A_HALOGENATED">Group 4-A: Halogenated (Dichloromethane, Chloroform)</option>
                      <option value="GROUP_5_BLEACH">Group 5: Bleach / Hypochlorites</option>
                      <option value="GROUP_5_AMMONIA">Group 5: Concentrated Ammonia</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">Volume (Liters)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={formVolume}
                      onChange={(e) => setFormVolume(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">Expiration Urgency</label>
                    <select
                      value={formUrgency}
                      onChange={(e) => setFormUrgency(e.target.value as UrgencyLevel)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                    >
                      <option value="URGENT">🔴 Urgent (&lt; 14 days)</option>
                      <option value="HIGH">🟠 High (&lt; 30 days)</option>
                      <option value="MEDIUM">🟡 Medium (&lt; 90 days)</option>
                      <option value="LOW">🟢 Low (&gt; 90 days)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">Container Condition</label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value as ContainerCondition)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                    >
                      <option value="GOOD">Good / Intact</option>
                      <option value="DAMAGED">Damaged / Weathered</option>
                      <option value="LEAKING">Leaking (Triggers Hauler Rejection)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">Target Pickup Expiration</label>
                    <input
                      type="date"
                      required
                      value={formExpDate}
                      onChange={(e) => setFormExpDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">Handling / Storage Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Grounded metal can, secondary tray"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Confirm & Save Canister
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

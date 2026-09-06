import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Eye,
  Plus,
  ArrowRight,
  FlaskConical,
  X,
  CheckCircle2,
} from 'lucide-react';
import { WasteItem, Lab, HazardClass, UrgencyLevel, WasteStatus } from '../types';
import { NavigationPage } from '../components/Navbar';

interface WasteManagementPageProps {
  wasteItems: WasteItem[];
  labs: Lab[];
  onAddWasteItem: (item: WasteItem) => void;
  onNavigate: (page: NavigationPage) => void;
}

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:8000';

export const WasteManagementPage: React.FC<WasteManagementPageProps> = ({
  wasteItems,
  labs,
  onAddWasteItem,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabId, setSelectedLabId] = useState<string>('all');
  const [selectedHazardClass, setSelectedHazardClass] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [selectedItemDetail, setSelectedItemDetail] = useState<WasteItem | null>(null);
  const [isPairwiseModalOpen, setIsPairwiseModalOpen] = useState(false);
  const [pairItemAId, setPairItemAId] = useState<string>(wasteItems[0]?.id || '');
  const [pairItemBId, setPairItemBId] = useState<string>(wasteItems[2]?.id || '');
  const [pairwiseResult, setPairwiseResult] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item form state
  const [newChemicalName, setNewChemicalName] = useState('');
  const [newCommonName, setNewCommonName] = useState('');
  const [newCasNumber, setNewCasNumber] = useState('');
  const [newLabId, setNewLabId] = useState(labs[0]?.id || '');
  const [newHazardClass, setNewHazardClass] = useState<HazardClass>('Flammable Liquid');
  const [newVolumeGal, setNewVolumeGal] = useState(55);
  const [newPh, setNewPh] = useState<number | undefined>(7);
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>('medium');
  const [newNotes, setNewNotes] = useState('');

  // Filtering
  const filteredItems = wasteItems.filter((item) => {
    const matchesSearch =
      item.chemicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.casNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.epaWasteCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLab = selectedLabId === 'all' || item.labId === selectedLabId;
    const matchesHazard = selectedHazardClass === 'all' || item.hazardClass === selectedHazardClass;
    const matchesUrgency = selectedUrgency === 'all' || item.urgency === selectedUrgency;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesLab && matchesHazard && matchesUrgency && matchesStatus;
  });

  // Fetch pairwise result when selected items change
  useEffect(() => {
    if (isPairwiseModalOpen && pairItemAId && pairItemBId) {
      fetch(`${API_BASE}/api/chemiguard/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_a_id: pairItemAId, item_b_id: pairItemBId }),
      })
        .then((res) => res.json())
        .then((data) => setPairwiseResult(data))
        .catch((err) => console.error("Error validating pair:", err));
    }
  }, [isPairwiseModalOpen, pairItemAId, pairItemBId]);

  const handleCreateWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const lab = labs.find((l) => l.id === newLabId) || labs[0];
    const created: WasteItem = {
      id: `w-custom-${Date.now()}`,
      trackingId: `HH-${lab.code}-${Math.floor(100 + Math.random() * 900)}`,
      labId: lab.id,
      labName: lab.name,
      chemicalName: newChemicalName || 'Laboratory Effluent Mixture',
      commonName: newCommonName || 'Custom Solvent Waste',
      casNumber: newCasNumber || 'N/A Mixture',
      hazardClass: newHazardClass,
      epaWasteCode: newHazardClass.includes('Acid') || newHazardClass.includes('Base') ? 'D002' : 'D001',
      dotProperShippingName: `${newHazardClass} n.o.s.`,
      unNumber: 'UN1993',
      containerType: '55-gal Poly Drum',
      volumeLiters: Number(newVolumeGal),
      weightLbs: Math.round(Number(newVolumeGal) * 8.4),
      ph: newPh,
      urgency: newUrgency,
      status: 'available',
      storageBay: 'Secondary Pad Bay 1',
      dateLogged: new Date().toISOString().split('T')[0],
      notes: newNotes,
    };

    onAddWasteItem(created);
    setIsAddModalOpen(false);
    // Reset form
    setNewChemicalName('');
    setNewCommonName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            INVENTORY REPOSITORY (30 MONITORED LOTS)
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hazardous Waste Stream Management
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time chemical characteristics, DOT shipping descriptors, and deterministic segregation metadata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPairwiseModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FlaskConical className="w-4 h-4 text-teal-700" />
            Test Pair Compatibility
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Custom Waste Drum
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search chemical, CAS, UN #, Tracking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Lab Filter */}
          <div>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-md border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Labs (8)</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Hazard Class Filter */}
          <div>
            <select
              value={selectedHazardClass}
              onChange={(e) => setSelectedHazardClass(e.target.value)}
              className="w-full px-2.5 py-2 rounded-md border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Hazard Classes</option>
              <option value="Corrosive Acid">Corrosive Acid</option>
              <option value="Corrosive Base">Corrosive Base</option>
              <option value="Flammable Liquid">Flammable Liquid</option>
              <option value="Oxidizer">Oxidizer</option>
              <option value="Toxic Heavy Metal">Toxic / Heavy Metals</option>
              <option value="Organic Peroxide">Organic Peroxide</option>
              <option value="Water Reactive">Water Reactive</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-2.5 py-2 rounded-md border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">Critical (Immediate Pickup)</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing <strong>{filteredItems.length}</strong> of <strong>{wasteItems.length}</strong> chemical waste items</span>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedLabId('all');
              setSelectedHazardClass('all');
              setSelectedUrgency('all');
              setSelectedStatus('all');
            }}
            className="text-teal-700 font-bold hover:underline text-xs"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Waste Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tracking / Chemical</th>
                <th className="px-4 py-3">Origin Lab</th>
                <th className="px-4 py-3">Hazard Class</th>
                <th className="px-4 py-3">EPA / UN Codes</th>
                <th className="px-4 py-3 text-right">Volume</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredItems.map((item) => {
                const isCritical = item.urgency === 'critical';
                const isHigh = item.urgency === 'high';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Chemical Name */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px] text-teal-800 font-bold">
                        {item.trackingId}
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">
                        {item.chemicalName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.commonName} • CAS: {item.casNumber}
                      </div>
                    </td>

                    {/* Lab */}
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-semibold text-slate-900 text-xs">{item.labName}</div>
                      <div className="text-[11px] text-slate-500">{item.storageBay}</div>
                    </td>

                    {/* Hazard Class */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.hazardClass.includes('Acid')
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : item.hazardClass.includes('Base')
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : item.hazardClass.includes('Flammable')
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : item.hazardClass.includes('Oxidizer')
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : item.hazardClass.includes('Peroxide')
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : item.hazardClass.includes('Water')
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {item.hazardClass}
                      </span>
                    </td>

                    {/* EPA & UN */}
                    <td className="px-4 py-3 font-mono text-slate-600">
                      <div>EPA: <strong>{item.epaWasteCode}</strong></div>
                      <div className="text-[11px] text-slate-500">{item.unNumber}</div>
                    </td>

                    {/* Volume */}
                    <td className="px-4 py-3 text-right">
                      <div className="font-extrabold text-slate-900 text-xs">{item.volumeLiters} L</div>
                      <div className="text-[11px] text-slate-500">{item.weightLbs} lbs</div>
                    </td>

                    {/* Urgency */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isCritical
                            ? 'bg-red-100 text-red-800'
                            : isHigh
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-slate-700 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedItemDetail(item)}
                        className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="View Full Chemical Spec Sheet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-teal-700">
                  {selectedItemDetail.trackingId} • EPA {selectedItemDetail.epaWasteCode}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedItemDetail.chemicalName}
                </h3>
                <p className="text-xs text-slate-500">{selectedItemDetail.commonName}</p>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div><strong>CAS Number:</strong> {selectedItemDetail.casNumber}</div>
                <div><strong>DOT Name:</strong> {selectedItemDetail.dotProperShippingName}</div>
                <div><strong>UN Number:</strong> {selectedItemDetail.unNumber}</div>
                <div><strong>Container:</strong> {selectedItemDetail.containerType}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div><strong>Volume:</strong> {selectedItemDetail.volumeLiters} Llons</div>
                <div><strong>Net Weight:</strong> {selectedItemDetail.weightLbs} lbs</div>
                <div><strong>pH:</strong> {selectedItemDetail.ph ?? 'N/A (Organic)'}</div>
                <div><strong>Flash Point:</strong> {selectedItemDetail.flashPointF !== undefined ? `${selectedItemDetail.flashPointF}°F` : 'Non-flammable'}</div>
              </div>
            </div>

            {selectedItemDetail.notes && (
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                <strong>Handling Precaution:</strong> {selectedItemDetail.notes}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setPairItemAId(selectedItemDetail.id);
                  setSelectedItemDetail(null);
                  setIsPairwiseModalOpen(true);
                }}
                className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
              >
                <FlaskConical className="w-3.5 h-3.5" /> Test Compatibility with this Item
              </button>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="px-4 py-2 rounded-md bg-slate-100 text-xs font-bold text-slate-800 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ChemiGuard Pairwise Safety Checker Modal */}
      {isPairwiseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-teal-700">
                  CHEMICGUARD™ DETERMINISTIC VERIFICATION
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Chemical Pairwise Compatibility Scanner
                </h3>
                <p className="text-xs text-slate-500">
                  Select two hazardous waste containers to simulate transport coexistence.
                </p>
              </div>
              <button
                onClick={() => setIsPairwiseModalOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selector A */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Chemical Waste A:</label>
                <select
                  value={pairItemAId}
                  onChange={(e) => setPairItemAId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-md border border-slate-300 text-xs bg-white font-medium"
                >
                  {wasteItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.hazardClass}] {item.chemicalName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector B */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Chemical Waste B:</label>
                <select
                  value={pairItemBId}
                  onChange={(e) => setPairItemBId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-md border border-slate-300 text-xs bg-white font-medium"
                >
                  {wasteItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.hazardClass}] {item.chemicalName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Result Card */}
            {pairwiseResult && (
              <div className="mt-4">
                {pairwiseResult.isCompatible ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      COMPATIBLE: Co-Loading Permitted
                    </div>
                    <p className="text-xs text-emerald-800">
                      No deterministic exothermic, gaseous, or oxidative hazards detected between these two classes under EPA 40 CFR § 264 Appendix V.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-red-800">
                      <AlertOctagon className="w-5 h-5 text-red-600" />
                      CRITICAL SAFETY VIOLATION: CO-LOADING BLOCKED
                    </div>
                    <div className="text-xs font-bold text-red-950">
                      {pairwiseResult.violation?.reason}
                    </div>
                    <p className="text-xs text-red-800">
                      {pairwiseResult.violation?.reactionConsequence}
                    </p>
                    <div className="text-[11px] font-mono text-red-700 pt-1">
                      Prohibited Citation: {pairwiseResult.violation?.epaCitation} | {pairwiseResult.violation?.dotCitation}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsPairwiseModalOpen(false)}
                className="px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Waste Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateWaste} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Log New Hazardous Waste Drum</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chemical Name / Solution:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nitric Acid 70% Aqueous Solution"
                  value={newChemicalName}
                  onChange={(e) => setNewChemicalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Common / Waste Stream Name:</label>
                <input
                  type="text"
                  placeholder="e.g., Spent Digestion Acid"
                  value={newCommonName}
                  onChange={(e) => setNewCommonName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Origin Lab:</label>
                  <select
                    value={newLabId}
                    onChange={(e) => setNewLabId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white"
                  >
                    {labs.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hazard Class:</label>
                  <select
                    value={newHazardClass}
                    onChange={(e) => setNewHazardClass(e.target.value as HazardClass)}
                    className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white"
                  >
                    <option value="Corrosive Acid">Corrosive Acid</option>
                    <option value="Corrosive Base">Corrosive Base</option>
                    <option value="Flammable Liquid">Flammable Liquid</option>
                    <option value="Oxidizer">Oxidizer</option>
                    <option value="Toxic Heavy Metal">Toxic Heavy Metal</option>
                    <option value="Organic Peroxide">Organic Peroxide</option>
                    <option value="Water Reactive">Water Reactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Volume (Gal):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newVolumeGal}
                    onChange={(e) => setNewVolumeGal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">pH (0-14):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={newPh ?? 7}
                    onChange={(e) => setNewPh(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Urgency:</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as UrgencyLevel)}
                    className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Precautions:</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Special handling instructions..."
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-teal-700 text-white text-xs font-bold hover:bg-teal-800"
              >
                Save &amp; Verify Matrix
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

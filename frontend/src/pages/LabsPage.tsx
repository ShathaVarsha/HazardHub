import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  FileText,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Search,
  CheckCircle2,
  X,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { Lab, WasteItem } from '../types';
import { NavigationPage } from '../components/Navbar';

interface LabsPageProps {
  labs: Lab[];
  wasteItems: WasteItem[];
  onCancelLab: (labId: string) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const LabsPage: React.FC<LabsPageProps> = ({
  labs,
  wasteItems,
  onCancelLab,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.epaId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lab.operationalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            PACIFIC NORTHWEST BIO-CORRIDOR #10
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Participating Regional Laboratories
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Certified generator nodes participating in synchronous regional hazmat consolidation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('pooling')}
            className="px-4 py-2.5 rounded-md bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Truck className="w-4 h-4" /> Run Pooling for All Labs
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search lab name, city, EPA ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="all">All Operational Statuses ({labs.length})</option>
            <option value="active">Active ({labs.filter((l) => l.operationalStatus === 'active').length})</option>
            <option value="pickup_ready">Pickup Ready ({labs.filter((l) => l.operationalStatus === 'pickup_ready').length})</option>
            <option value="offline_cached">Offline Staging Node ({labs.filter((l) => l.operationalStatus === 'offline_cached').length})</option>
            <option value="cancelled">Emergency Cancelled ({labs.filter((l) => l.operationalStatus === 'cancelled').length})</option>
          </select>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredLabs.map((lab) => {
          const labItems = wasteItems.filter((w) => w.labId === lab.id);
          const labVolume = labItems.reduce((acc, it) => acc + it.volumeGal, 0);
          const isCancelled = lab.operationalStatus === 'cancelled';

          return (
            <div
              key={lab.id}
              className={`bg-white rounded-xl border p-5 space-y-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
                isCancelled
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-slate-200 hover:border-teal-500/40'
              }`}
            >
              <div className="space-y-3">
                {/* Lab Header & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                      {lab.code}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                      {lab.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      isCancelled
                        ? 'bg-red-100 text-red-800'
                        : lab.operationalStatus === 'pickup_ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lab.operationalStatus === 'offline_cached'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-teal-50 text-teal-800'
                    }`}
                  >
                    {lab.operationalStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 font-medium">
                  {lab.facilityType}
                </div>

                {/* Location & EPA */}
                <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{lab.city}, {lab.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">EPA: {lab.epaId}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 font-medium text-[11px]">Staged Drums</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {isCancelled ? 0 : labItems.length} Lots
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 font-medium text-[11px]">Volume</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {isCancelled ? 0 : labVolume} gal
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Safety Audit Score</span>
                  <span className="font-bold text-teal-800">{lab.safetyAuditScore}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => setSelectedLab(lab)}
                  className="w-full py-1.5 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Facility Details
                </button>

                {!isCancelled && (
                  <button
                    onClick={() => onCancelLab(lab.id)}
                    className="w-full py-1.5 rounded-md bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                    title="Triggers ResilienceGuard Failover Engine"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    Simulate Cancellation
                  </button>
                )}
                {isCancelled && (
                  <div className="text-center text-[11px] font-semibold text-red-700 bg-red-50 py-1 rounded">
                    ResilienceGuard Rerouted
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lab Detail Modal */}
      {selectedLab && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-teal-700">
                  {selectedLab.code} • EPA ID: {selectedLab.epaId}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedLab.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedLab.facilityType}</p>
              </div>
              <button
                onClick={() => setSelectedLab(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Facility Logistics
                </div>
                <div><strong>Address:</strong> {selectedLab.address}, {selectedLab.city}, {selectedLab.state}</div>
                <div><strong>Dock Specification:</strong> {selectedLab.dockType}</div>
                <div><strong>Last Safety Audit:</strong> {selectedLab.lastInspectionDate} (Score: {selectedLab.safetyAuditScore}%)</div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Compliance Officer
                </div>
                <div><strong>Name:</strong> {selectedLab.contactName}</div>
                <div><strong>Email:</strong> {selectedLab.contactEmail}</div>
                <div><strong>Emergency Phone:</strong> {selectedLab.contactPhone}</div>
              </div>
            </div>

            {/* Special handling */}
            {selectedLab.specialHandlingNotes && (
              <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-100 text-xs text-teal-900">
                <strong>Facility Protocol Note:</strong> {selectedLab.specialHandlingNotes}
              </div>
            )}

            {/* Staged Waste Lots */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">
                Staged Hazardous Waste Lots ({wasteItems.filter((w) => w.labId === selectedLab.id).length})
              </h4>
              <div className="space-y-2">
                {wasteItems
                  .filter((w) => w.labId === selectedLab.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.chemicalName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.hazardClass} • {item.containerType} • {item.volumeGal} gal
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.urgency === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : item.urgency === 'high'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.urgency.toUpperCase()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedLab(null)}
                className="px-4 py-2 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedLab.operationalStatus !== 'cancelled' && (
                <button
                  onClick={() => {
                    onCancelLab(selectedLab.id);
                    setSelectedLab(null);
                  }}
                  className="px-4 py-2 rounded-md bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Trigger Cancellation Failover
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

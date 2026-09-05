import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const { networkMode, setNetworkMode } = useAppStore();

  if (networkMode === 'ONLINE') return null;

  return (
    <aside
      aria-label="Network Status Announcement"
      className={`w-full py-2.5 px-4 text-xs font-medium border-b transition-all duration-300 ${
        networkMode === 'OFFLINE'
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-3">
        <div className="flex items-center gap-2.5">
          {networkMode === 'OFFLINE' ? (
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-rose-100 text-rose-700 border border-rose-300">
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <span>
                <strong className="font-bold text-rose-950 tracking-wide">OFFLINE DEAD ZONE:</strong> Local-first persistence active. Manifest transactions & signatures are cryptographically signed and buffered in local IndexedDB.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-700 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="font-bold text-amber-950 tracking-wide">SPOTTY LATENCY SIMULATION:</strong> Degraded network connectivity. Local IndexedDB operational with background auto-retry queue.
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setNetworkMode('ONLINE')}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 text-teal-600" />
          <span>Restore Online</span>
        </button>
      </div>
    </aside>
  );
};

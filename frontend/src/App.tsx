import React, { useState } from 'react';
import { Navbar, NavigationPage } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PlatformPage } from './pages/PlatformPage';
import { LabsPage } from './pages/LabsPage';
import { WasteManagementPage } from './pages/WasteManagementPage';
import { PickupPoolingPage } from './pages/PickupPoolingPage';
import { AIOperationsPage } from './pages/AIOperationsPage';
import { ChainOfCustodyPage } from './pages/ChainOfCustodyPage';
import { AboutPage } from './pages/AboutPage';

import {
  INITIAL_LABS,
  INITIAL_WASTE_ITEMS,
  INITIAL_POOLING_RUNS,
  INITIAL_CUSTODY_EVENTS,
} from './data/initialData';

import { Lab, WasteItem, PoolingRun, CustodyEvent } from './types';
import { CheckCircle2, AlertTriangle, AlertOctagon, X, Info } from 'lucide-react';

interface NotificationToast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [isOffline, setIsOffline] = useState(false);

  // Core application states loaded from Python backend
  const [labs, setLabs] = useState<any[]>([]);
  const [wasteItems, setWasteItems] = useState<any[]>([]);
  const [poolingRuns, setPoolingRuns] = useState<any[]>([]);
  const [custodyEvents, setCustodyEvents] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchState = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/api/state`);
        const data = await res.json();
        setLabs(data.labs || []);
        setWasteItems(data.wasteItems || []);
        setPoolingRuns(data.pickupLots || []);
      } catch (e) {
        console.error("Failed to fetch initial state from Python backend", e);
      }
    };
    fetchState();
  }, []);

  // Operational feedback notifications
  const [notification, setNotification] = useState<NotificationToast | null>(null);

  const showNotification = (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string
  ) => {
    const toast: NotificationToast = {
      id: `toast-${Date.now()}`,
      type,
      title,
      message,
    };
    setNotification(toast);
    setTimeout(() => {
      setNotification((curr) => (curr?.id === toast.id ? null : curr));
    }, 6000);
  };

  // 1. Auto-Bundle handler (Calls Python FastAPI)
  const handleAutoBundle = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/autobundle`, { method: 'POST' });
      if (!response.ok) throw new Error("Backend auto-bundle failed");
      const data = await response.json();
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const stateRes = await fetch(`${API_BASE}/api/state`);
      const stateData = await stateRes.json();
      setPoolingRuns(stateData.pickupLots || []);
      setWasteItems(stateData.wasteItems || []);
      
      showNotification(
        'success',
        'QuotaPacker™ Optimization Complete',
        data.message || 'Synthesized pickup runs with 100% ChemiGuard safety compliance.'
      );
    } catch (e) {
      showNotification('error', 'Auto-Bundle Failed', String(e));
    }
  };

  // 2. Lab Cancellation Failover handler (Calls Python FastAPI)
  const handleCancelLab = async (labId: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/failover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: labId })
      });
      if (!response.ok) throw new Error("Failover failed");
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const stateRes = await fetch(`${API_BASE}/api/state`);
      const stateData = await stateRes.json();
      setLabs(stateData.labs || []);
      setWasteItems(stateData.wasteItems || []);
      setPoolingRuns(stateData.pickupLots || []);

      showNotification('warning', 'ResilienceGuard™ Failover Executed', `Lab ${labId} dropped and lot recalculated.`);
    } catch (e) {
      showNotification('error', 'Failover Failed', String(e));
    }
  };

  // 3. Hauler Dock Rejection handler (Calls Python FastAPI)
  const handleRejectItem = async (itemId: string, reason: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup_lot_id: 'default', waste_item_id: itemId, reason })
      });
      if (!response.ok) throw new Error("Reject failed");
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const stateRes = await fetch(`${API_BASE}/api/state`);
      const stateData = await stateRes.json();
      setWasteItems(stateData.wasteItems || []);
      setPoolingRuns(stateData.pickupLots || []);

      showNotification('error', 'Container Quarantined by Hauler', `Container ${itemId} rejected. Load volume adjusted via Python ResilienceGuard.`);
    } catch (e) {
      showNotification('error', 'Rejection Failed', String(e));
    }
  };

  // 4. Add Waste Item handler
  const handleAddWasteItem = (item: WasteItem) => {
    setWasteItems((prev) => [item, ...prev]);
    showNotification(
      'info',
      'Waste Stream Logged',
      `Added drum [${item.chemicalName}] to lab [${item.labName}]. ChemiGuard matrix updated.`
    );
  };

  // 5. Add Custody Event handler
  const handleAddCustodyEvent = (event: CustodyEvent) => {
    setCustodyEvents((prev) => [event, ...prev]);
    showNotification(
      'success',
      'Custody Transfer Sealed',
      `Step [${event.step}] signed by ${event.signedBy}. Manifest ${event.manifestNumber} synchronized.`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Top Professional Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOffline={isOffline}
        onToggleOffline={() => {
          const next = !isOffline;
          setIsOffline(next);
          showNotification(
            'info',
            next ? 'Offline Mode Activated' : 'Cloud Sync Restored',
            next
              ? 'Local key-value storage active. CustodySentinel™ QR handoffs will function air-gapped.'
              : 'Network connectivity re-established. Queued custody handoffs synced to regional registry.'
          );
        }}
      />

      {/* Operational Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-md w-full animate-slide-in">
          <div
            className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 bg-white ${
              notification.type === 'success'
                ? 'border-emerald-300 text-emerald-950'
                : notification.type === 'warning'
                ? 'border-amber-300 text-amber-950'
                : notification.type === 'error'
                ? 'border-red-300 text-red-950'
                : 'border-teal-300 text-teal-950'
            }`}
          >
            {notification.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {notification.type === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            {notification.type === 'error' && (
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            {notification.type === 'info' && (
              <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs space-y-0.5">
              <div className="font-bold text-slate-900">{notification.title}</div>
              <div className="text-slate-600 leading-relaxed">{notification.message}</div>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Page Content Rendered Based On Active Page State */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            labs={labs}
            wasteItems={wasteItems}
            poolingRuns={poolingRuns}
          />
        )}

        {currentPage === 'platform' && (
          <PlatformPage
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'labs' && (
          <LabsPage
            labs={labs}
            wasteItems={wasteItems}
            onCancelLab={handleCancelLab}
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'waste' && (
          <WasteManagementPage
            wasteItems={wasteItems}
            labs={labs}
            onAddWasteItem={handleAddWasteItem}
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'pooling' && (
          <PickupPoolingPage
            runs={poolingRuns}
            wasteItems={wasteItems}
            labs={labs}
            onAutoBundle={handleAutoBundle}
            onCancelLab={handleCancelLab}
            onRejectItem={handleRejectItem}
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'ai-ops' && (
          <AIOperationsPage
            wasteItems={wasteItems}
            labs={labs}
            runs={poolingRuns}
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'custody' && (
          <ChainOfCustodyPage
            runs={poolingRuns}
            events={custodyEvents}
            onAddEvent={handleAddCustodyEvent}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Enterprise Compliance Footer */}
      <Footer
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/layout/Navbar';
import { NetworkStatusBanner } from './components/layout/NetworkStatusBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { WasteInventory } from './pages/WasteInventory';
import { LabsDirectory } from './pages/LabsDirectory';
import { PickupPooling } from './pages/PickupPooling';
import { CustodySignOff } from './pages/CustodySignOff';
import { AIAssistant } from './pages/AIAssistant';
import { About } from './pages/About';
import { ChaosSimulator } from './components/simulator/ChaosSimulator';

export const App: React.FC = () => {
  const { activeTab } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0A192F] selection:bg-teal-100 selection:text-teal-900 pb-28">
      <NetworkStatusBanner />
      <Navbar />

      {activeTab === 'home' ? (
        <main className="flex-1 w-full">
          <Home />
        </main>
      ) : activeTab === 'about' ? (
        <main className="flex-1 w-full py-6">
          <About />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'labs' && <LabsDirectory />}
          {activeTab === 'inventory' && <WasteInventory />}
          {(activeTab === 'pooling' || activeTab === 'builder' || activeTab === 'lots') && <PickupPooling />}
          {activeTab === 'custody' && <CustodySignOff />}
          {activeTab === 'agent' && <AIAssistant />}
        </main>
      )}

      <ChaosSimulator />
      <ToastContainer />
    </div>
  );
};

export default App;

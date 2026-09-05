import React, { useState } from 'react';
import {
  ShieldAlert,
  Layers,
  Building2,
  Trash2,
  Truck,
  Bot,
  QrCode,
  Info,
  Menu,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export type NavigationPage =
  | 'home'
  | 'platform'
  | 'labs'
  | 'waste'
  | 'pooling'
  | 'ai-ops'
  | 'custody'
  | 'about';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  offlineMode: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  offlineMode,
  onToggleOffline,
  pendingSyncCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Layers className="w-4 h-4" /> },
    { id: 'platform', label: 'Platform', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'labs', label: 'Labs', icon: <Building2 className="w-4 h-4" /> },
    { id: 'waste', label: 'Waste Management', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'pooling', label: 'Pickup Pooling', icon: <Truck className="w-4 h-4" /> },
    { id: 'ai-ops', label: 'AI Operations', icon: <Bot className="w-4 h-4" /> },
    { id: 'custody', label: 'Chain of Custody', icon: <QrCode className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-200 transition-colors">
      {/* Regional Operational Alert Ribbon */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse mr-1.5"></span>
              EPA PACIFIC NORTHWEST CORRIDOR #10
            </span>
            <span className="hidden sm:inline text-slate-300 text-xs">
              8 Labs Active • 30 Monitored Waste Lots • ChemiGuard™ Deterministic Gate 100% Operational
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              id="offline-toggle-btn"
              onClick={onToggleOffline}
              className={`text-xs px-2.5 py-0.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
                offlineMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle remote dock offline mode simulation"
            >
              <Radio className="w-3 h-3" />
              <span>{offlineMode ? 'Dock Offline Mode (Simulated)' : 'Network: Online'}</span>
              {pendingSyncCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1 rounded-full text-[10px]">
                  {pendingSyncCount}
                </span>
              )}
            </button>
            <span className="hidden md:inline text-slate-400 text-xs">
              DOT 49 CFR § 177.848 Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Top Header & Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity - Prominently Displayed */}
          <div
            id="brand-logo-container"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3.5 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-800 transition-colors">
              <ShieldAlert className="w-6 h-6 text-teal-100" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  HAZARDHUB <span className="text-teal-700">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium tracking-tight">
                Environmental Compliance & Autonomous Regional Hazmat Pooling
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-teal-700' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Action Button & Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              id="cta-build-pickup-header"
              onClick={() => onNavigate('pooling')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs transition-colors"
            >
              <Truck className="w-4 h-4 mr-2" />
              Build a Pickup
            </button>

            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-1 shadow-md">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={isActive ? 'text-teal-700' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && <CheckCircle2 className="w-4 h-4 ml-auto text-teal-700" />}
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                onNavigate('pooling');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-bold text-sm bg-teal-700 text-white"
            >
              <Truck className="w-4 h-4" />
              Build a Pickup Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ActiveTab } from '../../store/useAppStore';
import { HazardHubLogo } from './HazardHubLogo';
import { 
  Home,
  LayoutDashboard, 
  FlaskConical, 
  Boxes, 
  FileCheck2, 
  Bot, 
  Wifi, 
  WifiOff, 
  Activity, 
  Building2,
  SlidersHorizontal,
  Info,
  Menu,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    networkMode, 
    isChaosDockOpen, 
    setChaosDockOpen 
  } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  interface NavOption {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }

  const navItems: NavOption[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Platform', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'labs', label: 'Labs', icon: <Building2 className="w-3.5 h-3.5" />, badge: '8' },
    { id: 'inventory', label: 'Waste Management', icon: <FlaskConical className="w-3.5 h-3.5" />, badge: '30' },
    { id: 'pooling', label: 'Pickup Pooling', icon: <Boxes className="w-3.5 h-3.5" />, badge: '≥150L' },
    { id: 'agent', label: 'AI Operations', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'custody', label: 'Chain of Custody', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-3.5 h-3.5" /> },
  ];

  const handleNav = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to determine if a nav link is active
  const isItemActive = (id: ActiveTab) => {
    if (activeTab === id) return true;
    if (id === 'pooling' && (activeTab === 'builder' || activeTab === 'lots')) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand & Main Actions Bar */}
        <div className="flex items-center justify-between py-3 sm:py-3.5 border-b border-slate-100/80">
          {/* Brand cluster */}
          <div className="flex items-center gap-3 sm:gap-4 select-none">
            {/* Custom Shield & Sprouting Leaf Logo */}
            <div 
              onClick={() => handleNav('home')} 
              className="cursor-pointer group shrink-0 flex items-center"
              title="HazardHub AI Home"
            >
              <HazardHubLogo className="w-10 h-10 sm:w-11 sm:h-11" />
            </div>

            {/* Brand Title & Subtitle */}
            <div 
              onClick={() => handleNav('home')} 
              className="cursor-pointer group flex flex-col justify-center"
            >
              {/* Single-line HazardHub AI title */}
              <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0A192F] whitespace-nowrap">
                  Hazard<span className="text-[#00875A]">Hub</span>
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#00875A] whitespace-nowrap">
                  AI
                </span>
              </div>
              
              {/* Dedicated company subtitle */}
              <p className="text-[10px] sm:text-[11.5px] font-medium text-[#5A6B82] tracking-tight mt-1 whitespace-nowrap hidden sm:block">
                Environmental Compliance &amp; Autonomous Regional Hazmat Pooling
              </p>
            </div>

            {/* Enterprise SaaS Pill Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F8F3] border border-[#A3E8D5] shadow-xs select-none ml-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006B4E] shrink-0" />
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[10px] font-bold text-[#006B4E] tracking-wider uppercase">EPA 40 CFR</span>
                <span className="text-[11px] font-extrabold text-[#006B4E]">Certified</span>
              </div>
            </div>
          </div>

          {/* Right quick telemetry & controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Network Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-mono font-semibold border transition-all ${
                networkMode === 'ONLINE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : networkMode === 'SPOTTY'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={`Network state: ${networkMode}`}
            >
              {networkMode === 'ONLINE' ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : networkMode === 'SPOTTY' ? (
                <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
              )}
              <span className="hidden sm:inline tracking-wide text-[11px]">{networkMode}</span>
            </div>

            {/* Field Chaos Simulator Toggle Button */}
            <button
              onClick={() => setChaosDockOpen(!isChaosDockOpen)}
              title="Toggle Field Chaos Simulator testing dock"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isChaosDockOpen
                  ? 'bg-[#007A5E] text-white border-[#00684A] shadow-sm shadow-[#007A5E]/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800" />
              <span className="hidden md:inline">Chaos Lab</span>
            </button>

            {/* Quick Action button */}
            {activeTab === 'home' || activeTab === 'about' ? (
              <button
                onClick={() => handleNav('dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00875A] hover:bg-[#007A5E] text-white text-xs font-bold transition-all shadow-sm shadow-[#00875A]/20 cursor-pointer"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : null}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center justify-between py-2 gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isItemActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <span className={active ? 'text-[#00875A]' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold transition-colors ${
                        active
                          ? 'bg-[#00875A] text-white'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center text-[11px] font-medium text-[#5A6B82] tracking-tight">
            <span>ChemiGuard EPA 40 CFR Part 264 Compliant</span>
          </div>
        </nav>

        {/* Mobile Flyout Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {navItems.map((item) => {
                const active = isItemActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5] font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 border border-slate-100 bg-white'
                    }`}
                  >
                    <span className={active ? 'text-[#00875A]' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

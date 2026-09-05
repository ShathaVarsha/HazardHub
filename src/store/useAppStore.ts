import { create } from 'zustand';
import type { NetworkMode } from '../types';

export type ActiveTab = 
  | 'home'
  | 'dashboard'
  | 'labs'
  | 'inventory'
  | 'pooling'
  | 'builder'
  | 'lots'
  | 'custody'
  | 'agent'
  | 'about';

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

interface AppState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  poolingSubTab: 'builder' | 'lots';
  setPoolingSubTab: (subTab: 'builder' | 'lots') => void;
  activeLabFilter: string | 'ALL';
  setActiveLabFilter: (labId: string | 'ALL') => void;
  networkMode: NetworkMode;
  setNetworkMode: (mode: NetworkMode) => void;
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  selectedLotId: string | null;
  setSelectedLotId: (id: string | null) => void;
  isChaosDockOpen: boolean;
  setChaosDockOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => {
    if (tab === 'builder') {
      set({ activeTab: 'pooling', poolingSubTab: 'builder' });
    } else if (tab === 'lots') {
      set({ activeTab: 'pooling', poolingSubTab: 'lots' });
    } else {
      set({ activeTab: tab });
    }
  },
  poolingSubTab: 'builder',
  setPoolingSubTab: (subTab) => set({ poolingSubTab: subTab }),
  activeLabFilter: 'ALL',
  setActiveLabFilter: (labId) => set({ activeLabFilter: labId }),
  networkMode: 'ONLINE',
  setNetworkMode: (mode) => set({ networkMode: mode }),
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, timestamp: Date.now() }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4500);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  selectedLotId: null,
  setSelectedLotId: (id) => set({ selectedLotId: id }),
  isChaosDockOpen: true,
  setChaosDockOpen: (open) => set({ isChaosDockOpen: open }),
}));

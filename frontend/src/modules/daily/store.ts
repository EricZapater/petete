import { create } from 'zustand';
import { dailyApi } from './api';
import {
  AccioWithStats,
  CreateAccioRequest,
  CreateRegistreDiariRequest,
  ExecutorType,
  UpdateAccioRequest,
} from './types';

interface DailyState {
  accions: AccioWithStats[];
  openOnly: boolean;
  selectedClientId: string;
  selectedExecutor: string;
  isLoading: boolean;
  error: string | null;

  setOpenOnly: (val: boolean) => void;
  setSelectedClientId: (val: string) => void;
  setSelectedExecutor: (val: string) => void;

  fetchAccions: () => Promise<void>;
  createAccio: (data: CreateAccioRequest) => Promise<void>;
  updateAccio: (id: string, data: UpdateAccioRequest) => Promise<void>;
  deleteAccio: (id: string) => Promise<void>;
  logHours: (data: CreateRegistreDiariRequest) => Promise<void>;
  toggleCloseAccio: (id: string, currentStatus: string) => Promise<void>;
  clearError: () => void;
}

export const useDailyStore = create<DailyState>((set, get) => ({
  accions: [],
  openOnly: true,
  selectedClientId: '',
  selectedExecutor: '',
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  setOpenOnly: (val: boolean) => {
    set({ openOnly: val });
    get().fetchAccions();
  },

  setSelectedClientId: (val: string) => {
    set({ selectedClientId: val });
    get().fetchAccions();
  },

  setSelectedExecutor: (val: string) => {
    set({ selectedExecutor: val });
    get().fetchAccions();
  },

  fetchAccions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { openOnly, selectedClientId, selectedExecutor } = get();
      const clientId = selectedClientId ? selectedClientId : undefined;
      const executor = selectedExecutor ? (selectedExecutor as ExecutorType) : undefined;
      const data = await dailyApi.listAccions(openOnly, clientId, undefined, executor);
      set({ accions: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Error carregant les accions',
        isLoading: false,
      });
    }
  },

  createAccio: async (data: CreateAccioRequest) => {
    set({ isLoading: true, error: null });
    try {
      await dailyApi.createAccio(data);
      await get().fetchAccions();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Error creant la nova acció',
        isLoading: false,
      });
      throw err;
    }
  },

  updateAccio: async (id: string, data: UpdateAccioRequest) => {
    set({ isLoading: true, error: null });
    try {
      await dailyApi.updateAccio(id, data);
      await get().fetchAccions();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Error actualitzant l'acció",
        isLoading: false,
      });
      throw err;
    }
  },

  deleteAccio: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await dailyApi.deleteAccio(id);
      await get().fetchAccions();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Error eliminant l'acció",
        isLoading: false,
      });
      throw err;
    }
  },

  logHours: async (data: CreateRegistreDiariRequest) => {
    set({ error: null });
    try {
      await dailyApi.createRegistreDiari(data);
      await get().fetchAccions();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Error registrant les hores',
      });
      throw err;
    }
  },

  toggleCloseAccio: async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'tancat' ? 'en_curs' : 'tancat';
    try {
      await dailyApi.updateAccio(id, { estat: nextStatus });
      await get().fetchAccions();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Error canviant l'estat de l'acció",
      });
    }
  },
}));

import { create } from 'zustand';
import { mastersApi } from './api';
import {
  Client,
  CreateClientRequest,
  CreateEquipRequest,
  CreateIniciativaRequest,
  CreateMetricaRequest,
  CreateObjectiuRequest,
  Equip,
  Iniciativa,
  Metrica,
  Objectiu,
  UpdateClientRequest,
  UpdateEquipRequest,
  UpdateIniciativaRequest,
  UpdateMetricaRequest,
  UpdateObjectiuRequest,
} from './types';

interface MastersState {
  clients: Client[];
  equips: Equip[];
  objectius: Objectiu[];
  iniciatives: Iniciativa[];
  metriques: Metrica[];
  isLoading: boolean;
  error: string | null;

  fetchClients: (actiu?: boolean) => Promise<void>;
  createClient: (data: CreateClientRequest) => Promise<void>;
  updateClient: (id: string, data: UpdateClientRequest) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  fetchEquips: (clientId?: string) => Promise<void>;
  createEquip: (data: CreateEquipRequest) => Promise<void>;
  updateEquip: (id: string, data: UpdateEquipRequest) => Promise<void>;
  deleteEquip: (id: string) => Promise<void>;

  fetchObjectius: (clientId?: string) => Promise<void>;
  createObjectiu: (data: CreateObjectiuRequest) => Promise<void>;
  updateObjectiu: (id: string, data: UpdateObjectiuRequest) => Promise<void>;
  deleteObjectiu: (id: string) => Promise<void>;

  fetchIniciatives: (objectiuId?: string) => Promise<void>;
  createIniciativa: (data: CreateIniciativaRequest) => Promise<void>;
  updateIniciativa: (id: string, data: UpdateIniciativaRequest) => Promise<void>;
  deleteIniciativa: (id: string) => Promise<void>;

  fetchMetriques: (iniciativaId?: string) => Promise<void>;
  createMetrica: (data: CreateMetricaRequest) => Promise<void>;
  updateMetrica: (id: string, data: UpdateMetricaRequest) => Promise<void>;
  deleteMetrica: (id: string) => Promise<void>;

  fetchAll: () => Promise<void>;
  clearError: () => void;
}

export const useMastersStore = create<MastersState>((set, get) => ({
  clients: [],
  equips: [],
  objectius: [],
  iniciatives: [],
  metriques: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchClients: async (actiu?: boolean) => {
    try {
      const data = await mastersApi.listClients(actiu);
      set({ clients: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error carregant clients' });
    }
  },

  createClient: async (data: CreateClientRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.createClient(data);
      await get().fetchClients();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error creant client' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateClient: async (id: string, data: UpdateClientRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.updateClient(id, data);
      await get().fetchClients();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error actualitzant client' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteClient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.deleteClient(id);
      await get().fetchClients();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error eliminant client' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEquips: async (clientId?: string) => {
    try {
      const data = await mastersApi.listEquips(clientId);
      set({ equips: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error carregant equips' });
    }
  },

  createEquip: async (data: CreateEquipRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.createEquip(data);
      await get().fetchEquips();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error creant equip' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEquip: async (id: string, data: UpdateEquipRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.updateEquip(id, data);
      await get().fetchEquips();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error actualitzant equip' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEquip: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.deleteEquip(id);
      await get().fetchEquips();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error eliminant equip' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchObjectius: async (clientId?: string) => {
    try {
      const data = await mastersApi.listObjectius(clientId);
      set({ objectius: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error carregant objectius' });
    }
  },

  createObjectiu: async (data: CreateObjectiuRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.createObjectiu(data);
      await get().fetchObjectius();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error creant objectiu' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateObjectiu: async (id: string, data: UpdateObjectiuRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.updateObjectiu(id, data);
      await get().fetchObjectius();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error actualitzant objectiu' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteObjectiu: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.deleteObjectiu(id);
      await get().fetchObjectius();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error eliminant objectiu' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchIniciatives: async (clientId?: string, objectiuId?: string) => {
    try {
      const data = await mastersApi.listIniciatives(clientId, objectiuId);
      set({ iniciatives: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error carregant iniciatives' });
    }
  },

  createIniciativa: async (data: CreateIniciativaRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.createIniciativa(data);
      await get().fetchIniciatives();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error creant iniciativa' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateIniciativa: async (id: string, data: UpdateIniciativaRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.updateIniciativa(id, data);
      await get().fetchIniciatives();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error actualitzant iniciativa' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteIniciativa: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.deleteIniciativa(id);
      await get().fetchIniciatives();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error eliminant iniciativa' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMetriques: async (iniciativaId?: string) => {
    try {
      const data = await mastersApi.listMetriques(iniciativaId);
      set({ metriques: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error carregant mètriques' });
    }
  },

  createMetrica: async (data: CreateMetricaRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.createMetrica(data);
      await get().fetchMetriques();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error creant mètrica' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateMetrica: async (id: string, data: UpdateMetricaRequest) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.updateMetrica(id, data);
      await get().fetchMetriques();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error actualitzant mètrica' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMetrica: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await mastersApi.deleteMetrica(id);
      await get().fetchMetriques();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error eliminant mètrica' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        get().fetchClients(),
        get().fetchEquips(),
        get().fetchObjectius(),
        get().fetchIniciatives(),
        get().fetchMetriques(),
      ]);
    } finally {
      set({ isLoading: false });
    }
  },
}));

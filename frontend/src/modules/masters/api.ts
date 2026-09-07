import { apiClient } from '../../api/client';
import {
  Client,
  CreateClientRequest,
  CreateEquipRequest,
  CreateIniciativaRequest,
  CreateMetricaRequest,
  CreateObjectiuRequest,
  Equip,
  Iniciativa,
  ItemStatus,
  Metrica,
  Objectiu,
  UpdateClientRequest,
  UpdateEquipRequest,
  UpdateIniciativaRequest,
  UpdateMetricaRequest,
  UpdateObjectiuRequest,
} from './types';

export const mastersApi = {
  // Clients
  listClients: async (actiu?: boolean): Promise<Client[]> => {
    const params = actiu !== undefined ? { actiu } : {};
    const res = await apiClient.get<Client[]>('/clients', { params });
    return res.data;
  },
  createClient: async (data: CreateClientRequest): Promise<Client> => {
    const res = await apiClient.post<Client>('/clients', data);
    return res.data;
  },
  updateClient: async (id: string, data: UpdateClientRequest): Promise<Client> => {
    const res = await apiClient.patch<Client>(`/clients/${id}`, data);
    return res.data;
  },
  deleteClient: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },

  // Equips
  listEquips: async (clientId?: string): Promise<Equip[]> => {
    const params = clientId ? { client_id: clientId } : {};
    const res = await apiClient.get<Equip[]>('/equips', { params });
    return res.data;
  },
  createEquip: async (data: CreateEquipRequest): Promise<Equip> => {
    const res = await apiClient.post<Equip>('/equips', data);
    return res.data;
  },
  updateEquip: async (id: string, data: UpdateEquipRequest): Promise<Equip> => {
    const res = await apiClient.patch<Equip>(`/equips/${id}`, data);
    return res.data;
  },
  deleteEquip: async (id: string): Promise<void> => {
    await apiClient.delete(`/equips/${id}`);
  },

  // Objectius
  listObjectius: async (clientId?: string, estat?: ItemStatus): Promise<Objectiu[]> => {
    const params: any = {};
    if (clientId) params.client_id = clientId;
    if (estat) params.estat = estat;
    const res = await apiClient.get<Objectiu[]>('/objectius', { params });
    return res.data;
  },
  createObjectiu: async (data: CreateObjectiuRequest): Promise<Objectiu> => {
    const res = await apiClient.post<Objectiu>('/objectius', data);
    return res.data;
  },
  updateObjectiu: async (id: string, data: UpdateObjectiuRequest): Promise<Objectiu> => {
    const res = await apiClient.patch<Objectiu>(`/objectius/${id}`, data);
    return res.data;
  },
  deleteObjectiu: async (id: string): Promise<void> => {
    await apiClient.delete(`/objectius/${id}`);
  },

  // Iniciatives
  listIniciatives: async (clientId?: string, objectiuId?: string, estat?: ItemStatus): Promise<Iniciativa[]> => {
    const params: any = {};
    if (clientId) params.client_id = clientId;
    if (objectiuId) params.objectiu_id = objectiuId;
    if (estat) params.estat = estat;
    const res = await apiClient.get<Iniciativa[]>('/iniciatives', { params });
    return res.data;
  },
  createIniciativa: async (data: CreateIniciativaRequest): Promise<Iniciativa> => {
    const res = await apiClient.post<Iniciativa>('/iniciatives', data);
    return res.data;
  },
  updateIniciativa: async (id: string, data: UpdateIniciativaRequest): Promise<Iniciativa> => {
    const res = await apiClient.patch<Iniciativa>(`/iniciatives/${id}`, data);
    return res.data;
  },
  deleteIniciativa: async (id: string): Promise<void> => {
    await apiClient.delete(`/iniciatives/${id}`);
  },

  // Mètriques
  listMetriques: async (iniciativaId?: string): Promise<Metrica[]> => {
    const params = iniciativaId ? { iniciativa_id: iniciativaId } : {};
    const res = await apiClient.get<Metrica[]>('/metriques', { params });
    return res.data;
  },
  createMetrica: async (data: CreateMetricaRequest): Promise<Metrica> => {
    const res = await apiClient.post<Metrica>('/metriques', data);
    return res.data;
  },
  updateMetrica: async (id: string, data: UpdateMetricaRequest): Promise<Metrica> => {
    const res = await apiClient.patch<Metrica>(`/metriques/${id}`, data);
    return res.data;
  },
  deleteMetrica: async (id: string): Promise<void> => {
    await apiClient.delete(`/metriques/${id}`);
  },
};

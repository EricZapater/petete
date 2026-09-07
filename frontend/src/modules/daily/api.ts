import { apiClient } from '../../api/client';
import {
  Accio,
  AccioWithStats,
  CreateAccioRequest,
  CreateRegistreDiariRequest,
  ExecutorType,
  RegistreDiari,
  UpdateAccioRequest,
  UpdateRegistreDiariRequest,
} from './types';

export const dailyApi = {
  listAccions: async (
    openOnly = true,
    clientId?: string,
    iniciativaId?: string,
    executor?: ExecutorType
  ): Promise<AccioWithStats[]> => {
    const params: any = { open_only: openOnly };
    if (clientId) params.client_id = clientId;
    if (iniciativaId) params.iniciativa_id = iniciativaId;
    if (executor) params.executor = executor;
    const res = await apiClient.get<AccioWithStats[]>('/accions', { params });
    return res.data;
  },

  getAccio: async (id: string): Promise<AccioWithStats> => {
    const res = await apiClient.get<AccioWithStats>(`/accions/${id}`);
    return res.data;
  },

  createAccio: async (data: CreateAccioRequest): Promise<Accio> => {
    const res = await apiClient.post<Accio>('/accions', data);
    return res.data;
  },

  updateAccio: async (id: string, data: UpdateAccioRequest): Promise<Accio> => {
    const res = await apiClient.patch<Accio>(`/accions/${id}`, data);
    return res.data;
  },

  deleteAccio: async (id: string): Promise<void> => {
    await apiClient.delete(`/accions/${id}`);
  },

  // Registres Diaris
  listRegistresDiaris: async (accioId?: string, data?: string): Promise<RegistreDiari[]> => {
    const params: any = {};
    if (accioId) params.accio_id = accioId;
    if (data) params.data = data;
    const res = await apiClient.get<RegistreDiari[]>('/registres-diaris', { params });
    return res.data;
  },

  createRegistreDiari: async (data: CreateRegistreDiariRequest): Promise<RegistreDiari> => {
    const res = await apiClient.post<RegistreDiari>('/registres-diaris', data);
    return res.data;
  },

  updateRegistreDiari: async (id: string, data: UpdateRegistreDiariRequest): Promise<RegistreDiari> => {
    const res = await apiClient.patch<RegistreDiari>(`/registres-diaris/${id}`, data);
    return res.data;
  },

  deleteRegistreDiari: async (id: string): Promise<void> => {
    await apiClient.delete(`/registres-diaris/${id}`);
  },
};

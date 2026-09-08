import { apiClient } from '../../api/client';
import { Nota, CreateNotaRequest, UpdateNotaRequest } from './types';

export const notesApi = {
  listNotes: async (filters?: { client_id?: string; search?: string }): Promise<Nota[]> => {
    const params: any = {};
    if (filters?.client_id) params.client_id = filters.client_id;
    if (filters?.search) params.search = filters.search;
    const res = await apiClient.get<Nota[]>('/notes', { params });
    return res.data;
  },

  getNoteById: async (id: string): Promise<Nota> => {
    const res = await apiClient.get<Nota>(`/notes/${id}`);
    return res.data;
  },

  createNote: async (data: CreateNotaRequest): Promise<Nota> => {
    const res = await apiClient.post<Nota>('/notes', data);
    return res.data;
  },

  updateNote: async (id: string, data: UpdateNotaRequest): Promise<Nota> => {
    const res = await apiClient.patch<Nota>(`/notes/${id}`, data);
    return res.data;
  },

  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/${id}`);
  },
};

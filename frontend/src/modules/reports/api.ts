import { apiClient } from '../../api/client';
import { ReportFilters, ReportLogRow, ReportSummary } from './types';

export const reportsApi = {
  getSummary: async (filters: ReportFilters): Promise<ReportSummary> => {
    const params = new URLSearchParams();
    if (filters.data_inici) params.append('data_inici', filters.data_inici);
    if (filters.data_fi) params.append('data_fi', filters.data_fi);
    if (filters.client_id) params.append('client_id', filters.client_id);
    if (filters.objectiu_id) params.append('objectiu_id', filters.objectiu_id);
    if (filters.iniciativa_id) params.append('iniciativa_id', filters.iniciativa_id);
    if (filters.executor) params.append('executor', filters.executor);

    const response = await apiClient.get<ReportSummary>(`/reports/summary?${params.toString()}`);
    return response.data;
  },

  getLogs: async (filters: ReportFilters): Promise<ReportLogRow[]> => {
    const params = new URLSearchParams();
    if (filters.data_inici) params.append('data_inici', filters.data_inici);
    if (filters.data_fi) params.append('data_fi', filters.data_fi);
    if (filters.client_id) params.append('client_id', filters.client_id);
    if (filters.objectiu_id) params.append('objectiu_id', filters.objectiu_id);
    if (filters.iniciativa_id) params.append('iniciativa_id', filters.iniciativa_id);
    if (filters.executor) params.append('executor', filters.executor);

    const response = await apiClient.get<ReportLogRow[]>(`/reports/logs?${params.toString()}`);
    return response.data;
  },

  exportExcel: async (filters: ReportFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.data_inici) params.append('data_inici', filters.data_inici);
    if (filters.data_fi) params.append('data_fi', filters.data_fi);
    if (filters.client_id) params.append('client_id', filters.client_id);
    if (filters.objectiu_id) params.append('objectiu_id', filters.objectiu_id);
    if (filters.iniciativa_id) params.append('iniciativa_id', filters.iniciativa_id);
    if (filters.executor) params.append('executor', filters.executor);

    const response = await apiClient.get(`/reports/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

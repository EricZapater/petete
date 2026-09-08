import { apiClient } from '../../api/client';
import {
  SystemHealth,
  UsageMetrics,
  ApiPerformanceMetrics,
  AuditLogsPaginatedResponse,
  AuditLogFilters,
} from './types';

export const adminApi = {
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<{ data: SystemHealth }>('/admin/health');
    return response.data.data;
  },

  async getUsageMetrics(): Promise<UsageMetrics> {
    const response = await apiClient.get<{ data: UsageMetrics }>('/admin/metrics/usage');
    return response.data.data;
  },

  async getApiPerformanceMetrics(): Promise<ApiPerformanceMetrics> {
    const response = await apiClient.get<{ data: ApiPerformanceMetrics }>('/admin/metrics/api');
    return response.data.data;
  },

  async getAuditLogs(filters: AuditLogFilters): Promise<AuditLogsPaginatedResponse> {
    const params: Record<string, string | number> = {
      page: filters.page,
      pageSize: filters.pageSize,
    };
    if (filters.search) params.search = filters.search;
    if (filters.module) params.module = filters.module;
    if (filters.statusCode) params.statusCode = filters.statusCode;

    const response = await apiClient.get<{ data: AuditLogsPaginatedResponse }>('/admin/audit-logs', {
      params,
    });
    return response.data.data;
  },

  async exportAuditLogsCSV(filters: Omit<AuditLogFilters, 'page' | 'pageSize'>): Promise<Blob> {
    const params: Record<string, string | number> = {};
    if (filters.search) params.search = filters.search;
    if (filters.module) params.module = filters.module;
    if (filters.statusCode) params.statusCode = filters.statusCode;

    const response = await apiClient.get('/admin/audit-logs/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

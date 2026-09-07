import { create } from 'zustand';
import { reportsApi } from './api';
import { ReportFilters, ReportLogRow, ReportSummary } from './types';

interface ReportsState {
  filters: ReportFilters;
  summary: ReportSummary | null;
  logs: ReportLogRow[];
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;

  setFilters: (newFilters: Partial<ReportFilters>) => void;
  resetFilters: () => void;
  fetchReportData: () => Promise<void>;
  downloadExcel: () => Promise<void>;
  clearError: () => void;
}

const getDefaultFilters = (): ReportFilters => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return {
    data_inici: `${year}-${month}-01`,
    data_fi: `${year}-${month}-${day}`,
    client_id: '',
    objectiu_id: '',
    iniciativa_id: '',
    executor: '',
  };
};

export const useReportsStore = create<ReportsState>((set, get) => ({
  filters: getDefaultFilters(),
  summary: null,
  logs: [],
  isLoading: false,
  isExporting: false,
  error: null,

  setFilters: (newFilters: Partial<ReportFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchReportData();
  },

  resetFilters: () => {
    set({ filters: getDefaultFilters() });
    get().fetchReportData();
  },

  fetchReportData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const [summary, logs] = await Promise.all([
        reportsApi.getSummary(filters),
        reportsApi.getLogs(filters),
      ]);
      set({ summary, logs, isLoading: false });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error carregant les dades dels informes';
      set({ error: errorMsg, isLoading: false });
    }
  },

  downloadExcel: async () => {
    set({ isExporting: true, error: null });
    try {
      const { filters } = get();
      const blob = await reportsApi.exportExcel(filters);

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `petete-informe-${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      set({ isExporting: false });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error generant la descàrrega de fitxer Excel';
      set({ error: errorMsg, isExporting: false });
    }
  },

  clearError: () => set({ error: null }),
}));

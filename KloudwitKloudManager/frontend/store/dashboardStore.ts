import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DashboardSummary {
  totalResources: number;
  totalProviders: number;
  totalCost: number;
  totalAlerts: number;
  runningCount: number;
  stoppedCount: number;
  vmCount: number;
  storageCount: number;
  networkCount: number;
  databaseCount: number;
}

interface DashboardStore {
  summary: DashboardSummary;
  loading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  summary: {
    totalResources: 0,
    totalProviders: 0,
    totalCost: 0,
    totalAlerts: 0,
    runningCount: 0,
    stoppedCount: 0,
    vmCount: 0,
    storageCount: 0,
    networkCount: 0,
    databaseCount: 0,
  },
  loading: false,
  error: null,
  fetchSummary: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/dashboard/summary`);
      set({ summary: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching dashboard summary:', error);
    }
  },
}));

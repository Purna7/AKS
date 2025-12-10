import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface CostData {
  total_cost: number;
  period: string;
  cost_by_service: Array<{ service: string; cost: number }>;
  cost_by_resource: Array<{ resource_name: string; resource_type: string; cost: number }>;
  daily_costs: Array<{ date: string; cost: number }>;
}

interface CostStore {
  costData: CostData;
  loading: boolean;
  error: string | null;
  fetchCostData: () => Promise<void>;
}

export const useCostStore = create<CostStore>((set) => ({
  costData: {
    total_cost: 0,
    period: 'Last 30 days',
    cost_by_service: [],
    cost_by_resource: [],
    daily_costs: [],
  },
  loading: false,
  error: null,
  fetchCostData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/costs/last-30-days`);
      set({ costData: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching cost data:', error);
    }
  },
}));

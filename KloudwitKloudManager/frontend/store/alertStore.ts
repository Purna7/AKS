import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Alert {
  id: number;
  title: string;
  message: string;
  severity: string;
  timestamp: string;
}

interface AlertStore {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  loading: false,
  error: null,
  fetchAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/alerts`);
      set({ alerts: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching alerts:', error);
    }
  },
}));

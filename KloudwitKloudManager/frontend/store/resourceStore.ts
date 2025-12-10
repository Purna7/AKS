import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Resource {
  id: number;
  name: string;
  type: string;
  provider: string;
  location: string;
  status: string;
  created_at: string;
}

interface ResourceStore {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
}

export const useResourceStore = create<ResourceStore>((set) => ({
  resources: [],
  loading: false,
  error: null,
  fetchResources: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/resources`);
      set({ resources: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching resources:', error);
    }
  },
}));

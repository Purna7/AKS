import { create } from 'zustand';
import axios from 'axios';
import { message } from 'antd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Provider {
  id: number;
  name: string;
  enabled: boolean;
  resource_count: number;
}

interface ProviderStore {
  providers: Provider[];
  loading: boolean;
  error: string | null;
  fetchProviders: () => Promise<void>;
  testConnection: (providerName: string) => Promise<void>;
}

export const useProviderStore = create<ProviderStore>((set, get) => ({
  providers: [],
  loading: false,
  error: null,
  fetchProviders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/providers`);
      set({ providers: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching providers:', error);
    }
  },
  testConnection: async (providerName: string) => {
    try {
      message.loading(`Testing ${providerName} connection...`, 0);
      const response = await axios.get(`${API_URL}/test-connection/${providerName}`);
      message.destroy();
      if (response.data.success) {
        message.success(`${providerName} connection successful!`);
      } else {
        message.error(`${providerName} connection failed: ${response.data.message}`);
      }
    } catch (error: any) {
      message.destroy();
      message.error(`Error testing ${providerName} connection`);
      console.error('Error testing connection:', error);
    }
  },
}));

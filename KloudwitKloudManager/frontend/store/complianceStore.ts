import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface NonCompliantResource {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  resource_group: string;
  location: string;
  policy_assignment: string;
  policy_definition: string;
  compliance_state: string;
}

interface ComplianceStore {
  nonCompliantResources: NonCompliantResource[];
  loading: boolean;
  error: string | null;
  fetchNonCompliantResources: () => Promise<void>;
}

export const useComplianceStore = create<ComplianceStore>((set) => ({
  nonCompliantResources: [],
  loading: false,
  error: null,
  fetchNonCompliantResources: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/compliance`);
      set({ nonCompliantResources: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching compliance data:', error);
    }
  },
}));

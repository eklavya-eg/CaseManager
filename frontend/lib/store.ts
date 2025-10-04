import { Store } from '@tanstack/react-store';
import axios from 'axios';

// Enums
export enum ModelType {
  CLASSIFICATION = "CLASSIFICATION",
  ANOMALY_DETECTION = "ANOMALY_DETECTION"
}

// Types
export interface Model {
  id: string;
  name: string;
  type: ModelType;
  createdAt: string;
  status?: 'active' | 'training' | 'error';
  data?: FormData;
}

export interface Dataset {
  id: string;
  name: string;
  uploadedAt: string;
  data?: FormData;
  status?: 'processed' | 'processing' | 'error';
}

export interface StoreState {
  models: Model[];
  datasets: Dataset[];
  isLoadingModels: boolean;
  isLoadingDatasets: boolean;
  error: string | null;
}

// Initial state
const initialState: StoreState = {
  models: [],
  datasets: [],
  isLoadingModels: false,
  isLoadingDatasets: false,
  error: null,
};

// Create store
export const store = new Store(initialState);

// Actions
export const storeActions = {
  // Models
  setModels: (models: Model[]) => {
    store.setState((state) => ({
      ...state,
      models,
      isLoadingModels: false,
      error: null,
    }));
  },

  setLoadingModels: (isLoading: boolean) => {
    store.setState((state) => ({
      ...state,
      isLoadingModels: isLoading,
    }));
  },

  // Datasets
  setDatasets: (datasets: Dataset[]) => {
    store.setState((state) => ({
      ...state,
      datasets,
      isLoadingDatasets: false,
      error: null,
    }));
  },

  setLoadingDatasets: (isLoading: boolean) => {
    store.setState((state) => ({
      ...state,
      isLoadingDatasets: isLoading,
    }));
  },

  // Error handling
  setError: (error: string) => {
    store.setState((state) => ({
      ...state,
      error,
      isLoadingModels: false,
      isLoadingDatasets: false,
    }));
  },

  clearError: () => {
    store.setState((state) => ({
      ...state,
      error: null,
    }));
  },

  // Fetch data
  fetchModels: async () => {
    storeActions.setLoadingModels(true);
    try {
      const response = await axios.get(
        `${process.env.BASE_URL}/v1/model`
      );
      if (response.status !== 200) {
        throw new Error('Failed to fetch models');
      }
      const models = response.data as Model[];
      models.forEach(model => {
        model.status = model.status || 'active';
      });
      storeActions.setModels(models);
    } catch (error) {
      storeActions.setError(error instanceof Error ? error.message : 'Failed to fetch models');
    }
  },

  fetchDatasets: async () => {
    storeActions.setLoadingDatasets(true);
    try {
      const response = await axios.get(
        `${process.env.BASE_URL}/v1/data`
      );
      if (response.status !== 200) {
        throw new Error('Failed to fetch datasets');
      }
      const datasets = response.data as Dataset[];
      datasets.forEach(dataset => {
        dataset.status = dataset.status || 'processing';
      });
      storeActions.setDatasets(datasets);
    } catch (error) {
      storeActions.setError(error instanceof Error ? error.message : 'Failed to fetch datasets');
    }
  },
};
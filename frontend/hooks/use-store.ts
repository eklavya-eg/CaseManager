import { useStore } from '@tanstack/react-store';
import { store, storeActions, type StoreState } from '@/lib/store';

export function useAppStore() {
  const state = useStore(store);
  
  return {
    ...state,
    actions: storeActions,
  };
}

// Selector hooks for specific parts of the state
export function useModels() {
  const models = useStore(store, (state) => state.models);
  const isLoadingModels = useStore(store, (state) => state.isLoadingModels);
  
  return {
    models,
    isLoadingModels,
    fetchModels: storeActions.fetchModels,
  };
}

export function useDatasets() {
  const datasets = useStore(store, (state) => state.datasets);
  const isLoadingDatasets = useStore(store, (state) => state.isLoadingDatasets);
  
  return {
    datasets,
    isLoadingDatasets,
    fetchDatasets: storeActions.fetchDatasets,
  };
}
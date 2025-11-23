import { useState, useEffect, useCallback } from 'react';
import { predictionsApi, PredictionItem, PredictionDataRow, ShapValue } from '@/lib/api';

export interface UsePredictionsReturn {
    // State
    predictions: PredictionItem[];
    selectedPrediction: PredictionItem | null;
    predictionData: PredictionDataRow[];
    selectedRows: string[];
    shapValues: Record<string, ShapValue[]>;
    loading: boolean;
    error: string | null;

    // Actions
    setSelectedPrediction: (prediction: PredictionItem | null) => void;
    setSelectedRows: (rows: string[]) => void;
    toggleRowSelection: (rowId: string) => void;
    fetchPredictions: () => Promise<void>;
    fetchPredictionData: (modelId: string, dataId: string) => Promise<void>;
    fetchShapValues: (rowId: string, modelId: string, dataId: string, finalcols: string[]) => Promise<void>;
    clearError: () => void;
}

export function usePredictions(): UsePredictionsReturn {
    const [predictions, setPredictions] = useState<PredictionItem[]>([]);
    const [selectedPrediction, setSelectedPrediction] = useState<PredictionItem | null>(null);
    const [predictionData, setPredictionData] = useState<PredictionDataRow[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [shapValues, setShapValues] = useState<Record<string, ShapValue[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch all predictions
    const fetchPredictions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching predictions...');
            const data = await predictionsApi.getPredictions();
            console.log('Received predictions:', data);
            setPredictions(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch predictions');
            console.error('Error fetching predictions:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch prediction data for a specific prediction
    const fetchPredictionData = useCallback(async (modelId: string, dataId: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = await predictionsApi.getPredictionData(modelId, dataId);
            setPredictionData(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch prediction data');
            console.error('Error fetching prediction data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch SHAP values for selected rows
    const fetchShapValues = useCallback(async (rowId: string, modelId: string, dataId: string, finalcols: string[]) => {
        setLoading(true);
        setError(null);

        try {
            const data = await predictionsApi.getShapValues(rowId, modelId, dataId, finalcols);
            setShapValues(prev => ({
                ...prev,
                [rowId]: data
            }));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch SHAP values');
            console.error('Error fetching SHAP values:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Toggle row selection
    const toggleRowSelection = useCallback((rowId: string) => {
        setSelectedRows(prev => {
            const newSelection = prev.includes(rowId)
                ? prev.filter(id => id !== rowId)
                : [...prev, rowId];

            // Fetch SHAP values when rows are selected
            if (selectedPrediction && !prev.includes(rowId)) {
                // The ID format is model_id_data_id, so we need to split it properly
                const parts = selectedPrediction.id.split('_');
                if (parts.length >= 2) {
                    const modelId = parts[0];
                    const dataId = parts.slice(1).join('_'); // In case data_id contains underscores
                    fetchShapValues(rowId, modelId, dataId, selectedPrediction.finalcols);
                }
            }

            return newSelection;
        });
    }, [selectedPrediction, fetchShapValues]);

    // Handle prediction selection
    const handleSetSelectedPrediction = useCallback((prediction: PredictionItem | null) => {
        setSelectedPrediction(prediction);
        setSelectedRows([]);
        setShapValues({});

        if (prediction) {
            // The ID format is model_id_data_id, so we need to split it properly
            const parts = prediction.id.split('_');
            if (parts.length >= 2) {
                const modelId = parts[0];
                const dataId = parts.slice(1).join('_'); // In case data_id contains underscores
                fetchPredictionData(modelId, dataId);
            }
        }
    }, [fetchPredictionData]);

    // Load predictions on mount
    useEffect(() => {
        fetchPredictions();
    }, [fetchPredictions]);
    console.log(predictionData)
    return {
        // State
        predictions,
        selectedPrediction,
        predictionData,
        selectedRows,
        shapValues,
        loading,
        error,

        // Actions
        setSelectedPrediction: handleSetSelectedPrediction,
        setSelectedRows,
        toggleRowSelection,
        fetchPredictions,
        fetchPredictionData,
        fetchShapValues,
        clearError,
    };
}

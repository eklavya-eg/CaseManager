import axios from 'axios';
import { mockPredictions, generateMockPredictionData, generateMockShapValues, mockApiDelay, mockApiError } from './mock-data';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const USE_MOCK_DATA = false; // Always use real API calls

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Types for API responses
export interface PredictionStatus {
    _id: string;
    id: string;
    model_name: string;
    data_name: string;
    created_at: string;
    updated_at: string;
    status: string;
    accuracy: number;
    finalcols: string[];
}

export interface PredictionItem {
    id: string;
    modelName: string;
    dataName: string;
    date: string;
    status: string;
    accuracy: number;
    totalCases: number;
    processedCases: number;
    finalcols: string[];
}

export interface PredictionDataRow {
    _id: string;
    predictions: number;
    [key: string]: any;
}

export interface ShapValue {
    feature: string;
    value: number;
    impact: number;
    color: string;
}

// API functions for predictions
export const predictionsApi = {
    // Get all prediction statuses
    async getPredictions(): Promise<PredictionItem[]> {
        if (USE_MOCK_DATA) {
            await mockApiDelay();
            if (mockApiError(0.05)) {
                throw new Error('Mock API error: Failed to fetch predictions');
            }
            return mockPredictions;
        }

        try {
            const response = await api.get('/v1/prediction-statuses');
            const statuses: PredictionStatus[] = response.data.statuses || [];

            // Transform API response to our interface
            return statuses.map(status => ({
                id: status.id,
                modelName: status.model_name,
                dataName: status.data_name,
                date: status.created_at,
                status: status.status,
                accuracy: status.accuracy,
                totalCases: 0, // Will be fetched separately
                processedCases: 0, // Will be fetched separately
                finalcols: status.finalcols || []
            }));
        } catch (error) {
            console.error('Failed to fetch predictions:', error);
            throw error;
        }
    },

    // Get prediction details by ID
    async getPredictionById(id: string): Promise<PredictionItem> {
        if (USE_MOCK_DATA) {
            await mockApiDelay();
            if (mockApiError(0.05)) {
                throw new Error('Mock API error: Failed to fetch prediction');
            }
            const prediction = mockPredictions.find(p => p.id === id);
            if (!prediction) {
                throw new Error('Prediction not found');
            }
            return prediction;
        }

        try {
            const response = await api.get(`/api/predictions/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch prediction ${id}:`, error);
            throw error;
        }
    },

    // Get prediction data (rows) for a specific prediction
    async getPredictionData(modelId: string, dataId: string): Promise<PredictionDataRow[]> {
        if (USE_MOCK_DATA) {
            await mockApiDelay();
            if (mockApiError(0.05)) {
                throw new Error('Mock API error: Failed to fetch prediction data');
            }
            return generateMockPredictionData(modelId);
        }

        try {
            const response = await api.post('/v1/predictions', {
                model_id: modelId,
                data_id: dataId
            });
            return response.data.predictions || [];
        } catch (error) {
            console.error(`Failed to fetch prediction data for ${modelId}:`, error);
            throw error;
        }
    },

    // Get SHAP values for specific rows
    async getShapValues(rowId: string, modelId: string, dataId: string, finalcols: string[]): Promise<ShapValue[]> {
        if (USE_MOCK_DATA) {
            await mockApiDelay();
            if (mockApiError(0.05)) {
                throw new Error('Mock API error: Failed to fetch SHAP values');
            }
            return generateMockShapValues([1]);
        }

        try {
            const response = await api.post('/v1/predictions-shap', {
                row_id: rowId,
                model_id: modelId,
                data_id: dataId
            });

            const shapValues: number[] = response.data.shap_values;

            // Map SHAP values to features with colors
            return shapValues.map((value, index) => ({
                feature: finalcols[index] || `Feature_${index}`,
                value: value,
                impact: value,
                color: value > 0 ? '#10B981' : '#EF4444' // Green for positive, red for negative
            })).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
        } catch (error) {
            console.error(`Failed to fetch SHAP values for ${rowId}:`, error);
            throw error;
        }
    },

    // Get prediction report/summary
    async getPredictionReport(predictionId: string): Promise<{
        summary: {
            totalCases: number;
            highRiskCases: number;
            lowRiskCases: number;
            averageConfidence: number;
        };
        metrics: {
            accuracy: number;
            precision: number;
            recall: number;
            f1Score: number;
        };
    }> {
        if (USE_MOCK_DATA) {
            await mockApiDelay();
            if (mockApiError(0.05)) {
                throw new Error('Mock API error: Failed to fetch prediction report');
            }
            return {
                summary: {
                    totalCases: 1000,
                    highRiskCases: 300,
                    lowRiskCases: 700,
                    averageConfidence: 0.85
                },
                metrics: {
                    accuracy: 0.92,
                    precision: 0.88,
                    recall: 0.90,
                    f1Score: 0.89
                }
            };
        }

        try {
            const response = await api.get(`/api/predictions/${predictionId}/report`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch prediction report for ${predictionId}:`, error);
            throw error;
        }
    }
};

// Utility functions for API integration
export const apiUtils = {
    // Handle API errors gracefully
    handleError: (error: any) => {
        if (error.response) {
            // Server responded with error status
            return {
                message: error.response.data?.message || 'Server error occurred',
                status: error.response.status
            };
        } else if (error.request) {
            // Request was made but no response received
            return {
                message: 'Network error - please check your connection',
                status: 0
            };
        } else {
            // Something else happened
            return {
                message: error.message || 'An unexpected error occurred',
                status: 0
            };
        }
    },

    // Retry function for failed requests
    retry: async <T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        delay: number = 1000
    ): Promise<T> => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
        throw new Error('Max retries exceeded');
    }
};

export default api;

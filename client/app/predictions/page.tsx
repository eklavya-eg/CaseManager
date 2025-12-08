"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Database, Brain, ArrowRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { usePredictions } from '@/hooks/use-predictions';
import { predictionsApi } from '@/lib/api';

interface Prediction {
    id: string;
    modelName: string;
    dataName: string;
    date: string;
    status: string;
    accuracy: number | "Unavailable";
    totalCases: number;
    processedCases: number;
    finalcols: string[];
}

export default function PredictionsPage() {
    const {
        predictions,
        selectedPrediction,
        predictionData,
        shapValues,
        loading,
        error,
        setSelectedPrediction,
        fetchShapValues,
        clearError
    } = usePredictions();

    const handlePredictionClick = (prediction: any) => {
        setSelectedPrediction(prediction);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={clearError}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedPrediction) {
        return (
            <PredictionDashboard
                prediction={selectedPrediction}
                predictionData={predictionData}
                shapValues={shapValues}
                loading={loading}
                error={error}
                onBack={() => setSelectedPrediction(null)}
                fetchShapValues={fetchShapValues}
                clearError={clearError}
            />
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Predictions
                </h1>
                <p className="text-slate-600">
                    View and analyze your model predictions and results
                </p>
            </div>

            {/* Predictions List */}
            <div className="space-y-4">
                {predictions.map((prediction) => (
                    <Card
                        key={prediction.id}
                        className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-0 shadow-sm bg-white cursor-pointer"
                        onClick={() => handlePredictionClick(prediction)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <Brain className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                                {prediction.modelName}
                                            </h3>
                                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                <Database className="h-4 w-4" />
                                                <span>{prediction.dataName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(prediction.date), 'MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">Accuracy:</span>
                                            <span className="font-semibold text-green-600">
                                                {typeof prediction.accuracy === 'number' ? `${prediction.accuracy}%` : prediction.accuracy}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">Features:</span>
                                            <span>{prediction.finalcols?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <Badge className={`${getStatusColor(prediction.status)} border`}>
                                        {prediction.status}
                                    </Badge>
                                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                                        <Eye className="h-4 w-4" />
                                        <span>View Details</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Prediction Dashboard Component
function PredictionDashboard({
    prediction,
    predictionData,
    shapValues,
    loading,
    error,
    onBack,
    fetchShapValues,
    clearError
}: {
    prediction: any;
    predictionData: any[];
    shapValues: Record<string, any[]>;
    loading: boolean;
    error: string | null;
    onBack: () => void;
    fetchShapValues: (rowId: string, modelId: string, dataId: string, finalcols: string[]) => Promise<void>;
    clearError: () => void;
}) {

    const getPredictionColor = (prediction: string) => {
        return prediction === 'High Risk'
            ? 'text-red-600 bg-red-50 border-red-200'
            : 'text-green-600 bg-green-50 border-green-200';
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={clearError}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        <span>Back</span>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                            {prediction.modelName}
                        </h1>
                        <p className="text-slate-600">{prediction.dataName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-600">Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">
                        {typeof prediction.accuracy === 'number' ? `${prediction.accuracy}%` : prediction.accuracy}
                    </p>
                </div>
            </div>

            {/* Prediction Data Table */}
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        Prediction Results ({predictionData.length} rows)
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                        Click on a row to view detailed SHAP analysis
                    </p>
                </CardHeader>
                <CardContent>
                    {predictionData.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500">No prediction data available</p>
                            <p className="text-sm text-slate-400 mt-2">Data may still be loading or there was an error fetching the data.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-medium text-slate-600">Row ID</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600">Prediction</th>
                                        {predictionData.length > 0 && Object.keys(predictionData[0])
                                            .filter(key => key !== '_id' && key !== 'predictions' && key !== 'fraud_reported' && key !== '_c39')
                                            .slice(0, 6) // Show first 6 features
                                            .map((key) => {
                                                const displayName = key
                                                    .replace(/^numerical__/, '')
                                                    .replace(/^categorical1__/, '')
                                                    .replace(/_/g, ' ')
                                                    .replace(/\b\w/g, l => l.toUpperCase());
                                                return (
                                                    <th key={key} className="text-left py-3 px-4 font-medium text-slate-600">
                                                        {displayName}
                                                    </th>
                                                );
                                            })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictionData.map((row) => {
                                        const handleRowClick = async () => {
                                            const rowId = row._id;

                                            try {
                                                // Check if SHAP values are already fetched
                                                let shapData = shapValues[rowId];

                                                // If not fetched, fetch them directly from API
                                                if (!shapData) {
                                                    const parts = prediction.id.split('_');
                                                    if (parts.length >= 2) {
                                                        const modelId = parts[0];
                                                        const dataId = parts.slice(1).join('_');
                                                        shapData = await predictionsApi.getShapValues(rowId, modelId, dataId, prediction.finalcols);
                                                        // Also update the hook state for future use
                                                        await fetchShapValues(rowId, modelId, dataId, prediction.finalcols);
                                                    }
                                                }

                                                // Store data in sessionStorage
                                                if (shapData) {
                                                    const storageKey = `shap_data_${rowId}`;
                                                    sessionStorage.setItem(storageKey, JSON.stringify(shapData));
                                                    // Open graph page in new tab
                                                    window.open(`/graph?rowId=${rowId}`, '_blank');
                                                }
                                            } catch (error) {
                                                console.error('Error fetching SHAP values:', error);
                                                alert('Failed to load SHAP values. Please try again.');
                                            }
                                        };

                                        return (
                                            <tr
                                                key={row._id}
                                                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={handleRowClick}
                                            >
                                                <td className="py-3 px-4 font-medium text-slate-900">{row._id}</td>
                                                <td className="py-3 px-4">
                                                    <Badge className={`${getPredictionColor(row.predictions === 1 ? 'High Risk' : 'Low Risk')} border`}>
                                                        {row.predictions === 1 ? 'High Risk' : 'Low Risk'}
                                                    </Badge>
                                                </td>
                                                {Object.keys(row)
                                                    .filter(key => key !== '_id' && key !== 'predictions' && key !== 'fraud_reported' && key !== '_c39')
                                                    .slice(0, 6) // Show first 6 features
                                                    .map((key) => (
                                                        <td key={key} className="py-3 px-4 text-slate-600">
                                                            {typeof row[key] === 'number' ? row[key].toFixed(2) : String(row[key] || '').substring(0, 20)}
                                                        </td>
                                                    ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

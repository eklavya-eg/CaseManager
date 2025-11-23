// Mock data service for development and testing
import { PredictionItem, PredictionDataRow, ShapValue } from './api';

// Mock predictions data
export const mockPredictions: PredictionItem[] = [
    {
        id: '1',
        modelName: 'Legal Case Classifier v2.1',
        dataName: 'Q3 Legal Cases Dataset',
        date: '2024-01-15',
        status: 'completed',
        accuracy: 94.2,
        totalCases: 1250,
        processedCases: 1250,
        finalcols: ['age', 'income', 'credit_score', 'debt_ratio', 'employment_years']
    },
    {
        id: '2',
        modelName: 'Medical Diagnosis Predictor v1.8',
        dataName: 'Medical Records 2024',
        date: '2024-01-12',
        status: 'completed',
        accuracy: 91.7,
        totalCases: 890,
        processedCases: 890,
        finalcols: ['symptoms', 'age', 'blood_pressure', 'heart_rate', 'temperature']
    },
    {
        id: '3',
        modelName: 'Financial Risk Assessment v3.0',
        dataName: 'Banking Transactions Q4',
        date: '2024-01-10',
        status: 'completed',
        accuracy: 96.8,
        totalCases: 2100,
        processedCases: 2100,
        finalcols: ['transaction_amount', 'account_balance', 'credit_score', 'age', 'income']
    },
    {
        id: '4',
        modelName: 'Insurance Claims Analyzer v2.5',
        dataName: 'Auto Insurance Claims',
        date: '2024-01-08',
        status: 'completed',
        accuracy: 89.3,
        totalCases: 750,
        processedCases: 750,
        finalcols: ['claim_amount', 'age', 'vehicle_age', 'policy_duration', 'previous_claims']
    },
    {
        id: '5',
        modelName: 'Fraud Detection Model v4.2',
        dataName: 'Credit Card Transactions',
        date: '2024-01-05',
        status: 'completed',
        accuracy: 98.1,
        totalCases: 5000,
        processedCases: 5000,
        finalcols: ['amount', 'merchant_category', 'time_of_day', 'location', 'card_type']
    }
];

// Generate mock prediction data for a specific prediction
export function generateMockPredictionData(predictionId: string, count: number = 20): PredictionDataRow[] {
    return Array.from({ length: count }, (_, i) => ({
        _id: `mock_row_${i + 1}`,
        predictions: Math.random() > 0.5 ? 1 : 0,
        // Add some mock feature columns
        age: Math.floor(Math.random() * 50) + 25,
        income: Math.floor(Math.random() * 100000) + 30000,
        credit_score: Math.floor(Math.random() * 300) + 500,
        debt_ratio: Math.random() * 0.8,
        employment_years: Math.floor(Math.random() * 20) + 1,
        // Add more dynamic columns based on prediction type
        ...(predictionId.includes('medical') ? {
            blood_pressure: Math.floor(Math.random() * 40) + 100,
            heart_rate: Math.floor(Math.random() * 40) + 60,
            temperature: Math.random() * 2 + 98
        } : {}),
        ...(predictionId.includes('financial') ? {
            transaction_amount: Math.floor(Math.random() * 10000),
            account_balance: Math.floor(Math.random() * 100000),
            merchant_category: ['grocery', 'gas', 'restaurant', 'online'][Math.floor(Math.random() * 4)]
        } : {})
    }));
}

// Generate mock SHAP values for specific rows
export function generateMockShapValues(rowIds: number[]): ShapValue[] {
    const features = [
        { name: 'Credit Score', color: '#3B82F6' },
        { name: 'Income', color: '#10B981' },
        { name: 'Age', color: '#8B5CF6' },
        { name: 'Debt Ratio', color: '#F59E0B' },
        { name: 'Employment Years', color: '#EF4444' }
    ];

    const allShapValues: ShapValue[] = [];

    rowIds.forEach(rowId => {
        features.forEach(feature => {
            allShapValues.push({
                feature: feature.name,
                value: Math.random() * 1000, // Mock feature value
                impact: (Math.random() - 0.5) * 0.3, // -0.15 to 0.15
                color: feature.color
            });
        });
    });

    return allShapValues;
}

// Mock API delay function
export function mockApiDelay(min: number = 500, max: number = 1500): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Mock API error function
export function mockApiError(errorRate: number = 0.1): boolean {
    return Math.random() < errorRate;
}

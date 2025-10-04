"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useModels } from '@/hooks/use-store';
import { Brain, Zap, Loader as Loader2, Target, ChartBar as BarChart3 } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/config';

interface PredictModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetName: string;
  datasetId: string;
}

type ActionType = 'PREDICTION' | 'ACCURACY_CHECK';
export function PredictModal({ isOpen, onClose, datasetName, datasetId }: PredictModalProps) {
  const { models, isLoadingModels } = useModels();
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [actionType, setActionType] = useState<ActionType>('PREDICTION');
  const [columnName, setColumnName] = useState<string>('');
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredict = async () => {
    if (!selectedModelId || (actionType === 'ACCURACY_CHECK' && !columnName.trim())) return;

    setIsPredicting(true);

    try {
      // Push prediction job to queue
      const response = await axios.post(
        `${BASE_URL}/v1/push`,
        {
          modelId: selectedModelId,
          datasetId: datasetId,
          accuracy_check: actionType === 'ACCURACY_CHECK',
          columnName: actionType === 'ACCURACY_CHECK' ? columnName : undefined
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to push inference');
      }

      setTimeout(() => {
        setIsPredicting(false);
        // onClose();
        // Here you would typically show a success message or redirect to results
        // if (actionType === 'ACCURACY_CHECK') {
        //   alert(`Accuracy check completed successfully for column: ${columnName}`);
        // } else {
        //   alert('Prediction completed successfully!');
        // }
      }, 3000);
    } catch (error) {
      console.error('Prediction error:', error);
      setIsPredicting(false);
      alert('Failed to start prediction. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedModelId('');
    setActionType('PREDICTION');
    setColumnName('');
    setIsPredicting(false);
    onClose();
  };

  const selectedModel = models.find(model => model.id === selectedModelId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Run Model Analysis</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dataset Info */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900 mb-1">Selected Dataset</p>
            <p className="text-sm text-slate-600">{datasetName}</p>
          </div>

          {/* Action Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">
              Select Action Type
            </Label>
            <RadioGroup value={actionType} onValueChange={(value: ActionType) => setActionType(value)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="PREDICTION" id="prediction" />
                <Label htmlFor="prediction" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Prediction</p>
                    <p className="text-xs text-slate-500">Generate predictions for new data</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="ACCURACY_CHECK" id="accuracy-check" />
                <Label htmlFor="accuracy-check" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <Target className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-slate-900">Accuracy Check</p>
                    <p className="text-xs text-slate-500">Validate model accuracy against known results</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Column Name Input for Accuracy Check */}
          {actionType === 'ACCURACY_CHECK' && (
            <div className="space-y-3">
              <Label htmlFor="column-name" className="text-sm font-medium text-slate-900">
                Target Column Name
              </Label>
              <Input
                id="column-name"
                type="text"
                placeholder="Enter the column name for accuracy validation"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Specify the column containing the actual values to compare against model predictions
              </p>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">
              Select Model
            </Label>

            {isLoadingModels ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <span className="ml-2 text-sm text-slate-500">Loading models...</span>
              </div>
            ) : (
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a model for analysis" />
                </SelectTrigger>
                <SelectContent>
                  {models
                    .filter(model => model.status === 'active' || model.status === 'training')
                    .map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{model.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {'90%'} accuracy
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Model Info */}
          {selectedModel && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-900">Model Details</p>
                <Badge className={`${selectedModel.status === 'active' || 'training'
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                  }`}>
                  {selectedModel.status || 'training'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Size</p>
                  <p className="font-medium text-slate-900">{'10 mb'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Accuracy</p>
                  <p className="font-medium text-slate-900">{'90%'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPredicting}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePredict}
              disabled={!selectedModelId || isPredicting || (actionType === 'ACCURACY_CHECK' && !columnName.trim())}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {actionType === 'ACCURACY_CHECK' ? 'Checking...' : 'Predicting...'}
                </>
              ) : (
                <>
                  {actionType === 'ACCURACY_CHECK' ? (
                    <BarChart3 className="h-4 w-4 mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {actionType === 'ACCURACY_CHECK' ? 'Check Accuracy' : 'Run Prediction'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
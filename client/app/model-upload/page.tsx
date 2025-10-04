"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Brain, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle } from 'lucide-react';
import { useModels } from '@/hooks/use-store';
import { Model, ModelType } from '@/lib/store';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import axios from 'axios';
import { BASE_URL } from '@/config';

export default function ModelUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { models, isLoadingModels, fetchModels } = useModels();
  const [modelType, setModelType] = useState<ModelType>(ModelType.CLASSIFICATION);

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Use fallback data if API is not available or no data
  const displayModels = models.length > 0 ? models : [];

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      formData.append('name', selectedFiles[0].name);
      formData.append('type', modelType);
      const response = await axios.post(
        `${BASE_URL}/v1/model`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.status !== 200) {
        throw new Error('Failed to upload model');
      }

      const { model } = response.data as { model: Model };
      fetchModels();

      setTimeout(() => {
        setIsUploading(false);
        setModelType(ModelType.CLASSIFICATION);
        setSelectedFiles([]);
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      alert('Failed to upload model. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'training':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'training':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Training</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Model Upload
        </h1>
        <p className="text-slate-600">
          Upload and manage your machine learning models (.pkl files)
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Upload New Model</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedFileTypes={['.pkl']}
                title="Drop your .pkl file here"
                description="Upload your trained machine learning model"
                maxFiles={1}
              />

              {/* Model Type Selection */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-900">
                    Model Type
                  </Label>
                  <RadioGroup value={modelType} onValueChange={(value: ModelType) => setModelType(value)}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value={ModelType.CLASSIFICATION} id="classification" />
                      <Label htmlFor="classification" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">Classification</p>
                          <p className="text-xs text-slate-500">Model that categorizes data into predefined classes</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value={ModelType.ANOMALY_DETECTION} id="anomaly-detection" />
                      <Label htmlFor="anomaly-detection" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="font-medium text-slate-900">Anomaly Detection</p>
                          <p className="text-xs text-slate-500">Model that identifies unusual patterns or outliers</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Model
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upload Guidelines */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-purple-900">Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Supported Format</p>
                  <p className="text-xs text-slate-600">Only .pkl (pickle) files are accepted</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">File Size</p>
                  <p className="text-xs text-slate-600">Maximum file size is 100MB</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Model Requirements</p>
                  <p className="text-xs text-slate-600">Ensure your model is properly serialized</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Version Control</p>
                  <p className="text-xs text-slate-600">Include version numbers in filename</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Models */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Existing Models</span>
            <Badge variant="outline" className="text-xs">
              {displayModels.length} models
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Model Name</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Upload Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Accuracy</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayModels.map((model, index) => (
                  <tr key={model.id || index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(model.status || 'active')}
                        <span className="font-medium text-slate-900">{model.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{'10 mb'}</td>
                    <td className="py-4 px-4 text-slate-600">{model.createdAt}</td>
                    <td className="py-4 px-4">{getStatusBadge(model.status || 'active')}</td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-900">{'90%'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
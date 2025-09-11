"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ModelFile {
  name: string;
  size: string;
  uploadDate: string;
  status: 'active' | 'training' | 'error';
  accuracy: number;
}

const existingModels: ModelFile[] = [
  {
    name: 'case_classifier_v3.pkl',
    size: '45.2 MB',
    uploadDate: '2024-01-15',
    status: 'active',
    accuracy: 97.2
  },
  {
    name: 'sentiment_analyzer_v2.pkl',
    size: '32.1 MB',
    uploadDate: '2024-01-10',
    status: 'training',
    accuracy: 94.8
  },
  {
    name: 'priority_predictor_v1.pkl',
    size: '28.7 MB',
    uploadDate: '2024-01-05',
    status: 'error',
    accuracy: 89.3
  }
];

enum ModelType {
  CLASSIFICATION = "classification",
  ANOMALY_DETECTION = "anomaly_detection"
}

export default function ModelUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [modelType, setType] = useState<ModelType>(ModelType.CLASSIFICATION);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    const formData = new FormData();
    formData.append(selectedFiles[0].name, selectedFiles[0])

    setIsUploading(true);

    // Simulate upload process
    const response = await axios.post("/api/v1/model/", {
      type: modelType,
      file: formData
    })
    if(response.status===200){
      alert("Model uploaded successfully");
    }else{
      alert("Failed to upload model");
    }
    
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFiles([]);
    }, 3000);
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
                acceptedFileTypes={['.pkl', 'application/octet-stream']}
                title="Drop your .pkl file here"
                description="Upload your trained machine learning model"
                maxFiles={1}
              />
              
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
              {existingModels.length} models
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
                {existingModels.map((model, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(model.status)}
                        <span className="font-medium text-slate-900">{model.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{model.size}</td>
                    <td className="py-4 px-4 text-slate-600">{model.uploadDate}</td>
                    <td className="py-4 px-4">{getStatusBadge(model.status)}</td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-900">{model.accuracy}%</span>
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
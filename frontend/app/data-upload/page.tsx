"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Upload, Eye, Download, Trash2 } from 'lucide-react';

interface DataFile {
  name: string;
  size: string;
  uploadDate: string;
  records: number;
  status: 'processed' | 'processing' | 'error';
}

const existingDatasets: DataFile[] = [
  {
    name: 'training_cases_2024.csv',
    size: '12.4 MB',
    uploadDate: '2024-01-15',
    records: 15420,
    status: 'processed'
  },
  {
    name: 'validation_set_v2.csv',
    size: '8.7 MB',
    uploadDate: '2024-01-12',
    records: 9876,
    status: 'processed'
  },
  {
    name: 'new_cases_batch.csv',
    size: '5.2 MB',
    uploadDate: '2024-01-10',
    records: 6543,
    status: 'processing'
  }
];

// Sample data preview
const sampleData = [
  { id: 1, case_type: 'Legal', priority: 'High', status: 'Open', date: '2024-01-15' },
  { id: 2, case_type: 'Medical', priority: 'Medium', status: 'In Progress', date: '2024-01-14' },
  { id: 3, case_type: 'Financial', priority: 'Low', status: 'Closed', date: '2024-01-13' },
  { id: 4, case_type: 'Insurance', priority: 'High', status: 'Open', date: '2024-01-12' },
  { id: 5, case_type: 'Legal', priority: 'Medium', status: 'Closed', date: '2024-01-11' },
];

export default function DataUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setShowPreview(false);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFiles([]);
      setShowPreview(false);
    }, 3000);
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Processed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
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
          Data Upload
        </h1>
        <p className="text-slate-600">
          Upload and manage your datasets (.csv files)
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span>Upload New Dataset</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedFileTypes={['.csv', 'text/csv']}
                title="Drop your CSV file here"
                description="Upload your case data for training and analysis"
                maxFiles={1}
              />
              
              {selectedFiles.length > 0 && (
                <div className="flex justify-between">
                  <Button 
                    onClick={handlePreview}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Data
                  </Button>
                  
                  <Button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Dataset
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Preview */}
          {showPreview && (
            <Card className="border-0 shadow-sm bg-white mt-6">
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-medium text-slate-900">ID</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-900">Case Type</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-900">Priority</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-900">Status</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.map((row, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 px-3 text-slate-700">{row.id}</td>
                          <td className="py-2 px-3 text-slate-700">{row.case_type}</td>
                          <td className="py-2 px-3">
                            <Badge variant={row.priority === 'High' ? 'destructive' : row.priority === 'Medium' ? 'default' : 'secondary'}>
                              {row.priority}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-slate-700">{row.status}</td>
                          <td className="py-2 px-3 text-slate-700">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 mt-4">Showing first 5 rows of your dataset</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upload Guidelines */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Data Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-slate-900">Required Columns</p>
                <ul className="text-xs text-slate-600 mt-1 space-y-1">
                  <li>• case_id</li>
                  <li>• case_type</li>
                  <li>• priority</li>
                  <li>• status</li>
                  <li>• date_created</li>
                </ul>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-green-100">
                <p className="text-sm font-medium text-slate-900">Format Guidelines</p>
                <ul className="text-xs text-slate-600 mt-1 space-y-1">
                  <li>• Use comma-separated values</li>
                  <li>• Include headers in first row</li>
                  <li>• UTF-8 encoding preferred</li>
                  <li>• Maximum 50MB file size</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Datasets */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Existing Datasets</span>
            <Badge variant="outline" className="text-xs">
              {existingDatasets.length} datasets
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Dataset Name</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Records</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Upload Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingDatasets.map((dataset, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-900">{dataset.name}</td>
                    <td className="py-4 px-4 text-slate-600">{dataset.size}</td>
                    <td className="py-4 px-4 text-slate-600">{dataset.records.toLocaleString()}</td>
                    <td className="py-4 px-4 text-slate-600">{dataset.uploadDate}</td>
                    <td className="py-4 px-4">{getStatusBadge(dataset.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3 mr-1" />
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
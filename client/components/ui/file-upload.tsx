"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, X, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  acceptedFileTypes: string[];
  maxFiles?: number;
  title: string;
  description: string;
}

export function FileUpload({ 
  onFileSelect, 
  acceptedFileTypes, 
  maxFiles = 1, 
  title, 
  description 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    onFileSelect(acceptedFiles);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      if (type === ".pkl") acc["application/octet-stream"] = [".pkl"];
      else acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01]",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragActive ? "bg-blue-100" : "bg-slate-100"
          )}>
            <Upload className={cn(
              "h-8 w-8 transition-colors",
              isDragActive ? "text-blue-600" : "text-slate-400"
            )} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
            <p className="text-xs text-slate-400 mt-2">
              Supported formats: {acceptedFileTypes.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-slate-900">Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{file.name}</p>
                  <p className="text-xs text-green-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

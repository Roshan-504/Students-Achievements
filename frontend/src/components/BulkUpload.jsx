import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';

const BulkUploadModal = ({ isOpen, onClose, uploadTypeOptions = [] }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUploadType, setSelectedUploadType] = useState(uploadTypeOptions[0]?.value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedFile(null);
      setUploadStatus(null);
      setSelectedUploadType(uploadTypeOptions[0]?.value || '');
      
      // Focus management
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose, uploadTypeOptions]);

  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xlsx, .xls)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
  };

  const handleDragEvents = {
    onDragOver: (e) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: (e) => {
      e.preventDefault();
      setIsDragging(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedUploadType) return;
    
    setIsUploading(true);
    setUploadStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedUploadType);

      const response = await axiosInstance.post(`/admin/upload/${selectedUploadType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(response.data.message || 'Data uploaded successfully!');
      setUploadStatus('success');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to upload file. Please try again.';
      toast.error(errorMessage);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      {/* Modal Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                Bulk Data Upload
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload Excel file to import {selectedUploadType.toLowerCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Template Requirements */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Template Requirements
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 list-disc list-inside pl-2">
              <li>First row must contain column headers</li>
              <li>Required columns depend on upload type</li>
              <li>File must be in Excel format (.xlsx)</li>
              <li>Maximum file size: 5MB</li>
            </ul>
          </div>

          {/* Upload Type Selection */}
          <div className="space-y-2">
            <label htmlFor="upload-type" className="block text-sm font-medium text-gray-700">
              Select Data Type
            </label>
            <select
              id="upload-type"
              value={selectedUploadType}
              onChange={(e) => setSelectedUploadType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            >
              {uploadTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Excel File
            </label>
            <div
              {...handleDragEvents}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' :
                selectedFile ? 'border-green-500 bg-green-50' :
                'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files[0])}
                accept=".xlsx,.xls"
                className="hidden"
                disabled={isUploading}
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  {!isUploading && (
                    <p className="text-xs text-gray-400 mt-2">Click or drag to replace</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="font-medium text-gray-900">
                    {isDragging ? 'Drop your file here' : 'Drag and drop file here or click to browse'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Excel files only (.xlsx, .xls)</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="text-sm">There was an error with your upload. Please try again.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                (!selectedFile || isUploading) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </span>
              ) : (
                'Upload Data'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';
const BulkUpload = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('Students Data');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [errorMessage, setErroMessage] = useState(null);
  // Inside the component state

  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Focus management and escape key handling
  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      {/* Success Message */}

      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
      setUploadStatus(null);
    } else {
      setUploadStatus('error');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
  if (!selectedFile) return;
  
  setIsUploading(true); // Reset error message
  
  try {
    const formData = new FormData();
    formData.append('file', selectedFile);

    // Determine endpoint based on upload type
    let endpoint;
    switch(uploadType) {
      case 'Students Data':
        endpoint = '/admin/upload/students';
        break;
      case 'Faculty Data':
        endpoint = '/admin/upload/faculty';
        break;
      default:
        throw new Error('Invalid upload type');
    }

    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.success(response.data.message || 'File uploaded successfully!');
    
    // Auto close after success
    setTimeout(() => {
      onClose();
      setSelectedFile(null);
    }, 2000);
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle backend validation errors
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } 
    // Handle specific Excel validation errors
    else if (error.response?.data?.details) {
      toast.error(error.response.data.details.join(', '));
    } 
    // Handle generic errors
    else {
      toast.error(error.message || 'Upload failed. Please try again.');
    }
  } finally {
    setIsUploading(false);
  }
}; 

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: '#f9f6f1' }}>
          <h2 id="modal-title" className="text-2xl font-bold text-black">
            Bulk Upload
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Requirements - Moved to top */}
          <div className="rounded-lg p-4 border border-gray-200" style={{ backgroundColor: '#f9f6f1' }}>
            <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
              <FileText className="mr-2 text-black" size={20} />
              Template Requirements:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#f4b400' }}></span>
                <span>First row must contain column headers</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#f4b400' }}></span>
                <span>Required columns: PRN, Email ID, First Name, Department, Batch</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#f4b400' }}></span>
                <span>Email must end with @ves.ac.in</span>
              </li>
            </ul>
          </div>

          {/* Upload Type */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-black">
              Upload Type
            </label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white text-black"
              style={{ 
                '--tw-ring-color': '#f4b400',
                focusRingColor: '#f4b400'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f4b400'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="Students Data">Students Data</option>
              <option value="Faculty Data">Faculty Data</option>
              <option value="Course Data">Course Data</option>
            </select>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-black">
              Excel File
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
                isDragging
                  ? 'border-opacity-100 bg-opacity-20'
                  : selectedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{
                borderColor: isDragging ? '#f4b400' : selectedFile ? '#10b981' : '#d1d5db',
                backgroundColor: isDragging ? '#f9f6f1' : selectedFile ? '#f0fdf4' : 'white'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-3">
                    <FileText className="text-green-500" size={28} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-black">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="mx-auto text-gray-400" size={36} />
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-black">Choose File</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      No file chosen
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Maximum file size: 5MB
            </p>
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`flex items-center space-x-3 p-4 rounded-lg ${
              uploadStatus === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {uploadStatus === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="text-sm font-medium">
                {uploadStatus === 'success' 
                  ? 'File uploaded successfully!' 
                  : 'Please select a valid Excel file.'}
              </span>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
              !selectedFile || isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-white hover:opacity-90 active:opacity-95 transform hover:scale-105 shadow-lg'
            }`}
            style={{
              backgroundColor: (!selectedFile || isUploading) ? '#d1d5db' : '#f4b400'
            }}
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
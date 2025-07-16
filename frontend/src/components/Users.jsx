import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import BulkUploadModal from './BulkUpload';
import UserDetails from './UserDetails';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Mock data - would normally come from API
  const batches = [
    { id: 1, name: '2023_a_INFT(D10A)', students: 45, completion: 67 },
    { id: 2, name: '2023_b_INFT(D10B)', students: 38, completion: 82 },
    { id: 3, name: '2023_c_INFT(D10C)', students: 52, completion: 45 },
    { id: 4, name: '2024_a_INFT(D15A)', students: 29, completion: 0 },
    { id: 5, name: 'Faculty Members', students: 41, completion: 73 }
  ];

  const uploadTypeOptions = [
    { value: 'students', label: 'Students Data' },
    { value: 'faculty', label: 'Faculty Data' },
  ];

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManageClick = (batch) => {
    setSelectedBatch(batch);
    setShowUserDetails(true);
  };

  if (showUserDetails && selectedBatch) {
    return <UserDetails batch={selectedBatch} onExit={() => setShowUserDetails(false)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage your batches and students efficiently</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            {/* Create Button */}
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Bulk Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBatches.map((batch) => (
          <BatchCard 
            key={batch.id} 
            batch={batch} 
            onManageClick={handleManageClick} 
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No batches found matching your search</p>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        uploadTypeOptions={uploadTypeOptions}
      />
    </div>
  );
};

// Separate BatchCard component for better readability
const BatchCard = ({ batch, onManageClick }) => {
  const completionColor = batch.completion >= 80 ? 'bg-green-500' :
                        batch.completion >= 60 ? 'bg-blue-500' :
                        batch.completion >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{batch.name}</h3>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>{batch.students} students</span>
          <span>{batch.completion}% responded</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div 
            className={`h-2 rounded-full ${completionColor}`}
            style={{ width: `${batch.completion}%` }}
          />
        </div>
      </div>
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <button
          onClick={() => onManageClick(batch)}
          className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100"
        >
          Manage Batch
        </button>
      </div>
    </div>
  );
};

export default Users;
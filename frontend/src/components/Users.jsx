import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronRight, Users as UsersIcon, BookOpen, TrendingUp } from 'lucide-react';
import UserDetails from './UserDetails';
import BulkUpload from '../components/BulkUpload'
const Users = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  // Mock data - optimized for performance
  const [dashboardData] = useState({
    batches: [
      { 
        id: 1, 
        name: '2023_a_INFT(D10A)', 
        students: 45, 
        completion: 67,
      },
      { 
        id: 2, 
        name: '2023_b_INFT(D10B)', 
        students: 38, 
        completion: 82,
      },
      { 
        id: 3, 
        name: '2023_c_INFT(D10C)', 
        students: 52, 
        completion: 45,
      },
      { 
        id: 4, 
        name: '2024_a_INFT(D15A)', 
        students: 29,  
        completion: 0,
      },
      { 
        id: 5, 
        name: 'Faculty Members',  
        students: 41,  
        completion: 73,
      }
    ]
  });

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter batches based on search - optimized
  const filteredBatches = React.useMemo(() => {
    if (!searchTerm) return dashboardData.batches;
    
    const term = searchTerm.toLowerCase();
    return dashboardData.batches.filter(batch =>
      batch.name.toLowerCase().includes(term) ||
      batch.instructor.toLowerCase().includes(term) ||
      batch.category.toLowerCase().includes(term)
    );
  }, [searchTerm, dashboardData.batches]);

  // Get completion color
  const getCompletionColor = (completion) => {
    if (completion >= 80) return 'from-emerald-500 to-emerald-600';
    if (completion >= 60) return 'from-blue-500 to-blue-600';
    if (completion >= 40) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  // Handle manage click
  const handleManageClick = (batch) => {
    setSelectedBatch(batch);
    setShowUserDetails(true);
  };

  // Handle back from details
  const handleBackFromDetails = () => {
    setShowUserDetails(false);
    setSelectedBatch(null);
    
  };

  // Conditional rendering for UserDetails
  if (showUserDetails && selectedBatch) {
    return (
      <UserDetails 
        batch={selectedBatch} 
        onExit={handleBackFromDetails}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UsersIcon className="text-indigo-600" size={32} />
              User Management
            </h1>
            <p className="text-gray-600">Manage your batches and students efficiently</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            
            {/* Create Button */}
            <div>
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => setIsModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Create Batch
              </button>
              <BulkUpload 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBatches.map((batch, index) => (
          <div 
            key={batch.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {batch.name}
                  </h3>
                </div>
              </div>
              
            </div>

            {/* Stats Section */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <UsersIcon size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium">{batch.students} Students</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {batch.completion}% Responded
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getCompletionColor(batch.completion)} transition-all duration-1000 ease-out`}
                  style={{ width: `${batch.completion}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6">
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium">
                  📊 Analytics
                </button>
                
                <button 
                  onClick={() => handleManageClick(batch)}
                  className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 font-medium flex items-center justify-center gap-1 group"
                >
                  ⚙️ Manage
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg font-medium mb-2">No batches found</div>
          <p className="text-gray-400 text-sm">
            Try adjusting your search criteria or create a new batch
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
// FacultyDashboard.jsx
import React, { useState } from 'react';
import FilterPanel from '../components/FilterPanel';
import Visuals from '../components/Visuals';
const FacultyDashboard = () => {
    const [faculty, setfaculty] = useState({
        name: 'Faculty Member',
        email: 'faculty@university.edu',
        role: 'System facultyistrator',
        avatar: null
      });
    
    
      // Handle logout
    const handleLogout = () => {
        console.log('faculty logout clicked');
        // Will integrate with auth logic
      };
    
    const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);
    const [filters, setFilters] = useState({
    dateRange: 'last30days',
    studentName: '',
    activityType: 'all',
    status: 'all'
    });

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
        }));
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Faculty Dashboard</h1>
              </div>
            </div>

            {/* faculty profile and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-medium">
                    {faculty.name.split(' ').map(n => n[0]).join('')} 
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{faculty.name}</p>
                </div>
              </div>
              {/* Enhanced logout button with tooltip */}
              <div className="relative">
                <button
                  onClick={handleLogout}
                  onMouseEnter={() => setShowLogoutTooltip(true)}
                  onMouseLeave={() => setShowLogoutTooltip(false)}
                  className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110 p-2 rounded-full hover:bg-red-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                {/* Tooltip */}
                {showLogoutTooltip && (
                  <div className="absolute right-0 top-12 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg transform transition-all duration-200 animate-fade-in">
                    Logout
                    <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Dashboard Content Area */}
      <FilterPanel />

      <Visuals />
    </div>
  );
};



export default FacultyDashboard;
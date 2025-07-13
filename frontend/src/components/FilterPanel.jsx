import { useState } from 'react';

function FilterPanel() {
  const [filters, setFilters] = useState({
    batchYear: '',
    division: '',
    studentSearch: '',
    dateRange: 'last30days',
    activityType: 'all'
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const onFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      batchYear: '',
      division: '',
      studentSearch: '',
      dateRange: 'last30days',
      activityType: 'all'
    });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Faculty Dashboard
          </h1>
          <p className="text-slate-600 text-lg">Monitor and analyze student activities across departments</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-2xl">
          {/* Filter Header */}
          <div 
            className="p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 cursor-pointer transition-all duration-300 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
                  <p className="text-indigo-100 text-sm">Customize your data view</p>
                </div>
              </div>
              <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter Content */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                

                {/* Batch Year Filter */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                    Batch Year
                  </label>
                  <div className="relative">
                    <select 
                      value={filters.batchYear}
                      onChange={(e) => onFilterChange('batchYear', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-gradient-to-r from-white to-slate-50 hover:from-purple-50 hover:to-pink-50 appearance-none cursor-pointer group-hover:border-purple-300"
                    >
                      <option value="">All Batches</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Division Filter */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-pink-600 transition-colors duration-200">
                    Division / Class
                  </label>
                  <div className="relative">
                    <select 
                      value={filters.division}
                      onChange={(e) => onFilterChange('division', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-gradient-to-r from-white to-slate-50 hover:from-pink-50 hover:to-rose-50 appearance-none cursor-pointer group-hover:border-pink-300"
                    >
                      <option value="">All Divisions</option>
                      <option value="A">Division A</option>
                      <option value="B">Division B</option>
                      <option value="C">Division C</option>
                      <option value="D">Division D</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-pink-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Student Search Filter */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-emerald-600 transition-colors duration-200">
                    Student Name / PRN / Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, PRN, or email..."
                      value={filters.studentSearch}
                      onChange={(e) => onFilterChange('studentSearch', e.target.value)}
                      className="w-full px-4 py-3 pl-11 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-gradient-to-r from-white to-slate-50 hover:from-emerald-50 hover:to-teal-50 group-hover:border-emerald-300"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    Date Range
                  </label>
                  <div className="relative">
                    <select 
                      value={filters.dateRange}
                      onChange={(e) => onFilterChange('dateRange', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-cyan-50 appearance-none cursor-pointer group-hover:border-blue-300"
                    >
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last3months">Last 3 Months</option>
                      <option value="last6months">Last 6 Months</option>
                      <option value="lastyear">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Activity Type Filter */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-orange-600 transition-colors duration-200">
                    Activity Type
                  </label>
                  <div className="relative">
                    <select 
                      value={filters.activityType}
                      onChange={(e) => onFilterChange('activityType', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gradient-to-r from-white to-slate-50 hover:from-orange-50 hover:to-amber-50 appearance-none cursor-pointer group-hover:border-orange-300"
                    >
                      <option value="all">All Activities</option>
                      <option value="tech">Tech Activities</option>
                      <option value="non-tech">Non-Tech Activities</option>
                      <option value="internal">Internal Activities</option>
                      <option value="external">External Activities</option>
                      <option value="internship">Internships</option>
                      <option value="certification">Certifications</option>
                      <option value="project">Projects</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-200">
                <button className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50">
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Apply Filters</span>
                  </span>
                </button>
                <button 
                  onClick={resetFilters}
                  className="group bg-gradient-to-r from-slate-500 to-slate-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-slate-600 hover:to-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reset Filters</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
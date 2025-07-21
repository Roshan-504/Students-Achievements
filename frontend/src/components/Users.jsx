import React, { useState, useEffect, useMemo } from 'react';
import { Filter, ChevronRight, Users as UsersIcon, X, Plus } from 'lucide-react';
import UserDetails from './StudentsDetails';
import BulkUpload from '../components/BulkUpload';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';

const Users = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // States for modals
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  // Data fetching and loading states
  const [batches, setBatches] = useState([]);
  const [facultyCount, setFacultyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const uploadTypeOptions = [
    { value: 'students', label: 'Students Data' },
    { value: 'batches', label: 'Batches Data' }
  ];

  const [filters, setFilters] = useState({
    division: { a: false, b: false, c: false },
    batchYear: '',
    dateFilter: new Date(Date.now() - 30 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Fetch batches data from backend
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/batches', {
        params: { date: filters.dateFilter },
      });
      setBatches(response.data.data);
    } catch (err) {
      setError('Failed to load batches. Please try again later.');
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch faculty count from backend
  const fetchFacultyCount = async () => {
    try {
      const response = await axiosInstance.get('/admin/faculty/count');
      setFacultyCount(response.data.count);
    } catch (err) {
      console.error('Error fetching faculty count:', err);
    }
  };

  // Initial data fetch and re-fetch on date filter change
  useEffect(() => {
    const fetchData = async () => {
      await fetchBatches();
      await fetchFacultyCount();
      setIsLoaded(true);
    };
    fetchData();
  }, [filters.dateFilter,isBulkUploadModalOpen]);

  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = (batch) => {
    setBatchToDelete(batch);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    let toastId;
    try {
      setDeleting(true);
      toastId = toast.loading('Deleting Batch...', { position: 'top-center', duration: Infinity });
      await axiosInstance.delete('/admin/delete-batch', {
        params: {
          batch_no: batchToDelete.batch_no,
          department: batchToDelete.department,
          division: batchToDelete.division,
        },
      });
      toast.success('Batch deleted successfully', { id: toastId, duration: 4000 });
      fetchBatches(); // Refresh batch list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete batch', { id: toastId, duration: 4000 });
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Transform backend data to UI format
  const transformedBatches = useMemo(() => {
    if (loading) return [];
    const studentBatches = batches.map((batch) => ({
      id: `${batch.batch_no}_${batch.department}_${batch.division}`,
      name: `${batch.batch_no}_${batch.department}_${batch.division}`,
      students: batch.totalStudents,
      completion: batch.totalStudents ? Math.round((batch.updatedStudents / batch.totalStudents) * 100) : 0,
      division: batch.division.toLowerCase(),
      year: batch.batch_no.toString(),
      rawData: batch, // Keep raw data for UserDetails
    }));
    const facultyBatch = {
      id: 'faculty',
      name: 'Faculty Members',
      students: facultyCount,
      completion: 0,
      division: 'faculty',
      year: new Date().getFullYear().toString(),
      isFaculty: true,
    };
    return [...studentBatches, facultyBatch];
  }, [batches, facultyCount, loading]);

  // Apply filters to transformed data
  const filteredBatches = useMemo(() => {
    let result = transformedBatches;
    const selectedDivisions = Object.keys(filters.division).filter((key) => filters.division[key]);
    if (selectedDivisions.length > 0) {
      result = result.filter((batch) => selectedDivisions.includes(batch.division));
    }
    if (filters.batchYear) {
      result = result.filter((batch) => batch.year === filters.batchYear);
    }
    return result;
  }, [filters, transformedBatches]);

  const handleDivisionChange = (division) => {
    setFilters((prev) => ({
      ...prev,
      division: { ...prev.division, [division]: !prev.division[division] },
    }));
  };

  const handleYearChange = (year) => setFilters((prev) => ({ ...prev, batchYear: year }));
  const handleDateChange = (date) => setFilters((prev) => ({ ...prev, dateFilter: date }));

  const clearAllFilters = () =>
    setFilters({
      division: { a: false, b: false, c: false },
      batchYear: '',
      dateFilter: new Date().toISOString().split('T')[0],
    });

  const handleManageClick = (batch) => {
    setSelectedBatch(batch);
    setShowUserDetails(true);
  };

  const handleBackFromDetails = () => {
    setShowUserDetails(false);
    setSelectedBatch(null);
  };

  if (showUserDetails && selectedBatch) {
    return <UserDetails batch={selectedBatch.rawData} comparisonDate={filters.dateFilter} onClose={handleBackFromDetails} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UsersIcon className="text-indigo-600" size={32} />
              User Management
            </h1>
            <p className="text-gray-600">Manage your batches and students efficiently</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative">
            {/* Filter Dropdown */}
            <div className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-600 text-white font-medium rounded-xl">
                <Filter size={20} className="mr-2" /> Filter
              </button>
              {isFilterOpen && (
                <div className="absolute top-full mt-2 right-0 z-50 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 filter-dropdown">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-gray-900">Filter Batches</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="p-1 text-gray-400 hover:text-black transition duration-200">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Division</label>
                      <div className="flex gap-4">
                        {['a', 'b', 'c'].map((division) => (
                          <label key={division} className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition duration-150">
                            <input
                              type="checkbox"
                              checked={filters.division[division]}
                              onChange={() => handleDivisionChange(division)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-800 font-medium uppercase">{division}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Batch Year</label>
                      <input
                        type="text"
                        placeholder="Enter year (e.g., 2023)"
                        value={filters.batchYear}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Date Filter</label>
                      <input
                        type="date"
                        value={filters.dateFilter}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={clearAllFilters} className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition">
                      Clear All
                    </button>
                    <button onClick={() => setIsFilterOpen(false)} className="flex-1 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90 rounded-xl transition">
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Create Batch Button */}
            <div>
              <button onClick={() => setIsBulkUploadModalOpen(true)} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl">
                <Plus size={20} className="mr-2" /> Create Batch
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <div className="text-red-600 font-medium">{error}</div>
          <button
            onClick={() => {
              setError(null);
              fetchBatches();
              fetchFacultyCount();
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {filteredBatches.map((batch) => (
              <div key={batch.id} className="bg-white/80 border border-blue-100/50 rounded-2xl shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{batch.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <UsersIcon size={16} className="text-gray-400" />
                          Total {batch.isFaculty ? 'Faculty' : 'Students'}:<span className="font-medium">{batch.students}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {!batch.isFaculty && (
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Response Rate</span>
                      <span className="text-lg font-bold text-gray-900">{batch.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200/60 rounded-full h-3 mb-4 overflow-hidden">
                      <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${batch.completion}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="px-6 pb-6">
                  <div className="flex gap-3">
                    <button onClick={() => handleDeleteClick(batch.rawData)} className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-gray-100 to-slate-200 cursor-pointer text-slate-700 hover:bg-gray-100 rounded-xl">
                      ❌ Delete
                    </button>
                    <button onClick={() => handleManageClick(batch)} className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-100 to-purple-200 text-blue-700 cursor-pointer hover:bg-blue-100 rounded-xl flex items-center justify-center gap-2">
                      ⚙️ Manage <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBatches.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg font-medium mb-2">No batches found</div>
              <p className="text-gray-400 text-sm">Try adjusting your filter criteria or create a new batch</p>
            </div>
          )}
        </>
      )}

      {/* Conditional Rendering for Modals */}
      {isBulkUploadModalOpen && <BulkUpload isOpen={isBulkUploadModalOpen} uploadTypeOptions={uploadTypeOptions} onClose={() => setIsBulkUploadModalOpen(false)} />}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Confirm Batch Deletion</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700" disabled={deleting}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete Batch <span className="font-bold">{batchToDelete?.batch_no} ({batchToDelete?.department}, {batchToDelete?.division}) ?</span>{' '}
              </p>
              <p className="text-yellow-600 pb-2">This will permanently delete all students and their associated activities in this batch.</p>

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50" disabled={deleting}>
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700" disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
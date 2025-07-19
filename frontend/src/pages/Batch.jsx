import { useEffect, useState } from 'react';
import { Calendar, Plus, X, FileText, Trash2, Edit2, ChevronRight } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import UserDetails from '../components/StudentsDetails';
import BulkUploadModal from '../components/BulkUpload';
import toast from 'react-hot-toast';

const BatchManagementPage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonDate, setComparisonDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  const uploadTypeOptions = [
    { value: 'students', label: 'Students Data' },
    { value: 'batches', label: 'Batches Data' }
  ];

  useEffect(() => {
    fetchBatches();
  }, [comparisonDate, isBulkUploadOpen]);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/batches', {
        params: { date: comparisonDate },
      });
      setBatches(response.data.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch batches';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
  };

  const handleDateChange = (e) => {
    setComparisonDate(e.target.value);
    setSelectedBatch(null);
  };

  const handleBackToBatches = () => {
    setSelectedBatch(null);
  };

  const handleBulkUploadSuccess = () => {
    fetchBatches();
  };

  const handleDeleteClick = (batch) => {
    setBatchToDelete(batch);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    let toastId;
    try {
      setIsLoading(true);
      toastId = toast.loading("Deleting Batch...",{position: 'top-center', duration: Infinity});
      const response = await axiosInstance.delete('/admin/delete-batch', {
        params: {
          batch_no: batchToDelete.batch_no,
          department: batchToDelete.department,
          division: batchToDelete.division
        }
      });
      
      toast.success(response.data.message || 'Batch deleted successfully', {id: toastId, duration: 4000});
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete batch', {id: toastId, duration: 4000});
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (selectedBatch) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <UserDetails 
            batch={selectedBatch} 
            comparisonDate={comparisonDate} 
            onClose={handleBackToBatches}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-9xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Batch Management</h1>
          <div className="flex items-center gap-3">
            <label htmlFor="comparisonDate" className="text-sm font-medium text-slate-700">
              Comparison Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                id="comparisonDate"
                value={comparisonDate}
                onChange={handleDateChange}
                className="pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                aria-label="Select comparison date"
              />
            </div>
            <button 
              onClick={() => setIsBulkUploadOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus size={20} className="mr-2" /> Create Batch
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg flex items-start gap-2" role="alert">
            <X size={20} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isLoading && !batches.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Table Section */}
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => {
                      const completion = Math.round((batch.updatedStudents / batch.totalStudents) * 100);
                      return (
                        <tr key={`${batch.batch_no}-${batch.department}-${batch.division}`} className="hover:bg-gray-50 transition-colors">
                          {/* Batch Details Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {batch.batch_no} - {batch.department} - {batch.division}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Students Count Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {batch.totalStudents} students
                            </div>
                            <div className="text-xs text-gray-500">
                              {batch.updatedStudents || 0} Filled form
                            </div>
                          </td>
                          
                          {/* Completion Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-full sm:w-48 bg-slate-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  completion >= 80 ? 'bg-green-600' :
                                  completion >= 60 ? 'bg-blue-600' :
                                  completion >= 40 ? 'bg-yellow-500' : 'bg-red-600'
                                }`}
                                style={{ width: `${completion}%` }}
                              />
                                </div>
                                <span className="text-sm font-medium text-slate-700 min-w-[40px]">
                                {completion}%
                                </span>
                            </div>
                            </td>
                          
                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleBatchSelect(batch)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <Edit2 className="mr-1" size={14} />
                                Manage
                              </button>
                              <button
                                onClick={() => handleDeleteClick(batch)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                disabled={isLoading}
                              >
                                <Trash2 className="mr-1" size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Empty State */}
            {!isLoading && batches.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-3 text-lg font-medium text-gray-900">No batches found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new batch
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsBulkUploadOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="mr-2" size={16} />
                    Create Batch
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        uploadTypeOptions={uploadTypeOptions}
        onSuccess={handleBulkUploadSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Confirm Batch Deletion</h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete Batch <span className='font-bold'> {batchToDelete?.batch_no} ({batchToDelete?.department}, {batchToDelete?.division}) ? </span> </p>
              <p className='text-yellow-600 pb-2'>  This will permanently delete all students and their associated activities in this batch. </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagementPage;
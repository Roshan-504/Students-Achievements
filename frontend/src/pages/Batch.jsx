import { useEffect, useState } from 'react';
import { Edit2, X, Calendar } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const BatchManagementPage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [comparisonDate, setComparisonDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Fetch batches when component mounts or comparisonDate changes
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get('/admin/batches', {
          params: { date: comparisonDate },
        });
        setBatches(response.data.data);
        console.log('Fetched batches:', response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch batches');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatches();
  }, [comparisonDate]);

  // Fetch students when a batch is selected
  useEffect(() => {
    if (selectedBatch) {
      const fetchStudents = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await axiosInstance.get('/admin/batch-students', {
            params: {
              division: selectedBatch.division,
              department: selectedBatch.department,
              batch_no: selectedBatch.batch_no,
            },
          });
          setStudents(response.data.data);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch students');
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudents();
    }
  }, [selectedBatch]);

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    setStudents([]);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setFormData(student);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await axiosInstance.put(`/api/students/${selectedStudent.email_id}`, formData);
      setStudents((prev) =>
        prev.map((s) => (s.email_id === selectedStudent.email_id ? { ...s, ...formData } : s))
      );
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setComparisonDate(e.target.value);
    setSelectedBatch(null);
    setStudents([]);
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'bg-accent-500';
    if (percentage >= 60) return 'bg-primary-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Batch Management</h1>
          <div className="flex items-center gap-3">
            <label htmlFor="comparisonDate" className="text-sm font-medium text-gray-700">
              Comparison Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                id="comparisonDate"
                value={comparisonDate}
                onChange={handleDateChange}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                aria-label="Select comparison date"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg" role="alert">
            <p>{error}</p>
          </div>
        )}

        {isLoading && !batches.length ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-12 w-12 text-primary-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            {/* Batches Table */}
            <div className="bg-white/90 backdrop-blur-xs shadow-glass rounded-lg overflow-hidden mb-8">
              <div className="p-4 border-b border-primary-500/10">
                <h2 className="text-xl font-semibold text-gray-900">Batches</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-primary-800 uppercase tracking-wider">Class/Division</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-primary-800 uppercase tracking-wider">Completion</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-primary-800 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => {
                      const completion = Math.round((batch.updatedStudents / batch.totalStudents) * 100);
                      return (
                        <tr
                          key={`${batch.batch_no}-${batch.department}-${batch.division}`}
                          className={`hover:bg-primary-50/50 transition-all duration-200 ${
                            selectedBatch?.batch_no === batch.batch_no &&
                            selectedBatch?.department === batch.department &&
                            selectedBatch?.division === batch.division
                              ? 'bg-primary-50'
                              : ''
                          }`}
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {`${batch.batch_no} ${batch.department} ${batch.division}`}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-32 sm:w-48 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getCompletionColor(completion)} transition-all duration-1000 ease-out`}
                                  style={{ width: `${completion}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-700">{completion}%</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleBatchSelect(batch)}
                              className="relative group text-primary-600 hover:text-primary-700 transition-colors duration-200"
                              aria-label={`Manage batch ${batch.batch_no} ${batch.department} ${batch.division}`}
                            >
                              Manage
                              <span className="absolute hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded-md -top-8 left-1/2 transform -translate-x-1/2">
                                Manage Batch
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Students Table */}
            {selectedBatch && (
              <div className="bg-white/90 backdrop-blur-xs shadow-glass rounded-lg overflow-hidden mb-8">
                <div className="p-4 border-b border-primary-500/10">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Students - Batch {selectedBatch.batch_no} ({selectedBatch.department}, Div {selectedBatch.division})
                  </h2>
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No students found for this batch.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-primary-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-primary-800 uppercase tracking-wider">PRN</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-primary-800 uppercase tracking-wider">Name</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-primary-800 uppercase tracking-wider">Email</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-primary-800 uppercase tracking-wider">Last Updated</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-primary-800 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.email_id} className="hover:bg-primary-50/50 transition-all duration-200">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.prn || '-'}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.email_id}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {student.last_updated ? new Date(student.last_updated).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleStudentSelect(student)}
                                className="relative group text-primary-600 hover:text-primary-700 transition-colors duration-200"
                                aria-label={`Edit student ${student.first_name} ${student.last_name}`}
                              >
                                <Edit2 size={16} />
                                <span className="absolute hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded-md -top-8 left-1/2 transform -translate-x-1/2">
                                  View/Edit
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Student Edit Modal */}
        {isModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-xs rounded-xl shadow-glass max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        aria-label="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        aria-label="Last Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email_id"
                        value={formData.email_id || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        aria-label="Email (disabled)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PRN</label>
                      <input
                        type="text"
                        name="prn"
                        value={formData.prn || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        aria-label="PRN"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
                      disabled={isLoading}
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                      aria-label="Save changes"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchManagementPage;
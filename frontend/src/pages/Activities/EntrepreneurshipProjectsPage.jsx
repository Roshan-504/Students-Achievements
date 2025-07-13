import { useState, useEffect } from 'react';
import { Edit2, Plus, X, Search, Calendar, Briefcase, AlertCircle, Eye, Download, CheckCircle, Clock } from 'lucide-react';
import EntrepreneurshipForm from '../../forms/EntrepreneurshipProjectsForm';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';

const EntrepreneurshipPage = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [incompleteRecords, setIncompleteRecords] = useState([]);
  const [completeRecords, setCompleteRecords] = useState([]);
  const [error, setError] = useState(null);

  // Fetch records from backend
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/student/entrepreneurships');
        const complete = response?.data?.data?.complete || [];
        const incomplete = response?.data?.data?.incomplete || [];

        setCompleteRecords(complete);
        setIncompleteRecords(incomplete);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch records:', error);
        setError(error.response?.data?.message || 'Failed to load records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    let toastId;
    try {
      setLoading(true);
      toastId = toast.loading(
        editingRecord ? 'Updating record...' : 'Adding new record...',
        { position: 'top-center', duration: Infinity }
      );

      const form = new FormData();
      form.append('startup_name', formData.startup_name);
      form.append('role', formData.role);
      form.append('description', formData.description);
      form.append('type', formData.type);
      form.append('registration_number', formData.registration_number);
      if (formData.proof) {
        form.append('proof', formData.proof);
      }

      let response;
      if (editingRecord) {
        response = await axiosInstance.put(
          `/student/update/entrepreneurship/${editingRecord._id}`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        // Update state
        const updatedRecord = response.data.data;
        if (updatedRecord.proof?.fileName) {
          setCompleteRecords([
            ...completeRecords.filter(r => r._id !== updatedRecord._id),
            updatedRecord
          ]);
          setIncompleteRecords(incompleteRecords.filter(r => r._id !== updatedRecord._id));
        } else {
          setIncompleteRecords([
            ...incompleteRecords.filter(r => r._id !== updatedRecord._id),
            updatedRecord
          ]);
          setCompleteRecords(completeRecords.filter(r => r._id !== updatedRecord._id));
        }
      } else {
        response = await axiosInstance.post(
          '/student/upload/entrepreneurship',
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        // Update state
        const newRecord = response.data.data;
        if (newRecord.proof?.fileName) {
          setCompleteRecords([...completeRecords, newRecord]);
        } else {
          setIncompleteRecords([...incompleteRecords, newRecord]);
        }
      }

      setShowForm(false);
      setEditingRecord(null);
      toast.success(response.data.message, { id: toastId, duration: 4000 });
    } catch (error) {
      console.error('Error saving record:', error);
      setError(error.response?.data?.message || 'Error saving record');
      toast.error(error.response?.data?.message || 'Error saving record', { 
        id: toastId, 
        duration: 4000 
      });
    } finally {
      setLoading(false);
    }
  };

  // Download proof
  const downloadProof = async (record) => {
    try {
      const response = await axiosInstance.get(
        `/student/download/entrepreneurship/${record._id}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', record.proof.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading proof:', error);
      setError(error.response?.data?.message || 'Failed to download proof');
    }
  };

  // Delete record
  const deleteRecord = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/student/entrepreneurship/${id}`);
      
      setCompleteRecords(completeRecords.filter(r => r._id !== id));
      setIncompleteRecords(incompleteRecords.filter(r => r._id !== id));
      
      toast.success('Record deleted successfully');
    } catch (error) {
      console.error('Error deleting record:', error);
      setError(error.response?.data?.message || 'Error deleting record');
    } finally {
      setLoading(false);
    }
  };

  const totalRecords = incompleteRecords.length + completeRecords.length;
  const incompleteCount = incompleteRecords.length;
  const completeCount = completeRecords.length;

  const renderRecordTable = (records, title, description) => {
    if (records.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className={`text-xl font-bold ${
              title.includes("Incomplete") ? 'text-red-500' : 'text-gray-800'
            }`}>
              {title}
            </h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {records.length} items
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Startup</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Your Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Proof</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {record.startup_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{record.startup_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{record.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{record.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.registration_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.proof?.fileName ? (
                        <button
                          onClick={() => downloadProof(record)}
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      ) : (
                        <span className="text-gray-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Not Uploaded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecord(record);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteRecord(record._id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Entrepreneurship Records</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Track your startups, business ventures, and entrepreneurial activities here.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRecord(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Record
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            <AlertCircle className="inline mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-300 text-blue-900 border border-blue-200 shadow hover:shadow-md rounded-xl p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Ventures</p>
                <p className="text-3xl font-bold mt-1">{totalRecords}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-400 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-200 to-blue-400 text-blue-900 border border-blue-300 shadow hover:shadow-md rounded-xl p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Pending Proofs</p>
                <p className="text-3xl font-bold mt-1">{incompleteCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-300 to-blue-500 text-blue-900 border border-blue-400 shadow hover:shadow-md rounded-xl p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Completed</p>
                <p className="text-3xl font-bold mt-1">{completeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </div>
        </div>
        
        {/* Incomplete Records Table */}
        {renderRecordTable(
          incompleteRecords,
          "Incomplete Records - Pending Submissions",
          "These records are missing proofs. Please edit and complete them to keep your profile updated."
        )}

        {/* Complete Records Table */}
        {renderRecordTable(
          completeRecords,
          "Completed Records",
          "All your successfully submitted entrepreneurial activities"
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse p-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded-lg w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/5"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {(!loading && incompleteRecords.length === 0 && completeRecords.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <button
              onClick={() => {
                setEditingRecord(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add your first record
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-slate-800 pr-8">{selectedRecord.startup_name}</h2>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="bg-slate-100 hover:bg-slate-200 rounded-lg p-2 transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Details</h3>
                      <div className="space-y-2">
                        <p className="text-slate-600"><span className="font-medium">Your Role:</span> {selectedRecord.role}</p>
                        <p className="text-slate-600"><span className="font-medium">Type:</span> {selectedRecord.type}</p>
                        <p className="text-slate-600"><span className="font-medium">Registration:</span> {selectedRecord.registration_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Description</h3>
                      <p className="text-slate-600">{selectedRecord.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    
                    {selectedRecord.proof?.fileName && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Proof</h3>
                        <button
                          onClick={() => downloadProof(selectedRecord)}
                          className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download Proof
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setEditingRecord(selectedRecord);
                      setShowForm(true);
                      setSelectedRecord(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform animate-slideIn border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-xl relative text-white">
                <h2 className="text-xl font-semibold">
                  {editingRecord ? 'Edit Record' : 'Add New Record'}
                </h2>
                <p className="text-blue-100 mt-1 opacity-90">
                  {editingRecord ? 'Update your entrepreneurial record' : 'Fill in the details to add your entrepreneurial activity'}
                </p>
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute top-6 right-6 text-blue-100 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="">
                <EntrepreneurshipForm 
                  initialData={editingRecord || {
                    startup_name: '',
                    role: '',
                    description: '',
                    type: 'Product-Based',
                    registration_number: '',
                    proof: null,
                    no_certificate_yet: false
                  }}
                  onSubmit={handleFormSubmit}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntrepreneurshipPage;
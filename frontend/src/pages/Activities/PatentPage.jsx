import { useState, useEffect } from 'react';
import { Edit2, Plus, X, Search, Calendar, Award, AlertCircle, Eye, Download, CheckCircle, Clock, User, FileText } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';
import PatentForm from '../../forms/PatentFrom';

const PatentPage = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatent, setEditingPatent] = useState(null);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [incompletePatents, setIncompletePatents] = useState([]);
  const [completePatents, setCompletePatents] = useState([]);
  const [error, setError] = useState(null);

  // Fetch patents from backend on component mount
  useEffect(() => {
    const fetchPatents = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/student/patents');
        const complete = response?.data?.data?.complete || [];
        const incomplete = response?.data?.data?.incomplete || [];

        setCompletePatents(complete);
        setIncompletePatents(incomplete);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch patents:', error);
        setError(error.response?.data?.message || 'Failed to load patents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatents();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    let toastId;
    try {
      setLoading(true);

      // Show loading toast
      toastId = toast.loading(
        editingPatent 
          ? 'Updating patent...' 
          : 'Uploading new patent...',
        {
          position: 'top-center',
          duration: Infinity // Don't auto-dismiss
        }
      );

      const form = new FormData();
      form.append('patent_name', formData.patent_name);
      form.append('application_no', formData.application_no);
      form.append('application_date', formData.application_date);
      form.append('user_type', formData.user_type);
      form.append('inventor_name', formData.inventor_name);
      form.append('description', formData.description);
      form.append('co_inventors', JSON.stringify(formData.co_inventors));
      form.append('status', formData.status);
      if (formData.proof) {
        form.append('proof', formData.proof);
      }

      let response;
      if (editingPatent) {
        // Update existing patent
        response = await axiosInstance.put(`student/update/patent/${editingPatent._id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updatedPatent = response.data.data;
        // Update complete/incomplete lists
        if (!updatedPatent.proof) {
          setIncompletePatents([
            ...incompletePatents.filter(item => item._id !== updatedPatent._id),
            updatedPatent,
          ]);
          setCompletePatents(completePatents.filter(item => item._id !== updatedPatent._id));
        } else {
          setCompletePatents([
            ...completePatents.filter(item => item._id !== updatedPatent._id),
            updatedPatent,
          ]);
          setIncompletePatents(incompletePatents.filter(item => item._id !== updatedPatent._id));
        }
      } else {
        response = await axiosInstance.post('/student/upload/patent', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newPatent = response.data.data;
        
        // Update complete/incomplete lists
        if (!newPatent.proof) {
          setIncompletePatents([...incompletePatents, newPatent]);
        } else {
          setCompletePatents([...completePatents, newPatent]);
        }
      }
      setShowForm(false);
      setEditingPatent(null);
      setError(null);
      toast.success(response.data.message, {id: toastId, duration: 4000});
    } catch (error) {
      console.error('Failed to save patent:', error);
      setError(error.response?.data?.message || 'An error occurred while saving the patent.');
      toast.error(error.response?.data?.message || 'An error occurred while saving the patent.', {id: toastId, duration: 4000});
    } finally {
      setLoading(false);
    }
  };

  // Download document
  const downloadDocument = async (patent) => {
    try {
      const response = await axiosInstance.get(`student/download/patent/${patent._id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: patent.proof.contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.download = patent.proof.fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError(error.response?.data?.message || 'Failed to download document.');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Granted': 'bg-green-100 text-green-800',
      'Published': 'bg-blue-100 text-blue-800',
      'Rejected': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
        statusColors[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {status === 'Granted' ? (
          <>
            <CheckCircle className="w-3 h-3" />
            {status}
          </>
        ) : status === 'Pending' ? (
          <>
            <Clock className="w-3 h-3" />
            {status}
          </>
        ) : (
          status
        )}
      </span>
    );
  };

  const incompleteCount = incompletePatents?.length;
  const completeCount = completePatents?.length;
  const totalPatents = incompleteCount + completeCount;
  
  const renderPatentTable = (patents, title, description) => {
    if (patents.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className={`text-xl font-bold ${title === "Incomplete Patents - Pending Submissions" ? 'text-red-500' : 'text-gray-800'}`}>{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {patents.length} items
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patent Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Application No.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inventor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patents.map((patent) => (
                  <tr key={patent._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {patent.patent_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{patent.patent_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {patent.application_no || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{patent.inventor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          {patent.application_date ? new Date(patent.application_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(patent.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {patent.proof?.fileName ? (
                        <button
                          onClick={() => downloadDocument(patent)}
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
                          onClick={() => setSelectedPatent(patent)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPatent(patent);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 size={16} />
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Patents</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Add details of patents you've filed or been involved with as an inventor.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPatent(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Patent
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
                <p className="text-sm font-medium opacity-90">Total Patents</p>
                <p className="text-3xl font-bold mt-1">{totalPatents}</p>
              </div>
              <Award className="w-8 h-8 text-blue-400 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-200 to-blue-400 text-blue-900 border border-blue-300 shadow hover:shadow-md rounded-xl p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Pending Uploads</p>
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
        
        {/* Incomplete Patents Table */}
        {renderPatentTable(
          incompletePatents,
          "Incomplete Patents - Pending Submissions",
          "These patents are missing documents. Please edit and complete them to keep your profile updated."
        )}

        {/* Complete Patents Table */}
        {renderPatentTable(
          completePatents,
          "Completed Patents",
          "All your successfully filed patents with complete documentation"
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
        {(!loading && incompletePatents.length === 0 && completePatents.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patents found</h3>
            <button
              onClick={() => {
                setEditingPatent(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add your first patent
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedPatent && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-slate-800 pr-8">{selectedPatent.patent_name}</h2>
                  <button
                    onClick={() => setSelectedPatent(null)}
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
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Patent Details</h3>
                      <div className="space-y-2">
                        <p className="text-slate-600"><span className="font-medium">Application No:</span> {selectedPatent.application_no || 'N/A'}</p>
                        <p className="text-slate-600"><span className="font-medium">Primary Inventor:</span> {selectedPatent.inventor_name}</p>
                        <p className="text-slate-600"><span className="font-medium">User Type:</span> {selectedPatent.user_type || 'N/A'}</p>
                        {selectedPatent.co_inventors?.length > 0 && (
                          <div>
                            <p className="font-medium text-slate-600">Co-Inventors:</p>
                            <ul className="list-disc list-inside">
                              {selectedPatent.co_inventors.map((name, index) => (
                                <li key={index} className="text-slate-600">{name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Dates</h3>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-5 h-5" />
                        <span>
                          {selectedPatent.application_date ? new Date(selectedPatent.application_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Status</h3>
                      {getStatusBadge(selectedPatent.status)}
                    </div>
                    
                    {selectedPatent.proof?.fileName && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Document</h3>
                        <button 
                          onClick={() => downloadDocument(selectedPatent)}
                          className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download Document
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPatent.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Description</h3>
                    <p className="text-slate-600 whitespace-pre-line">{selectedPatent.description}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setEditingPatent(selectedPatent);
                      setShowForm(true);
                      setSelectedPatent(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Patent
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
                  {editingPatent ? 'Edit Patent' : 'Add New Patent'}
                </h2>
                <p className="text-blue-100 mt-1 opacity-90">
                  {editingPatent ? 'Update your patent details' : 'Fill in the details to add your patent'}
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
                <PatentForm 
                  initialData={editingPatent || {
                    patent_name: "",
                    application_no: "",
                    application_date: "",
                    user_type: "",
                    inventor_name: "",
                    description: "",
                    co_inventors: [],
                    status: "Pending",
                    proof: null,
                    no_document_yet: false
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

export default PatentPage;
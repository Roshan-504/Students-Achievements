import { useState, useEffect } from 'react';
import { Edit2, Plus, X, Search, Calendar, FileText, BookOpen, Tag, File, Eye, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import WorkshopForm from '../../forms/WorkshopForm';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';

const WorkshopPage = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [incompleteWorkshops, setIncompleteWorkshops] = useState([]);
  const [completeWorkshops, setCompleteWorkshops] = useState([]);
  const [error, setError] = useState(null);

  // Fetch workshops from backend
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/student/workshops');
        const complete = response?.data?.data?.complete || [];
        const incomplete = response?.data?.data?.incomplete || [];

        setCompleteWorkshops(complete);
        setIncompleteWorkshops(incomplete);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch workshops:', error);
        setError(error.response?.data?.message || 'Failed to load workshops. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    let toastId;
    try {
      setLoading(true);
      toastId = toast.loading(
        editingWorkshop ? 'Updating workshop...' : 'Adding new workshop...',
        { position: 'top-center', duration: Infinity }
      );

      const form = new FormData();
      form.append('title', formData.title);
      form.append('organizer', formData.organizer);
      form.append('date', formData.date);
      form.append('topic', formData.topic);
      form.append('mode', formData.mode);
      form.append('duration', formData.duration);
      form.append('description', formData.description);
      if (formData.proof) {
        form.append('proof', formData.proof);
      }

      let response;
      if (editingWorkshop) {
        response = await axiosInstance.put(
          `/student/update/workshop/${editingWorkshop._id}`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        // Update state
        const updatedWorkshop = response.data.data;
        if (updatedWorkshop.proof?.fileName || updatedWorkshop.no_certificate_yet) {
          setCompleteWorkshops([
            ...completeWorkshops.filter(w => w._id !== updatedWorkshop._id),
            updatedWorkshop
          ]);
          setIncompleteWorkshops(incompleteWorkshops.filter(w => w._id !== updatedWorkshop._id));
        } else {
          setIncompleteWorkshops([
            ...incompleteWorkshops.filter(w => w._id !== updatedWorkshop._id),
            updatedWorkshop
          ]);
          setCompleteWorkshops(completeWorkshops.filter(w => w._id !== updatedWorkshop._id));
        }
      } else {
        response = await axiosInstance.post(
          '/student/upload/workshop',
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        // Update state
        const newWorkshop = response.data.data;
        if (newWorkshop.proof?.fileName || newWorkshop.no_certificate_yet) {
          setCompleteWorkshops([...completeWorkshops, newWorkshop]);
        } else {
          setIncompleteWorkshops([...incompleteWorkshops, newWorkshop]);
        }
      }

      setShowForm(false);
      setEditingWorkshop(null);
      toast.success(response.data.message, { id: toastId, duration: 4000 });
    } catch (error) {
      console.error('Error saving workshop:', error);
      setError(error.response?.data?.message || 'Error saving workshop');
      toast.error(error.response?.data?.message || 'Error saving workshop', { 
        id: toastId, 
        duration: 4000 
      });
    } finally {
      setLoading(false);
    }
  };

  // Download certificate
  const downloadCertificate = async (workshop) => {
    try {
      const response = await axiosInstance.get(
        `/student/download/workshop/${workshop._id}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', workshop.proof.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setError(error.response?.data?.message || 'Failed to download certificate');
    }
  };

  // Delete workshop
  const deleteWorkshop = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/student/workshop/${id}`);
      
      setCompleteWorkshops(completeWorkshops.filter(w => w._id !== id));
      setIncompleteWorkshops(incompleteWorkshops.filter(w => w._id !== id));
      
      toast.success('Workshop deleted successfully');
    } catch (error) {
      console.error('Error deleting workshop:', error);
      setError(error.response?.data?.message || 'Error deleting workshop');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (workshop) => {
    const hasCertificate = workshop.proof?.fileName;
    const isPending = !hasCertificate && !workshop.no_certificate_yet;
    
    if (hasCertificate) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Complete
        </span>
      );
    } else if (workshop.no_certificate_yet) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3" />
          Pending Upload
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3" />
          Missing Proof
        </span>
      );
    }
  };

  const totalWorkshops = incompleteWorkshops.length + completeWorkshops.length;
  const incompleteCount = incompleteWorkshops.length;
  const completeCount = completeWorkshops.length;

  const renderWorkshopTable = (workshops, title, description) => {
    if (workshops.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className={`text-xl font-bold ${
              title.includes("Incomplete") ? 'text-orange-500' : 'text-gray-800'
            }`}>
              {title}
            </h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {workshops.length} items
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Workshop Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Organizer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Certificate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workshops.map((workshop) => (
                  <tr key={workshop._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 max-w-[400px]">
                        <div className="flex items-center min-w-0"> {/* Added min-w-0 here */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3 flex-shrink-0">
                            {workshop.title.charAt(0)}
                          </div>
                          <div className="min-w-0 overflow-hidden"> {/* Added overflow-hidden */}
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {workshop.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate"> {/* Added truncate for duration if needed */}
                              {workshop.duration}
                            </div>
                          </div>
                        </div>
                      </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{workshop.organizer}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{workshop.topic}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workshop.mode === 'Online' ? 'bg-blue-100 text-blue-800' :
                        workshop.mode === 'Hybrid' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workshop.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(workshop.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {workshop.proof?.fileName ? (
                        <button
                          onClick={() => downloadCertificate(workshop)}
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      ) : workshop.no_certificate_yet ? (
                        <span className="text-gray-400 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Will submit later
                        </span>
                      ) : (
                        <span className="text-gray-400 flex items-center">
                          <File className="w-4 h-4 mr-1" />
                          Not Uploaded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedWorkshop(workshop)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWorkshop(workshop);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteWorkshop(workshop._id)}
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Workshops</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                List the workshops you've attended to learn new skills or deepen your knowledge in a specific area.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingWorkshop(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Workshop
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
                <p className="text-sm font-medium opacity-90">Total Workshops</p>
                <p className="text-3xl font-bold mt-1">{totalWorkshops}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400 opacity-80" />
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
        
        {/* Incomplete Workshops Table */}
        {renderWorkshopTable(
          incompleteWorkshops,
          "Incomplete Workshops - Pending Submissions",
          "These workshops are missing certificates. Please edit and complete them to keep your profile updated."
        )}

        {/* Complete Workshops Table */}
        {renderWorkshopTable(
          completeWorkshops,
          "Completed Workshops",
          "All your successfully submitted workshop participations"
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
        {(!loading && incompleteWorkshops.length === 0 && completeWorkshops.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops found</h3>
            <button
              onClick={() => {
                setEditingWorkshop(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add your first workshop
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedWorkshop && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-slate-800 pr-8">{selectedWorkshop.title}</h2>
                  <button
                    onClick={() => setSelectedWorkshop(null)}
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
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Workshop Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <BookOpen className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-600">Organizer</p>
                            <p className="text-slate-800">{selectedWorkshop.organizer}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Tag className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-600">Topic</p>
                            <p className="text-slate-800">{selectedWorkshop.topic}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <FileText className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-600">Mode</p>
                            <p className="text-slate-800">{selectedWorkshop.mode}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-600">Duration</p>
                            <p className="text-slate-800">{selectedWorkshop.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Date</h3>
                      <div className="flex items-center gap-2 text-slate-800">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        {new Date(selectedWorkshop.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Status</h3>
                      {getStatusBadge(selectedWorkshop)}
                    </div>
                    
                    {selectedWorkshop.proof?.fileName && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Certificate</h3>
                        <button
                          onClick={() => downloadCertificate(selectedWorkshop)}
                          className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download Certificate
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setEditingWorkshop(selectedWorkshop);
                      setShowForm(true);
                      setSelectedWorkshop(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Workshop
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
                  {editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
                </h2>
                <p className="text-blue-100 mt-1 opacity-90">
                  {editingWorkshop ? 'Update your workshop details' : 'Fill in the details to add your workshop'}
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
                <WorkshopForm 
                  initialData={editingWorkshop || {
                    title: '',
                    organizer: '',
                    date: '',
                    topic: '',
                    mode: 'Offline',
                    duration: '',
                    description: '',
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

export default WorkshopPage;
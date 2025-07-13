import { useState, useEffect } from 'react';
import { Edit2, Plus, X, Search, Calendar, Award, AlertCircle, Eye, Download, CheckCircle, Clock, BookOpen } from 'lucide-react';
import CertificationForm from '../../forms/CertificationForm';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';

const CertificationPage = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [incompleteCertifications, setIncompleteCertifications] = useState([]);
  const [completeCertifications, setCompleteCertifications] = useState([]);
  const [error, setError] = useState(null);

  // Fetch certifications from backend on component mount
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/student/certifications');
        const complete = response?.data?.data?.complete || [];
        const incomplete = response?.data?.data?.incomplete || [];

        setCompleteCertifications(complete);
        setIncompleteCertifications(incomplete);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch certifications:', error);
        setError(error.response?.data?.message || 'Failed to load certifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    let toastId;
    try {
      setLoading(true);

      // Show loading toast
      toastId = toast.loading(
        editingCertification 
          ? 'Updating certification...' 
          : 'Uploading new certification...',
        {
          position: 'top-center',
          duration: Infinity // Don't auto-dismiss
        }
      );

      const form = new FormData();
      form.append('course_name', formData.course_name);
      form.append('platform', formData.platform);
      form.append('start_date', formData.start_date);
      form.append('end_date', formData.end_date);
      form.append('ongoing', formData.ongoing);
      form.append('course_type', formData.course_type);
      if (formData.proof) {
        form.append('proof', formData.proof);
      }

      let response;
      if (editingCertification) {
        // Update existing certification
        response = await axiosInstance.put(
          `student/update/certification/${editingCertification._id}`,
          form,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        const updatedCertification = response.data.data;
        
        // Update complete/incomplete lists
        if (updatedCertification.end_date === null || !updatedCertification.proof) {
          setIncompleteCertifications([
            ...incompleteCertifications.filter(item => item._id !== updatedCertification._id),
            updatedCertification,
          ]);
          setCompleteCertifications(completeCertifications.filter(item => item._id !== updatedCertification._id));
        } else {
          setCompleteCertifications([
            ...completeCertifications.filter(item => item._id !== updatedCertification._id),
            updatedCertification,
          ]);
          setIncompleteCertifications(incompleteCertifications.filter(item => item._id !== updatedCertification._id));
        }
      } else {
        // Add new certification
        response = await axiosInstance.post('/student/upload/certification', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newCertification = response.data.data;
        
        // Update complete/incomplete lists
        if (newCertification.end_date === null || !newCertification.proof) {
          setIncompleteCertifications([...incompleteCertifications, newCertification]);
        } else {
          setCompleteCertifications([...completeCertifications, newCertification]);
        }
      }
      
      setShowForm(false);
      setEditingCertification(null);
      setError(null);
      toast.success(response.data.message, {id: toastId, duration: 4000});
    } catch (error) {
      console.error('Failed to save certification:', error);
      setError(error.response?.data?.message || 'An error occurred while saving the certification.');
      toast.error(error.response?.data?.message || 'An error occurred while saving the certification.', {id: toastId, duration: 4000});
    } finally {
      setLoading(false);
    }
  };

  // Download certificate
  const downloadCertificate = async (certification) => {
    try {
      const response = await axiosInstance.get(
        `student/download/certification/${certification._id}`,
        {
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: certification.proof.contentType })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = certification.proof.fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setError(error.response?.data?.message || 'Failed to download certificate.');
    }
  };

  const getStatusBadge = (certification) => {
    const isOngoing = certification.end_date === null || certification.ongoing;
    const hasCertificate = certification.proof?.fileName;
    
    if (isOngoing) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Ongoing
        </span>
      );
    }
    
    return hasCertificate ? (
      <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        Completed
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-red-100 text-red-800">
        <AlertCircle className="w-3 h-3" />
        Missing Certificate
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        type === 'Technical' 
          ? 'bg-indigo-100 text-indigo-800' 
          : 'bg-purple-100 text-purple-800'
      }`}>
        {type}
      </span>
    );
  };

  const incompleteCount = incompleteCertifications?.length;
  const completeCount = completeCertifications?.length;
  const totalCertifications = incompleteCount + completeCount;

  const renderCertificationTable = (certifications, title, description) => {
    if (certifications.length === 0) return null;

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
            {certifications.length} items
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Certificate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certifications.map((certification) => (
                  <tr key={certification._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 max-w-[400px]">
                      <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {certification.course_name.charAt(0)}
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {certification.course_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{certification.platform}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(certification.course_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          {new Date(certification.start_date).toLocaleDateString()} -{' '}
                          {certification.end_date === null ? 'Present' : new Date(certification.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(certification)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {certification.proof?.fileName ? (
                        <button
                          onClick={() => downloadCertificate(certification)}
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
                          onClick={() => setSelectedCertification(certification)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCertification(certification);
                            console.log(certification)
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Courses & Certifications</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Add technical or non-technical courses and certifications that helped you gain new skills.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCertification(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Certification
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
                <p className="text-sm font-medium opacity-90">Total Certifications</p>
                <p className="text-3xl font-bold mt-1">{totalCertifications}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400 opacity-80" />
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
              <Award className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </div>
        </div>
        
        {/* Incomplete Certifications Table */}
        {renderCertificationTable(
          incompleteCertifications,
          "Incomplete Certifications - Pending Submissions",
          "These certifications are either ongoing or missing certificates. Please edit and complete them."
        )}

        {/* Complete Certifications Table */}
        {renderCertificationTable(
          completeCertifications,
          "Completed Certifications",
          "All your successfully completed certifications with uploaded certificates"
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
        {(!loading && incompleteCertifications.length === 0 && completeCertifications.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certifications found</h3>
            <button
              onClick={() => {
                setEditingCertification(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add your first certification
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedCertification && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-slate-800 pr-8">{selectedCertification.course_name}</h2>
                  <button
                    onClick={() => setSelectedCertification(null)}
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
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Course Details</h3>
                      <div className="space-y-2">
                        <p className="text-slate-600"><span className="font-medium">Platform:</span> {selectedCertification.platform}</p>
                        <p className="text-slate-600"><span className="font-medium">Course Type:</span> {selectedCertification.course_type}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Duration</h3>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-5 h-5" />
                        <span>
                          {new Date(selectedCertification.start_date).toLocaleDateString()} -{' '}
                          {selectedCertification.end_date === null ? 'Present' : new Date(selectedCertification.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Status</h3>
                      {getStatusBadge(selectedCertification)}
                    </div>
                    
                    {selectedCertification.proof?.fileName && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Certificate</h3>
                        <button
                          onClick={() => downloadCertificate(selectedCertification)}
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
                      setEditingCertification(selectedCertification);
                      setShowForm(true);
                      setSelectedCertification(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Certification
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
                  {editingCertification ? 'Edit Certification' : 'Add New Certification'}
                </h2>
                <p className="text-blue-100 mt-1 opacity-90">
                  {editingCertification ? 'Update your certification details' : 'Fill in the details to add your certification'}
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
                <CertificationForm 
                  initialData={editingCertification || {
                    course_name: "",
                    platform: "",
                    start_date: "",
                    end_date: "",
                    ongoing: false,
                    course_type: "Technical",
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

export default CertificationPage;
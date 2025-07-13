import { useState, useEffect } from 'react';
import { Edit2, Plus, X, Search, Calendar, Award, AlertCircle, Eye, Download, CheckCircle, Clock, Briefcase, User, Building, DollarSign } from 'lucide-react';
import InternshipForm from '../../forms/InternshipForm';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';


const InternshipPage = () => {
  const [loading, setLoading] = useState(true); // Start with loading true
  const [showForm, setShowForm] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [incompleteInternships, setIncompleteInternships] = useState([]);
  const [completeInternships, setCompleteInternships] = useState([]);
  const [error, setError] = useState(null);

  // Fetch internships from backend on component mount
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/student/internships');
        const complete = response?.data?.data?.complete || [];
        const incomplete = response?.data?.data?.incomplete || [];

        setCompleteInternships(complete);
        setIncompleteInternships(incomplete);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch internships:', error);
        setError(error.response?.data?.message || 'Failed to load internships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  // Categorize internships into complete and incomplete whenever the internships state changes

    // Handle form submission
  const handleFormSubmit = async (formData) => {
    let toastId;
    try {
      setLoading(true);

        // Show loading toast
      toastId = toast.loading(
        editingInternship 
          ? 'Updating internship...' 
          : 'Uploading new internship...',
        {
          position: 'top-center',
          duration: Infinity // Don't auto-dismiss
        }
      );

      const form = new FormData();
      form.append('company_name', formData.company_name);
      form.append('internship_role', formData.internship_role);
      form.append('department', formData.department);
      form.append('start_date', formData.start_date);
      form.append('end_date', formData.end_date);
      form.append('ongoing', formData.ongoing);
      form.append('stipend', formData.stipend);
      form.append('external_mentor', formData.external_mentor);
      form.append('internal_mentor', formData.internal_mentor);
      if (formData.proof) {
        form.append('proof', formData.proof);
      }

      let response;
      if (editingInternship) {
        // Update existing internship
        response = await axiosInstance.put(`student/update/internship/${editingInternship._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updatedInternship = response.data.data;
        // Update complete/incomplete lists
        if (updatedInternship.end_date === null || !updatedInternship.proof) {
          setIncompleteInternships([
            ...incompleteInternships.filter(item => item._id !== updatedInternship._id),
            updatedInternship,
          ]);
          setCompleteInternships(completeInternships.filter(item => item._id !== updatedInternship._id));
        } else {
          setCompleteInternships([
            ...completeInternships.filter(item => item._id !== updatedInternship._id),
            updatedInternship,
          ]);
          setIncompleteInternships(incompleteInternships.filter(item => item._id !== updatedInternship._id));
        }
      } else {
        response = await axiosInstance.post('/student/upload/internship', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newInternship = response.data.data;
        
        // Update complete/incomplete lists
        if (newInternship.end_date === null || !newInternship.proof) {
          setIncompleteInternships([...incompleteInternships, newInternship]);
        } else {
          setCompleteInternships([...completeInternships, newInternship]);
        }
      }
      setShowForm(false);
      setEditingInternship(null);
      setError(null);
      toast.success(response.data.message, {id: toastId, duration: 4000});
    } catch (error) {
      console.error('Failed to save internship:', error);
      setError(error.response?.data?.message || 'An error occurred while saving the internship.');
      toast.error(error.response?.data?.message || 'An error occurred while saving the internship.', {id: toastId, duration: 4000});
    } finally {
      setLoading(false);
    }
  };

    // Download certificate
  const downloadCertificate = async (internship) => {
    try {
      const response = await axiosInstance.get(`student/download/internship/${internship._id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: internship.proof.contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.download = internship.proof.fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setError(error.response?.data?.message || 'Failed to download certificate.');
    }
  };

  const getStatusBadge = (internship) => {
    const isOngoing = internship.end_date === null;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
        isOngoing 
          ? 'bg-green-100 text-green-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {isOngoing ? (
          <>
            <Clock className="w-3 h-3" />
            Active
          </>
        ) : (
          <>
            <CheckCircle className="w-3 h-3" />
            Completed
          </>
        )}
      </span>
    );
  };

  const incompleteCount = incompleteInternships?.length;
  const completeCount = completeInternships?.length;
  const totalInternships = incompleteCount + completeCount;
  
  const renderInternshipTable = (internships, title, description) => {
    if (internships.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className={`text-xl font-bold ${title == "Incomplete Internships - Pending Submissions" ? 'text-red-500' : 'text-gray-800'}`}>{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {internships.length} items
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Certificate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {internships.map((internship) => (
                  <tr key={internship._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {internship.company_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{internship.company_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{internship.internship_role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{internship.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          {new Date(internship.start_date).toLocaleDateString()} -{' '}
                          {internship.end_date === null ? 'Present' : new Date(internship.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(internship)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {internship.proof?.fileName ? (
                        <button
                          onClick={() => downloadCertificate(internship)}
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
                          onClick={() => setSelectedInternship(internship)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingInternship(internship);
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Internships</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Add details of internships you've completed or are currently doing as a student intern.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingInternship(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Internship
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
                <p className="text-sm font-medium opacity-90">Total Internships</p>
                <p className="text-3xl font-bold mt-1">{totalInternships}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-400 opacity-80" />
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
        
        {/* Incomplete Internships Table */}
        {renderInternshipTable(
          incompleteInternships,
          "Incomplete Internships - Pending Submissions",
          "These internships are either ongoing or missing certificates. Please edit and complete them to keep your profile updated."
        )}

        {/* Complete Internships Table */}
        {renderInternshipTable(
          completeInternships,
          "Completed Internships",
          "All your successfully completed internships"
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
        {(!loading && incompleteInternships.length === 0 && completeInternships.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <button
              onClick={() => {
                setEditingInternship(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add your first internship
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedInternship && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-slate-800 pr-8">{selectedInternship.company_name}</h2>
                  <button
                    onClick={() => setSelectedInternship(null)}
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
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Internship Details</h3>
                      <div className="space-y-2">
                        <p className="text-slate-600"><span className="font-medium">Role:</span> {selectedInternship.internship_role}</p>
                        <p className="text-slate-600"><span className="font-medium">Department:</span> {selectedInternship.department}</p>
                        <p className="text-slate-600"><span className="font-medium">Stipend:</span> {selectedInternship.stipend}</p>
                        {selectedInternship.external_mentor && (
                          <p className="text-slate-600"><span className="font-medium">External Mentor:</span> {selectedInternship.external_mentor}</p>
                        )}
                        {selectedInternship.internal_mentor && (
                          <p className="text-slate-600"><span className="font-medium">Internal Mentor:</span> {selectedInternship.internal_mentor}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Duration</h3>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-5 h-5" />
                        <span>
                          {new Date(selectedInternship.start_date).toLocaleDateString()} -{' '}
                          {selectedInternship.end_date === 'Ongoing' ? 'Present' : new Date(selectedInternship.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Status</h3>
                      {getStatusBadge(selectedInternship)}
                    </div>
                    
                    {selectedInternship.certificate_url && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Certificate</h3>
                        <a 
                          href={selectedInternship.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download Certificate
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setEditingInternship(selectedInternship);
                      setShowForm(true);
                      setSelectedInternship(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Internship
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
                  {editingInternship ? 'Edit Internship' : 'Add New Internship'}
                </h2>
                <p className="text-blue-100 mt-1 opacity-90">
                  {editingInternship ? 'Update your internship details' : 'Fill in the details to add your internship'}
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
                <InternshipForm 
                  initialData={editingInternship || {
                    company_name: "",
                    internship_role: "",
                    department: "",
                    start_date: "",
                    end_date: "",
                    ongoing: false,
                    stipend: "",
                    external_mentor: "",
                    internal_mentor: "",
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

export default InternshipPage;
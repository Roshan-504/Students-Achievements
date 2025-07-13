import { useState, useEffect } from 'react';
import { Edit2, Plus, X, Search, Award, AlertCircle, Eye, Download, CheckCircle } from 'lucide-react';
import OtherAchievementForm from '../../forms/OtherAchievementForm';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';

const OtherAchievementsPage = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [incompleteAchievements, setIncompleteAchievements] = useState([]);
  const [completeAchievements, setCompleteAchievements] = useState([]);
  const [error, setError] = useState(null);

  // Fetch achievements from backend
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/student/other-achievements');
        const complete = response?.data?.data?.complete || [];
        const incomplete = response?.data?.data?.incomplete || [];

        setCompleteAchievements(complete);
        setIncompleteAchievements(incomplete);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        setError(error.response?.data?.message || 'Failed to load achievements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    let toastId;
    try {
      setLoading(true);
      toastId = toast.loading(
        editingAchievement ? 'Updating achievement...' : 'Adding new achievement...',
        { position: 'top-center', duration: Infinity }
      );

      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      if (formData.proof) {
        form.append('proof', formData.proof);
      }

      let response;
      if (editingAchievement) {
        response = await axiosInstance.put(
          `/student/update/other-achievement/${editingAchievement._id}`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        // Update state
        const updatedAchievement = response.data.data;
        if (updatedAchievement.proof?.fileName) {
          setCompleteAchievements([
            ...completeAchievements.filter(a => a._id !== updatedAchievement._id),
            updatedAchievement
          ]);
          setIncompleteAchievements(incompleteAchievements.filter(a => a._id !== updatedAchievement._id));
        } else {
          setIncompleteAchievements([
            ...incompleteAchievements.filter(a => a._id !== updatedAchievement._id),
            updatedAchievement
          ]);
          setCompleteAchievements(completeAchievements.filter(a => a._id !== updatedAchievement._id));
        }
      } else {
        response = await axiosInstance.post(
          '/student/upload/other-achievement',
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        // Update state
        const newAchievement = response.data.data;
        if (newAchievement.proof?.fileName) {
          setCompleteAchievements([...completeAchievements, newAchievement]);
        } else {
          setIncompleteAchievements([...incompleteAchievements, newAchievement]);
        }
      }

      setShowForm(false);
      setEditingAchievement(null);
      toast.success(response.data.message, { id: toastId, duration: 4000 });
    } catch (error) {
      console.error('Error saving achievement:', error);
      setError(error.response?.data?.message || 'Error saving achievement');
      toast.error(error.response?.data?.message || 'Error saving achievement', { 
        id: toastId, 
        duration: 4000 
      });
    } finally {
      setLoading(false);
    }
  };

  // Download proof
  const downloadProof = async (achievement) => {
    try {
      const response = await axiosInstance.get(
        `/student/download/other-achievement/${achievement._id}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', achievement.proof.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading proof:', error);
      setError(error.response?.data?.message || 'Failed to download proof');
    }
  };

  // Delete achievement
  const deleteAchievement = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/student/other-achievement/${id}`);
      
      setCompleteAchievements(completeAchievements.filter(a => a._id !== id));
      setIncompleteAchievements(incompleteAchievements.filter(a => a._id !== id));
      
      toast.success('Achievement deleted successfully');
    } catch (error) {
      console.error('Error deleting achievement:', error);
      setError(error.response?.data?.message || 'Error deleting achievement');
    } finally {
      setLoading(false);
    }
  };

  const totalAchievements = incompleteAchievements.length + completeAchievements.length;
  const incompleteCount = incompleteAchievements.length;
  const completeCount = completeAchievements.length;

  const renderAchievementTable = (achievements, title, description) => {
    if (achievements.length === 0) return null;

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
            {achievements.length} items
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Achievement</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Proof</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {achievements.map((achievement) => (
                  <tr key={achievement._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 max-w-[400px]"> {/* Add max-width */}
                      <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3 flex-shrink-0">
                          {achievement.title.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {achievement.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {achievement.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {achievement.proof?.fileName ? (
                        <button
                          onClick={() => downloadProof(achievement)}
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
                          onClick={() => setSelectedAchievement(achievement)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingAchievement(achievement);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteAchievement(achievement._id)}
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Other Achievements</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Track your special recognitions, awards, and other accomplishments here.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAchievement(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Achievement
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
                <p className="text-sm font-medium opacity-90">Total Achievements</p>
                <p className="text-3xl font-bold mt-1">{totalAchievements}</p>
              </div>
              <Award className="w-8 h-8 text-blue-400 opacity-80" />
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
        
        {/* Incomplete Achievements Table */}
        {renderAchievementTable(
          incompleteAchievements,
          "Incomplete Achievements - Pending Submissions",
          "These achievements are missing proofs. Please edit and complete them to keep your profile updated."
        )}

        {/* Complete Achievements Table */}
        {renderAchievementTable(
          completeAchievements,
          "Completed Achievements",
          "All your successfully submitted achievements"
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
        {(!loading && incompleteAchievements.length === 0 && completeAchievements.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
            <button
              onClick={() => {
                setEditingAchievement(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add your first achievement
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedAchievement && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-lg flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">{selectedAchievement.title}</h2>
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Description</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-slate-700">{selectedAchievement.description}</p>
                  </div>
                </div>

                {selectedAchievement.proof?.fileName && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Proof</h3>
                    <button
                      onClick={() => downloadProof(selectedAchievement)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Download Proof
                    </button>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setEditingAchievement(selectedAchievement);
                      setShowForm(true);
                      setSelectedAchievement(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Edit2 className="w-5 h-5 mr-2 inline" />
                    Edit Achievement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-xl relative text-white">
                <h2 className="text-xl font-semibold">
                  {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
                </h2>
                <p className="text-blue-100 mt-1 opacity-90">
                  {editingAchievement ? 'Update your achievement details' : 'Fill in the details to add your achievement'}
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
                <OtherAchievementForm 
                  initialData={editingAchievement || {
                    title: '',
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

export default OtherAchievementsPage;
import { useState, useEffect } from 'react';
import { Edit2, Plus, X, Search, Calendar, Award, FileText, Briefcase, CheckCircle, AlertCircle, Eye, Download, Clock } from 'lucide-react';
import EntrepreneurshipProjectForm from '../../forms/EntrepreneurshipProjectsForm';

const EntrepreneurshipProjectPage = () => {
  // Enhanced dummy data with more fields
  const dummyProjects = [
    {
      _id: '1',
      project_name: 'EcoPack Solutions',
      description: 'Sustainable packaging solutions for e-commerce businesses',
      domain: 'Product-Based',
      year_of_start: 2022,
      status: 'Ongoing',
      registration_proof_url: 'https://example.com/proof1.pdf',
      no_proof_yet: false
    },
    {
      _id: '2',
      project_name: 'Campus Connect',
      description: 'Service platform connecting students with local businesses',
      domain: 'Service-Based',
      year_of_start: 2023,
      status: 'Completed',
      registration_proof_url: '',
      no_proof_yet: true
    }
  ];

  const [projects, setProjects] = useState(dummyProjects);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [incompleteProjects, setIncompleteProjects] = useState([]);
  const [completeProjects, setCompleteProjects] = useState([]);

  // Filter incomplete projects (missing proofs)
  useEffect(() => {
    const incomplete = projects.filter(project => 
      !project.registration_proof_url && project.no_proof_yet
    );
    
    const complete = projects.filter(project => 
      project.registration_proof_url
    );
    
    setIncompleteProjects(incomplete);
    setCompleteProjects(complete);
  }, [projects]);

  const handleFormSubmit = async (formData) => {
    const newProject = {
      ...formData,
      _id: editingProject?._id || Math.random().toString(36).substring(2, 9),
      registration_proof_url: formData.registration_proof_file 
        ? URL.createObjectURL(formData.registration_proof_file) 
        : editingProject?.registration_proof_url,
    };

    if (editingProject) {
      setProjects(projects.map(item => 
        item._id === editingProject._id ? newProject : item
      ));
    } else {
      setProjects([...projects, newProject]);
    }
    setShowForm(false);
  };

  const getStatusBadge = (project) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
        project.status === 'Completed' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {project.status === 'Completed' ? (
          <>
            <CheckCircle className="w-3 h-3" />
            Completed
          </>
        ) : (
          <>
            <Clock className="w-3 h-3" />
            Ongoing
          </>
        )}
      </span>
    );
  };

  const getDomainBadge = (domain) => {
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
        domain === 'Product-Based' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-indigo-100 text-indigo-800'
      }`}>
        {domain}
      </span>
    );
  };

  // Stats calculation
  const totalProjects = projects.length;
  const incompleteCount = incompleteProjects.length;
  const completeCount = completeProjects.length;

  const renderProjectTable = (projects, title, description) => {
    if (projects.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {projects.length} items
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Proof</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {project.project_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{project.project_name}</div>
                          <div className="text-xs text-gray-500 line-clamp-2">{project.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDomainBadge(project.domain)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.year_of_start}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(project)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {project.registration_proof_url ? (
                        <a 
                          href={project.registration_proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      ) : project.no_proof_yet ? (
                        <span className="text-gray-400 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Will submit later
                        </span>
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
                          onClick={() => setSelectedProject(project)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProject(project);
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
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Entrepreneurship Projects</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Track your entrepreneurial ventures and innovative projects here.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProject(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Project
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-300 text-blue-900 border border-blue-200 shadow hover:shadow-md rounded-xl p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Projects</p>
                <p className="text-3xl font-bold mt-1">{totalProjects}</p>
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
        
        {/* Incomplete Projects Table */}
        {renderProjectTable(
          incompleteProjects,
          "Incomplete Projects - Pending Submissions",
          "These projects are missing registration proofs. Please edit and complete them to keep your profile updated."
        )}

        {/* Complete Projects Table */}
        {renderProjectTable(
          completeProjects,
          "Completed Projects",
          "All your successfully submitted entrepreneurship projects"
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
        {(incompleteProjects.length === 0 && completeProjects.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <button
              onClick={() => {
                setEditingProject(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add your first project
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-slate-800 pr-8">{selectedProject.project_name}</h2>
                  <button
                    onClick={() => setSelectedProject(null)}
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
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Project Details</h3>
                      <div className="space-y-2">
                        <p className="text-slate-600"><span className="font-medium">Description:</span> {selectedProject.description}</p>
                        <p className="text-slate-600"><span className="font-medium">Domain:</span> {selectedProject.domain}</p>
                        <p className="text-slate-600"><span className="font-medium">Year Started:</span> {selectedProject.year_of_start}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Status</h3>
                      {getStatusBadge(selectedProject)}
                    </div>
                    
                    {selectedProject.registration_proof_url && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Registration Proof</h3>
                        <a 
                          href={selectedProject.registration_proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download Proof
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setEditingProject(selectedProject);
                      setShowForm(true);
                      setSelectedProject(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Project
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
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>
                <p className="text-blue-100 mt-1 opacity-90">
                  {editingProject ? 'Update your project details' : 'Fill in the details to add your project'}
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
                <EntrepreneurshipProjectForm 
                  initialData={editingProject || {
                    project_name: '',
                    description: '',
                    domain: 'Product-Based',
                    year_of_start: new Date().getFullYear(),
                    status: 'Ongoing',
                    registration_proof_file: null,
                    no_proof_yet: false
                  }}
                  onSubmit={handleFormSubmit}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntrepreneurshipProjectPage;
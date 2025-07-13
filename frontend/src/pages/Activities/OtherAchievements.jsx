import React, { useState, useRef } from 'react';
import { Plus, Clock, CheckCircle, X, Calendar, Building, ExternalLink, Upload, FileText, Tag, Book, Hash, Medal, Eye, Edit } from 'lucide-react';

const OtherAchievements = () => {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [Achievements, setAchievements] = useState([
    {
      id: 1,
      title: "Machine Learning Applications in Healthcare Data Analysis",
      publication: "Journal of Medical Informatics",
      date: "2024-03-15",
      doi: "10.1234/jmi.2024.001",
      ISSN: "12345678",
      category: "Computer Science",
      status: "Completed",
      certificate: "Uploaded"
    },
    {
      id: 2,
      title: "Sustainable Energy Systems: A Comprehensive Review",
      publication: "Renewable Energy Today",
      date: "2024-01-22",
      doi: "10.5678/ret.2024.002",
      ISSN: "12345678",
      category: "Engineering",
      status: "Completed",
      certificate: "Not Uploaded"
    },
    {
      id: 3,
      title: "Blockchain Technology in Supply Chain Management",
      publication: "International Journal of Supply Chain",
      date: "2023-11-30",
      doi: "10.9012/ijsc.2023.003",
      ISSN: "12345678",
      category: "Computer Science",
      status: "Pending",
      certificate: "Uploaded"
    },
    {
      id: 4,
      title: "Quantum Computing: Algorithms and Applications",
      publication: "Quantum Science Review",
      date: "2023-09-14",
      doi: "10.3456/qsr.2023.004",
      ISSN: "12345678",
      category: "Physics",
      status: "Completed",
      certificate: "Not Uploaded"
    },
    {
      id: 5,
      title: "Climate Change Impact on Urban Planning",
      publication: "Urban Development Quarterly",
      date: "2023-07-08",
      doi: "10.7890/udq.2023.005",
      ISSN: "12345678",
      category: "Engineering",
      status: "Pending",
      certificate: "Uploaded"
    }
  ]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    publication: '',
    issn: '',
    category: '',
    date: '',
    file: null
  });
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const categoryOptions = [
    'Computer Science',
    'Engineering',
    'Medicine',
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Psychology',
    'Economics',
    'Literature'
  ];

  // Updated stats with colorful gradients
  const stats = [
  {
    icon: Medal,
    title: "Total Achievements",
    count: Achievements.length,
    color: "bg-gradient-to-br from-blue-100 to-blue-300 text-blue-900 border border-blue-200 shadow hover:shadow-md",
    iconColor: "text-blue-400",
    textColor: "text-blue-900",
    countColor: "text-blue-900"
  },
  {
    icon: Clock,
    title: "Pending Proofs",
    count: 3,
    color: "bg-gradient-to-br from-blue-200 to-blue-400 text-blue-900 border border-blue-300 shadow hover:shadow-md",
    iconColor: "text-blue-500",
    textColor: "text-blue-900",
    countColor: "text-blue-900"
  },
  {
    icon: CheckCircle,
    title: "Completed",
    count: Achievements.length - 3,
    color: "bg-gradient-to-br from-blue-300 to-blue-500 text-blue-900 border border-blue-400 shadow hover:shadow-md",
    iconColor: "text-blue-600",
    textColor: "text-blue-900",
    countColor: "text-blue-900"
  }
];


  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Achievement title is required';
    }
    
    if (!formData.publication.trim()) {
      newErrors.publication = 'Publication name is required';
    }
    
    if (!formData.issn.trim()) {
      newErrors.issn = 'ISSN/ISBN is required';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.issn)) {
      newErrors.issn = 'ISSN/ISBN must contain only letters and numbers';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Publication date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Add new Achievement to the list
      const newAchievement = {
        id: Achievements.length + 1,
        title: formData.title,
        publication: formData.publication,
        date: formData.date,
        doi: `10.${Math.floor(Math.random() * 9999)}/new.${new Date().getFullYear()}.${String(Achievements.length + 1).padStart(3, '0')}`,
        ISSN: formData.issn,
        category: formData.category,
        status: "Completed",
        certificate: formData.file ? "Uploaded" : "Not Uploaded"
      };
      
      setAchievements(prev => [newAchievement, ...prev]);
      alert('Achievement added successfully!');
      handleFormClose();
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    // Reset form after animation completes
    setTimeout(() => {
      setFormData({
        title: '',
        publication: '',
        issn: '',
        category: '',
        date: '',
        file: null
      });
      setErrors({});
    }, 300);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDetailsClick = (Achievement) => {
    setSelectedAchievement(Achievement);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAchievement(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const StatCard = ({ icon: Icon, title, count, color, iconColor, textColor, countColor }) => (
    <div className={`${color} rounded-xl p-6 transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColor} text-sm font-medium opacity-90`}>{title}</p>
          <p className={`${countColor} text-3xl font-bold mt-1`}>{count}</p>
        </div>
        <Icon className={`w-8 h-8 ${iconColor} opacity-80`} />
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1";
    
    if (status === "Completed") {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    } else if (status === "Pending") {
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }
    return null;
  };

  const getCertificateBadge = (certificate) => {
    if (certificate === "Uploaded") {
      return (
        <span className="text-green-600 text-sm font-medium">
          Uploaded
        </span>
      );
    } else {
      return (
        <span className="text-gray-500 text-sm">
          Not Uploaded
        </span>
      );
    }
  };

  const Modal = ({ Achievement, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold text-slate-800 pr-8">{Achievement.title}</h2>
            <button
              onClick={onClose}
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
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Publication Details</h3>
                <div className="space-y-2">
                  <p className="text-slate-600"><span className="font-medium">Journal:</span> {Achievement.publication}</p>
                  <p className="text-slate-600"><span className="font-medium">Date:</span> {formatDate(Achievement.date)}</p>
                  <p className="text-slate-600"><span className="font-medium">DOI:</span> {Achievement.doi}</p>
                  <p className="text-slate-600"><span className="font-medium">Category:</span> {Achievement.category}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">ISSN/ISBN Number:</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-slate-700 text-sm leading-relaxed">{Achievement.ISSN}</p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              View Publication
            </button>
            <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Achievement Form Component
  const AchievementForm = () => (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform animate-slideIn border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-xl relative text-white">
          <h2 className="text-xl font-semibold">Submit Research Achievement</h2>
          <p className="text-blue-100 mt-1 opacity-90">Fill in the details to add your Achievement</p>
          <button
            onClick={handleFormClose}
            className="absolute top-6 right-6 text-blue-100 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Achievement Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Achievement Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
              placeholder="Enter the title of your research Achievement"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Publication Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Book className="w-4 h-4 text-blue-600" />
              Publication Name *
            </label>
            <input
              type="text"
              value={formData.publication}
              onChange={(e) => handleInputChange('publication', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.publication ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
              placeholder="Enter the name of the journal or conference"
            />
            {errors.publication && <p className="text-red-500 text-sm mt-1">{errors.publication}</p>}
          </div>

          {/* ISSN/ISBN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-600" />
              ISSN/ISBN *
            </label>
            <input
              type="text"
              value={formData.issn}
              onChange={(e) => handleInputChange('issn', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.issn ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
              placeholder="Enter ISSN or ISBN (letters and numbers only)"
            />
            {errors.issn && <p className="text-red-500 text-sm mt-1">{errors.issn}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Category *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="Enter category or select from dropdown"
                list="categories"
              />
              <datalist id="categories">
                {categoryOptions.map((category, index) => (
                  <option key={index} value={category} />
                ))}
              </datalist>
            </div>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Date of Publication */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Date of Publication *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.date ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Proof File (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                dragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              
              {formData.file ? (
                <div className="flex items-center justify-center gap-3 text-green-600">
                  <FileText className="w-8 h-8" />
                  <div>
                    <p className="font-medium">{formData.file.name}</p>
                    <p className="text-sm text-slate-500">{formatFileSize(formData.file.size)}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">Drag and drop your file here, or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleFormClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleFormSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Submit Achievement
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              Achievements Published
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              These achievements are either ongoing or missing certificates. Please edit and complete them to keep your profile updated.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Achievement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Achievements Table */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px] bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm uppercase tracking-wider min-w-full">
                <div className="col-span-4">Publication</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

    {/* Table Body */}
    <div className="divide-y divide-gray-200">
      {Achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="grid grid-cols-12 gap-4 items-center min-w-full">
            {/* Publication Info */}
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">
                  {achievement.publication.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {achievement.publication}
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="col-span-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {achievement.category}
              </span>
            </div>

            {/* Date */}
            <div className="col-span-2 ">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(achievement.date)}</span>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2 ">{getStatusBadge(achievement.status)}</div>

            {/* Actions */}
            <div className="col-span-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDetailsClick(achievement)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


        {/* Achievement Details Modal */}
        {showModal && selectedAchievement && (
          <Modal Achievement={selectedAchievement} onClose={closeModal} />
        )}

        {/* Achievement Form Modal */}
        {showForm && <AchievementForm />}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OtherAchievements;
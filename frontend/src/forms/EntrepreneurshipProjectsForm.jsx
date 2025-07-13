import { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

const EntrepreneurshipProjectsForm = ({ initialData, onSubmit }) => {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState(
    initialData || {
      project_name: '',
      description: '',
      domain: '',
      year_of_start: '',
      status: '',
      proof_file: null,
      no_proof_yet: false,
    }
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0],
        no_proof_yet: false,
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
        ...(name === 'no_proof_yet' && checked ? { proof_file: null } : {}),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData({
        ...formData,
        proof_file: e.dataTransfer.files[0],
        no_proof_yet: false,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClickUpload = () => {
    if (!formData.no_proof_yet && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white shadow-2xl border border-slate-200 p-6">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Project Name <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Eco-Friendly Packaging Solution</p>
            <input
              type="text"
              name="project_name"
              required
              value={formData.project_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Project Name"
              aria-label="Project Name"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Domain <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">Select the project type</p>
            <select
              name="domain"
              required
              value={formData.domain}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              aria-label="Project Domain"
            >
              <option value="" disabled>
                Select Domain
              </option>
              <option value="Product-Based">Product-Based</option>
              <option value="Service-Based">Service-Based</option>
            </select>
          </div>

          {/* Year of Start */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Year of Start <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., 2023</p>
            <input
              type="number"
              name="year_of_start"
              required
              value={formData.year_of_start}
              onChange={handleChange}
              min="1900"
              max={currentYear}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Year of Start"
              aria-label="Year of Start"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Status <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">Select the project status</p>
            <select
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              aria-label="Project Status"
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Description <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">Briefly describe the project</p>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Project Description"
              rows="4"
              aria-label="Project Description"
            ></textarea>
          </div>
        </div>

        {/* Registration Proof Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            Registration Proof Upload (Optional)
          </label>
          <div className="mt-2 pb-2 flex items-center">
            <input
              type="checkbox"
              id="no_proof_yet"
              name="no_proof_yet"
              checked={formData.no_proof_yet}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label="No proof yet"
            />
            <label htmlFor="no_proof_yet" className="ml-2 text-xs font-medium text-gray-600">
              I haven't received my registration proof yet, I'll submit it later
            </label>
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : formData.no_proof_yet
                ? 'border-gray-300 bg-gray-100 opacity-70'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onClick={handleClickUpload}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              name="proof_file"
              ref={fileInputRef}
              accept="application/pdf,image/*"
              onChange={handleChange}
              className="hidden"
              disabled={formData.no_proof_yet}
              aria-label="Upload registration proof"
            />
            {formData.proof_file ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
                <p className="font-semibold text-gray-900">{formData.proof_file.name}</p>
                <p className="text-xs text-gray-400">Click or drag to replace</p>
              </div>
            ) : formData.no_proof_yet ? (
              <div className="flex flex-col items-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mb-2" />
                <p className="font-semibold text-gray-900">Proof will be submitted later</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="font-semibold text-gray-900">
                  {isDragging ? 'Drop your proof here' : 'Drag and drop your registration proof here or click to upload'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full mt-6 flex justify-center gap-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!formData.project_name || !formData.description || !formData.domain || !formData.year_of_start || !formData.status || (!formData.proof_file && !formData.no_proof_yet)}
            aria-label={initialData?._id ? 'Update Project' : 'Add Project'}
          >
            {initialData?._id ? 'Update Project' : 'Add Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntrepreneurshipProjectsForm;
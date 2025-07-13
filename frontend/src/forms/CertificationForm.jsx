import { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const CertificationForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      course_name: '',
      platform: '',
      start_date: '',
      end_date: '',
      ongoing: false,
      course_type: '',
      proof: null,
      no_certificate_yet: false,
    }
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setFormData({
        ...formData,
        [name]: files[0],
        no_certificate_yet: false,
      });
    } else if (type === 'checkbox') {
      const isNoCertCheckbox = name === 'no_certificate_yet';
      setFormData({
        ...formData,
        [name]: checked,
        ...(isNoCertCheckbox && checked ? { proof: null } : {}),
        ...(name === 'ongoing' ? { end_date: checked ? '' : formData.end_date } : {}),
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
      const file = e.dataTransfer.files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setFormData({
        ...formData,
        proof: e.dataTransfer.files[0],
        no_certificate_yet: false,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClickUpload = () => {
    if (!formData.no_certificate_yet && fileInputRef.current) {
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
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Course Name <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Python for Data Science</p>
            <input
              type="text"
              name="course_name"
              required
              value={formData.course_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Course Name"
              aria-label="Course Name"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Platform <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Coursera, Udemy, edX</p>
            <input
              type="text"
              name="platform"
              required
              value={formData.platform}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Platform"
              aria-label="Platform"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Start Date <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">When you started the course</p>
            <input
              type="date"
              name="start_date"
              required
              value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              aria-label="Start Date"
            />
          </div>

          {/* End Date with Ongoing Checkbox */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              End Date
            </label>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="ongoing"
                name="ongoing"
                checked={formData.ongoing}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="Ongoing course"
              />
              <label htmlFor="ongoing" className="ml-2 text-xs font-medium text-gray-600">
                Currently taking this course
              </label>
            </div>
            <input
              type="date"
              name="end_date"
              disabled={formData.ongoing}
              value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                formData.ongoing ? 'bg-gray-100 cursor-not-allowed text-gray-500 border-gray-300' : ''
              }`}
              aria-label="End Date"
            />
          </div>

          {/* Course Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Course Type <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">Select the course category</p>
            <select
              name="course_type"
              required
              value={formData.course_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              aria-label="Course Type"
            >
              <option value="">Select Course Type</option>
              <option value="Technical">Technical</option>
              <option value="Non-Technical">Non-Technical</option>
            </select>
          </div>

          {/* Certificate Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Certificate Upload
            </label>
            <div className="mt-2 pb-2 flex items-center">
              <input
                type="checkbox"
                id="no_certificate_yet"
                name="no_certificate_yet"
                checked={formData.no_certificate_yet}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="No certificate yet"
              />
              <label htmlFor="no_certificate_yet" className="ml-2 text-xs font-medium text-gray-600">
                I haven't received my certificate yet
              </label>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : formData.no_certificate_yet
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
                name="proof"
                ref={fileInputRef}
                accept="application/pdf,image/*"
                onChange={handleChange}
                className="hidden"
                disabled={formData.no_certificate_yet}
                aria-label="Upload certificate"
              />
              {formData.proof ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
                  <p className="font-semibold text-gray-900">{formData.proof.fileName || formData.proof.name}</p>
                  <p className="text-xs text-gray-400">Click or drag to replace</p>
                </div>
              ) : formData.no_certificate_yet ? (
                <div className="flex flex-col items-center">
                  <Clock className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-900">Certificate will be submitted later</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-900">
                    {isDragging ? 'Drop your certificate here' : 'Drag and drop your certificate here or click to upload'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF or image (max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full mt-6 flex justify-center gap-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              loading ||
              (!formData.proof && !formData.no_certificate_yet)
            }
            aria-label={initialData?._id ? 'Update Certification' : 'Add Certification'}
          >
            {initialData?._id ? 'Update Certification' : 'Add Certification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CertificationForm;
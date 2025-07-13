import { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

const InternshipForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      company_name: '',
      internship_role: '',
      department: '',
      start_date: '',
      end_date: '',
      ongoing: false,
      stipend: '',
      external_mentor: '',
      internal_mentor: '',
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
      console.log(file)
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
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Company Name / Organization <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., TCS, Infosys, Google</p>
            <input
              type="text"
              name="company_name"
              required
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Company Name"
              aria-label="Company Name"
            />
          </div>

          {/* Internship Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Internship Role <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Frontend Developer</p>
            <input
              type="text"
              name="internship_role"
              required
              value={formData.internship_role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Internship Role"
              aria-label="Internship Role"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Department <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., IT, R&D</p>
            <input
              type="text"
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Department"
              aria-label="Department"
            />
          </div>

          {/* Stipend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Stipend (Optional)
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., ₹5000/month</p>
            <input
              type="text"
              name="stipend"
              value={formData.stipend}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Stipend"
              aria-label="Stipend"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Start Date <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">When the internship started</p>
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
                aria-label="Ongoing internship"
              />
              <label htmlFor="ongoing" className="ml-2 text-xs font-medium text-gray-600">
                Ongoing internship
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

          {/* External Mentor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              External Mentor & Designation <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Mr. Sharma, Senior Developer</p>
            <input
              type="text"
              name="external_mentor"
              required
              value={formData.external_mentor}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="External Mentor"
              aria-label="External Mentor"
            />
          </div>

          {/* Internal Mentor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Internal Mentor & Designation <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Prof. A. Patel, Assistant Professor</p>
            <input
              type="text"
              name="internal_mentor"
              required
              value={formData.internal_mentor}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Internal Mentor"
              aria-label="Internal Mentor"
            />
          </div>

          {/* Certificate Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Certificate Upload (Optional)
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
                I haven't received my certificate yet, I'll submit it later
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
                  <AlertTriangle className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-900">Certificate will be submitted later</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-900">
                    {isDragging ? 'Drop your certificate here' : 'Drag and drop your certificate here or click to upload'}
                  </p>
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
              !formData.company_name ||
              !formData.internship_role ||
              !formData.department ||
              !formData.start_date ||
              !formData.external_mentor ||
              !formData.internal_mentor ||
              (!formData.proof && !formData.no_certificate_yet) ||
              (!formData.ongoing && !formData.end_date)
            }
            aria-label={initialData?._id ? 'Update Internship' : 'Add Internship'}
          >
            {initialData?._id ? 'Update Internship' : 'Add Internship'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InternshipForm;
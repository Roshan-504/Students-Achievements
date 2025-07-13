import { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const WorkshopForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      organizer: '',
      date: '',
      topic: '',
      mode: 'Offline', 
      duration: '',   
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
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
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
    <form onSubmit={handleSubmit} className="bg-white shadow-2xl border border-slate-200 p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Title of Workshop <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., AI/ML Workshop by Google</p>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Name of Workshop"
              aria-label="Name of Workshop"
            />
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Organizer / Conducted By <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., VESIT</p>
            <input
              type="text"
              name="organizer"
              required
              value={formData.organizer}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Organizer"
              aria-label="Organizer"
            />
          </div>

          {/* Topic / Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Topic / Domain <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Machine Learning, Cybersecurity</p>
            <input
              type="text"
              name="topic"
              required
              value={formData.topic}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Topic / Domain"
              aria-label="Topic / Domain"
            />
          </div>

          {/* Mode Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Mode <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">Select the workshop mode</p>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            >
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Duration <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., 2 days, 1 week, 3 hours</p>
            <input
              type="text"
              name="duration"
              required
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Duration"
              aria-label="Duration"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Date <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">When the workshop was conducted</p>
            <input
              type="date"
              name="date"
              required
              value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              aria-label="Date"
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
              !formData.title ||
              !formData.organizer ||
              !formData.date ||
              !formData.topic ||
              !formData.mode ||
              !formData.duration ||
              (!formData.proof && !formData.no_certificate_yet)
            }
            aria-label={initialData?._id ? 'Update Workshop' : 'Add Workshop'}
          >
            {initialData?._id ? 'Update Workshop' : 'Add Workshop'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default WorkshopForm;
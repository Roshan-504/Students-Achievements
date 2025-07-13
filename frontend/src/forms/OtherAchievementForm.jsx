import { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

const OtherAchievementForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
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
      setFormData({
        ...formData,
        [name]: checked,
        ...(name === 'no_certificate_yet' && checked ? { proof: null } : {}),
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
        <div className="grid grid-cols-1 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Achievement Title <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">A descriptive name for your achievement</p>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., Special Recognition Award"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">Explain what this achievement is about</p>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Describe your achievement in detail..."
            />
          </div>

          {/* Certificate Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Proof/Documentation (Optional)
            </label>
            <div className="mt-2 pb-2 flex items-center">
              <input
                type="checkbox"
                id="no_certificate_yet"
                name="no_certificate_yet"
                checked={formData.no_certificate_yet}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="no_certificate_yet" className="ml-2 text-xs font-medium text-gray-600">
                I don't have documentation yet, I'll submit it later
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
              />
              {formData.proof ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
                  <p className="font-semibold text-gray-900">{formData.proof.name}</p>
                  <p className="text-xs text-gray-400">Click or drag to replace</p>
                </div>
              ) : formData.no_certificate_yet ? (
                <div className="flex flex-col items-center">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-900">Documentation will be submitted later</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-900">
                    {isDragging ? 'Drop your documentation here' : 'Drag and drop your documentation here or click to upload'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF or image (max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full mt-6 flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              loading ||
              (!formData.proof && !formData.no_certificate_yet)
            }
          >
            {initialData?._id ? 'Update Achievement' : 'Add Achievement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OtherAchievementForm;
import { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PatentForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      patent_name: '',
      application_no: '',
      application_date: '',
      user_type: '',
      inventor_name: '',
      description: '',
      co_inventors: [],
      status: 'Pending',
      proof: null,
      no_document_yet: false,
    }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const [currentCoInventor, setCurrentCoInventor] = useState('');
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
        no_document_yet: false,
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
        ...(name === 'no_document_yet' && checked ? { proof: null } : {}),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddCoInventor = () => {
    if (currentCoInventor.trim() && !formData.co_inventors.includes(currentCoInventor.trim())) {
      setFormData({
        ...formData,
        co_inventors: [...formData.co_inventors, currentCoInventor.trim()],
      });
      setCurrentCoInventor('');
    }
  };

  const handleRemoveCoInventor = (index) => {
    const updated = [...formData.co_inventors];
    updated.splice(index, 1);
    setFormData({ ...formData, co_inventors: updated });
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
        no_document_yet: false,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClickUpload = () => {
    if (!formData.no_document_yet && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDocumentError(null);

    // Validate required fields
    if (!formData.patent_name || !formData.inventor_name) {
      setDocumentError('Please fill all required fields');
      toast.error('Please fill all required fields');
      return;
    }

    // Validate document status
    if (!formData.proof && !formData.no_document_yet) {
      setDocumentError('Please either upload your patent document or check the box if you will submit it later');
      toast.error('Please either upload your patent document or check the box if you will submit it later');
      return;
    }

    // If we get here, form is valid
    onSubmit(formData);
  };

  return (
    <div className="bg-white shadow-2xl border border-slate-200 p-6">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patent Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Patent Name <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., "System for automated patent analysis"</p>
            <input
              type="text"
              name="patent_name"
              required
              value={formData.patent_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Patent Name"
              aria-label="Patent Name"
            />
          </div>

          {/* Application Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Application Number
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., US20210193725A1</p>
            <input
              type="text"
              name="application_no"
              value={formData.application_no}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Application Number"
              aria-label="Application Number"
            />
          </div>

          {/* Application Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Application Date
            </label>
            <p className="text-xs text-gray-400 mb-1">When the patent was applied for</p>
            <input
              type="date"
              name="application_date"
              value={formData.application_date ? new Date(formData.application_date).toISOString().split('T')[0] : ''}
              max={new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              aria-label="Application Date"
            />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              User Type
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Individual, Organization</p>
            <input
              type="text"
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="User Type"
              aria-label="User Type"
            />
          </div>

          {/* Primary Inventor */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Primary Inventor <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">Your name as the primary inventor</p>
            <input
              type="text"
              name="inventor_name"
              required
              value={formData.inventor_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Primary Inventor"
              aria-label="Primary Inventor"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Status
            </label>
            <p className="text-xs text-gray-400 mb-1">Current status of the patent</p>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="Pending">Pending</option>
              <option value="Granted">Granted</option>
              <option value="Published">Published</option>
              <option value="Filed">Filed</option>
            </select>
          </div>


          {/* Co-Inventors */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Co-Inventors
            </label>
            <p className="text-xs text-gray-400 mb-1">Add names of other inventors (if any)</p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentCoInventor}
                onChange={(e) => setCurrentCoInventor(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Co-Inventor Name"
                aria-label="Co-Inventor Name"
              />
              <button
                type="button"
                onClick={handleAddCoInventor}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>
            {formData.co_inventors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.co_inventors.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 px-3 py-2 rounded-full text-sm"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => handleRemoveCoInventor(index)}
                      className="ml-2 text-gray-500 hover:text-red-600"
                      aria-label={`Remove ${name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Description
            </label>
            <p className="text-xs text-gray-400 mb-1">Brief description of the patent</p>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Describe your patent..."
              aria-label="Patent Description"
            />
          </div>

          {/* Document Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Patent Document Upload (Optional)
            </label>
            <div className="mt-2 pb-2 flex items-center">
              <input
                type="checkbox"
                id="no_document_yet"
                name="no_document_yet"
                checked={formData.no_document_yet}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="No document yet"
              />
              <label htmlFor="no_document_yet" className="ml-2 text-xs font-medium text-gray-600">
                I haven't received my patent document yet, I'll submit it later
              </label>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : formData.no_document_yet
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
                disabled={formData.no_document_yet}
                aria-label="Upload patent document"
              />
              {formData.proof ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
                  <p className="font-semibold text-gray-900">{formData.proof.fileName || formData.proof.name}</p>
                  <p className="text-xs text-gray-400">Click or drag to replace</p>
                </div>
              ) : formData.no_document_yet ? (
                <div className="flex flex-col items-center">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-900">Document will be submitted later</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-900">
                    {isDragging ? 'Drop your patent document here' : 'Drag and drop your document here or click to upload'}
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
            aria-label={initialData?._id ? 'Update Patent' : 'Add Patent'}
            disabled={loading}
          >
            {initialData?._id ? 'Update Patent' : 'Add Patent'}
          </button>
        </div>
      </form>
      {documentError && (
        <div className="flex items-center text-red-600 text-sm p-2 mt-2">
          <XCircle className="w-4 h-4 mr-1" />
          {documentError}
        </div>
      )}
    </div>
  );
};

export default PatentForm;
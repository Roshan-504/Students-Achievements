import { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PaperPublicationForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      paper_title: '',
      publication_name: '',
      issn_isbn: '',
      date_of_publication: '',
      category: '',
      proof: null,
      no_certificate_yet: false,
    }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [certificateError, setCertificateError] = useState(null);
  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
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
      setFormData({ 
        ...formData, 
        [name]: value,
      });
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
        proof: e.dataTransfer.files[0],
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      setCertificateError(null); // Reset error state
      
      // Validate certificate status
      if (!formData.proof && !formData.no_certificate_yet) {
        setCertificateError('Please either upload your certificate or check the box if you will submit it later');
        toast.error('Please either upload your certificate or check the box if you will submit it later');
        return;
      }
  
      // If we get here, form is valid
      onSubmit(formData);
    };
  

  return (
    <div className="bg-white shadow-2xl border border-slate-200 p-6">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paper Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Paper Title <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., Machine Learning Applications in Healthcare</p>
            <input
              type="text"
              name="paper_title"
              required
              value={formData.paper_title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Paper Title"
              aria-label="Paper Title"
            />
          </div>

          {/* Publication Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Publication Name <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., IEEE Transactions, Nature, ACM</p>
            <input
              type="text"
              name="publication_name"
              required
              value={formData.publication_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Publication Name"
              aria-label="Publication Name"
            />
          </div>

          {/* ISSN/ISBN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              ISSN/ISBN <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">e.g., 1234-5678 or 978-0123456789</p>
            <input
              type="text"
              name="issn_isbn"
              required
              value={formData.issn_isbn}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="ISSN/ISBN"
              aria-label="ISSN/ISBN"
            />
          </div>

          {/* Date of Publication */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Date of Publication <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">When the paper was published</p>
            <input
              type="date"
              name="date_of_publication"
              required
              value={formData.date_of_publication ? new Date(formData.date_of_publication).toISOString().split('T')[0] : ''}
              max={new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              aria-label="Date of Publication"
            />
          </div>

          {/* Paper Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Paper Type <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1">eg. Research Paper, Technical Report, Case Study </p>
             <input
              type="text"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Category"
              aria-label="Category"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload Paper(Optional)
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
                I haven't received my paper yet, I'll submit it later
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
                  <p className="text-xs text-gray-500 mt-1">PDF or image (max 10MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full mt-6 flex justify-center gap-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={ loading }
            aria-label={initialData?._id ? 'Update Paper Publication' : 'Add Paper Publication'}
          >
            {initialData?._id ? 'Update Paper Publication' : 'Add Paper Publication'}
          </button>
        </div>
      </form>
      {certificateError && (
                  <div className="flex items-center text-red-600 text-sm p-2 mt-2">
                    <XCircle className="w-4 h-4 mr-1" />
                    {certificateError}
                  </div>
                )}
    </div>
  );
};

export default PaperPublicationForm;
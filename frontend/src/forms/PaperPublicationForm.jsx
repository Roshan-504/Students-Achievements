import { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, XCircle, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const PaperPublicationForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      paper_title: '',
      publication_name: '',
      issn_isbn: '',
      date_of_publication: '',
      category: '',
      proof: { fileName: '' },
      no_certificate_yet: false,
    }
  );
  const [certificateError, setCertificateError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (name === 'proofLink') {
      // Handle the proof link separately
      setFormData({
        ...formData,
        proof: {
          fileName: value
        }
      });
    } else {
      setFormData({ 
        ...formData, 
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCertificateError(null); // Reset error state
    
    // Validate certificate status
    if (!formData.proof?.fileName && !formData.no_certificate_yet) {
      setCertificateError('Please either provide a link to your paper or check the box if you will submit it later');
      toast.error('Please either provide a link to your paper or check the box if you will submit it later');
      return;
    }

    // If we get here, form is valid
    onSubmit(formData);
  };

  return (
    <div className="bg-white shadow-2xl border border-slate-200 p-6">
      <form onSubmit={handleSubmit}>
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
              <LinkIcon className="w-4 h-4 text-blue-600" />
              Paper Link
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
                I haven't received Link yet, I'll submit it later
              </label>
            </div>
            
            {formData.no_certificate_yet ? (
              <div className="border-2 border-gray-300 bg-gray-100 opacity-70 rounded-lg p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                <p className="font-semibold text-gray-900">Paper link will be submitted later</p>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="url"
                  name="proofLink"
                  value={formData.proof?.fileName || ''}
                  onChange={handleChange}
                  disabled={formData.no_certificate_yet}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                  placeholder="https://example.com/your-paper"
                  aria-label="Paper link"
                />
                <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                {formData.proof?.fileName && (
                  <div className="flex items-center text-green-600 text-sm p-2 mt-2">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Link provided
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full mt-6 flex justify-center gap-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
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
import { useState } from 'react';
import { Mail, MessageSquare, AlertCircle, User, ChevronDown, Send, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../services/axiosInstance';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const formTypes = [
    { value: 'suggestion', label: 'Suggestion', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
    { value: 'report', label: 'Report Issue', icon: <AlertCircle className="w-4 h-4 mr-2" /> },
    { value: 'contact', label: 'General Inquiry', icon: <Mail className="w-4 h-4 mr-2" /> }
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      type
    }));
    setIsTypeOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const toastId = toast.loading('Submitting your message...', { position: 'top-center' });
      
      await axiosInstance.post('/contact-us/message', formData);

      toast.success('Message sent successfully!', { id: toastId });
      
      setFormData({
        name: '',
        email: '',
        type: 'suggestion',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = formTypes.find(type => type.value === formData.type);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact Us</h2>
        <p className="text-gray-600">
          Share your feedback, report issues, or contact us with your queries.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Dropdown */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type of Message
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <span className="flex items-center">
                {selectedType.icon}
                {selectedType.label}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </span>
            </button>

            {isTypeOpen && (
              <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {formTypes.map((type) => (
                  <li
                    key={type.value}
                    className="text-gray-900 cursor-default select-none relative py-2 pl-3 hover:bg-blue-50"
                    onClick={() => handleTypeSelect(type.value)}
                  >
                    <div className="flex items-center">
                      {type.icon}
                      <span className="ml-3 block truncate">{type.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`pl-10 block w-full rounded-md shadow-sm ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm py-2.5`}
              placeholder="Full Name"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Your Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`pl-10 block w-full rounded-md shadow-sm ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm py-2.5`}
              placeholder="Email"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Subject Field */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`block w-full rounded-md shadow-sm ${errors.subject ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm py-2.5 px-3`}
            placeholder={
              formData.type === 'suggestion' ? 'Briefly describe your suggestion' :
              formData.type === 'report' ? 'What issue are you reporting?' : 
              'What is your inquiry about?'
            }
          />
          {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            {formData.type === 'suggestion' ? 'Your Suggestion' : 
             formData.type === 'report' ? 'Detailed Description' : 'Your Message'}
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className={`block w-full rounded-md shadow-sm ${errors.message ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm py-2.5 px-3`}
            placeholder={
              formData.type === 'suggestion' ? 'How can we improve your experience?' :
              formData.type === 'report' ? 'Please describe the issue in detail...' : 
              'How can we help you?'
            }
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="-ml-1 mr-2 h-4 w-4" />
                {formData.type === 'suggestion' ? 'Submit Suggestion' : 
                 formData.type === 'report' ? 'Send Report' : 'Send Message'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
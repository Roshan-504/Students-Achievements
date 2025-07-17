import { useState, useRef } from 'react';
import {
  Edit2, Mail, Phone, Link, User, Book, GraduationCap, X, Calendar, Plus, UploadCloud, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import axiosInstance from '../services/axiosInstance';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast installed

const StudentProfile = () => {
  const { user, checkAuth } = useAuthStore();
  const [profile, setProfile] = useState(user || {});
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editErrors, setEditErrors] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [otherUrls, setOtherUrls] = useState(profile.other_urls || []);

  const fullName = `${profile.first_name || ''} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name || ''}`.trim();

  const isProfileComplete = [
    profile.first_name,
    profile.last_name,
    profile.department,
    profile.batch_no,
    profile.division,
    profile.gender,
    profile.abc_id,
    profile.average_sgpi,
    profile.phone,
    profile.linkedin_url,
  ].every(field => field && String(field).trim() !== '');

  const validateField = (field, value) => {
    if (field === 'phone') {
      return typeof value === 'string' && value.match(/^\+?\d{10,15}$/)
        ? ''
        : 'Invalid phone number (e.g., +919876543210).';
    }

    if (field === 'linkedin_url') {
      return typeof value === 'string' && value.match(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[\w-.~:?#[\]@!$&'()*+,;=]*)?$/)
        ? ''
        : 'Invalid LinkedIn URL.';
    }

    if (field === 'other_urls') {
      if (!Array.isArray(value)) return 'Invalid input for links.';
      const invalidUrls = value.filter(
        (url) =>
          typeof url !== 'string' ||
          !url.match(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[\w-.~:?#[\]@!$&'()*+,;=]*)?$/)
      );
      return invalidUrls.length ? 'One or more URLs are invalid.' : '';
    }

    if (field === 'average_sgpi') {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 10 ? '' : 'SGPI must be between 0 and 10.';
    }

    if (field === 'batch_no') {
      const num = parseInt(value);
      return !isNaN(num) && num > 0 ? '' : 'Batch number must be a positive integer.';
    }

    if (['first_name', 'last_name', 'department', 'division', 'gender', 'abc_id', 'mother_name', 'prn'].includes(field)) {
      return typeof value === 'string' && value.trim() !== ''
        ? ''
        : `${field.replace('_', ' ').charAt(0).toUpperCase() + field.replace('_', ' ').slice(1)} cannot be empty.`;
    }

    return '';
  };


  const handleEditClick = (field, value) => {
    setEditField(field);
    setEditValue(field === 'other_urls' ? '' : value || '');
    setOtherUrls(field === 'other_urls' ? profile.other_urls || [] : []);
    setEditErrors('');
  };

  const handleAddUrl = () => {
    const error = validateField('other_urls', newUrl);
    if (error) {
      setEditErrors(error);
      return;
    }
    setOtherUrls([...otherUrls, newUrl.trim()]);
    setNewUrl('');
    setEditErrors('');
  };

  const handleRemoveUrl = (index) => {
    setOtherUrls(otherUrls.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    let finalValue;
    if (editField === 'other_urls') {
      finalValue = otherUrls;
    } else if (editField === 'average_sgpi') {
      finalValue = parseFloat(editValue);
    } else if (editField === 'batch_no') {
      finalValue = parseInt(editValue);
    } else {
      finalValue = editValue?.trim() === '' ? null : editValue;
    }

    const error = validateField(editField, finalValue);
    if (error) {
      setEditErrors(error);
      return;
    }

    try {
      const updateData = { [editField]: finalValue };
      const response = await axiosInstance.put('/student/update-student-profile', updateData);
      setProfile(response.data.profile);
      setEditField(null);
      setEditValue('');
      setEditErrors('');
      toast.success(`${fields.find(f => f.key === editField)?.label || editField.replace('_', ' ')} updated successfully!`);
      checkAuth();
    } catch (error) {
      console.error('Error updating profile:', error);
      setEditErrors(error.response?.data?.message || 'Failed to update profile.');
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    }
  };


  const fields = [
    { key: 'email_id', label: 'Email Address', icon: Mail, editable: false },
    { key: 'prn', label: 'PRN', icon: User, editable: true },
    { key: 'first_name', label: 'First Name', icon: User, editable: false },
    { key: 'middle_name', label: 'Middle Name', icon: User, editable: true },
    { key: 'last_name', label: 'Last Name', icon: User, editable: false },
    { key: 'mother_name', label: 'Mother\'s Name', icon: User, editable: true },
    { key: 'department', label: 'Department', icon: Book, editable: false },
    { key: 'gender', label: 'Gender', icon: User, editable: true },
    { key: 'division', label: 'Division', icon: Book, editable: false },
    { key: 'average_sgpi', label: 'Average SGPI', icon: GraduationCap, editable: true },
    { key: 'batch_no', label: 'Batch Number', icon: Calendar, editable: false },
    { key: 'abc_id', label: 'ABC ID', icon: Book, editable: true },
    { key: 'phone', label: 'Phone Number', icon: Phone, editable: true },
    { key: 'linkedin_url', label: 'LinkedIn Profile', icon: Link, isLink: true, editable: true },
    { key: 'other_urls', label: 'Other Important Links', icon: Link, isArray: true, editable: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2">
      <div className="container mx-auto max-w-8xl">
        {/* Profile Header Card */}
        <div className="relative bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-4 flex flex-col md:flex-row items-center md:items-start gap-6 border border-gray-100">
          <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32">
            {profile.pic ? (
              <img
                src={profile.pic}
                alt={`${fullName}'s Profile`}
                className="w-full h-full rounded-full object-cover border-4 border-blue-100 shadow-md"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-5xl sm:text-6xl border-4 border-blue-100 shadow-md">
                {profile.first_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1 leading-tight">
              {fullName || 'Student Profile'}
            </h1>
            <p className="text-md text-gray-600 mb-3">{profile.email_id || 'Email not available'}</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 ${
                isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {isProfileComplete ? <CheckCircle size={16} className="mr-1" /> : <AlertCircle size={16} className="mr-1" />}
              {isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
            </span>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-20 gap-x-8 gap-y-6">
            {fields.map((field) => (
              <div key={field.key} className="flex items-start justify-between">
                <div className="flex items-start">
                  <field.icon className="w-5 h-5 text-gray-500 mr-3 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-0.5">{field.label}</p>
                    {field.isArray ? (
                      profile[field.key] && profile[field.key].length > 0 ? (
                        <ul className="space-y-1">
                          {profile[field.key].map((url, index) => (
                            <li key={index}>
                              <a
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                              >
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-700 italic">Not provided</p>
                      )
                    ) : field.isLink ? (
                      profile[field.key] ? (
                        <a
                          href={profile[field.key].startsWith('http') ? profile[field.key] : `https://${profile[field.key]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                        >
                          {profile[field.key]}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-700 italic">Not provided</p>
                      )
                    ) : field.key === 'average_sgpi' ? (
                      <p className="text-sm font-semibold text-gray-900">{profile[field.key]?.toFixed(2) || 'Not provided'}</p>
                    ) : ( <p className="text-sm font-semibold text-gray-900">{profile[field.key] || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                {field.editable && (
                  <button
                    onClick={() => handleEditClick(field.key, profile[field.key])}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ml-4 -mt-1 flex-shrink-0"
                    title={`Edit ${field.label}`}
                    aria-label={`Edit ${field.label}`}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {editField && (
          <div className="fixed inset-0 bg-gray-900/20 bg-opacity-40  flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 transform scale-95 animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Edit {fields.find(f => f.key === editField)?.label || editField.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </h3>
                <button
                  onClick={() => setEditField(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close edit modal"
                >
                  <X size={20} />
                </button>
              </div>

              {editField === 'other_urls' ? (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="new-url-input" className="block text-sm font-medium text-gray-700 mb-2">Add New Link</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        id="new-url-input"
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://your-portfolio.com"
                        className="flex-grow border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                      <button
                        onClick={handleAddUrl}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                      >
                        <Plus size={18} className="mr-2" /> Add
                      </button>
                    </div>
                    {editErrors && <p className="text-sm text-red-600 mt-2 flex items-center"><AlertCircle size={16} className="mr-1" />{editErrors}</p>}
                  </div>

                  {otherUrls.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Links ({otherUrls.length})</p>
                      <ul className="space-y-3 max-h-48 overflow-y-auto pr-2"> 
                        {otherUrls.map((url, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-800 font-medium break-all mr-3">
                              <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {url}
                              </a>
                            </span>
                            <button
                              onClick={() => handleRemoveUrl(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                              aria-label={`Remove URL ${url}`}
                            >
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="edit-value-input" className="block text-sm font-medium text-gray-700 mb-2">
                    {editField === 'average_sgpi' ? 'SGPI (0-10)' :
                     editField === 'batch_no' ? 'Batch Number (e.g., 2024)' :
                     fields.find(f => f.key === editField)?.label || editField.replace('_', ' ')}
                  </label>
                  <input
                    id="edit-value-input"
                    type={editField === 'average_sgpi' ? 'number' : editField === 'batch_no' ? 'number' : (editField === 'phone' ? 'tel' : (editField === 'linkedin_url' ? 'url' : 'text'))}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`Enter ${fields.find(f => f.key === editField)?.label || editField.replace('_', ' ')}`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    min={editField === 'average_sgpi' ? 0 : editField === 'batch_no' ? 1 : undefined}
                    max={editField === 'average_sgpi' ? 10 : undefined}
                    step={editField === 'average_sgpi' ? 0.01 : editField === 'batch_no' ? 1 : undefined}
                  />
                  {editErrors && <p className="text-sm text-red-600 mt-2 flex items-center"><AlertCircle size={16} className="mr-1" />{editErrors}</p>}
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditField(null)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  aria-label="Cancel edit"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  aria-label="Save changes"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StudentProfile;
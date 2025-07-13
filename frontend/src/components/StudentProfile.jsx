import { useState } from 'react';
import { Edit2, Mail, Phone, Link, User, Book, GraduationCap, X, Image as ImageIcon } from 'lucide-react';

const StudentProfile = () => {
  // Dummy data based on personal_information schema
  const profileData = {
    email_id: 'user@example.com',
    prn: '2021001234',
    last_name: 'Patel',
    first_name: 'Aarav',
    middle_name: 'Kumar',
    mother_name: 'Sunita Patel',
    department: 'INFT',
    batch_no: '2021-2025',
    gender: 'Male',
    abc_id: 'ABC123456789',
    current_sgpi: 8.5,
    phone: '+91 9876543210',
    linkedin_url: 'https://linkedin.com/in/aaravpatel',
    other_urls: ['https://github.com/aaravpatel', 'https://portfolio.aaravpatel.com'],
    profile_picture: null, // Placeholder for profile picture URL
  };

  const [profile, setProfile] = useState(profileData);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editErrors, setEditErrors] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [otherUrls, setOtherUrls] = useState(profile.other_urls || []);

  const fullName = `${profile.first_name} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name}`;

  // Check profile completion
  const isProfileComplete = profile.abc_id && profile.current_sgpi && profile.phone && profile.linkedin_url && profile.other_urls?.length > 0;

  // Validation functions
  const validateField = (field, value) => {
    if (field === 'phone') {
      return value.match(/^\+?\d{10,15}$/) ? '' : 'Invalid phone number (e.g., +919876543210)';
    }
    if (field === 'linkedin_url' || field === 'other_urls') {
      return value.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/) ? '' : 'Invalid URL';
    }
    if (field === 'current_sgpi') {
      const num = parseFloat(value);
      return num >= 0 && num <= 10 ? '' : 'SGPI must be between 0 and 10';
    }
    if (field === 'department') {
      return value === 'INFT' ? '' : 'Department must be INFT';
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
    setOtherUrls([...otherUrls, newUrl]);
    setNewUrl('');
  };

  const handleRemoveUrl = (index) => {
    setOtherUrls(otherUrls.filter((_, i) => i !== index));
  };

  const handleSaveEdit = () => {
    const error = validateField(editField, editValue);
    if (error) {
      setEditErrors(error);
      return;
    }

    let updatedProfile = { ...profile };
    if (editField === 'other_urls') {
      updatedProfile.other_urls = otherUrls;
    } else {
      updatedProfile[editField] = editValue || null;
    }

    setProfile(updatedProfile);
    setEditField(null);
    setEditValue('');
    setEditErrors('');
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profile_picture: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                    {profile.first_name.charAt(0)}
                  </div>
                )}
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors"
                  title="Upload profile picture"
                >
                  <ImageIcon size={16} />
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </label>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                <p className="text-sm text-gray-600">{profile.email_id}</p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block ${
                    isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{profile.email_id}</p>
                  </div>
                </div>
                {/* No edit button for email_id (PK) */}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">PRN</p>
                    <p className="font-medium text-gray-900">{profile.prn}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('prn', profile.prn)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit PRN"
                  aria-label="Edit PRN"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium text-gray-900">{profile.first_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('first_name', profile.first_name)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit First Name"
                  aria-label="Edit First Name"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Middle Name</p>
                    <p className="font-medium text-gray-900">{profile.middle_name || 'Not provided'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('middle_name', profile.middle_name)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Middle Name"
                  aria-label="Edit Middle Name"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium text-gray-900">{profile.last_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('last_name', profile.last_name)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Last Name"
                  aria-label="Edit Last Name"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Mother's Name</p>
                    <p className="font-medium text-gray-900">{profile.mother_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('mother_name', profile.mother_name)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Mother's Name"
                  aria-label="Edit Mother's Name"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{profile.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('department', profile.department)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Department"
                  aria-label="Edit Department"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Book className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Batch</p>
                    <p className="font-medium text-gray-900">{profile.batch_no}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('batch_no', profile.batch_no)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Batch"
                  aria-label="Edit Batch"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900">{profile.gender}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('gender', profile.gender)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Gender"
                  aria-label="Edit Gender"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Details</h2>
            <div className="space-y-4">
              {profile.abc_id ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Book className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">ABC ID</p>
                      <p className="font-medium text-gray-900">{profile.abc_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditClick('abc_id', profile.abc_id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Edit ABC ID"
                    aria-label="Edit ABC ID"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">ABC ID not provided</p>
                  <button
                    onClick={() => handleEditClick('abc_id', '')}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Add ABC ID"
                    aria-label="Add ABC ID"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
              {profile.current_sgpi ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <GraduationCap className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Current SGPI</p>
                      <p className="font-medium text-gray-900">{profile.current_sgpi.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditClick('current_sgpi', profile.current_sgpi)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Edit SGPI"
                    aria-label="Edit SGPI"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">SGPI not provided</p>
                  <button
                    onClick={() => handleEditClick('current_sgpi', '')}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Add SGPI"
                    aria-label="Add SGPI"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact & Links</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('phone', profile.phone)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Phone"
                  aria-label="Edit Phone"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">LinkedIn</p>
                    {profile.linkedin_url ? (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {profile.linkedin_url}
                      </a>
                    ) : (
                      <p className="font-medium text-gray-900">Not provided</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('linkedin_url', profile.linkedin_url)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit LinkedIn"
                  aria-label="Edit LinkedIn"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Link className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Other Links</p>
                    {profile.other_urls && profile.other_urls.length > 0 ? (
                      <ul className="space-y-1">
                        {profile.other_urls.map((url, index) => (
                          <li key={index}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-medium text-gray-900">Not provided</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick('other_urls', '')}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Other Links"
                  aria-label="Edit Other Links"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editField && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit {editField.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </h3>
                <button
                  onClick={() => setEditField(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                  aria-label="Close edit modal"
                >
                  <X size={20} />
                </button>
              </div>
              {editField === 'other_urls' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Add New URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full border rounded p-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <button
                        onClick={handleAddUrl}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    {editErrors && <p className="text-sm text-red-600 mt-1">{editErrors}</p>}
                  </div>
                  {otherUrls.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Current URLs</p>
                      <ul className="space-y-2">
                        {otherUrls.map((url, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">{url}</span>
                            <button
                              onClick={() => handleRemoveUrl(index)}
                              className="text-red-600 hover:text-red-800"
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
                  <label className="block text-sm text-gray-500 mb-1">
                    {editField === 'current_sgpi' ? 'SGPI (0-10)' : editField.replace('_', ' ')}
                  </label>
                  <input
                    type={editField === 'current_sgpi' ? 'number' : 'text'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`Enter ${editField.replace('_', ' ')}`}
                    className="w-full border rounded p-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    min={editField === 'current_sgpi' ? 0 : undefined}
                    max={editField === 'current_sgpi' ? 10 : undefined}
                    step={editField === 'current_sgpi' ? 0.01 : undefined}
                  />
                  {editErrors && <p className="text-sm text-red-600 mt-1">{editErrors}</p>}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditField(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  aria-label="Cancel edit"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  aria-label="Save changes"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
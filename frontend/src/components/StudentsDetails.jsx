import { useEffect, useState } from 'react';
import { Edit2, X, ChevronLeft, Search, Trash2, Download, User, Mail, Calendar, FileText, Loader2 } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';

const UserDetails = ({ batch, comparisonDate, onClose }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (batch) {
      const fetchStudents = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await axiosInstance.get('/admin/batch-students', {
            params: {
              division: batch.division,
              department: batch.department,
              batch_no: batch.batch_no,
              date: comparisonDate,
            },
          });
          setStudents(response.data.data);
          setFilteredStudents(response.data.data);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch students');
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudents();
    }
  }, [batch, comparisonDate]);

  useEffect(() => {
    const results = students.filter(student =>
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(results);
  }, [searchTerm, students]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'other_urls' ? value.split('\n').filter((url) => url.trim()) : value,
    }));
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      middle_name: student.middle_name || '',
      mother_name: student.mother_name || '',
      email_id: student.email_id || '',
      prn: student.prn || '',
      department: student.department || '',
      batch_no: student.batch_no || '',
      division: student.division || '',
      gender: student.gender || '',
      abc_id: student.abc_id || '',
      average_sgpi: student.average_sgpi || '',
      phone: student.phone || '',
      linkedin_url: student.linkedin_url || '',
      other_urls: student.other_urls?.join('\n') || '',
    });
    setIsModalOpen(true);
  };

  const handleDownloadNotFilled = () => {
    const notFilledStudents = students.filter(student => student.status === 'Not Filled');
    const csvContent = [
      ['Name', 'Department', 'Batch', 'Division'],
      ...notFilledStudents.map(student => [
        `${student.first_name} ${student.last_name}`,
        student.department,
        student.batch_no,
        student.division
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Not_Filled_Students_Batch_${batch.batch_no}_${batch.department}_${batch.division}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteStudent = async (email) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setIsLoading(true);
        await axiosInstance.delete('/admin/delete-student', { params: { email } });
        setStudents(students.filter(student => student.email_id !== email));
        setFilteredStudents(filteredStudents.filter(student => student.email_id !== email));
        toast.success('Student deleted successfully');
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to delete student';
        toast.error(errorMsg);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate other_urls if present
      if (formData.other_urls) {
        const urls = typeof formData.other_urls === 'string' 
          ? formData.other_urls.split('\n').filter(url => url.trim())
          : formData.other_urls;
        
        if (urls.some(url => !url.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/))) {
          throw new Error('Invalid URL in other_urls');
        }
      }

      await axiosInstance.put(`/student/update-student-profile`, {
        ...formData,
        other_urls: typeof formData.other_urls === 'string' 
          ? formData.other_urls.split('\n').filter(url => url.trim())
          : formData.other_urls
      });
      
      toast.success('Profile updated successfully');
      setIsModalOpen(false);
      
      // Refresh student data
      const response = await axiosInstance.get('/admin/batch-students', {
        params: {
          division: batch.division,
          department: batch.department,
          batch_no: batch.batch_no,
          date: comparisonDate,
        },
      });
      setStudents(response.data.data);
      setFilteredStudents(response.data.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update student';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Filled':
        return 'bg-green-100 text-green-800';
      case 'Not Filled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

 return (
    <div className=" rounded-xl shadow-lg overflow-hidden mb-5">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex flex-col space-y-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2  text-blue-100 hover:text-white transition-colors self-start"
          >
            <ChevronLeft size={20} />
            <span>Back to Batches</span>
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Batch {batch.batch_no} Students
              </h2>
              <p className="text-blue-100">
                {batch.department}, Division {batch.division}
              </p>
            </div>
            
            <button
              onClick={handleDownloadNotFilled}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg transition-colors shadow-sm"
            >
              <Download size={16} />
              <span>Export Not Filled List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name or email..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300">
            <span className="text-sm text-slate-600">Status:</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {students.filter(s => s.status === 'Filled').length} Filled
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {students.filter(s => s.status === 'Not Filled').length} Not Filled
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mx-6 mt-4 rounded-lg flex items-start gap-2">
          <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          <p className="text-slate-600">Loading students...</p>
        </div>
      ) : (
        /* Students Table */
        <div className="overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-lg font-medium text-slate-900">
                {searchTerm ? 'No matching students found' : 'No students in this batch'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm ? 'Try a different search term' : 'This batch currently has no students'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-1 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Sr No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredStudents.map((student, index) => (
                  <tr key={student.email_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-1 text-center py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 flex items-center justify-center">
                        <span className="font-semibold">{index + 1}</span>
                      </div>
                    </td>

                    {/* Student Name Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <User size={16} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {student.first_name} {student.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Contact Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 flex items-center gap-1">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {student.email_id}
                      </div>
                    </td>
                    
                    {/* Last Updated Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {student.last_updated ? new Date(student.last_updated).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStudentSelect(student)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Edit student"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.email_id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Student Edit Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 pr-8">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 p-1 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="Last Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="Middle Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mother's Name</label>
                      <input
                        type="text"
                        name="mother_name"
                        value={formData.mother_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="Mother's Name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email_id"
                        value={formData.email_id || ''}
                        disabled
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100"
                        aria-label="Email (disabled)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PRN</label>
                      <input
                        type="text"
                        name="prn"
                        value={formData.prn || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="PRN"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="Gender"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ABC ID</label>
                      <input
                        type="text"
                        name="abc_id"
                        value={formData.abc_id || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="ABC ID"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                      <input
                        type="text"
                        name="department"
                        onChange={handleInputChange}
                        value={formData.department || ''}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        aria-label="Department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number</label>
                      <input
                        type="number"
                        name="batch_no"
                        onChange={handleInputChange}
                        value={formData.batch_no || ''}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg "
                        aria-label="Batch Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Division</label>
                      <input
                        type="text"
                        name="division"
                        onChange={handleInputChange}
                        value={formData.division || ''}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        aria-label="Division"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Average SGPI</label>
                      <input
                        type="number"
                        name="average_sgpi"
                        value={formData.average_sgpi || ''}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        max="10"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="Average SGPI"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        aria-label="Phone"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      aria-label="LinkedIn URL"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Other URLs (one per line)</label>
                    <textarea
                      name="other_urls"
                      value={formData.other_urls || ''}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      aria-label="Other URLs"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Updated</label>
                    <input
                      type="text"
                      value={selectedStudent.last_updated ? new Date(selectedStudent.last_updated).toLocaleString() : '-'}
                      disabled
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100"
                      aria-label="Last Updated (disabled)"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl font-medium shadow hover:shadow-md transition-all duration-200 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    disabled={isLoading}
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-75"
                    aria-label="Save changes"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
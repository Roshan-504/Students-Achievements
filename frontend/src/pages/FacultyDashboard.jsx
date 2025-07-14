import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, Download, LogOut, X, FileText } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { useAuthStore } from '../context/authStore';
import FilterPanel from '../components/FilterPanel';

const FacultyDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivitys, setTotalActivitys] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [filters, setFilters] = useState({
    students: { department: [], batch_no: '', class_division: '', gender: '', email: '' },
    activities: { activity_type: 'All', status: '', start_date: '', end_date: '' },
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/api/faculty/activities?page=${page}&limit=10`;
      const { activity_type, status, start_date, end_date } = filters.activities;
      const studentFilters = filters.students;
      if (activity_type) url += `&activity_type=${encodeURIComponent(activity_type)}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (start_date) url += `&start_date=${encodeURIComponent(start_date)}`;
      if (end_date) url += `&end_date=${encodeURIComponent(end_date)}`;
      if (studentFilters.email) url += `&email_id=${encodeURIComponent(studentFilters.email)}`;
      if (studentFilters.department.length > 0 || studentFilters.batch_no || studentFilters.class_division || studentFilters.gender) {
        const studentEmails = await fetchStudentEmails(studentFilters);
        if (studentEmails.length > 0) {
          url += `&email_id=${encodeURIComponent(studentEmails.join(','))}`;
        }
      }

      const response = await axiosInstance.get(url);
      console.log(response.data)
      setData(response.data.activities || []);
      setTotalActivitys(response.data.total)
      setTotalPages(response.data.pages || 1);
      setCurrentPage(Number(response.data.page) || 1);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentEmails = async (studentFilters) => {
    try {
      let url = '/api/faculty/students?';
      const { department, batch_no, class_division, gender, email } = studentFilters;
      if (department.length > 0) url += `&department=${encodeURIComponent(department.join(','))}`;
      if (batch_no) url += `&batch_no=${encodeURIComponent(batch_no)}`;
      if (class_division) url += `&class_division=${encodeURIComponent(class_division)}`;
      if (gender) url += `&gender=${encodeURIComponent(gender)}`;
      if (email) url += `&email=${encodeURIComponent(email)}`;

      const response = await axiosInstance.get(url);
      return response.data.students.map((student) => student.email_id);
    } catch (error) {
      console.error('Error fetching student emails:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const applyFilters = () => {
    setCurrentPage(1);
    setSortConfig({ key: '', direction: 'asc' });
    fetchData(1);
  };

  const resetFilters = () => {
    setFilters({
      students: { department: [], batch_no: '', class_division: '', gender: '', email: '' },
      activities: { activity_type: 'All', status: '', start_date: '', end_date: '' },
    });
    setCurrentPage(1);
    setSortConfig({ key: '', direction: 'asc' });
    fetchData(1);
  };

  const handleSort = (key) => {
  // Determine new sort direction
    const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    
    setSortConfig({ key, direction: newDirection });
      // Create sorted copy of data
      const sortedData = [...data].sort((a, b) => {
        // Get values to compare
        let aValue, bValue;

        switch (key) {
          case 'email_id':
            aValue = a.email_id || '';
            bValue = b.email_id || '';
            break;
          case 'activity_type':
            aValue = a.activity_type || '';
            bValue = b.activity_type || '';
            break;
          case 'status':
            aValue = a.status || "";
            bValue = b.status || "";
            break;
          case 'date':
            aValue = new Date(a.start_date || a.date || a.date_of_publication).getTime();
            bValue = new Date(b.start_date || b.date || b.date_of_publication).getTime();
            break;
          default:
            aValue = '';
            bValue = '';
        }

        // Handle null/undefined/empty values
        if (!aValue && !bValue) return 0;
        if (!aValue) return newDirection === 'asc' ? -1 : 1;
        if (!bValue) return newDirection === 'asc' ? 1 : -1;

        // Normalize values for comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        // Perform comparison
        if (aValue < bValue) return newDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return newDirection === 'asc' ? 1 : -1;
        return 0;
      });

      setData(sortedData);
    };

  const handleViewDetails = (row) => {
    setSelectedActivity(row);
  };

  const handleDownloadProof = async (row) => {
    if (!row.proof?.fileName) return;
    try {
      const response = await axiosInstance.get(`/api/faculty/activities/proof/${row._id}?activity_type=${row.activity_type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', row.proof.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading proof:', error);
    }
  };

  const columns = [
    { header: 'Student Email', accessor: 'email_id', sortKey: 'email_id' },
    { header: 'Activity Name', accessor: 'activity_name', sortKey: 'activity_type' },
    { header: 'Title', accessor: 'title', sortKey: null, className: 'hidden sm:table-cell' },
    { header: 'Status', accessor: 'status', sortKey: 'status' },
    { header: 'Date', accessor: 'date', sortKey: 'date' },
    { header: 'Actions', accessor: 'actions', sortKey: null },
  ];

  const renderCell = (row, column) => {
    switch (column.accessor) {
      case 'activity_name':
        return (
          row.activity_type || '-'
        );
      case 'title':
        return row.title || row.paper_title || row.activity_name || row.course_name || row.startup_name || row.company_name || '-';
      case 'status':
        return row.status;
      case 'date': {
        const date = row.start_date || row.date || row.date_of_publication;
        return date ? new Date(date).toLocaleDateString() : "-";
      }
      case 'actions':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleViewDetails(row)}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
              aria-label="View activity details"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => handleDownloadProof(row)}
              className={`p-1 ${
                row.proof?.fileName
                  ? 'text-blue-600 hover:text-blue-800'
                  : 'text-gray-400 cursor-not-allowed'
              } transition-colors duration-200`}
              aria-label="Download proof file"
              title="Download Proof"
              disabled={!row.proof?.fileName}
            >
              <Download size={18} />
            </button>
          </div>
        );
      default:
        return row[column.accessor] || '-';
    }
  };

  const fields = {
    Internship: [
      { label: 'Company Name', value: 'company_name' },
      { label: 'Role', value: 'internship_role' },
      { label: 'Department', value: 'department' },
      { label: 'Stipend', value: 'stipend' },
      { label: 'Start Date', value: 'start_date' },
      { label: 'End Date', value: 'end_date' },
    ],
    CourseCertification: [
      { label: 'Course Name', value: 'course_name' },
      { label: 'Platform', value: 'platform' },
      { label: 'Course Type', value: 'course_type' },
      { label: 'Date', value: 'date' },
    ],
    Entrepreneurship: [
      { label: 'Startup Name', value: 'startup_name' },
      { label: 'Role', value: 'role' },
      { label: 'Type', value: 'type' },
      { label: 'Start Date', value: 'start_date' },
    ],
    NonTechnicalActivity: [
      { label: 'Activity Name', value: 'activity_name' },
      { label: 'Type', value: 'type' },
      { label: 'Position', value: 'position' },
      { label: 'Date', value: 'date' },
    ],
    OtherAchievement: [
      { label: 'Title', value: 'title' },
      { label: 'Description', value: 'description' },
      { label: 'Date', value: 'date' },
    ],
    PaperPublication: [
      { label: 'Paper Title', value: 'paper_title' },
      { label: 'Category', value: 'category' },
      { label: 'ISSN/ISBN', value: 'issn_isbn' },
      { label: 'Date of Publication', value: 'date_of_publication' },
    ],
    TechnicalActivity: [
      { label: 'Activity Name', value: 'activity_name' },
      { label: 'Type', value: 'type' },
      { label: 'Position', value: 'position' },
      { label: 'Date', value: 'date' },
    ],
    Volunteering: [
      { label: 'Organization', value: 'organization' },
      { label: 'Cause', value: 'cause' },
      { label: 'Hours Contributed', value: 'hours_contributed' },
      { label: 'Start Date', value: 'start_date' },
    ],
    Workshop: [
      { label: 'Topic', value: 'topic' },
      { label: 'Mode', value: 'mode' },
      { label: 'Organized By', value: 'organized_by' },
      { label: 'Date', value: 'date' },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#f9f6f1]">
      
        {/* Top Navbar */}
        <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-50 transition-all duration-300 ease-in-out">
          <div className="max-w-full mx-auto px-6 sm:px-10 lg:px-15 h-16 flex justify-between items-center">

            <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing for smaller screens */}
              {/* Dashboard Title - Consistent branding */}
              <div className="ml-2">
                <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  Faculty Dashboard
                </div>
              </div>
            </div>

            {/* Right Section: User Profile + Logout */}
            <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing */}
              {/* User Profile */}
              <div className="relative group">
                <div
                  className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {(imgError || !user?.pic) ? (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm sm:text-base"> {/* Smaller for mobile */}
                      {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                    </div>
                  ) : (
                    <img
                      src={user.pic}
                      alt="Profile"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-300 group-hover:border-blue-500 transition-all duration-200"
                      onError={() => setImgError(true)}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {/* Hide full name on small screens, show on medium+ */}
                  <p className='text-sm sm:text-base font-medium text-gray-800 hidden md:block'>{user?.firstName + " " + user?.lastName}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 cursor-pointer rounded-lg flex items-center text-white hover:text-gray-100 bg-red-600 hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium touch-manipulation"
                aria-label="Logout"
              >
                <LogOut size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      
      <div className="max-w-7xl mx-auto mt-15 p-4 sm:p-6 lg:p-8">
        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-[#f4b400] to-[#f7c670] rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
            <h3 className="text-xl text-black font-medium opacity-90">Total Activities</h3>
            <p className="text-3xl font-bold mt-2">{totalActivitys}</p>
            <p className="text-xs mt-2 opacity-80">+12% from last month</p>
          </div>
          <div className="bg-gradient-to-r from-[#f4b400] to-[#f7c670] rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
            <h3 className="text-xl text-black font-medium opacity-90">Completed</h3>
            <p className="text-3xl font-bold mt-2">856</p>
            <p className="text-xs mt-2 opacity-80">68.6% completion rate</p>
          </div>
          <div className="bg-gradient-to-r from-[#f4b400] to-[#f7c670] rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
            <h3 className="text-xl text-black font-medium opacity-90">Pending Review</h3>
            <p className="text-3xl font-bold mt-2">392</p>
            <p className="text-xs mt-2 opacity-80">31.4% pending</p>
          </div>
        </div>

        {/* Data Table */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Student Activities</h2>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              aria-label="Download all filtered data as CSV"
              disabled={loading}
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <svg
                className="animate-spin w-10 h-10 mx-auto text-blue-600"
                viewBox="0 0 24 24"
                aria-label="Loading"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-4 text-slate-600">Loading student activities...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    {columns.map((column) => (
                      <th
                        key={column.header}
                        onClick={() => column.sortKey && handleSort(column.sortKey)}
                        onKeyDown={(e) => {
                          if (column.sortKey && (e.key === 'Enter' || e.key === ' ')) {
                            handleSort(column.sortKey);
                            e.preventDefault();
                          }
                        }}
                        className={`px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${column.className || ''} ${
                          column.sortKey ? 'cursor-pointer hover:bg-slate-100 transition-colors duration-200' : ''
                        }`}
                        tabIndex={column.sortKey ? 0 : -1}
                        aria-sort={sortConfig.key === column.sortKey ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <div className="flex items-center">
                          {column.header}
                          {sortConfig.key === column.sortKey ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp size={16} className="ml-1" aria-hidden="true" />
                            ) : (
                              <ChevronDown size={16} className="ml-1" aria-hidden="true" />
                            )
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="text-lg font-medium text-slate-700">No activities found</h3>
                          <p className="text-slate-500 mt-1">Try adjusting your filters or check back later</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((row, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/50 transition-colors duration-150 animate-fade-in"
                      >
                        {columns.map((column) => (
                          <td key={column.header} className={`px-6 py-4 text-sm ${column.className || ''} ${
                            column.accessor === 'status' 
                              ? row.status === 'Completed'
                                ? 'text-green-600 font-medium' 
                                : 'text-amber-600 font-medium'
                              : 'text-slate-800 font-medium'
                          }`}>
                            {renderCell(row, column)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-slate-600">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prevPage = Math.max(currentPage - 1, 1);
                setCurrentPage(prevPage);
                fetchData(prevPage);
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      fetchData(pageNum);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 hover:bg-slate-50'
                    } transition-all duration-200`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    onClick={() => {
                      setCurrentPage(totalPages);
                      fetchData(totalPages);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 hover:bg-slate-50'
                    } transition-all duration-200`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => {
                const nextPage = Math.min(currentPage + 1, totalPages);
                setCurrentPage(nextPage);
                fetchData(nextPage);
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Details Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-scale-in">
              <div className="sticky top-0 bg-white p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedActivity.activity_type} Details
                </h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors duration-200 text-slate-500 hover:text-slate-700"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Student</p>
                    <p className="text-slate-800 mt-1">{selectedActivity.email_id}</p>
                  </div>
                  
                  {(fields[selectedActivity.activity_type] || []).map((field, index) => (
                    <div key={index}>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{field.label}</p>
                      <p className="text-slate-800 mt-1">
                        {field.value === 'start_date' || field.value === 'end_date' || field.value === 'date' || field.value === 'date_of_publication'
                          ? selectedActivity[field.value]
                            ? new Date(selectedActivity[field.value]).toLocaleDateString()
                            : '-'
                          : selectedActivity[field.value] || '-'}
                      </p>
                    </div>
                  ))}
                  
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</p>
                    <p className={`mt-1 font-medium ${
                      selectedActivity.proof?.fileName && selectedActivity.end_date 
                        ? 'text-green-600' 
                        : 'text-amber-600'
                    }`}>
                      {selectedActivity.proof?.fileName && selectedActivity.end_date ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Proof</p>
                    <p className="mt-1">
                      {selectedActivity.proof?.fileName ? (
                        <span className="text-blue-600 flex items-center gap-2">
                          <FileText size={16} />
                          {selectedActivity.proof.fileName}
                        </span>
                      ) : (
                        'No proof uploaded'
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      handleDownloadProof(selectedActivity);
                      setSelectedActivity(null);
                    }}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      selectedActivity.proof?.fileName
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    } transition-all duration-200 shadow-sm`}
                    disabled={!selectedActivity.proof?.fileName}
                    aria-label="Download proof from modal"
                  >
                    <Download size={16} />
                    Download Proof
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Animation Styles */}
        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FacultyDashboard;
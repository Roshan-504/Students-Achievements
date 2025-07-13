import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Eye, Download, LogOut, X } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { useAuthStore } from '../context/authStore';
import FilterPanel from '../components/FilterPanel';

const FacultyDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
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
      setData(response.data.activities);
      setTotalPages(response.data.pages);
      setCurrentPage(response.data.page);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    setSortConfig((prev) => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });

    const sortedData = [...data].sort((a, b) => {
      let aValue, bValue;
      switch (key) {
        case 'email_id':
          aValue = a.email_id || '';
          bValue = b.email_id || '';
          break;
        case 'activity_name':
          aValue = a.activity_name || a.course_name || a.startup_name || a.paper_title || a.title || '';
          bValue = b.activity_name || b.course_name || b.startup_name || b.paper_title || b.title || '';
          break;
        case 'title':
          aValue = a.title || a.paper_title || '';
          bValue = b.title || b.paper_title || '';
          break;
        case 'status':
          aValue = (a.proof?.fileName && a.end_date ? 'Completed' : 'Pending').toLowerCase();
          bValue = (b.proof?.fileName && b.end_date ? 'Completed' : 'Pending').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.start_date || a.date || a.date_of_publication).getTime();
          bValue = new Date(b.start_date || b.date || b.date_of_publication).getTime();
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
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
    { header: 'Activity Name', accessor: 'activity_name', sortKey: 'activity_name' },
    { header: 'Title', accessor: 'title', sortKey: 'title', className: 'hidden sm:table-cell' },
    { header: 'Status', accessor: 'status', sortKey: 'status' },
    { header: 'Date', accessor: 'date', sortKey: 'date' },
    { header: 'Actions', accessor: 'actions', sortKey: null },
  ];

  const renderCell = (row, column) => {
    switch (column.accessor) {
      case 'activity_name':
        return (
          row.activity_type ||
          '-'
        );
      case 'title':
        return row.activity_name || row.course_name || row.startup_name || row.paper_title || row.title || row.company_name || '-';
      case 'status':
        return row.proof?.fileName && row.end_date ? 'Completed' : 'Pending';
      case 'date':
        return new Date(row.start_date || row.date || row.date_of_publication).toLocaleDateString();
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

  const renderActivityDetails = (activity) => {
    if (!activity) return null;
    const fields = {
      Internship: [
        { label: 'Company Name', value: activity.company_name },
        { label: 'Role', value: activity.internship_role },
        { label: 'Department', value: activity.department },
        { label: 'Stipend', value: activity.stipend },
        { label: 'Start Date', value: activity.start_date ? new Date(activity.start_date).toLocaleDateString() : '-' },
        { label: 'End Date', value: activity.end_date ? new Date(activity.end_date).toLocaleDateString() : '-' },
      ],
      CourseCertification: [
        { label: 'Course Name', value: activity.course_name },
        { label: 'Platform', value: activity.platform },
        { label: 'Course Type', value: activity.course_type },
        { label: 'Date', value: activity.date ? new Date(activity.date).toLocaleDateString() : '-' },
      ],
      Entrepreneurship: [
        { label: 'Startup Name', value: activity.startup_name },
        { label: 'Role', value: activity.role },
        { label: 'Type', value: activity.type },
        { label: 'Start Date', value: activity.start_date ? new Date(activity.start_date).toLocaleDateString() : '-' },
      ],
      NonTechnicalActivity: [
        { label: 'Activity Name', value: activity.activity_name },
        { label: 'Type', value: activity.type },
        { label: 'Position', value: activity.position },
        { label: 'Date', value: activity.date ? new Date(activity.date).toLocaleDateString() : '-' },
      ],
      OtherAchievement: [
        { label: 'Title', value: activity.title },
        { label: 'Description', value: activity.description },
        { label: 'Date', value: activity.date ? new Date(activity.date).toLocaleDateString() : '-' },
      ],
      PaperPublication: [
        { label: 'Paper Title', value: activity.paper_title },
        { label: 'Category', value: activity.category },
        { label: 'ISSN/ISBN', value: activity.issn_isbn },
        { label: 'Date of Publication', value: activity.date_of_publication ? new Date(activity.date_of_publication).toLocaleDateString() : '-' },
      ],
      TechnicalActivity: [
        { label: 'Activity Name', value: activity.activity_name },
        { label: 'Type', value: activity.type },
        { label: 'Position', value: activity.position },
        { label: 'Date', value: activity.date ? new Date(activity.date).toLocaleDateString() : '-' },
      ],
      Volunteering: [
        { label: 'Organization', value: activity.organization },
        { label: 'Cause', value: activity.cause },
        { label: 'Hours Contributed', value: activity.hours_contributed },
        { label: 'Start Date', value: activity.start_date ? new Date(activity.start_date).toLocaleDateString() : '-' },
      ],
      Workshop: [
        { label: 'Topic', value: activity.topic },
        { label: 'Mode', value: activity.mode },
        { label: 'Organized By', value: activity.organized_by },
        { label: 'Date', value: activity.date ? new Date(activity.date).toLocaleDateString() : '-' },
      ],
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{activity.activity_type} Details</h3>
          <button
            onClick={() => setSelectedActivity(null)}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          <p><strong>Email:</strong> {activity.email_id}</p>
          {(fields[activity.activity_type] || []).map((field, index) => (
            <p key={index}>
              <strong>{field.label}:</strong> {field.value || '-'}
            </p>
          ))}
          <p>
            <strong>Proof:</strong>{' '}
            {activity.proof?.fileName ? (
              <span className="text-blue-600">{activity.proof.fileName}</span>
            ) : (
              'None'
            )}
          </p>
        </div>
        <button
          onClick={() => {
            handleDownloadProof(activity);
            setSelectedActivity(null);
          }}
          className={`mt-4 px-4 py-2 ${
            activity.proof?.fileName
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } rounded-lg transition-all duration-200`}
          disabled={!activity.proof?.fileName}
          aria-label="Download proof from modal"
        >
          Download Proof
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Faculty Dashboard</h1>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
        />

        {/* Data Table */}
        <section className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <div className="text-center py-10">
              <svg
                className="animate-spin w-8 h-8 mx-auto text-blue-600"
                viewBox="0 0 24 24"
                aria-label="Loading"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
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
                      className={`px-4 py-3 text-left text-sm font-semibold text-gray-800 ${column.className || ''} ${
                        column.sortKey ? 'cursor-pointer select-none' : ''
                      }`}
                      tabIndex={column.sortKey ? 0 : -1}
                      aria-sort={sortConfig.key === column.sortKey ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      {column.header}
                      {sortConfig.key === column.sortKey ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} className="inline ml-2" aria-hidden="true" />
                        ) : (
                          <ChevronDown size={16} className="inline ml-2" aria-hidden="true" />
                        )
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-3 text-center text-gray-700">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-blue-50 transition-all duration-200 animate-fade-in"
                    >
                      {columns.map((column) => (
                        <td key={column.header} className={`px-4 py-3 text-sm text-gray-700 ${column.className || ''}`}>
                          {renderCell(row, column)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Pagination */}
        <nav className="flex justify-between items-center mt-4" aria-label="Table pagination">
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
              fetchData(currentPage - 1);
            }}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 transition-all duration-200 shadow-sm"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              fetchData(currentPage + 1);
            }}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 transition-all duration-200 shadow-sm"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>

        {/* Details Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {renderActivityDetails(selectedActivity)}
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
          .animate-fade-in {
            animation: fade-in 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FacultyDashboard;
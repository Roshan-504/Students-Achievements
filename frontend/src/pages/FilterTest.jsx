import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, LogOut } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { useAuthStore } from '../context/authStore';

const FacultyDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('students'); // 'students', 'activities', 'contacts'
  const [filters, setFilters] = useState({
    students: { department: '', batch_no: '', class_division: '', sgpi_min: '', sgpi_max: '', gender: '', email: '', prn: '' },
    activities: { activity_type: 'Internship', email_id: '', status: '', start_date: '', end_date: '' },
    contacts: { type: '', status: '', email: '', start_date: '', end_date: '' },
  });
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const activityModels = {
    Internship: 'Internship',
    CourseCertification: 'CourseCertification',
    Entrepreneurship: 'Entrepreneurship',
    NonTechnicalActivity: 'NonTechnicalActivity',
    OtherAchievement: 'OtherAchievement',
    PaperPublication: 'PaperPublication',
    TechnicalActivity: 'TechnicalActivity',
    Volunteering: 'Volunteering',
    Workshop: 'Workshop',
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/api/faculty/${tab}?page=${page}&limit=10`;
      const currentFilters = filters[tab];
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) url += `&${key}=${encodeURIComponent(value)}`;
      });

      const response = await axiosInstance.get(url);
      setData(response.data[tab]);
      setTotalPages(response.data.pages);
      setCurrentPage(response.data.page);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [tab]);

  const handleFilterChange = (e, section) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [section]: { ...prev[section], [name]: value },
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setSortConfig({ key: '', direction: 'asc' });
    fetchData(1);
  };

  const resetFilters = (section) => {
    setFilters((prev) => ({
      ...prev,
      [section]: Object.fromEntries(Object.keys(prev[section]).map((key) => [key, ''])),
    }));
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
      if (tab === 'students') {
        if (key === 'name') {
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
        } else {
          aValue = a[key] || '';
          bValue = b[key] || '';
        }
      } else if (tab === 'activities') {
        if (key === 'details') {
          if (filters.activities.activity_type === 'Internship') {
            aValue = `${a.company_name} - ${a.internship_role}`.toLowerCase();
            bValue = `${b.company_name} - ${b.internship_role}`.toLowerCase();
          } else if (filters.activities.activity_type === 'CourseCertification') {
            aValue = `${a.course_name} - ${a.platform}`.toLowerCase();
            bValue = `${b.course_name} - ${b.platform}`.toLowerCase();
          } else if (filters.activities.activity_type === 'Entrepreneurship') {
            aValue = `${a.startup_name} - ${a.role}`.toLowerCase();
            bValue = `${b.startup_name} - ${b.role}`.toLowerCase();
          } else {
            aValue = (a.activity_name || a.title || a.paper_title || '').toLowerCase();
            bValue = (b.activity_name || b.title || b.paper_title || '').toLowerCase();
          }
        } else if (key === 'status') {
          aValue = (a.proof?.fileName && a.end_date ? 'Completed' : 'Pending').toLowerCase();
          bValue = (b.proof?.fileName && b.end_date ? 'Completed' : 'Pending').toLowerCase();
        } else if (key === 'date') {
          aValue = new Date(a.start_date || a.date || a.date_of_publication).getTime();
          bValue = new Date(b.start_date || b.date || b.date_of_publication).getTime();
        } else {
          aValue = a[key] || '';
          bValue = b[key] || '';
        }
      } else if (tab === 'contacts') {
        if (key === 'created') {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        } else {
          aValue = a[key] || '';
          bValue = b[key] || '';
        }
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  // Table columns
  const studentColumns = useMemo(
    () => [
      { header: 'Name', accessor: 'name', sortKey: 'name' },
      { header: 'Email', accessor: 'email_id', sortKey: 'email_id' },
      { header: 'PRN', accessor: 'prn', sortKey: 'prn' },
      { header: 'Department', accessor: 'department', sortKey: 'department' },
      { header: 'Batch', accessor: 'batch_no', sortKey: 'batch_no' },
      { header: 'Division', accessor: 'class_division', sortKey: 'class_division' },
      { header: 'SGPI', accessor: 'current_sgpi', sortKey: 'current_sgpi' },
      { header: 'Gender', accessor: 'gender', sortKey: 'gender' },
    ],
    []
  );

  const activityColumns = useMemo(
    () => [
      { header: 'Student Email', accessor: 'email_id', sortKey: 'email_id' },
      { header: 'Activity Type', accessor: () => filters.activities.activity_type, sortKey: 'activity_type' },
      { header: 'Details', accessor: 'details', sortKey: 'details' },
      { header: 'Status', accessor: 'status', sortKey: 'status' },
      { header: 'Date', accessor: 'date', sortKey: 'date' },
    ],
    [filters.activities.activity_type]
  );

  const contactColumns = useMemo(
    () => [
      { header: 'Name', accessor: 'name', sortKey: 'name' },
      { header: 'Email', accessor: 'email', sortKey: 'email' },
      { header: 'Type', accessor: 'type', sortKey: 'type' },
      { header: 'Subject', accessor: 'subject', sortKey: 'subject' },
      { header: 'Status', accessor: 'status', sortKey: 'status' },
      { header: 'Created', accessor: 'created', sortKey: 'created' },
    ],
    []
  );

  const columns = tab === 'students' ? studentColumns : tab === 'activities' ? activityColumns : contactColumns;

  const renderCell = (row, column) => {
    if (tab === 'students') {
      if (column.accessor === 'name') return `${row.first_name} ${row.last_name}`;
      return row[column.accessor] || '-';
    }
    if (tab === 'activities') {
      if (column.accessor === 'activity_type') return filters.activities.activity_type;
      if (column.accessor === 'details') {
        if (filters.activities.activity_type === 'Internship') return `${row.company_name} - ${row.internship_role}`;
        if (filters.activities.activity_type === 'CourseCertification') return `${row.course_name} - ${row.platform}`;
        if (filters.activities.activity_type === 'Entrepreneurship') return `${row.startup_name} - ${row.role}`;
        return row.activity_name || row.title || row.paper_title || '-';
      }
      if (column.accessor === 'status') return row.proof?.fileName && row.end_date ? 'Completed' : 'Pending';
      if (column.accessor === 'date') return new Date(row.start_date || row.date || row.date_of_publication).toLocaleDateString();
      return row[column.accessor] || '-';
    }
    if (tab === 'contacts') {
      if (column.accessor === 'created') return new Date(row.createdAt).toLocaleDateString();
      return row[column.accessor] || '-';
    }
    return '-';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Faculty Dashboard</h1>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          {['students', 'activities', 'contacts'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setCurrentPage(1);
                setSortConfig({ key: '', direction: 'asc' });
                fetchData(1);
              }}
              className={`px-4 py-2 text-sm font-semibold capitalize transition-all duration-200 ${
                tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filter Panel */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          {tab === 'students' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                name="department"
                value={filters.students.department}
                onChange={(e) => handleFilterChange(e, 'students')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Department"
              >
                <option value="">All Departments</option>
                <option value="INFT">INFT</option>
                <option value="COMPS">COMPS</option>
                <option value="EXTC">EXTC</option>
              </select>
              <input
                name="batch_no"
                type="number"
                value={filters.students.batch_no}
                onChange={(e) => handleFilterChange(e, 'students')}
                placeholder="Batch Number"
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Batch Number"
              />
              <input
                name="class_division"
                value={filters.students.class_division}
                onChange={(e) => handleFilterChange(e, 'students')}
                placeholder="Class Division"
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Class Division"
              />
              <div className="flex gap-2">
                <input
                  name="sgpi_min"
                  type="number"
                  step="0.1"
                  value={filters.students.sgpi_min}
                  onChange={(e) => handleFilterChange(e, 'students')}
                  placeholder="Min SGPI"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                  aria-label="Minimum SGPI"
                />
                <input
                  name="sgpi_max"
                  type="number"
                  step="0.1"
                  value={filters.students.sgpi_max}
                  onChange={(e) => handleFilterChange(e, 'students')}
                  placeholder="Max SGPI"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                  aria-label="Maximum SGPI"
                />
              </div>
              <select
                name="gender"
                value={filters.students.gender}
                onChange={(e) => handleFilterChange(e, 'students')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Gender"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                name="email"
                value={filters.students.email}
                onChange={(e) => handleFilterChange(e, 'students')}
                placeholder="Email"
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Email"
              />
              <input
                name="prn"
                value={filters.students.prn}
                onChange={(e) => handleFilterChange(e, 'students')}
                placeholder="PRN"
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="PRN"
              />
            </div>
          )}
          {tab === 'activities' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                name="activity_type"
                value={filters.activities.activity_type}
                onChange={(e) => handleFilterChange(e, 'activities')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Activity Type"
              >
                {Object.keys(activityModels).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                name="email_id"
                value={filters.activities.email_id}
                onChange={(e) => handleFilterChange(e, 'activities')}
                placeholder="Student Email"
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Student Email"
              />
              <select
                name="status"
                value={filters.activities.status}
                onChange={(e) => handleFilterChange(e, 'activities')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Submission Status"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <input
                name="start_date"
                type="date"
                value={filters.activities.start_date}
                onChange={(e) => handleFilterChange(e, 'activities')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Start Date"
              />
              <input
                name="end_date"
                type="date"
                value={filters.activities.end_date}
                onChange={(e) => handleFilterChange(e, 'activities')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="End Date"
              />
            </div>
          )}
          {tab === 'contacts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                name="type"
                value={filters.contacts.type}
                onChange={(e) => handleFilterChange(e, 'contacts')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Contact Type"
              >
                <option value="">All Types</option>
                <option value="suggestion">Suggestion</option>
                <option value="report">Report</option>
                <option value="contact">Contact</option>
              </select>
              <select
                name="status"
                value={filters.contacts.status}
                onChange={(e) => handleFilterChange(e, 'contacts')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Contact Status"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <input
                name="email"
                value={filters.contacts.email}
                onChange={(e) => handleFilterChange(e, 'contacts')}
                placeholder="Email"
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Email"
              />
              <input
                name="start_date"
                type="date"
                value={filters.contacts.start_date}
                onChange={(e) => handleFilterChange(e, 'contacts')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Start Date"
              />
              <input
                name="end_date"
                type="date"
                value={filters.contacts.end_date}
                onChange={(e) => handleFilterChange(e, 'contacts')}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="End Date"
              />
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              aria-label={`Apply ${tab} filters`}
            >
              Apply Filters
            </button>
            <button
              onClick={() => resetFilters(tab)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              aria-label={`Reset ${tab} filters`}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <div className="text-center py-10">
              <svg className="animate-spin w-8 h-8 mx-auto text-blue-600" viewBox="0 0 24 24">
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
                      onClick={() => handleSort(column.sortKey)}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer select-none"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSort(column.sortKey);
                          e.preventDefault();
                        }
                      }}
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
                    <tr key={index} className="border-t border-gray-200 hover:bg-blue-50">
                      {columns.map((column) => (
                        <td key={column.header} className="px-4 py-3 text-sm text-gray-700">
                          {renderCell(row, column)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
              fetchData(currentPage - 1);
            }}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 transition-all duration-200"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 transition-all duration-200"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
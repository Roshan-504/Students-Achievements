import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

const FilterPanel = ({ filters, setFilters, applyFilters, resetFilters }) => {
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [emailError, setEmailError] = useState('');

  const activityTypes = [
    'All',
    'Internship',
    'CourseCertification',
    'Entrepreneurship',
    'NonTechnicalActivity',
    'OtherAchievement',
    'PaperPublication',
    'TechnicalActivity',
    'Volunteering',
    'Workshop',
  ];

  const departments = ['INFT', 'CMPN', 'AIDS', 'EXTC', 'AURO', 'ECS'];

  const handleFilterChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    if (section === 'students' && name === 'department') {
      const updatedDepartments = filters.students.department.includes(value)
        ? filters.students.department.filter((dep) => dep !== value)
        : [...filters.students.department, value];
      setFilters((prev) => ({
        ...prev,
        students: { ...prev.students, department: updatedDepartments },
      }));
    } else if (section === 'students' && name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(value) || value === '' ? '' : 'Invalid email format');
      setFilters((prev) => ({
        ...prev,
        students: { ...prev.students, email: value },
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: type === 'checkbox' ? checked : value },
      }));
    }
  };

  return (
    <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-blue-600" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
      </div>

      {/* Student Filters Dropdown */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => setIsStudentOpen(!isStudentOpen)}
          className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
          aria-expanded={isStudentOpen}
          aria-controls="student-filters"
        >
          <span className="text-sm font-semibold text-gray-800">Student Filters</span>
          {isStudentOpen ? (
            <ChevronUp size={20} className="text-blue-600" />
          ) : (
            <ChevronDown size={20} className="text-blue-600" />
          )}
        </button>
        <div
          id="student-filters"
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 transition-all duration-300 ${
            isStudentOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <div className="flex flex-col gap-2">
              {departments.map((dep) => (
                <label key={dep} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="department"
                    value={dep}
                    checked={filters.students.department.includes(dep)}
                    onChange={(e) => handleFilterChange(e, 'students')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{dep}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="class_division" className="block text-sm font-medium text-gray-700 mb-1">
              Class Division
            </label>
            <select
              id="class_division"
              name="class_division"
              value={filters.students.class_division}
              onChange={(e) => handleFilterChange(e, 'students')}
              className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              aria-label="Class Division"
            >
              <option value="">All Divisions</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div>
            <label htmlFor="batch_no" className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number
            </label>
            <input
              id="batch_no"
              name="batch_no"
              type="number"
              value={filters.students.batch_no}
              onChange={(e) => handleFilterChange(e, 'students')}
              placeholder="e.g., 2023"
              className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              aria-label="Batch Number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other'].map((gender) => (
                <label key={gender} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={filters.students.gender === gender}
                    onChange={(e) => handleFilterChange(e, 'students')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{gender}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={filters.students.email}
              onChange={(e) => handleFilterChange(e, 'students')}
              placeholder="e.g., student@example.com"
              className={`p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 ${
                emailError ? 'border-red-500' : ''
              }`}
              aria-label="Email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="text-red-500 text-xs mt-1">
                {emailError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Filters Dropdown */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => setIsActivityOpen(!isActivityOpen)}
          className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
          aria-expanded={isActivityOpen}
          aria-controls="activity-filters"
        >
          <span className="text-sm font-semibold text-gray-800">Activity Filters</span>
          {isActivityOpen ? (
            <ChevronUp size={20} className="text-blue-600" />
          ) : (
            <ChevronDown size={20} className="text-blue-600" />
          )}
        </button>
        <div
          id="activity-filters"
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 transition-all duration-300 ${
            isActivityOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div>
            <label htmlFor="activity_type" className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              id="activity_type"
              name="activity_type"
              value={filters.activities.activity_type}
              onChange={(e) => handleFilterChange(e, 'activities')}
              className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              aria-label="Activity Type"
            >
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.activities.status}
              onChange={(e) => handleFilterChange(e, 'activities')}
              className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              aria-label="Submission Status"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={filters.activities.start_date}
              onChange={(e) => handleFilterChange(e, 'activities')}
              className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              aria-label="Start Date"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={filters.activities.end_date}
              onChange={(e) => handleFilterChange(e, 'activities')}
              className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              aria-label="End Date"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
          aria-label="Apply filters"
        >
          Apply Filters
        </button>
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-sm"
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>
    </section>
  );
};

export default FilterPanel;
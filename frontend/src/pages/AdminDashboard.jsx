import React, { useState, useEffect } from 'react';
import '../App.css';
import Overview from '../components/Overview';
import Users from '../components/Users';
import Settings from '../components/Settings';

const AdminDashboard = () => {
  // State for dashboard data and UI controls
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);


  // Admin user data
  const [admin, setAdmin] = useState({
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'System Administrator',
    avatar: null
  });

  // Mock admin dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 1247,
      activebatchs: 24,
      totalInstructors: 58,
      pendingApprovals: 12
    },
    recentActivities: [
      { id: 1, type: 'user_registered', description: 'New student registration: Sarah Johnson', time: '10 minutes ago', priority: 'normal' },
      { id: 2, type: 'batch_created', description: 'Batch "Advanced AI" created by Dr. Smith', time: '2 hours ago', priority: 'normal' },
      { id: 3, type: 'system_alert', description: 'Database backup completed successfully', time: '4 hours ago', priority: 'low' },
      { id: 4, type: 'security_alert', description: 'Multiple failed login attempts detected', time: '6 hours ago', priority: 'high' }
    ],
    users: [
      { id: 1, name: 'John Doe', email: 'john.doe@university.edu', role: 'student', status: 'active', lastLogin: '2024-06-18', batchs: 4 },
      { id: 2, name: 'Sarah Johnson', email: 'sarah.j@university.edu', role: 'student', status: 'pending', lastLogin: 'Never', batchs: 0 },
      { id: 3, name: 'Michael Smith', email: 'dr.smith@university.edu', role: 'instructor', status: 'active', lastLogin: '2024-06-17', batchs: 3 },
      { id: 4, name: 'Emma Wilson', email: 'emma.w@university.edu', role: 'student', status: 'inactive', lastLogin: '2024-06-10', batchs: 2 },
      { id: 5, name: 'Lisa Chen', email: 'prof.chen@university.edu', role: 'student', status: 'active', lastLogin: '2024-06-18', batchs: 5 }
    ],
    batchs: [
      { id: 1, name: '2023_a_INFT(D10A)', instructor: 'Dr. Smith', students: 45, status: 'active', responses: 67 },
      { id: 2, name: '2023_b_INFT(D10B)', instructor: 'Prof. Chen', students: 38, status: 'active', responses: 82 },
      { id: 3, name: '2023_c_INFT(D10C)', instructor: 'Dr. Johnson', students: 52, status: 'active', responses: 45 },
      { id: 4, name: '2024_a_INFT(D15A)', instructor: 'Prof. Williams', students: 29, status: 'draft', responses: 0 }
    ],
    // New data for System Management
    studentReports: [
      {
  id: 1,
  studentName: 'John Doe',
  studentEmail: 'john.doe@university.edu',
  subject: 'Achievement Proof Upload Failure',
  message: 'I am trying to upload a PDF proof of my internship, but it fails with an unknown error.',
  priority: 'high',
  status: 'pending',
  submittedAt: '2024-06-20 14:30',
  category: 'file-upload'
},

{
  id: 2,
  studentName: 'Sarah Johnson',
  studentEmail: 'sarah.j@university.edu',
  subject: 'Workshop Details Not Saving',
  message: 'After entering workshop details and clicking save, the form resets and nothing is stored.',
  priority: 'medium',
  status: 'resolved',
  submittedAt: '2024-06-19 09:15',
  category: 'form-entry'
},

{
  id: 3,
  studentName: 'Emma Wilson',
  studentEmail: 'emma.w@university.edu',
  subject: 'Incorrect Achievement Displayed',
  message: 'My profile is showing an outdated internship from last year that I already removed.',
  priority: 'low',
  status: 'in responses',
  submittedAt: '2024-06-18 16:45',
  category: 'profile-update'
},

{
  id: 4,
  studentName: 'Ravi Sharma',
  studentEmail: 'ravi.s@university.edu',
  subject: 'Unable to Edit Technical Activity',
  message: 'I am trying to update the certificate number in my technical activity, but the edit button is disabled.',
  priority: 'medium',
  status: 'pending',
  submittedAt: '2024-06-20 11:20',
  category: 'activity-edit'
},

{
  id: 5,
  studentName: 'Anjali Mehta',
  studentEmail: 'anjali.m@university.edu',
  subject: 'PDF Proof Not Displaying',
  message: 'The proof I uploaded is not visible when I try to preview it from my dashboard.',
  priority: 'medium',
  status: 'pending',
  submittedAt: '2024-06-19 10:05',
  category: 'file-preview'
},

{
  id: 6,
  studentName: 'Nikhil Patel',
  studentEmail: 'nikhil.p@university.edu',
  subject: 'Notice Not Received',
  message: 'I did not receive the alert for the final deadline to submit my achievements.',
  priority: 'low',
  status: 'resolved',
  submittedAt: '2024-06-18 08:55',
  category: 'notifications'
},

{
  id: 7,
  studentName: 'Priya Desai',
  studentEmail: 'priya.d@university.edu',
  subject: 'Multiple File Upload Issue',
  message: 'When I upload both image and PDF proofs together, only one gets saved.',
  priority: 'high',
  status: 'pending',
  submittedAt: '2024-06-21 13:10',
  category: 'file-upload'
},

{
  id: 8,
  studentName: 'Amit Verma',
  studentEmail: 'amit.v@university.edu',
  subject: 'Startup Data Not Saving',
  message: 'I added details of my startup project, but the form crashes on submission.',
  priority: 'medium',
  status: 'in responses',
  submittedAt: '2024-06-20 15:40',
  category: 'startup'
},

{
  id: 9,
  studentName: 'Sneha Kapoor',
  studentEmail: 'sneha.k@university.edu',
  subject: 'Page Freezes on Submission',
  message: 'The page freezes when I try to update my non-technical activities.',
  priority: 'medium',
  status: 'pending',
  submittedAt: '2024-06-21 10:25',
  category: 'non-technical'
},

{
  id: 10,
  studentName: 'Kunal Shah',
  studentEmail: 'kunal.s@university.edu',
  subject: 'Profile Access Error',
  message: 'I get a “403 Forbidden” error when trying to view my own profile details.',
  priority: 'high',
  status: 'pending',
  submittedAt: '2024-06-22 09:45',
  category: 'authentication'
}
    ],
notices: [
  {
    id: 1,
    title: 'System Maintenance Scheduled',
    message: 'The learning platform will be under maintenance on June 25th from 2 AM to 4 AM.',
    type: 'warning',
    isActive: true,
    createdAt: '2024-06-20 10:00',
    expiresAt: '2024-06-25 23:59'
  },
  {
    id: 2,
    title: 'New batch Available',
    message: 'Advanced AI and Machine Learning batch is now available for enrollment.',
    type: 'success',
    isActive: true,
    createdAt: '2024-06-19 15:30',
    expiresAt: '2024-07-01 23:59'
  },
  {
    id: 3,
    title: 'Assignment Deadline Reminder',
    message: 'All pending assignments for React Development batch are due by June 30th.',
    type: 'info',
    isActive: true,
    createdAt: '2024-06-18 11:20',
    expiresAt: '2024-06-30 23:59'
  }
]
  });


  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle logout
  const handleLogout = () => {
    console.log('Admin logout clicked');
    // Will integrate with auth logic
  };

  // Tab switching with smooth animation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // User management functions
  const handleUserAction = (user, action) => {
    console.log(`${action} user:`, user);
    // Will integrate with backend API
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
      pending: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300',
      inactive: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300',
      draft: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      resolved: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
      'in-responses': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300'
    };
    return `px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${styles[status] || styles.active}`;
  };


  // Get notice type styling
  const getNoticeTypeStyles = (type) => {
    const styles = {
      warning: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
      success: 'bg-gradient-to-r from-green-400 to-emerald-400 text-white',
      info: 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white',
      danger: 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
    };
    return styles[type] || styles.info;
  };

  // Filter users based on search
  const filteredUsers = dashboardData.users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

// Helper function to get category icon - shows different icons for different report categories
  const getCategoryIcon = (category) => {
    const icons = {
      technical: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      academic: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      financial: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    };
    return icons[category] || icons.technical;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
              </div>
            </div>

            {/* Admin profile and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-medium">
                    {admin.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                </div>
              </div>
              {/* Enhanced logout button with tooltip */}
              <div className="relative">
                <button
                  onClick={handleLogout}
                  onMouseEnter={() => setShowLogoutTooltip(true)}
                  onMouseLeave={() => setShowLogoutTooltip(false)}
                  className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110 p-2 rounded-full hover:bg-red-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                {/* Tooltip */}
                {showLogoutTooltip && (
                  <div className="absolute right-0 top-12 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg transform transition-all duration-200 animate-fade-in">
                    Logout
                    <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs with smooth transitions */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: 'chart' },
              { id: 'users', name: 'User Management', icon: 'users' },
              { id: 'settings', name: 'System Management', icon: 'cog' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 bg-gradient-to-t from-indigo-50 to-transparent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content with smooth transitions */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="transition-all duration-500 ease-in-out">
            {/* Overview Tab  */}
          {activeTab === 'overview' && (
              <Overview/>
          )}

          {/* Batch Management */}
          {activeTab === 'users' && (
            <Users/>
          )}

          {activeTab === 'settings' && (
            <Settings/>
          )}
        </div>
      </main>
    </div>
  )
          
}
export default AdminDashboard;
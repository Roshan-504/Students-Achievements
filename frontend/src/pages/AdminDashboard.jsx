import React, { useState, useEffect } from 'react';
import '../App.css';
import Overview from '../components/Overview';
import Users from '../components/Users';
import Settings from '../components/Settings';
import axiosInstance from '../services/axiosInstance';

const AdminDashboard = () => {
  // State for dashboard data and UI controls
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);
  const [contactMessages, setContactMessages] = useState([]);

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
  // Fetch contact messages when settings tab is active
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeTab === 'settings') {
        try {
          const response = await axiosInstance.get('/contact-us/messages');
          setContactMessages(response.data.data);
        } catch (error) {
          console.error('Failed to fetch contact messages:', error);
        }
      }
    };
    
    fetchMessages();
  }, [activeTab]);
  // Admin user data
  const [admin, setAdmin] = useState({
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'System Administrator',
    avatar: null
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

  const updateMessageStatus = async (id, status) => {
    try {
      await axiosInstance.patch(`/contact-us/message/${id}`, { status });
      setContactMessages(prev => prev.map(msg => 
        msg._id === id ? { ...msg, status } : msg
      ));
    } catch (error) {
      console.error('Failed to update message status:', error);
    }
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
            <Settings 
              contactMessages={contactMessages} 
              updateMessageStatus={updateMessageStatus} 
            />
          )}
        </div>
      </main>
    </div>
  )
          
}
export default AdminDashboard;
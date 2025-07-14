import React, { useState, useEffect } from 'react';
import '../App.css';
import Overview from '../components/Overview';
import Users from '../components/Users';
import Settings from '../components/Settings';
import axiosInstance from '../services/axiosInstance';
import { useAuthStore } from '../context/authStore';
import { LogOut } from 'lucide-react';

const AdminDashboard = () => {
  // State for dashboard data and UI controls
  const { user, logout } = useAuthStore();
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);
  const [contactMessages, setContactMessages] = useState([]);

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
      {/* Top Navbar */}
        <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-50 transition-all duration-300 ease-in-out">
          <div className="max-w-full mx-auto px-6 sm:px-10 lg:px-15 h-16 flex justify-between items-center">

            <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing for smaller screens */}
              {/* Dashboard Title - Consistent branding */}
              <div className="ml-2">
                <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  Admin Dashboard
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

      {/* Navigation tabs with smooth transitions */}
      <div className="bg-white border-b mt-16 border-gray-200 shadow-sm">
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
      </div>

      {/* Main content with smooth transitions */}
      <main className="pb-5 px-4 sm:px-6 lg:px-8 mt-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto"> {/* Add container with max-width */}
          <div className="relative">
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
          </div>
        </div>
      </main>
    </div>
  )
          
}
export default AdminDashboard;
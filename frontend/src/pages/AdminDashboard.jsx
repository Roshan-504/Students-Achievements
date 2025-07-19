import React, { useState, useEffect } from 'react';
import '../App.css';
import { ChevronRight, Users, FileText, Database, LogOut } from 'lucide-react';
import FilterPanel from '../components/FilterPanel';
import Users1 from '../components/Users';
import Settings from '../components/Settings';
import axiosInstance from '../services/axiosInstance';
import { useAuthStore } from '../context/authStore';
import Visuals from '../components/Visuals';
import Footer from '../components/Footer';
import FilterStudentActivities from '../components/FilterStudentActivities';
import FacultyDashboard from './FacultyDashboard';
import BatchManagementPage from './Batch';
const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('Student Activities');
  const [contactMessages, setContactMessages] = useState([]);

  const tabs = [
    { 
      name: 'Student Activities', 
      component: FacultyDashboard,
      icon: Database,
      props: {
      }
    },
    { 
      name: 'Manage Users', 
      component: Users1,
      icon: Users,
      props: {}
    },
    { 
      name: 'Manage Table', 
      component: BatchManagementPage,
      icon: Users,
      props: {}
    },
    { 
      name: 'Student Reports', 
      component: Settings,
      icon: FileText,
      props: {
      }
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const activeTabData = tabs.find(tab => tab.name === activeTab);
  const ActiveComponent = activeTabData?.component;
  const componentProps = activeTabData?.props || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-50 transition-all duration-300 ease-in-out">
        <div className="max-w-full mx-auto px-6 sm:px-10 lg:px-15 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="ml-2">
              <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Admin Dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative group">
              <div className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {(imgError || !user?.pic) ? (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm sm:text-base">
                    {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                  </div>
                ) : (
                  <img
                    src={user.pic}
                    alt="Profile"
                    title={user?.firstName + ' ' + user?.lastName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-300 group-hover:border-blue-500 transition-all duration-200"
                    onError={() => setImgError(true)}
                    referrerPolicy="no-referrer"
                  />
                )}
                <p className='text-sm sm:text-base font-medium text-gray-800 hidden md:block'>{user?.firstName + " " + user?.lastName}</p>
              </div>
            </div>
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

      {/* Tab Navigation */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`min-w-max
                      relative flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap
                      transition-all duration-300 ease-in-out
                      ${activeTab === tab.name
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                    {activeTab === tab.name && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300 ease-in-out" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-opacity duration-300 ease-in-out">
          {ActiveComponent && <ActiveComponent {...componentProps} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

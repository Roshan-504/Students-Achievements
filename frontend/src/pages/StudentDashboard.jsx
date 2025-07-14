import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, ChevronRight, Calendar, SquareChartGantt, Settings, Contact, Phone } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import Footer from '../components/Footer';


const StudentDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [profileTooltip, setProfileTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredAlertId, setHoveredAlertId] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const animationRef = useRef(null);
  const containerRef = useRef(null);


  useEffect(() => {
    const animate = () => {
      if (!isHovered && !hoveredAlertId && containerRef.current) {
        setScrollPosition(prev => {
          const newPos = prev + 0.5;
          const maxScroll = containerRef.current.scrollHeight / 2;
          return newPos >= maxScroll ? 0 : newPos;
        });
      }
    };

    if (!isHovered && !hoveredAlertId) {
      animationRef.current = setInterval(animate, 16);
    } else {
      clearInterval(animationRef.current);
    }

    return () => clearInterval(animationRef.current);
  }, [isHovered, hoveredAlertId]);

  // Event handlers
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/student/personal-info');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-50 transition-all duration-300 ease-in-out">
  <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 h-16 flex justify-between items-center">

    {/* Left Section: Sidebar Toggle + Dashboard Title */}
    <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing for smaller screens */}
      {/* Sidebar Toggle Button - Always visible for quick access */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Dashboard Title - Consistent branding */}
      <div className="ml-2">
        <NavLink to="/student/" className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
          Student Dashboard
        </NavLink>
      </div>
    </div>

    {/* Right Section: User Profile + Logout */}
    <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing */}
      {/* User Profile Button */}
      <div className="relative group">
        <button
          onClick={handleProfileClick}
          className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onMouseEnter={() => setProfileTooltip(true)}
          onMouseLeave={() => setProfileTooltip(false)}
          aria-expanded={profileTooltip}
          aria-haspopup="true"
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
        </button>
        {profileTooltip && ( /* Keep tooltip for all screen sizes */
          <div className="absolute right-0 top-full mt-2 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-xl z-10 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out translate-y-2">
            <div className="text-base font-semibold">{user.firstName +" "+ user.lastName}</div>
            <div className="text-sm text-gray-300">ID: {user.email}</div>
            <div className="absolute -top-1 right-6 w-3 h-3 bg-gray-800 transform rotate-45"></div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="p-2 cursor-pointer rounded-lg flex items-center text-white hover:text-gray-100 bg-red-600 hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium touch-manipulation"
        aria-label="Logout"
      >
        <LogOut size={16} className="sm:mr-1" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  </div>
</nav>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
} pt-16 border-r border-gray-200`}> {/* Added shadow-xl and border-r */}
  <div className="h-full overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar class */}
    <div className="p-6 space-y-2"> {/* Adjusted padding and added space-y */}

      {/* Activities Section */}
      <div className="relative"> {/* Added relative for potential future additions */}
        <div className='flex items-center justify-between w-full px-4 py-3 rounded-lg text-lg font-medium transition-all duration-250 ease-in-out'>
          <div className="flex items-center">
            <SquareChartGantt className="mr-3 text-blue-500" size={20} /> {/* Colored icon, more margin */}
            Activities
          </div>
        </div>

        <div className="space-y-1 py-2 text-sm text-gray-600 ml-8 border-l border-gray-200 mt-1 animate-in slide-in-from-top-1 fade-in duration-200"> {/* Adjusted margin, added border-l, fade-in */}
            <NavLink
              to="/student/internships"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Internships
            </NavLink>
            <NavLink
              to="/student/tech-activities"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Tech Activities
            </NavLink>
            <NavLink
              to="/student/non-tech-activities"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Non-Tech Activities
            </NavLink>
            <NavLink
              to="/student/paper-publications"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Paper Publications
            </NavLink>
            <NavLink
              to="/student/entrepreneurship"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Entrepreneurship/Projects
            </NavLink>
            <NavLink
              to="/student/courses"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Courses/Certifications
            </NavLink>
            <NavLink
              to="/student/volunteering"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Volunteering
            </NavLink>
            <NavLink
              to="/student/workshop"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Workshops
            </NavLink>
            <NavLink
              to="/student/achievements"
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              Other Achievements
            </NavLink>
          </div>
      </div>

      {/* Semesters */}
      <NavLink
        to="/student/contact-us"
        className={({ isActive }) =>
          `flex items-center w-full px-4 py-3 rounded-lg text-lg font-medium transition-all duration-250 ease-in-out ${
            isActive
              ? 'text-blue-700 bg-blue-100 shadow-sm'
              : 'text-gray-800 hover:text-blue-700 hover:bg-blue-50'
          }`
        }
      >
        <Phone className="mr-3 text-blue-500" size={20} /> {/* Colored icon, more margin */}
        Contact Us
      </NavLink>
    </div>
  </div>
</div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <main className="pt-16 pb-5 px-4 sm:px-6 lg:px-8 mt-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* <div className="max-w-7xl mx-auto"> */}
          <div className="relative">            
            {/* Activity Content */}
            <div className="transition-all duration-300 ease-in-out">
              <Outlet />
            </div>
          {/* </div> */}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;
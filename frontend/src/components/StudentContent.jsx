import React, { useState, useEffect, useRef } from 'react';
import {  Bell, Clock, AlertCircle} from 'lucide-react';
import { useAuthStore } from '../context/authStore';



const StudentContent = () => {
  const {user} = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredAlertId, setHoveredAlertId] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const animationRef = useRef(null);
  const containerRef = useRef(null);
  
  // Mock data
const studentData = {
    name: "Alex Johnson",
    studentId: "STU2024001",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    lastLogin: "2024-06-21 09:30 AM",
    semester: "Spring 2024",
    gpa: "3.85"
  };

  const alerts = [
    {
      id: 1,
      type: "deadline",
      title: "Profile Section not Completed!",
      message: "Some of the Section of your profile are still pending. Please Kindly update them!",
      priority: "high",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "info",
      title: "Activity Inforamtion not updated",
      message: "You have not updated your presence!",
      priority: "medium",
      time: "1 day ago"
    },
    {
      id: 3,
      type: "event",
      title: "Internship Proof",
      message: "You have not uploaded any proof of the Internship. If you have recieved any proof kindly please update it!",
      priority: "low",
      time: "1 week ago"
    }
  ];


  const duplicatedAlerts = [...alerts, ...alerts];

  // Animation logic with precise position control
  useEffect(() => {
    const animate = () => {
      if (!isHovered && !hoveredAlertId && containerRef.current) {
        setScrollPosition(prev => {
          const newPos = prev + 0.5; // Smooth scroll speed
          // Reset when we've scrolled through half the content (since we duplicated)
          const maxScroll = containerRef.current.scrollHeight / 2;
          return newPos >= maxScroll ? 0 : newPos;
        });
      }
    };

    if (!isHovered && !hoveredAlertId) {
      animationRef.current = setInterval(animate, 16); // ~60fps
    } else {
      clearInterval(animationRef.current);
    }

    return () => clearInterval(animationRef.current);
  }, [isHovered, hoveredAlertId]);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-400 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200';
      case 'medium':
        return 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200';
      case 'low':
        return 'border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200';
      default:
        return 'border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200';
    }
  };
    return (
        <>
        {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome back, {user.firstName + " " + user.lastName}! 👋
        </h1>
        <p className="text-blue-100 flex items-center">
          <Clock className="mr-2" size={16} />
          Last login: {studentData.lastLogin}
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts Section */}
        <div className="lg:col-span-2 ">
          <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Bell className="mr-2 text-orange-500" size={24} />
                Important Alerts & Deadlines
            </h2>
    
            {/* Animated Alerts Container */}
            <div 
              className="relative h-80 overflow-hidden rounded-lg bg-gradient-to-b from-gray-50 to-white"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setHoveredAlertId(null);
              }}
            >
              {/* Smooth gradient overlays for seamless visual transition */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
              
              {/* Moving Alerts Container */}
              <div 
                ref={containerRef}
                className="flex flex-col"
                style={{
                  transform: `translateY(-${scrollPosition}px)`,
                  transition: (isHovered || hoveredAlertId) ? 'none' : 'transform 0.016s linear',
                }}
              >
                {duplicatedAlerts.map((alert, index) => (
                  <div
                    key={`${alert.id}-${index}`}
                    className={`
                      border-l-4 rounded-lg p-4 m-2 transition-all duration-300 
                      transform cursor-pointer relative
                      ${getPriorityColor(alert.priority)}
                      ${hoveredAlertId === alert.id 
                        ? 'shadow-2xl z-20 ring-4 ring-opacity-50 ring-offset-2 ring-offset-white' +
                          (alert.priority === 'high' ? ' ring-red-300' :
                          alert.priority === 'medium' ? ' ring-yellow-300' : ' ring-blue-300')
                        : hoveredAlertId 
                        ? 'opacity-40 scale-95' 
                        : 'hover:scale-105 hover:shadow-xl opacity-100'
                      }
                    `}
                    style={{
                      minHeight: '120px',
                      backdropFilter: 'blur(10px)',
                    }}
                    onMouseEnter={() => setHoveredAlertId(alert.id)}
                    onMouseLeave={() => setHoveredAlertId(null)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                          {alert.title}
                        </h3>
                        <p className="text-gray-600 text-xs mb-2 leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={12} className="mr-1" />
                          {alert.time}
                        </div>
                      </div>
                      <AlertCircle 
                        size={18} 
                        className={`ml-4 flex-shrink-0 transition-colors duration-300 ${
                          alert.priority === 'high' ? 'text-red-500' :
                          alert.priority === 'medium' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} 
                      />
                    </div>
                    
                    {/* Priority indicator dot */}
                    <div className="absolute top-2 right-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          alert.priority === 'high' ? 'bg-red-400 shadow-red-200' :
                          alert.priority === 'medium' ? 'bg-yellow-400 shadow-yellow-200' :
                          'bg-blue-400 shadow-blue-200'
                        } shadow-lg animate-pulse`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    )
}

export default StudentContent;
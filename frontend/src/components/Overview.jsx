import React, { useState, useEffect } from 'react';

const Overview = () => {
    const [admin, setAdmin] = useState({
        name: 'Admin User',
        email: 'admin@university.edu',
        role: 'System Administrator',
        avatar: null
      });
    
    const [dashboardData, setDashboardData] = useState({
          stats: {
            totalStudents: 1247,
            activeCourses: 24,
            totalInstructors: 58,
            pendingApprovals: 12
          },
          recentActivities: [
            { id: 1, type: 'user_registered', description: 'New student registration: Sarah Johnson', time: '10 minutes ago', priority: 'normal' },
            { id: 2, type: 'course_created', description: 'Batch "Advanced AI" created by Dr. Smith', time: '2 hours ago', priority: 'normal' },
            { id: 3, type: 'system_alert', description: 'Database backup completed successfully', time: '4 hours ago', priority: 'low' },
            { id: 4, type: 'security_alert', description: 'Multiple failed login attempts detected', time: '6 hours ago', priority: 'high' }
          ],
          users: [
            { id: 1, name: 'John Doe', email: 'john.doe@university.edu', role: 'student', status: 'active', lastLogin: '2024-06-18', courses: 4 },
            { id: 2, name: 'Sarah Johnson', email: 'sarah.j@university.edu', role: 'student', status: 'pending', lastLogin: 'Never', courses: 0 },
            { id: 3, name: 'Michael Smith', email: 'dr.smith@university.edu', role: 'instructor', status: 'active', lastLogin: '2024-06-17', courses: 3 },
            { id: 4, name: 'Emma Wilson', email: 'emma.w@university.edu', role: 'student', status: 'inactive', lastLogin: '2024-06-10', courses: 2 },
            { id: 5, name: 'Lisa Chen', email: 'prof.chen@university.edu', role: 'student', status: 'active', lastLogin: '2024-06-18', courses: 5 }
          ],
          courses: [
            { id: 1, name: 'Advanced React Development', instructor: 'Dr. Smith', students: 45, status: 'active', progress: 67 },
            { id: 2, name: 'Database Systems', instructor: 'Prof. Chen', students: 38, status: 'active', progress: 82 },
            { id: 3, name: 'Machine Learning Basics', instructor: 'Dr. Johnson', students: 52, status: 'active', progress: 45 },
            { id: 4, name: 'Web Security', instructor: 'Prof. Williams', students: 29, status: 'draft', progress: 0 }
          ],
          // New data for System Management
          studentReports: [
        {
          id: 1,
          studentName: 'John Doe',
          studentEmail: 'john.doe@university.edu',
          subject: 'Course Access Issue',
          message: 'I cannot access the Advanced React Development course materials. The login keeps failing.',
          priority: 'high',
          status: 'pending',
          submittedAt: '2024-06-20 14:30',
          category: 'technical'
        },
        {
          id: 2,
          studentName: 'Sarah Johnson',
          studentEmail: 'sarah.j@university.edu',
          subject: 'Assignment Submission Problem',
          message: 'My assignment was submitted on time but shows as late in the system.',
          priority: 'medium',
          status: 'resolved',
          submittedAt: '2024-06-19 09:15',
          category: 'academic'
        },
        {
          id: 3,
          studentName: 'Emma Wilson',
          studentEmail: 'emma.w@university.edu',
          subject: 'Payment Query',
          message: 'I need clarification about the course fee payment deadline.',
          priority: 'low',
          status: 'in-progress',
          submittedAt: '2024-06-18 16:45',
          category: 'financial'
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
          title: 'New Course Available',
          message: 'Advanced AI and Machine Learning course is now available for enrollment.',
          type: 'success',
          isActive: true,
          createdAt: '2024-06-19 15:30',
          expiresAt: '2024-07-01 23:59'
        },
        {
          id: 3,
          title: 'Assignment Deadline Reminder',
          message: 'All pending assignments for React Development course are due by June 30th.',
          type: 'info',
          isActive: true,
          createdAt: '2024-06-18 11:20',
          expiresAt: '2024-06-30 23:59'
        }
      ]
        });
    const [isLoaded, setIsLoaded] = useState(false);

    const getPriorityStyles = (priority) => {
    const styles = {
      high: 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-100',
      normal: 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-100',
      low: 'border-l-green-500 bg-gradient-to-r from-green-50 to-green-100'
    };
    return styles[priority] || styles.normal;
  };
    return(
        

        <div className="space-y-8 animate-fade-in">
              {/* Welcome section with gradient background */}
              <div className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back, {admin.name.split(' ')[0]}! 🚀
                </h2>
                <p className="text-indigo-100 text-lg">Here's your system overview and recent activities.</p>
              </div>

              {/* Enhanced stats grid with gradients */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 delay-200 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {[
                  { label: 'Total Students', value: dashboardData.stats.totalStudents, gradient: 'from-blue-400 to-blue-600', icon: 'users' },
                  { label: 'Active Batches', value: dashboardData.stats.activeCourses, gradient: 'from-green-400 to-green-600', icon: 'book' },
                  { label: 'Instructors', value: dashboardData.stats.totalInstructors, gradient: 'from-purple-400 to-purple-600', icon: 'academic' },
                  { label: 'Pending Approvals', value: dashboardData.stats.pendingApprovals, gradient: 'from-yellow-400 to-orange-500', icon: 'clock' }
                ].map((stat, index) => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}>
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {stat.icon === 'users' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />}
                          {stat.icon === 'book' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
                          {stat.icon === 'academic' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />}
                          {stat.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced recent activities */}
              <div className={`transition-all duration-1000 delay-400 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent System Activities</h3>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className={`p-6 border-l-4 ${getPriorityStyles(activity.priority)} ${activity.id !== dashboardData.recentActivities[dashboardData.recentActivities.length - 1].id ? 'border-b border-gray-100' : ''} hover:shadow-md transition-all duration-200`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                          activity.priority === 'high' ? 'bg-gradient-to-r from-red-400 to-red-600 text-white' :
                          activity.priority === 'normal' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                          'bg-gradient-to-r from-green-400 to-green-600 text-white'
                        }`}>
                          {activity.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
    )
}

export default Overview;
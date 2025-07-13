import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Bug, 
  HelpCircle, 
  MessageSquare, 
  Star, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Mail,
  User,
  Calendar
} from 'lucide-react';
import '../App.css';

const Settings = ({ contactMessages, updateMessageStatus }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
      }, []);
        const [isLoaded, setIsLoaded] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const [showNoticeModal, setShowNoticeModal] = useState(false);
        const [editingNotice, setEditingNotice] = useState(null);
        const [newNotice, setNewNotice] = useState({ title: '', content: '', type: 'info' });

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
            // Contact us form filled by student that data will be displayed here
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
                  message: 'The Student platform will be under maintenance on June 25th from 2 AM to 4 AM.',
                  type: 'warning',
                  isActive: true,
                  createdAt: '2024-06-20 10:00',
                  expiresAt: '2024-06-25 23:59'
                },
                {
                  id: 2,
                  title: 'Semester Deadline Reminder',
                  message: 'All pending Data for Current Semester should be filled by  Novemember 30th.',
                  type: 'info',
                  isActive: true,
                  createdAt: '2024-06-18 11:20',
                  expiresAt: '2024-06-30 23:59'
                },
                {
                  id: 3,
                  title: 'Proof Submission Deadline',
                  message: 'Please upload valid image or PDF proof for all achievements by July 5th.',
                  type: 'warning',
                  isActive: true,
                  createdAt: '2024-06-22 09:00',
                  expiresAt: '2024-07-05 23:59'
                },
                {
                  id: 4,
                  title: 'Update Your Profile',
                  message: 'Please ensure your personal and academic data is up to date before the next review cycle.',
                  type: 'info',
                  isActive: true,
                  createdAt: '2024-06-23 10:20',
                  expiresAt: '2024-07-07 23:59'
                },
                {
                  id: 5,
                  title: 'Non-Technical Events Recording Open',
                  message: 'You can now add non-technical activities (like volunteering or event participation) to your records.',
                  type: 'success',
                  isActive: true,
                  createdAt: '2024-06-24 14:15',
                  expiresAt: '2024-07-10 23:59'
                },
          ]
          });
        
      // Get status badge styling
      const getCategoryColor = (type) => {
  switch (type) {
    case 'bug':
      return 'bg-red-100 text-red-600 border-red-200';
    case 'feature':
      return 'bg-purple-100 text-purple-600 border-purple-200';
    case 'inquiry':
      return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'feedback':
      return 'bg-green-100 text-green-600 border-green-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
      };

      const getStatusConfig = (status) => {
        switch (status) {
          case 'new':
            return {
              color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
              icon: <Clock size={12} />,
              label: 'New'
            };
          case 'in-progress':
            return {
              color: 'bg-blue-100 text-blue-800 border-blue-300',
              icon: <AlertTriangle size={12} />,
              label: 'In Progress'
            };
          case 'resolved':
            return {
              color: 'bg-green-100 text-green-800 border-green-300',
              icon: <CheckCircle size={12} />,
              label: 'Resolved'
            };
          default:
            return {
              color: 'bg-gray-100 text-gray-800 border-gray-300',
              icon: <AlertCircle size={12} />,
              label: 'Unknown'
            };
        }
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
        const getCategoryIcon = (type) => {
          const icons = {
            suggestion: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
            report: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ),
            contact: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )
          };
          return icons[type] || icons.contact;
        };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">System Management</h2>
          <p className="text-gray-600 mt-1">Manage student reports, notices, and system settings</p>
        </div>
      </div>

      {/* Student Reports Section Contact Us form data should be displayed here */}
        <div className="flex space-x-6 overflow-x-auto pb-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {contactMessages.map((message) => (
          <div key={message._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-500 flex-shrink-0 w-96 transform hover:-translate-y-1">
            {/* Report Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl border ${getCategoryColor(message.type)} shadow-sm`}>
                  {getCategoryIcon(message.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-base mb-1 leading-tight">{message.subject}</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" size={20} />
            </div>

            {/* Student Info */}
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{message.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="text-gray-600" size={16} />
                </div>
                <p className="text-sm text-gray-600">{message.email}</p>
              </div>
            </div>

            {/* Report Message */}
            <div className="mb-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{message.message}</p>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusConfig(message.status).color}`}>
                  {getStatusConfig(message.status).icon}
                  <span>{getStatusConfig(message.status).label}</span>
                </div>
              </div>
              
              <select
                value={message.status}
                onChange={(e) => updateMessageStatus(message._id, e.target.value)}
                className="px-3 py-2 text-xs font-medium border-2 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        ))}
        </div>
        

      {/* Notices Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Active Notices
          </h3>
          <button 
            onClick={() => setShowNoticeModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Post Notice</span>
          </button>
        </div>

        {/* Notices List with Vertical Scroll */}
        <div className="max-h-96 overflow-y-auto pr-2">
          <div className="space-y-4">
            {dashboardData.notices.map((notice) => (
              <div key={notice.id} className={`rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-md flex-shrink-0 ${
                notice.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                notice.type === 'success' ? 'bg-green-50 border-green-200' :
                notice.type === 'error' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{notice.title}</h4>
                      <span className={getNoticeTypeStyles(notice.type)}>
                        {notice.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{notice.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {notice.createdAt}</span>
                      <span>Expires: {notice.expiresAt}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => {
                        setEditingNotice(notice);
                        setNewNotice({
                          title: notice.title,
                          message: notice.message,
                          type: notice.type
                        });
                        setShowNoticeModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-100 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-100 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      

      {/* System Settings Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Send email alerts to administrators</p>
            </div>
            <button className="bg-indigo-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
              <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-500">Temporarily disable user access</p>
            </div>
            <button className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
              <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Modal - This popup appears when creating/editing notices */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h3>
              <button
                onClick={() => {
                  setShowNoticeModal(false);
                  setEditingNotice(null);
                  setNewNotice({ title: '', message: '', type: 'info' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="space-y-4">
              {/* Notice Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter notice title..."
                />
              </div>
              
              {/* Notice Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newNotice.type}
                  onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              
              {/* Notice Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newNotice.message}
                  onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter notice message..."
                />
              </div>
              
              {/* Modal Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoticeModal(false);
                    setEditingNotice(null);
                    setNewNotice({ title: '', message: '', type: 'info' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  {editingNotice ? 'Update Notice' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, X } from 'lucide-react';

/**
 * UserManagementContent Component
 * Contains the user management table and functionality
 * This component will be displayed inside the popup modal
 */
const Userdetails = ({ onExit }) => {
  // Sample user data - replace with your actual data
  const [users] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastLogin: '2024-01-15',
      batchs: '2023_A_INFT'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      lastLogin: '2024-01-14',
      batchs: '2023_B_INFT'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      lastLogin: '2024-01-10',
      batchs: '2023_C_INFT'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      lastLogin: '2024-01-16',
      batchs: '2023_B_INFT'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Get status badge stylin

  // Handle user actions
  const handleUserAction = (user, action) => {
    console.log(`${action} action for user:`, user);
    // Implement your action logic here
    switch (action) {
      case 'view':
        alert(`Viewing user: ${user.name}`);
        break;
      case 'edit':
        alert(`Editing user: ${user.name}`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
          alert(`Deleting user: ${user.name}`);
        }
        break;
      default:
        break;
    }
  };

  // Handle exit button click
  const handleExit = () => {
    if (onExit && typeof onExit === 'function') {
      onExit();
    } else {
      console.warn('No onExit callback provided');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                transition-all duration-200
              "
            />
          </div>

          
        </div>

        <button 
          onClick={handleExit}
          className="
            inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-600 to-red-700
            text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            transition-all duration-200 shadow-lg hover:shadow-xl
          "
        >
          <X size={20} />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
               
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-900">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(user.status)}>{user.status}</span>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.batchs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLogin}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleUserAction(user, 'view')}
                        className="
                          p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 
                          rounded-lg transition-all duration-200
                        "
                        title="View User"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleUserAction(user, 'edit')}
                        className="
                          p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 
                          rounded-lg transition-all duration-200
                        "
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleUserAction(user, 'delete')}
                        className="
                          p-2 text-red-600 hover:text-red-900 hover:bg-red-50 
                          rounded-lg transition-all duration-200
                        "
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg font-medium">No users found</div>
            <div className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="font-medium">Total Users:</span>
          <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
            {users.length}
          </span>
        </div>
        <div className="flex items-center">
          <span className="font-medium">Showing:</span>
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
            {filteredUsers.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Userdetails;
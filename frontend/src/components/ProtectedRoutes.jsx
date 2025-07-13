import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import AdminDashboard from '../pages/AdminDashboard';
const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading, checkAuth } = useAuthStore();
  
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (loading) return (<div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>)
      
    if (!user) return <Navigate to="/login" replace />;
    if (roles.length && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
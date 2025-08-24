import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import AdminDashboard from '../pages/AdminDashboard';
import { Loader2 } from 'lucide-react';
const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading, checkAuth } = useAuthStore();
  
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        </div>
    )
      
    if (!user) return <Navigate to="/login" replace />;
    if (roles.length && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
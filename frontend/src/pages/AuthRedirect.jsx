import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { checkAuth, user, loading } = useAuthStore();

  // 1. Call checkAuth only once on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // 2. React to changes in `user` after it's updated
  useEffect(() => {
    if (loading) return;

    if (user?.role === 'student') navigate('/student');
    else if (user?.role === 'faculty') navigate('/faculty');
    else if (user?.role === 'admin') navigate('/admin');
    else navigate('/login');
  }, [user, loading]); // <- depend on both user and loading

  return (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
  );
};

export default AuthRedirect;

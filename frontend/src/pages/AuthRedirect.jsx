import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { Loader2 } from 'lucide-react';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setToken, user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    
    if (token) {
      // 1. Store token in localStorage
      localStorage.setItem('jwt', token);
      
      // 2. Update auth store
      setToken(token);
      
      // 3. Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // 4. Immediately check auth
      checkAuth().then(() => {
        // This ensures we wait for auth check to complete
      });
    } else {
      // If no token, check if we're already authenticated
      checkAuth();
    }
  }, []);

  // Handle redirection after auth check completes
  useEffect(() => {
    if (loading) return;

    if (user?.role === 'student') navigate('/student', { replace: true });
    else if (user?.role === 'faculty') navigate('/faculty', { replace: true });
    else if (user?.role === 'admin') navigate('/admin', { replace: true });
    else navigate('/login', { replace: true });
  }, [user, loading]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
    </div>
  );
};

export default AuthRedirect;
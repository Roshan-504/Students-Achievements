import { useAuthStore } from "../context/authStore";
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from "react-hot-toast";
import { useEffect } from "react";

const LoginPage = () => {
  const { loginWithGoogle } = useAuthStore();

  const [params] = useSearchParams();
  const error = params.get('error');

  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const message = getErrorMessage();
      if (message) toast.error(message);

      const timer = setTimeout(() => {
        navigate('/login', { replace: true }); // removes query string
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const getErrorMessage = () => {
    if (error === 'invalid-email') return 'Only VES email accounts are allowed.';
    if (error === 'not-registered') return 'You are not registered in the system.';
    if (error === 'unauthorized') return 'Login failed. Please try again.';
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 text-center">
          {getErrorMessage() && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">
              {getErrorMessage()}
            </div>
          )}
          <img 
            src={""} 
            alt="VES Logo" 
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Student Achievements Portal
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in with your institutional account
          </p>
          
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-[#4285F4] hover:bg-[#357ABD] text-white py-2 px-4 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Only @ves.ac.in email addresses are permitted
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
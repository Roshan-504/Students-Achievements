import { useAuthStore } from "../context/authStore";
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from "react-hot-toast";
import { useEffect } from "react";
import vesLogo from '../assets/ves_logo.png'
import googloLogo from '../assets/google_logo.svg'

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
    <div className="min-h-screen flex items-center justify-center bg-[#f9f6f1] px-4">
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-xl max-w-4xl w-full overflow-hidden">
        
        {/* Illustration on top (mobile) and right (desktop) */}
        <div className="flex md:flex-1 items-center justify-center bg-[#f4b400] p-6 md:p-0">
          <img
            src={vesLogo}
            alt="Illustration"
            className="max-h-48 sm:max-h-56 md:max-h-64"
          />
        </div>

        {/* Login form below on mobile and left on desktop */}
        <div className="flex-1 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center space-y-6">
          {/* Institute logo */}
          {getErrorMessage() && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">
              {getErrorMessage()}
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Student Achievements Portal</h2>
          <p className="text-gray-500 text-xs sm:text-sm text-center">Sign in with your institutional account</p>

          <div className="flex items-center gap-2 sm:gap-4 text-gray-400 text-xs w-full">
            <hr className="flex-1 border-gray-200" /> Sign in with Google <hr className="flex-1 border-gray-200" />
          </div>

          <button
            onClick={loginWithGoogle}
            className="border border-gray-300 rounded-md px-4 py-2 sm:py-3 hover:bg-gray-50 flex items-center gap-2"
          >
            <img src={googloLogo} alt="Google logo" className="w-5 h-5" />
            <span className="text-sm text-gray-700">Continue with Google</span>
          </button>

          <p className="text-xs sm:text-sm text-red-600 mt-2 text-center">
            Only <span className="font-medium">@ves.ac.in</span> email addresses are permitted
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

const NotFoundPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">The page you're looking for doesn't exist.</p>
      {user ? (
        <Link
          to={
            user.role === 'student'
              ? '/student'
              : user.role === 'faculty'
              ? '/faculty'
              : '/admin'
          }
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
        >
          Go to Dashboard
        </Link>
      ) : (
        <Link to="/login" className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">
          Log In
        </Link>
      )}
    </div>
  );
};

export default NotFoundPage;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
// import FacultyDashboard from './pages/FacultyDashboard';
import ProtectedRoute from './components/ProtectedRoutes';
import StudentDashboard from './pages/StudentDashboard';
import AuthRedirect from './pages/AuthRedirect';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import FacultyDashboard from './pages/FacultyDashboard';
import FilterTest from './pages/FilterTest';
import StudentContent from './components/StudentContent';
import CardContainer from './components/CardContainer';
import StudentProfile from './components/StudentProfile';
import InternshipPage from './pages/Activities/InternshipPage';
import TechnicalActivityPage from './pages/Activities/TechnicalActivityPage';
import NonTechnicalActivityPage from './pages/Activities/NonTechnicalActivityPage';
import PaperPublicationsPage from './pages/Activities/PaperPublicationsPage';
import EntrepreneurshipProjectPage from './pages/Activities/EntrepreneurshipProjectsPage';
import CertificationPage from './pages/Activities/CertificationPage';
import VolunteeringPage from './pages/Activities/VolunteeringPage';
import WorkshopsPage from './pages/Activities/WorshopsPage';
import OtherAchievements from './pages/Activities/OtherAchievements';
import ContactForm from './forms/ContactForm';
import { useAuthStore } from './context/authStore';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';


function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // ✅ Run once when app loads
  }, []);
  return (
    <>
    <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
          },
          duration: 4000,
          loading: {
            iconTheme: {
              primary: '#3B82F6', // blue-500
              secondary: 'white',
            },
          }
        }}
    />

      <Routes>
        <Route path="/" element={<AuthRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<h1> Unauthorized</h1>} />
        <Route path="/auth/redirect" element={<AuthRedirect />} />
        
        <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>}>
          <Route index element={<><StudentContent /><CardContainer /></>} />
          <Route path="personal-info" element={<StudentProfile />} />
          <Route path="internships" element={<InternshipPage />} />
          <Route path="tech-activities" element={<TechnicalActivityPage />} />
          <Route path="non-tech-activities" element={<NonTechnicalActivityPage />} />
          <Route path="paper-publications" element={<PaperPublicationsPage />} />
          <Route path="entrepreneurship" element={<EntrepreneurshipProjectPage />} />
          <Route path="courses" element={<CertificationPage />} />
          <Route path="volunteering" element={<VolunteeringPage />} />
          <Route path="workshop" element={<WorkshopsPage />} />
          <Route path="achievements" element={<OtherAchievements />} />
          <Route path="semesters" element={
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Semesters</h2>
              <p className="text-gray-600">Semesters content will be displayed here...</p>
            </div>
          } />
          <Route path="contact-us" element={<ContactForm />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        
        <Route path="/faculty" element={
          <ProtectedRoute roles={['faculty']}>
            <FacultyDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
    </>
  );
}

export default App;
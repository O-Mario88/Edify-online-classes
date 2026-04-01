import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { CourseCatalog } from './pages/CourseCatalog';
import { CourseDetail } from './pages/CourseDetail';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ForumPage } from './pages/ForumPage';
import { LiveSessionsPage } from './pages/LiveSessionsPage';
import { PaymentPage } from './pages/PaymentPage';
import LearningPathPage from './pages/LearningPathPage';
import ProjectsPage from './pages/ProjectsPage';
import AITeachingAssistant from './pages/AITeachingAssistant';
import PeerTutoringPage from './pages/PeerTutoringPage';
import MarketplacePage from './pages/MarketplacePage';
import InstitutionManagementPage from './pages/InstitutionManagementPage';
import ExamRegistrationPage from './pages/ExamRegistrationPage';
import PlatformAnalyticsPage from './pages/PlatformAnalyticsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CourseCatalog />} />
          <Route path="courses/:gradeId/:termId/:subjectId" element={<CourseDetail />} />
          <Route path="forum/*" element={<ForumPage />} />
          <Route path="live-sessions" element={<LiveSessionsPage />} />
          <Route path="payment" element={<PaymentPage />} />
          
          {/* Hybrid Business Model Features */}
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="exam-registration" element={
            <ProtectedRoute allowedRoles={['universal_student']}>
              <ExamRegistrationPage />
            </ProtectedRoute>
          } />
          <Route path="institution-management" element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <InstitutionManagementPage />
            </ProtectedRoute>
          } />
          <Route path="platform-analytics" element={
            <ProtectedRoute allowedRoles={['platform_admin']}>
              <PlatformAnalyticsPage />
            </ProtectedRoute>
          } />
          
          {/* AI-Powered Features */}
          <Route path="learning-path" element={
            <ProtectedRoute allowedRoles={['universal_student']}>
              <LearningPathPage />
            </ProtectedRoute>
          } />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="peer-tutoring" element={<PeerTutoringPage />} />
          <Route path="ai-assistant" element={
            <ProtectedRoute allowedRoles={['independent_teacher', 'institution_admin']}>
              <AITeachingAssistant />
            </ProtectedRoute>
          } />
          
          {/* Dashboard Routes */}
          <Route path="dashboard/student" element={
            <ProtectedRoute allowedRoles={['universal_student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="dashboard/teacher" element={
            <ProtectedRoute allowedRoles={['independent_teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="dashboard/admin" element={
            <ProtectedRoute allowedRoles={['platform_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="dashboard/institution" element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <InstitutionManagementPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

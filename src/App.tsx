import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CourseCatalog } from './pages/CourseCatalog';
import { CourseDetail } from './pages/CourseDetail';
import { ClassSyllabusPage } from './pages/ClassSyllabusPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ForumPage } from './pages/ForumPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { SubjectTopicsPage } from './pages/SubjectTopicsPage';
import { LiveSessionsPage } from './pages/LiveSessionsPage';
import { PaymentPage } from './pages/PaymentPage';
import LearningPathPage from './pages/LearningPathPage';
import ProjectsPage from './pages/ProjectsPage';
import AITeachingAssistant from './pages/AITeachingAssistant';
import PeerTutoringHub from './pages/PeerTutoringHub';
import MarketplacePage from './pages/MarketplacePage';
import MarketplaceSubjectPage from './pages/MarketplaceSubjectPage';
import MarketplaceTopicPage from './pages/MarketplaceTopicPage';
import { InstitutionManagementPage } from './pages/InstitutionManagementPage';
import { InstitutionTimetableStudio } from './pages/InstitutionTimetableStudio';
import { AcademicLibraryPage } from './pages/AcademicLibraryPage';
import ExamRegistrationPage from './pages/ExamRegistrationPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ParentDashboard } from './pages/ParentDashboard';
import { TeacherLessonStudio } from './pages/TeacherLessonStudio';
import { AttendanceRegisterPage } from './pages/AttendanceRegisterPage';
import { PublicProfile } from './pages/PublicProfile';
import { TeacherStorefront } from './pages/TeacherStorefront';
import { TeacherMarksUpload } from './pages/TeacherMarksUpload';
import { AssignmentTargetingStudio } from './pages/AssignmentTargetingStudio';
import { NetworkStatusWidget } from './components/NetworkStatusWidget';
import { AITeacherCopilotWidget } from './components/copilot/AITeacherCopilotWidget';
import { DashboardRouter } from './components/DashboardRouter';
import { AICopilotProvider } from './contexts/AICopilotContext';
import { MissedSessionRecoveryPage } from './pages/MissedSessionRecoveryPage';
import { GlassDashboardLayout } from './components/dashboard/layout/GlassDashboardLayout';

function App() {
  return (
    <AuthProvider>
      <AICopilotProvider>
        <NetworkStatusWidget />
        <AITeacherCopilotWidget />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="classes" element={<CourseCatalog />} />
          <Route path="classes/:classId" element={<ClassSyllabusPage />} />
          <Route path="classes/:gradeId/:termId/:subjectId" element={<CourseDetail />} />
          <Route path="classes/:classId/subject/:subjectId" element={<SubjectTopicsPage />} />
          <Route path="classes/:classId/:termId/:subjectId/topic/:topicId" element={<TopicDetailPage />} />
          <Route path="forum/*" element={<ForumPage />} />
          <Route path="live-sessions" element={<LiveSessionsPage />} />
          <Route path="library" element={
            <ProtectedRoute allowedRoles={['student', 'parent', 'institution_teacher', 'universal_teacher', 'teacher', 'independent_teacher', 'institution_admin', 'platform_admin']}>
              <AcademicLibraryPage />
            </ProtectedRoute>
          } />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="p/:username" element={<PublicProfile />} />
          <Route path="t/:username" element={<TeacherStorefront />} />
          
          {/* Hybrid Business Model Features */}
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="marketplace/:country/:subjectId" element={<MarketplaceSubjectPage />} />
          <Route path="marketplace/:country/:subjectId/:classId/:topicId" element={<MarketplaceTopicPage />} />

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

          
          {/* AI-Powered Features */}
          <Route path="learning-path" element={
            <ProtectedRoute allowedRoles={['universal_student']}>
              <LearningPathPage />
            </ProtectedRoute>
          } />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="peer-tutoring" element={<PeerTutoringHub />} />
          <Route path="ai-assistant" element={
            <ProtectedRoute allowedRoles={['independent_teacher', 'institution_admin']}>
              <AITeachingAssistant />
            </ProtectedRoute>
          } />
          
          {/* Dashboard Routes */}
        </Route>
        
        {/* Year 2090 Premium Dashboard Routes */}
        <Route path="/dashboard" element={<GlassDashboardLayout />}>
          <Route index element={<DashboardRouter />} />
          <Route path="student" element={
            <ProtectedRoute allowedRoles={['universal_student', 'institution_student', 'student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="sessions/recover/:sessionId" element={
            <ProtectedRoute allowedRoles={['universal_student', 'parent', 'independent_teacher', 'institution_admin', 'institution_teacher']}>
              <MissedSessionRecoveryPage />
            </ProtectedRoute>
          } />
          <Route path="teacher" element={
            <ProtectedRoute allowedRoles={['institution_teacher', 'universal_teacher', 'independent_teacher', 'teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="teacher/class/:classId" element={
            <ProtectedRoute allowedRoles={['institution_teacher', 'universal_teacher', 'independent_teacher', 'teacher']}>
              <TeacherLessonStudio />
            </ProtectedRoute>
          } />
          <Route path="teacher/attendance" element={
            <ProtectedRoute allowedRoles={['institution_teacher', 'universal_teacher', 'independent_teacher', 'teacher']}>
              <AttendanceRegisterPage />
            </ProtectedRoute>
          } />
          <Route path="teacher/marks-upload" element={
            <ProtectedRoute allowedRoles={['institution_teacher', 'universal_teacher', 'independent_teacher', 'teacher']}>
              <TeacherMarksUpload />
            </ProtectedRoute>
          } />
          <Route path="teacher/targeting" element={
            <ProtectedRoute allowedRoles={['institution_teacher', 'universal_teacher', 'independent_teacher', 'teacher']}>
              <AssignmentTargetingStudio />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['platform_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="institution" element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <InstitutionManagementPage />
            </ProtectedRoute>
          } />
          <Route path="institution/timetable" element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <InstitutionTimetableStudio />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
      </AICopilotProvider>
    </AuthProvider>
  );
}

export default App;

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NetworkStatusWidget } from './components/NetworkStatusWidget';
import { DashboardRouter } from './components/DashboardRouter';
import { AICopilotProvider } from './contexts/AICopilotContext';
import { GlassDashboardLayout } from './components/dashboard/layout/GlassDashboardLayout';
import { Toaster } from './components/ui/sonner';

const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
// Dashboard placeholder pages for missing routes
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const InterventionsPage = lazy(() => import('./pages/InterventionsPage'));
const EarningsPage = lazy(() => import('./pages/EarningsPage'));
// InstitutionFinancePage removed — institutions no longer manage finance on platform

// Lazy-load all page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const CourseCatalog = lazy(() => import('./pages/CourseCatalog').then(m => ({ default: m.CourseCatalog })));
const CourseDetail = lazy(() => import('./pages/CourseDetail').then(m => ({ default: m.CourseDetail })));
const ClassSyllabusPage = lazy(() => import('./pages/ClassSyllabusPage').then(m => ({ default: m.ClassSyllabusPage })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ForumPage = lazy(() => import('./pages/ForumPage').then(m => ({ default: m.ForumPage })));
const TopicDetailPage = lazy(() => import('./pages/TopicDetailPage').then(m => ({ default: m.TopicDetailPage })));
const SubjectTopicsPage = lazy(() => import('./pages/SubjectTopicsPage').then(m => ({ default: m.SubjectTopicsPage })));
const LiveSessionsPage = lazy(() => import('./pages/LiveSessionsPage').then(m => ({ default: m.LiveSessionsPage })));
const PaymentPage = lazy(() => import('./pages/PaymentPage').then(m => ({ default: m.PaymentPage })));
const ExercisePage = lazy(() => import('./pages/ExercisePage').then(m => ({ default: m.ExercisePage })));
const LearningPathPage = lazy(() => import('./pages/LearningPathPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectWorkspace = lazy(() => import('./pages/ProjectWorkspace'));
const AITeachingAssistant = lazy(() => import('./pages/AITeachingAssistant'));
const PeerTutoringHub = lazy(() => import('./pages/PeerTutoringHub'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const MarketplaceSubjectPage = lazy(() => import('./pages/MarketplaceSubjectPage'));
const MarketplaceTopicPage = lazy(() => import('./pages/MarketplaceTopicPage'));
const InstitutionManagementPage = lazy(() => import('./pages/InstitutionManagementPage').then(m => ({ default: m.InstitutionManagementPage })));
const InstitutionTimetableStudio = lazy(() => import('./pages/InstitutionTimetableStudio').then(m => ({ default: m.InstitutionTimetableStudio })));
const InstitutionWizard = lazy(() => import('./pages/InstitutionWizard').then(m => ({ default: m.InstitutionWizard })));
const IndependentTeacherWizard = lazy(() => import('./pages/IndependentTeacherWizard').then(m => ({ default: m.IndependentTeacherWizard })));
const AcademicLibraryPage = lazy(() => import('./pages/AcademicLibraryPage').then(m => ({ default: m.AcademicLibraryPage })));
const ResourceDiscoveryPage = lazy(() => import('./pages/ResourceDiscoveryPage').then(m => ({ default: m.ResourceDiscoveryPage })));
const ExamRegistrationPage = lazy(() => import('./pages/ExamRegistrationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const TeacherLessonStudio = lazy(() => import('./pages/TeacherLessonStudio').then(m => ({ default: m.TeacherLessonStudio })));
const AttendanceRegisterPage = lazy(() => import('./pages/AttendanceRegisterPage').then(m => ({ default: m.AttendanceRegisterPage })));
const PublicProfile = lazy(() => import('./pages/PublicProfile').then(m => ({ default: m.PublicProfile })));
const TeacherStorefront = lazy(() => import('./pages/TeacherStorefront').then(m => ({ default: m.TeacherStorefront })));
const TeacherMarksUpload = lazy(() => import('./pages/TeacherMarksUpload').then(m => ({ default: m.TeacherMarksUpload })));
const AssignmentTargetingStudio = lazy(() => import('./pages/AssignmentTargetingStudio').then(m => ({ default: m.AssignmentTargetingStudio })));
const AITeacherCopilotWidget = lazy(() => import('./components/copilot/AITeacherCopilotWidget').then(m => ({ default: m.AITeacherCopilotWidget })));
const MissedSessionRecoveryPage = lazy(() => import('./pages/MissedSessionRecoveryPage').then(m => ({ default: m.MissedSessionRecoveryPage })));

// Maple Intelligence System
const MapleIntelligenceHub = lazy(() => import('./pages/admin/intelligence/MapleIntelligenceHub'));
const InstitutionRiskMonitor = lazy(() => import('./pages/admin/intelligence/InstitutionRiskMonitor'));
const InstitutionHealthView = lazy(() => import('./pages/institution/dashboard/InstitutionHealthView'));
const OfflineResultUpload = lazy(() => import('./pages/institution/academics/OfflineResultUpload'));

// Analytics
const AnalyticsLayout = lazy(() => import('./pages/analytics/AnalyticsLayout').then(m => ({ default: m.AnalyticsLayout })));
const PlatformCommandCenter = lazy(() => import('./pages/analytics/PlatformCommandCenter').then(m => ({ default: m.PlatformCommandCenter })));
const InstitutionIntelligence = lazy(() => import('./pages/analytics/InstitutionIntelligence').then(m => ({ default: m.InstitutionIntelligence })));
const LearningAnalytics = lazy(() => import('./pages/analytics/PlatformAnalyticsViews').then(m => ({ default: m.LearningAnalytics })));
const ExamsAnalytics = lazy(() => import('./pages/analytics/PlatformAnalyticsViews').then(m => ({ default: m.ExamsAnalytics })));
const MarketplaceAnalytics = lazy(() => import('./pages/analytics/PlatformAnalyticsViews').then(m => ({ default: m.MarketplaceAnalytics })));
const SystemHealthAnalytics = lazy(() => import('./pages/analytics/PlatformAnalyticsViews').then(m => ({ default: m.SystemHealthAnalytics })));

// New Dashboard Hubs
const DashboardLibraryPage = lazy(() => import('./pages/dashboard/DashboardLibraryPage'));
const InterventionsHub = lazy(() => import('./pages/dashboard/InterventionsHub'));
const TeacherEarningsPage = lazy(() => import('./pages/dashboard/TeacherEarningsPage'));
// InstitutionFinanceHub removed — institutions no longer manage finance on platform

// Primary School Pages
const PrimaryClassLanding = lazy(() => import('./pages/primary/PrimaryClassLanding').then(m => ({ default: m.PrimaryClassLanding })));
const PrimaryClassDetail = lazy(() => import('./pages/primary/PrimaryClassDetail').then(m => ({ default: m.PrimaryClassDetail })));
const P7ReadinessDashboard = lazy(() => import('./pages/primary/P7ReadinessDashboard'));
const PrimaryStudentDashboard = lazy(() => import('./pages/primary/PrimaryStudentDashboard'));
const PrimaryTeacherDashboard = lazy(() => import('./pages/primary/PrimaryTeacherDashboard'));
const PrimaryParentDashboard = lazy(() => import('./pages/primary/PrimaryParentDashboard'));

// Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AICopilotProvider>
        <NetworkStatusWidget />
        <Suspense fallback={null}>
          <AITeacherCopilotWidget />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/institution-onboarding" element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <InstitutionWizard />
            </ProtectedRoute>
          } />
          <Route path="/independent-teacher-onboarding" element={
            <ProtectedRoute allowedRoles={['independent_teacher', 'teacher']}>
              <IndependentTeacherWizard />
            </ProtectedRoute>
          } />
        <Route path="/" element={<Layout />}>
                    <Route path="feedback" element={<FeedbackPage />} />
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutUsPage />} />
          <Route path="classes" element={<CourseCatalog />} />
          <Route path="classes/:classId" element={<ClassSyllabusPage />} />
          <Route path="classes/:classId/:termId/:subjectId" element={<CourseDetail />} />
          <Route path="classes/:classId/subject/:subjectId" element={<SubjectTopicsPage />} />
          <Route path="classes/:classId/:termId/:subjectId/topic/:topicId" element={<TopicDetailPage />} />
          <Route path="forum/*" element={<ForumPage />} />
          <Route path="live-sessions" element={<LiveSessionsPage />} />
          <Route path="library" element={
            <ProtectedRoute allowedRoles={['student', 'parent', 'institution_teacher', 'universal_teacher', 'teacher', 'independent_teacher', 'institution_admin', 'platform_admin']}>
              <AcademicLibraryPage />
            </ProtectedRoute>
          } />
          <Route path="resources" element={
            <ProtectedRoute allowedRoles={['student', 'parent', 'institution_teacher', 'universal_teacher', 'teacher', 'independent_teacher', 'institution_admin', 'platform_admin']}>
              <ResourceDiscoveryPage />
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
          <Route path="projects" element={
            <ProtectedRoute allowedRoles={['student', 'universal_student', 'parent', 'institution_teacher', 'universal_teacher', 'teacher', 'independent_teacher', 'institution_admin', 'platform_admin']}>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          <Route path="projects/:projectId" element={
            <ProtectedRoute allowedRoles={['student', 'universal_student', 'parent', 'institution_teacher', 'universal_teacher', 'teacher', 'independent_teacher', 'institution_admin', 'platform_admin']}>
              <ProjectWorkspace />
            </ProtectedRoute>
          } />
          <Route path="exercises/:exerciseId" element={<ExercisePage />} />
          <Route path="projects/:projectId/submit" element={<ExercisePage />} />
          <Route path="assignments/:assignmentId" element={<ExercisePage />} />
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
          
          {/* Global Dashboard Navigation Hubs */}
            <Route path="library" element={
              <ProtectedRoute allowedRoles={['student', 'universal_student', 'parent']}>
                <LibraryPage />
              </ProtectedRoute>
            } />
            <Route path="interventions" element={
              <ProtectedRoute allowedRoles={['institution_teacher', 'universal_teacher', 'teacher', 'independent_teacher', 'institution_admin']}>
                <InterventionsHub />
              </ProtectedRoute>
            } />
            <Route path="earnings" element={
              <ProtectedRoute allowedRoles={['institution_teacher', 'universal_teacher', 'teacher', 'independent_teacher']}>
                <EarningsPage />
              </ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute allowedRoles={['platform_admin', 'institution_admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }>
             <Route path="platform" element={<PlatformCommandCenter />} />
             <Route path="institution" element={<InstitutionIntelligence />} />
             <Route path="learning" element={<LearningAnalytics />} />
             <Route path="exams" element={<ExamsAnalytics />} />
             <Route path="marketplace" element={<MarketplaceAnalytics />} />
             <Route path="system" element={<SystemHealthAnalytics />} />
             <Route index element={<PlatformCommandCenter />} />
          </Route>

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
          <Route path="admin/intelligence" element={
            <ProtectedRoute allowedRoles={['platform_admin']}>
              <MapleIntelligenceHub />
            </ProtectedRoute>
          } />
          <Route path="admin/intelligence/risk" element={
            <ProtectedRoute allowedRoles={['platform_admin']}>
              <InstitutionRiskMonitor />
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
          {/* Finance route removed — institutions no longer manage finance on platform */}
          <Route path="institution/health" element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <InstitutionHealthView />
            </ProtectedRoute>
          } />
          <Route path="institution/health/upload" element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <OfflineResultUpload />
            </ProtectedRoute>
          } />
          <Route path="institution/timetable" element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <InstitutionTimetableStudio />
            </ProtectedRoute>
          } />

          {/* Primary School Dashboard Routes */}
          <Route path="primary/student" element={
            <ProtectedRoute allowedRoles={['universal_student', 'institution_student', 'student']}>
              <PrimaryStudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="primary/teacher" element={
            <ProtectedRoute allowedRoles={['institution_teacher', 'universal_teacher', 'independent_teacher', 'teacher']}>
              <PrimaryTeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="primary/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <PrimaryParentDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Primary School Content Routes (outside dashboard layout) */}
        <Route path="/primary" element={<Layout />}>
          <Route index element={<PrimaryClassLanding />} />
          <Route path="class/:classId" element={<PrimaryClassDetail />} />
          <Route path="p7-readiness" element={<P7ReadinessDashboard />} />
        </Route>

        {/* Analytics Routes completely moved to /dashboard/analytics inside GlassDashboardLayout above */}

      </Routes>
      </Suspense>
      <Toaster />
      </AICopilotProvider>
    </AuthProvider>
  );
}

export default App;

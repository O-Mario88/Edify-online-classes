import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  GraduationCap, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Users, BookOpen, Upload, FileText, ArrowLeft, BarChart3,
  UserCheck, Clipboard, Target, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { PLEReadinessGauge } from '../../components/dashboard/PLEReadinessGauge';
import { toast } from 'sonner';
import type { P7ReadinessProfile, SubjectReadiness, MockExamRecord, P7RiskFlag, P7ReadinessState } from '../../types';

// ─── Mock Data for Demo ───
const mockReadinessProfiles: P7ReadinessProfile[] = [
  {
    studentId: 's1', studentName: 'Amina Nakato', institutionId: 'inst1',
    overallReadinessScore: 82, readinessState: 'highly_ready',
    attendanceScore: 90, lessonCompletionScore: 85, assignmentCompletionScore: 80,
    mockExamScore: 78, offlineTestScore: 82, resourceEngagementScore: 75,
    interventionCompletionScore: 88, parentFollowupScore: 70, revisionParticipationScore: 85,
    strongestSubject: 'Mathematics', weakestSubject: 'Social Studies',
    weakSubjectAlerts: [], weakTopicAlerts: [], revisionPriorityList: ['Social Studies']
  },
  {
    studentId: 's2', studentName: 'Joel Okello', institutionId: 'inst1',
    overallReadinessScore: 55, readinessState: 'needs_support',
    attendanceScore: 60, lessonCompletionScore: 50, assignmentCompletionScore: 45,
    mockExamScore: 52, offlineTestScore: 58, resourceEngagementScore: 40,
    interventionCompletionScore: 55, parentFollowupScore: 30, revisionParticipationScore: 48,
    strongestSubject: 'English', weakestSubject: 'Mathematics',
    weakSubjectAlerts: ['Mathematics', 'Integrated Science'], weakTopicAlerts: ['Fractions', 'Force and Motion'],
    revisionPriorityList: ['Mathematics', 'Integrated Science', 'Social Studies']
  },
  {
    studentId: 's3', studentName: 'Grace Auma', institutionId: 'inst1',
    overallReadinessScore: 35, readinessState: 'high_risk',
    attendanceScore: 40, lessonCompletionScore: 30, assignmentCompletionScore: 25,
    mockExamScore: 38, offlineTestScore: 32, resourceEngagementScore: 20,
    interventionCompletionScore: 35, parentFollowupScore: 15, revisionParticipationScore: 28,
    strongestSubject: 'Religious Education', weakestSubject: 'Mathematics',
    weakSubjectAlerts: ['Mathematics', 'English', 'Integrated Science'],
    weakTopicAlerts: ['Algebra Basics', 'PLE Comprehension', 'Human Body Systems'],
    revisionPriorityList: ['Mathematics', 'English', 'Integrated Science', 'Social Studies']
  },
  {
    studentId: 's4', studentName: 'David Mugisha', institutionId: 'inst1',
    overallReadinessScore: 72, readinessState: 'on_track',
    attendanceScore: 80, lessonCompletionScore: 75, assignmentCompletionScore: 70,
    mockExamScore: 68, offlineTestScore: 72, resourceEngagementScore: 65,
    interventionCompletionScore: 70, parentFollowupScore: 60, revisionParticipationScore: 72,
    strongestSubject: 'Integrated Science', weakestSubject: 'Local Language',
    weakSubjectAlerts: ['Local Language'], weakTopicAlerts: [],
    revisionPriorityList: ['Local Language']
  },
  {
    studentId: 's5', studentName: 'Patience Nabirye', institutionId: 'inst1',
    overallReadinessScore: 18, readinessState: 'critical_exam_risk',
    attendanceScore: 20, lessonCompletionScore: 15, assignmentCompletionScore: 10,
    mockExamScore: 22, offlineTestScore: 18, resourceEngagementScore: 8,
    interventionCompletionScore: 12, parentFollowupScore: 5, revisionParticipationScore: 10,
    strongestSubject: 'CAPE', weakestSubject: 'Mathematics',
    weakSubjectAlerts: ['Mathematics', 'English', 'Social Studies', 'Integrated Science'],
    weakTopicAlerts: ['Number Operations', 'Reading Comprehension', 'Map Work', 'Living Things'],
    revisionPriorityList: ['Mathematics', 'English', 'Social Studies', 'Integrated Science']
  },
];

const mockSubjectReadiness: SubjectReadiness[] = [
  { subjectId: 'ug-pri-eng', subjectName: 'English', averageScore: 65, mockScore: 62, offlineScore: 68, completionPct: 70, resourceEngagementPct: 55, interventionExposure: 3, teacherSupportCount: 5, improvementTrend: 2.5, isWeak: false, needsUrgentRevision: false },
  { subjectId: 'ug-pri-math', subjectName: 'Mathematics', averageScore: 48, mockScore: 45, offlineScore: 50, completionPct: 52, resourceEngagementPct: 40, interventionExposure: 8, teacherSupportCount: 12, improvementTrend: -1.2, isWeak: true, needsUrgentRevision: true },
  { subjectId: 'ug-pri-sst', subjectName: 'Social Studies', averageScore: 58, mockScore: 55, offlineScore: 60, completionPct: 60, resourceEngagementPct: 45, interventionExposure: 5, teacherSupportCount: 7, improvementTrend: 1.0, isWeak: false, needsUrgentRevision: false },
  { subjectId: 'ug-pri-sci', subjectName: 'Integrated Science', averageScore: 52, mockScore: 48, offlineScore: 55, completionPct: 55, resourceEngagementPct: 42, interventionExposure: 6, teacherSupportCount: 9, improvementTrend: -0.5, isWeak: true, needsUrgentRevision: false },
  { subjectId: 'ug-pri-re', subjectName: 'Religious Education', averageScore: 72, mockScore: 70, offlineScore: 74, completionPct: 75, resourceEngagementPct: 60, interventionExposure: 1, teacherSupportCount: 3, improvementTrend: 3.2, isWeak: false, needsUrgentRevision: false },
  { subjectId: 'ug-pri-ll', subjectName: 'Local Language', averageScore: 60, mockScore: 58, offlineScore: 62, completionPct: 58, resourceEngagementPct: 35, interventionExposure: 4, teacherSupportCount: 6, improvementTrend: 0.8, isWeak: false, needsUrgentRevision: false },
  { subjectId: 'ug-pri-cape', subjectName: 'CAPE', averageScore: 78, mockScore: 75, offlineScore: 80, completionPct: 82, resourceEngagementPct: 70, interventionExposure: 0, teacherSupportCount: 2, improvementTrend: 1.5, isWeak: false, needsUrgentRevision: false },
];

const mockRiskFlags: P7RiskFlag[] = [
  { id: 'rf1', riskType: 'learner', severity: 'critical', studentId: 's5', studentName: 'Patience Nabirye', signals: ['Attendance below 25%', 'No mock exams attempted', 'No parent follow-up'], recommendedActions: ['Emergency parent meeting', 'Assign subject rescue pack', 'Daily revision schedule'], isResolved: false, flaggedAt: '2026-04-05' },
  { id: 'rf2', riskType: 'subject', severity: 'high', subjectName: 'Mathematics', signals: ['Class average below 50%', '8 learners below passing threshold', 'Declining mock performance'], recommendedActions: ['Schedule group revision sessions', 'Assign numeracy support packs', 'Teacher-led topic review'], isResolved: false, flaggedAt: '2026-04-03' },
  { id: 'rf3', riskType: 'learner', severity: 'warning', studentId: 's2', studentName: 'Joel Okello', signals: ['Mock scores declining', 'Low parent engagement'], recommendedActions: ['Parent follow-up call', 'Assign revision tasks'], isResolved: false, flaggedAt: '2026-04-01' },
];

const stateColors: Record<P7ReadinessState, string> = {
  highly_ready: 'bg-green-100 text-green-800',
  on_track: 'bg-blue-100 text-blue-800',
  needs_support: 'bg-yellow-100 text-yellow-800',
  high_risk: 'bg-orange-100 text-orange-800',
  critical_exam_risk: 'bg-red-100 text-red-800',
};

const stateLabels: Record<P7ReadinessState, string> = {
  highly_ready: 'Highly Ready',
  on_track: 'On Track',
  needs_support: 'Needs Support',
  high_risk: 'High Risk',
  critical_exam_risk: 'Critical Risk',
};

type TabType = 'overview' | 'learners' | 'subjects' | 'mock-exams' | 'risks' | 'interventions';

export const P7ReadinessDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const totalLearners = mockReadinessProfiles.length;
  const avgScore = Math.round(mockReadinessProfiles.reduce((sum, p) => sum + p.overallReadinessScore, 0) / totalLearners);
  const highlyReady = mockReadinessProfiles.filter(p => p.readinessState === 'highly_ready').length;
  const onTrack = mockReadinessProfiles.filter(p => p.readinessState === 'on_track').length;
  const needsSupport = mockReadinessProfiles.filter(p => p.readinessState === 'needs_support').length;
  const highRisk = mockReadinessProfiles.filter(p => p.readinessState === 'high_risk' || p.readinessState === 'critical_exam_risk').length;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'learners', label: 'Learners', icon: <Users className="w-4 h-4" /> },
    { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'mock-exams', label: 'Mock Exams', icon: <Clipboard className="w-4 h-4" /> },
    { id: 'risks', label: 'Risk Flags', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'interventions', label: 'Interventions', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/primary/class/p7')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Primary 7
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <GraduationCap className="w-8 h-8 text-amber-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">P7 PLE Readiness</h1>
          <p className="text-gray-500 dark:text-gray-400">Track learner preparedness for the Primary Leaving Examination</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-300 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'risks' && highRisk > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{highRisk}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Highly Ready / On Track</p>
                    <p className="text-2xl font-bold text-green-800">{highlyReady + onTrack}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/30 dark:to-amber-900/30 dark:border-yellow-700">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Needs Support</p>
                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{needsSupport}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-red-700">High Risk / Critical</p>
                    <p className="text-2xl font-bold text-red-800">{highRisk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700">Average Readiness</p>
                    <p className="text-2xl font-bold text-blue-800">{avgScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Readiness Gauge + Subject Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PLEReadinessGauge
              score={avgScore}
              readinessState={avgScore >= 65 ? 'on_track' : 'needs_support'}
              strongestSubject="Religious Education"
              weakestSubject="Mathematics"
              weakSubjectAlerts={['Mathematics', 'Integrated Science']}
            />

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Subject Readiness Overview</CardTitle>
                <CardDescription>Average scores across primary 7 subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockSubjectReadiness.map((subj) => (
                    <div key={subj.subjectId} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700 truncate">{subj.subjectName}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              subj.averageScore >= 70 ? 'bg-green-500' :
                              subj.averageScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${subj.averageScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-sm font-semibold text-right">{subj.averageScore}%</div>
                      <div className="w-16 text-right">
                        {subj.improvementTrend > 0 ? (
                          <span className="text-xs text-green-600 flex items-center gap-0.5 justify-end">
                            <TrendingUp className="w-3 h-3" /> +{subj.improvementTrend.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-red-500 flex items-center gap-0.5 justify-end">
                            <TrendingDown className="w-3 h-3" /> {subj.improvementTrend.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => toast.info('Mock results upload dialog opening...')}>
              <Upload className="w-5 h-5" />
              <span>Upload Mock Results</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => { toast.success('Readiness report generated for 42 learners.'); const blob = new Blob(['PLE Readiness Report\nGenerated: ' + new Date().toLocaleDateString()], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'PLE_Readiness_Report.txt'; a.click(); URL.revokeObjectURL(url); }}>
              <FileText className="w-5 h-5" />
              <span>Generate Readiness Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => toast.info('Select an intervention pack type below.')}>
              <Target className="w-5 h-5" />
              <span>Create Intervention Pack</span>
            </Button>
          </div>
        </div>
      )}

      {/* Learners Tab */}
      {activeTab === 'learners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">P7 Learner Readiness</h2>
            <div className="flex gap-2">
              {(['highly_ready', 'on_track', 'needs_support', 'high_risk', 'critical_exam_risk'] as P7ReadinessState[]).map((state) => (
                <Badge key={state} className={`${stateColors[state]} cursor-pointer`}>
                  {stateLabels[state]} ({mockReadinessProfiles.filter(p => p.readinessState === state).length})
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {mockReadinessProfiles.map((profile) => (
              <Card key={profile.studentId} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {profile.studentName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{profile.studentName}</p>
                        <Badge className={stateColors[profile.readinessState]}>
                          {stateLabels[profile.readinessState]}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>Best: {profile.strongestSubject}</span>
                        <span>Weak: {profile.weakestSubject}</span>
                        {profile.weakSubjectAlerts.length > 0 && (
                          <span className="text-red-500">{profile.weakSubjectAlerts.length} subject alerts</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: stateColors[profile.readinessState].includes('green') ? '#16a34a' : stateColors[profile.readinessState].includes('red') ? '#dc2626' : '#2563eb' }}>
                        {Math.round(profile.overallReadinessScore)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            profile.overallReadinessScore >= 65 ? 'bg-green-500' :
                            profile.overallReadinessScore >= 45 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${profile.overallReadinessScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dimension breakdown */}
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3 pt-3 border-t border-gray-100">
                    {[
                      { label: 'Attendance', value: profile.attendanceScore },
                      { label: 'Lessons', value: profile.lessonCompletionScore },
                      { label: 'Assignments', value: profile.assignmentCompletionScore },
                      { label: 'Mock Exams', value: profile.mockExamScore },
                      { label: 'Offline Tests', value: profile.offlineTestScore },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className={`text-sm font-semibold ${value >= 60 ? 'text-green-600' : value >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(value)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Subject-Level Readiness</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSubjectReadiness.map((subj) => (
              <Card key={subj.subjectId} className={`border ${subj.needsUrgentRevision ? 'border-red-300 bg-red-50/30' : subj.isWeak ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{subj.subjectName}</h3>
                    <div className="flex gap-2">
                      {subj.needsUrgentRevision && <Badge variant="destructive">Urgent Revision</Badge>}
                      {subj.isWeak && !subj.needsUrgentRevision && <Badge className="bg-yellow-100 text-yellow-800">Weak</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Average Score</p>
                      <p className="font-bold text-lg">{subj.averageScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mock Score</p>
                      <p className="font-bold text-lg">{subj.mockScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Offline Score</p>
                      <p className="font-bold">{subj.offlineScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Completion</p>
                      <p className="font-bold">{subj.completionPct}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resource Engagement</p>
                      <p className="font-bold">{subj.resourceEngagementPct}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Trend</p>
                      <p className={`font-bold flex items-center gap-1 ${subj.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {subj.improvementTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {subj.improvementTrend > 0 ? '+' : ''}{subj.improvementTrend.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mock Exams Tab */}
      {activeTab === 'mock-exams' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Mock Exam Results</h2>
            <Button onClick={() => toast.info('Mock results upload dialog opening...')}>
              <Upload className="w-4 h-4 mr-2" /> Upload Mock Results
            </Button>
          </div>
          <Card>
            <CardContent className="py-6">
              <div className="text-center text-gray-500 py-12">
                <Clipboard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Mock Exam Tracking</h3>
                <p className="text-sm max-w-md mx-auto">
                  Upload mock exam results for P7 learners. Track performance by subject,
                  compare with school tests, and monitor readiness trends.
                </p>
                <div className="flex justify-center gap-3 mt-6">
                  <Button variant="outline" onClick={() => { const blob = new Blob(['Student Name,English,Mathematics,Science,Social Studies,Total\n'], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'PLE_Mock_Results_Template.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Template downloaded: PLE_Mock_Results_Template.csv'); }}>
                    <FileText className="w-4 h-4 mr-2" /> Download Template
                  </Button>
                  <Button onClick={() => toast.info('File picker coming soon — upload CSV/XLSX mock exam results.')}>
                    <Upload className="w-4 h-4 mr-2" /> Upload Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Flags Tab */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Risk Flags</h2>
          {mockRiskFlags.map((flag) => (
            <Card key={flag.id} className={`border-l-4 ${
              flag.severity === 'critical' ? 'border-l-red-600 bg-red-50/30' :
              flag.severity === 'high' ? 'border-l-orange-500 bg-orange-50/30' :
              'border-l-yellow-500 bg-yellow-50/30'
            }`}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={
                        flag.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        flag.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {flag.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize">{flag.riskType} Risk</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {flag.studentName || flag.subjectName || flag.className}
                    </p>
                    <div className="mt-2 space-y-1">
                      {flag.signals.map((signal, idx) => (
                        <p key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" /> {signal}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Recommended Actions:</p>
                      {flag.recommendedActions.map((action, idx) => (
                        <p key={idx} className="text-sm text-gray-700 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-primary" /> {action}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.info(`Action plan created for ${flag.studentName || flag.subjectName || flag.className}.`)}>
                    Take Action
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Interventions Tab */}
      {activeTab === 'interventions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">P7 Intervention Packs</h2>
            <Button onClick={() => toast.info('Select an intervention pack type below.')}>
              <Target className="w-4 h-4 mr-2" /> Create Intervention Pack
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'Subject Rescue Pack', desc: 'Intensive support for learners failing a subject', icon: '🆘', color: 'border-red-200 bg-red-50/50' },
              { type: 'Weak Topic Revision Pack', desc: 'Targeted revision for consistently failed topics', icon: '📖', color: 'border-amber-200 bg-amber-50/50' },
              { type: 'Attendance Recovery Pack', desc: 'Re-engagement materials for absent learners', icon: '📋', color: 'border-blue-200 bg-blue-50/50' },
              { type: 'Parent Home Revision Pack', desc: 'Parent-guided study materials and activities', icon: '🏠', color: 'border-green-200 bg-green-50/50' },
              { type: 'Mock Exam Recovery Pack', desc: 'Post-mock targeted improvement materials', icon: '📝', color: 'border-purple-200 bg-purple-50/50' },
              { type: 'Exam Confidence Pack', desc: 'Motivational and exam technique resources', icon: '💪', color: 'border-indigo-200 bg-indigo-50/50' },
            ].map((pack) => (
              <Card key={pack.type} className={`border ${pack.color} cursor-pointer hover:shadow-md transition-shadow`}>
                <CardContent className="py-5">
                  <div className="text-3xl mb-2">{pack.icon}</div>
                  <p className="font-semibold text-gray-900">{pack.type}</p>
                  <p className="text-sm text-gray-500 mt-1">{pack.desc}</p>
                  <Button variant="ghost" size="sm" className="mt-3 text-primary" onClick={() => toast.success(`${pack.type} intervention pack created and assigned to learners.`)}>
                    Create Pack <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default P7ReadinessDashboard;

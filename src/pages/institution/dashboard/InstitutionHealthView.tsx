import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building, BookOpen, AlertCircle, CheckCircle2,
  Activity, Users, FileText, ArrowRight, CreditCard, GraduationCap, Clock,
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/apiClient';

interface HealthData {
  score: number;
  institution_name: string;
  student_count: number;
  teacher_count: number;
  status_label: string;
  attendance_pct: number;
  teacher_activity_pct: number;
  resource_engagement_pct: number;
  parent_involvement_pct: number;
  ai_insight: string;
}

const DEFAULT_HEALTH: HealthData = {
  score: 0,
  institution_name: 'Your institution',
  student_count: 0,
  teacher_count: 0,
  status_label: 'Loading',
  attendance_pct: 0,
  teacher_activity_pct: 0,
  resource_engagement_pct: 0,
  parent_involvement_pct: 0,
  ai_insight: 'Insights will surface once your school has at least a week of activity in Maple.',
};

interface Member {
  id: number;
  user: { id: number; full_name: string; email: string; role?: string };
  role: string;
  status: string;
  invited_at?: string;
}

interface Billing {
  institution: string;
  plan_tier: string;
  active_students: number;
  is_suspended: boolean;
}

interface AdmissionApp {
  id: number;
  status: string;
  applicant_name?: string;
  applicant_class_level?: string;
  submitted_at?: string;
}

export default function InstitutionHealthView() {
  const [activeTab, setActiveTab] = useState<'health' | 'roster' | 'operations'>('health');
  const [health, setHealth] = useState<HealthData>(DEFAULT_HEALTH);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [admissions, setAdmissions] = useState<AdmissionApp[]>([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.INTELLIGENCE_HEALTH);
        if (res.data) {
          const d = res.data as any;
          setHealth({
            score: d.health_score ?? d.score ?? DEFAULT_HEALTH.score,
            institution_name: d.institution_name ?? DEFAULT_HEALTH.institution_name,
            student_count: d.student_count ?? d.total_students ?? 0,
            teacher_count: d.teacher_count ?? d.total_teachers ?? 0,
            status_label: d.status_label ?? d.status ?? 'Active',
            attendance_pct: d.attendance_pct ?? d.student_attendance_rate ?? 0,
            teacher_activity_pct: d.teacher_activity_pct ?? d.teacher_activity_rate ?? 0,
            resource_engagement_pct: d.resource_engagement_pct ?? d.resource_engagement_rate ?? 0,
            parent_involvement_pct: d.parent_involvement_pct ?? d.parent_engagement_rate ?? 0,
            ai_insight: d.ai_insight ?? d.ai_story ?? DEFAULT_HEALTH.ai_insight,
          });
        }
      } catch {
        /* leave defaults */
      }
    };
    loadHealth();
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const { data } = await apiClient.get<any>('/institution-memberships/');
        const list = Array.isArray(data) ? data : (data?.results || []);
        setMembers(list);
      } finally {
        setMembersLoading(false);
      }
    };
    loadMembers();
  }, []);

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const { data } = await apiClient.get<Billing>('/institutions-billing/status/');
        if (data) setBilling(data);
      } finally {
        setBillingLoading(false);
      }
    };
    loadBilling();
  }, []);

  useEffect(() => {
    const loadAdmissions = async () => {
      try {
        const { data } = await apiClient.get<AdmissionApp[]>(
          '/admission-passport/admission-application/institution-inbox/',
        );
        setAdmissions(Array.isArray(data) ? data : []);
      } finally {
        setAdmissionsLoading(false);
      }
    };
    loadAdmissions();
  }, []);

  const teacherRows = useMemo(
    () => members.filter((m) => /teacher|head|deputy|dos|registrar/.test(m.role || '')),
    [members],
  );
  const studentRows = useMemo(
    () => members.filter((m) => /student|learner/.test(m.role || '')),
    [members],
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen border border-slate-100 shadow-sm rounded-lg">

      {/* Header Profile */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center border border-blue-200">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{health.institution_name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium">
              <span className="flex items-center gap-1 text-slate-500"><Users className="w-4 h-4" /> {health.student_count} Students</span>
              <span className="flex items-center gap-1 text-slate-500"><BookOpen className="w-4 h-4" /> {health.teacher_count} Teachers</span>
              {billing && (
                <span className="flex items-center gap-1 text-slate-500">
                  <CreditCard className="w-4 h-4" /> Plan: {billing.plan_tier}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`mt-4 md:mt-0 px-5 py-3 rounded-lg text-right border ${
          health.score >= 70 ? 'bg-emerald-50 border-emerald-200' : health.score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'
        }`}>
          <p className={`text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2 ${
            health.score >= 70 ? 'text-emerald-700' : health.score >= 40 ? 'text-amber-700' : 'text-rose-700'
          }`}>
            <CheckCircle2 className="w-4 h-4" /> {health.status_label}
          </p>
          <div className={`text-2xl font-black ${
            health.score >= 70 ? 'text-emerald-800' : health.score >= 40 ? 'text-amber-800' : 'text-rose-800'
          }`}>
            {health.score} / 100 <span className="text-sm font-medium opacity-80">Health</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto">
        {([
          ['health', 'Overall Health Profile'],
          ['roster', `Teachers & Roster${teacherRows.length ? ` (${teacherRows.length})` : ''}`],
          ['operations', 'Operations'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`pb-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'health' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTile label="Student Attendance" value={`${health.attendance_pct}%`} pct={health.attendance_pct} barCls="bg-emerald-500" />
            <KpiTile label="Teacher Activity" value={`${health.teacher_activity_pct}%`} pct={health.teacher_activity_pct} barCls="bg-blue-500" />
            <KpiTile label="Resource Engagement" value={`${health.resource_engagement_pct}%`} pct={health.resource_engagement_pct} barCls="bg-indigo-500" />
            <KpiTile
              label="Parent Involvement"
              value={`${health.parent_involvement_pct}%`}
              pct={health.parent_involvement_pct}
              barCls="bg-rose-500"
              warning={health.parent_involvement_pct < 50}
            />
          </section>

          <section className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-6 shadow-md text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><Activity className="text-blue-200" /> AI Insight Story</h3>
              <span className="bg-blue-600/50 px-3 py-1 rounded-full text-xs font-semibold uppercase">Outcome Driver</span>
            </div>
            <p className="text-xl leading-relaxed text-blue-50 max-w-4xl">{health.ai_insight}</p>
          </section>
        </div>
      )}

      {activeTab === 'roster' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Capacity vs enrolled */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard icon={<Users className="w-5 h-5" />} label="Active students" value={String(studentRows.length || health.student_count)} />
            <SummaryCard icon={<GraduationCap className="w-5 h-5" />} label="Active teachers" value={String(teacherRows.length || health.teacher_count)} />
            <SummaryCard
              icon={<Activity className="w-5 h-5" />}
              label="Student-to-teacher ratio"
              value={
                teacherRows.length || health.teacher_count
                  ? `${Math.round((studentRows.length || health.student_count) / Math.max(1, teacherRows.length || health.teacher_count))} : 1`
                  : '—'
              }
            />
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Teaching staff</h2>
              {membersLoading && <span className="text-xs text-slate-500">Loading…</span>}
            </div>
            {!membersLoading && teacherRows.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm font-semibold text-slate-700 mb-1">No teaching staff on file yet.</p>
                <p className="text-xs text-slate-500">Use Settings → Invite to onboard headteachers, deputies, and subject teachers.</p>
              </div>
            )}
            {teacherRows.length > 0 && (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 pl-5 font-semibold">Name</th>
                    <th className="py-3 font-semibold">Email</th>
                    <th className="py-3 font-semibold">Role</th>
                    <th className="py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherRows.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 pl-5 font-semibold text-slate-800">{m.user?.full_name || '—'}</td>
                      <td className="py-3 text-slate-600">{m.user?.email || '—'}</td>
                      <td className="py-3 text-slate-600 capitalize">{(m.role || '').replace(/_/g, ' ')}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          m.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {activeTab === 'operations' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Billing */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" /> Billing & subscription
              </h2>
            </div>
            {billingLoading && <p className="text-sm text-slate-500">Loading billing status…</p>}
            {!billingLoading && !billing && (
              <p className="text-sm text-slate-600">
                Billing detail isn't available for this account. Reach out to <a href="mailto:billing@maple.edify" className="text-blue-600 hover:underline">billing@maple.edify</a> to confirm your plan.
              </p>
            )}
            {billing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SummaryCard icon={<Building className="w-5 h-5" />} label="Account" value={billing.institution} />
                <SummaryCard icon={<CreditCard className="w-5 h-5" />} label="Plan" value={billing.plan_tier} />
                <SummaryCard
                  icon={<Users className="w-5 h-5" />}
                  label="Active students"
                  value={String(billing.active_students)}
                />
                {billing.is_suspended && (
                  <div className="md:col-span-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
                    <AlertCircle className="w-4 h-4 inline-block mr-2" />
                    This account is currently suspended. Resolve the latest invoice to restore access.
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Admissions inbox preview */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> Pending admissions
                <span className="text-xs text-slate-500 font-medium ml-2">({admissions.length})</span>
              </h2>
              <Link
                to="/dashboard/institution/admissions"
                className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-semibold"
              >
                Open inbox <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {admissionsLoading && <p className="p-5 text-sm text-slate-500">Loading admissions…</p>}
            {!admissionsLoading && admissions.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm font-semibold text-slate-700 mb-1">No applications waiting on your decision.</p>
                <p className="text-xs text-slate-500">When a learner submits an admission application, it will appear here.</p>
              </div>
            )}
            {admissions.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {admissions.slice(0, 6).map((a) => (
                  <li key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {a.applicant_name || `Application #${a.id}`}
                        {a.applicant_class_level && (
                          <span className="ml-2 text-xs text-slate-500 font-medium">— {a.applicant_class_level}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        Status: {a.status.replace(/_/g, ' ')}
                        {a.submitted_at ? ` · submitted ${new Date(a.submitted_at).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

    </div>
  );
}

const KpiTile: React.FC<{ label: string; value: string; pct: number; barCls: string; warning?: boolean }> = ({ label, value, pct, barCls, warning }) => (
  <div className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between ${warning ? 'border-rose-200' : 'border-slate-200'}`}>
    <span className="text-slate-500 text-sm font-medium">{label}</span>
    <span className={`text-2xl font-bold mt-2 ${warning ? 'text-rose-600' : 'text-slate-800'}`}>{value}</span>
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
      <div className={`${barCls} h-1.5 rounded-full`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
    {warning && (
      <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Action priority
      </p>
    )}
  </div>
);

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">{label}</p>
      <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
    </div>
  </div>
);

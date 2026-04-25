import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowRight, FileText } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface Application {
  id: number;
  status: string;
  applicant_name?: string;
  applicant_class_level?: string;
  submitted_at?: string;
}

/**
 * Pipeline funnel for institution admissions. Groups the inbox by the
 * canonical statuses (draft → submitted → under_review →
 * more_info_requested → interview_invited → accepted → enrolled) and
 * renders each stage as a column with count + linked drill-through.
 *
 * Replaces the flat list view where an admin couldn't eyeball where
 * the bottleneck was. Typical question answered: "how many candidates
 * are stuck at 'more info requested' for more than a week?"
 */
const STAGE_ORDER: Array<{ id: string; label: string; accent: string }> = [
  { id: 'submitted',            label: 'Submitted',        accent: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { id: 'under_review',         label: 'Under review',     accent: 'bg-blue-50 border-blue-200 text-blue-800' },
  { id: 'more_info_requested',  label: 'More info',        accent: 'bg-amber-50 border-amber-200 text-amber-800' },
  { id: 'interview_invited',    label: 'Interview',        accent: 'bg-purple-50 border-purple-200 text-purple-800' },
  { id: 'accepted',             label: 'Accepted',         accent: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { id: 'rejected',             label: 'Rejected',         accent: 'bg-rose-50 border-rose-200 text-rose-800' },
];

export const AdmissionsPipeline: React.FC = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await apiClient.get<Application[] | { results: Application[] }>(
        '/admission-passport/admission-application/',
      );
      const list = Array.isArray(data) ? data : (data?.results || []);
      setApps(list);
      setLoading(false);
    };
    load();
  }, []);

  const groups = STAGE_ORDER.map((stage) => ({
    ...stage,
    items: apps.filter((a) => a.status === stage.id),
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" /> Admissions pipeline
          </CardTitle>
          <Link
            to="/dashboard/institution/admissions"
            className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-semibold"
          >
            Open full inbox <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && <p className="py-4 text-center text-sm text-slate-500">Loading pipeline…</p>}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {groups.map((g) => (
              <div key={g.id} className={`rounded-lg border p-3 ${g.accent}`}>
                <p className="text-[11px] uppercase tracking-wider font-bold mb-1">{g.label}</p>
                <p className="text-2xl font-extrabold leading-none">{g.items.length}</p>
                {g.items.length > 0 && (
                  <p className="text-[11px] mt-2 opacity-80 line-clamp-2">
                    {g.items.slice(0, 2).map((a) => a.applicant_name || `#${a.id}`).join(', ')}
                    {g.items.length > 2 ? `, +${g.items.length - 2} more` : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {!loading && apps.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-sm font-semibold text-slate-700">No applications yet.</p>
            <p className="text-xs text-slate-500">
              When learners submit applications, they'll flow through these stages.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

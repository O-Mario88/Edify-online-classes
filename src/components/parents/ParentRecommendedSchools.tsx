import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { InstitutionMatchCard, RecommendedInstitution } from '../institutions/InstitutionMatchCard';
import { apiGet } from '../../lib/apiClient';

export const ParentRecommendedSchools: React.FC = () => {
  const [recs, setRecs] = useState<RecommendedInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await apiGet<RecommendedInstitution[]>('/institution-discovery/institutions/recommendations/');
        if (!error && Array.isArray(data)) setRecs(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-500 py-4">Finding trusted schools for your child…</div>;
  }

  if (recs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
        <h4 className="font-semibold text-slate-900">Trusted school recommendations will appear here soon.</h4>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          We only recommend schools that are actively delivering lessons, tracking attendance, and keeping parents informed — verified through real platform activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recs.slice(0, 6).map(inst => (
          <InstitutionMatchCard key={inst.id} inst={inst} ctaLabel="See school" variant="parent" />
        ))}
      </div>
      <div className="flex justify-between items-center pt-2">
        <p className="text-xs text-slate-500">
          Every recommendation is earned: Maple Activeness looks at real lesson delivery, attendance tracking, assessment activity, and parent reporting.
        </p>
        <Link to="/schools" className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
          Compare schools <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

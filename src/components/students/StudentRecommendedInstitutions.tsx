import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { InstitutionMatchCard, RecommendedInstitution } from '../institutions/InstitutionMatchCard';
import { apiGet } from '../../lib/apiClient';

export const StudentRecommendedInstitutions: React.FC = () => {
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
    return <div className="text-sm text-slate-500 py-4">Finding schools that match your profile…</div>;
  }

  if (recs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <Sparkles className="w-6 h-6 text-blue-600 mx-auto mb-2" />
        <h4 className="font-semibold text-slate-900">School recommendations will appear here once we have good matches.</h4>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          Maple recommends schools that are actively delivering lessons, tracking attendance, and reporting to parents — so you know they're real.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recs.slice(0, 6).map(inst => (
          <InstitutionMatchCard key={inst.id} inst={inst} ctaLabel="View profile" variant="student" />
        ))}
      </div>
      <div className="flex justify-between items-center pt-2">
        <p className="text-xs text-slate-500">
          Match estimates are based on Maple Activeness (lesson delivery, attendance, assessments, and parent reporting).
        </p>
        <Link to="/schools" className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
          See all schools <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface CurrentTermPayload {
  year_label: string | null;
  term: number | null;
  term_label: string | null;
  term_starts: string | null;
  term_ends: string | null;
  days_remaining_in_term: number | null;
  days_remaining_in_year: number | null;
}

/**
 * Thin one-line banner that shows the active academic year and term.
 * Renders nothing while loading or when the backend has no AcademicYear
 * configured (avoids rendering a "—" placeholder that adds visual noise
 * for accounts not yet tied to an institution timeline).
 */
export const AcademicTermBanner: React.FC = () => {
  const [data, setData] = useState<CurrentTermPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: payload } = await apiClient.get<CurrentTermPayload>(
        '/curriculum/current-term/',
      );
      setData(payload || null);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;
  if (!data || !data.year_label) return null;

  const piece = data.term_label
    ? `${data.year_label} · ${data.term_label}`
    : data.year_label;
  const remaining = data.days_remaining_in_term;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm px-4 py-2 flex items-center gap-3 text-sm">
      <CalendarDays className="w-4 h-4 text-slate-500 shrink-0" />
      <span className="font-semibold text-slate-800">{piece}</span>
      {typeof remaining === 'number' && remaining > 0 && (
        <span className="text-xs text-slate-500">
          {remaining} day{remaining === 1 ? '' : 's'} left in term
        </span>
      )}
      {typeof remaining === 'number' && remaining === 0 && data.term_label?.includes('ended') && (
        <span className="text-xs text-amber-700">Term has ended — set up the new academic year.</span>
      )}
    </div>
  );
};

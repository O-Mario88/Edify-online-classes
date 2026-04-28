import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { apiGet } from '../../lib/apiClient';

interface Pathway {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
  recommended_subjects: string[];
  required_skills: string[];
  typical_roles: string[];
  education_levels: string[];
  related_industries: string[];
  icon_emoji?: string;
}

interface Suggestion {
  id: string;
  pathway: Pathway;
  confidence: number;
  reasoning: string;
}

export const FuturePathwaysPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [catalog, setCatalog] = useState<Pathway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [sug, cat] = await Promise.all([
        apiGet<Suggestion[]>('/pathways/my-suggestions/'),
        apiGet<{ results?: Pathway[] } | Pathway[]>('/pathways/'),
      ]);
      if (Array.isArray(sug.data)) setSuggestions(sug.data);
      if (cat.data) {
        const arr = Array.isArray(cat.data) ? cat.data : (cat.data.results || []);
        setCatalog(arr);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const suggestedIds = new Set(suggestions.map(s => s.pathway.id));
  const rest = catalog.filter(p => !suggestedIds.has(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-xs font-bold tracking-widest text-indigo-700 uppercase">
            <Compass className="w-3 h-3" /> Future Pathways
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">See where what you're learning can take you.</h1>
          <p className="text-slate-600 max-w-2xl">Maple maps your strong subjects to real-world career families. This is guidance, not a label — your path is still yours to choose.</p>
        </header>

        {suggestions.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Your matched pathways</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {suggestions.map(s => <PathwayCard key={s.id} pathway={s.pathway} confidence={s.confidence} reasoning={s.reasoning} matched />)}
            </div>
            <p className="text-xs text-slate-500 pt-2">
              Pathway match is based on your strongest subjects in recent assessments and practice activity. As you grow, these suggestions update.
            </p>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Explore more pathways</h2>
          {rest.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <Sparkles className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">More pathways are being curated.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {rest.map(p => <PathwayCard key={p.id} pathway={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};


const PathwayCard: React.FC<{ pathway: Pathway; confidence?: number; reasoning?: string; matched?: boolean }> = ({ pathway, confidence, reasoning, matched }) => (
  <Card className={matched ? 'border-indigo-200 shadow-md' : ''}>
    <CardContent className="p-5 space-y-3 flex flex-col h-full">
      <div className="flex items-start justify-between">
        <div className="text-3xl">{pathway.icon_emoji || '🧭'}</div>
        {matched && typeof confidence === 'number' && (
          <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white">{Math.round(confidence)}% match</Badge>
        )}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 leading-tight">{pathway.title}</h3>
        {pathway.tagline && <p className="text-xs text-slate-600 mt-1">{pathway.tagline}</p>}
      </div>

      {matched && confidence !== undefined && (
        <div>
          <Progress value={confidence} className="h-1.5" />
          {reasoning && <p className="text-xs text-slate-600 mt-2">{reasoning}</p>}
        </div>
      )}

      {pathway.recommended_subjects.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Key subjects</p>
          <div className="flex flex-wrap gap-1">
            {pathway.recommended_subjects.slice(0, 4).map(s => (
              <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {pathway.typical_roles.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Typical roles</p>
          <p className="text-xs text-slate-700">{pathway.typical_roles.slice(0, 3).join(' · ')}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default FuturePathwaysPage;

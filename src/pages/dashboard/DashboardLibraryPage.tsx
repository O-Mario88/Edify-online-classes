import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Play, FileText, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGet } from '@/lib/apiClient';

interface ResourceRow {
  id: number | string;
  title: string;
  resource_type?: 'video' | 'pdf' | 'note' | 'audio' | 'link' | string;
  subject_name?: string;
  class_level_name?: string;
  topic_name?: string;
  duration_minutes?: number | null;
  file_size_mb?: number | null;
  saved?: boolean;
  url?: string;
  preview_image?: string | null;
}

const TYPE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  video: { icon: Play,     label: 'Video' },
  pdf:   { icon: FileText, label: 'PDF' },
  note:  { icon: FileText, label: 'Note' },
  audio: { icon: Play,     label: 'Audio' },
  link:  { icon: BookOpen, label: 'Link' },
};

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Dashboard library — read-view of the resources the learner has
 * saved or recently engaged with. Backed by /api/v1/resources/. Keep
 * the surface light; the full catalog lives at /library.
 */
export const DashboardLibraryPage: React.FC = () => {
  const [items, setItems] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await apiGet<any>('/resources/?saved=true&limit=24');
      if (cancelled) return;
      if (r.error) {
        setError(r.error.message);
      } else {
        setItems(arr<ResourceRow>(r.data));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      (r.subject_name || '').toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Study Library</h1>
            <p className="text-gray-500">Saved materials and recently engaged content.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full md:w-64 border rounded-full pl-10 pr-4 py-2 text-sm bg-white"
              placeholder="Search my library..."
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-900">Your library is empty</p>
              <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
                Save resources from the catalog and they'll appear here for quick offline access.
              </p>
              <Link to="/library" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                Browse the catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" /> Saved resources ({filtered.length})
              </h3>
              <Link to="/library" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
                Browse full catalog <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => <ResourceCard key={String(r.id)} resource={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ResourceCard: React.FC<{ resource: ResourceRow }> = ({ resource }) => {
  const meta = TYPE_META[resource.resource_type || 'pdf'] || TYPE_META.pdf;
  const Icon = meta.icon;
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-0">
        <div className="h-28 bg-slate-100 flex items-center justify-center border-b">
          {resource.preview_image ? (
            <img src={resource.preview_image} alt={resource.title} className="h-full w-full object-cover" />
          ) : (
            <Icon className="w-10 h-10 text-slate-400" />
          )}
        </div>
        <div className="p-4">
          <Badge variant="outline" className="mb-2">{meta.label}</Badge>
          <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{resource.title}</h4>
          <p className="text-xs text-gray-500">
            {[resource.subject_name, resource.class_level_name, resource.topic_name].filter(Boolean).join(' · ') || 'Library'}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {resource.duration_minutes ? `${resource.duration_minutes} min` : ''}
              {resource.file_size_mb ? ` · ${resource.file_size_mb.toFixed(1)} MB` : ''}
            </p>
            {resource.url ? (
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">Open</Button>
              </a>
            ) : (
              <Button variant="outline" size="sm" disabled>Open</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardLibraryPage;

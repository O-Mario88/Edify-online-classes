import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Trophy, BookOpen, Sparkles, Share2, Lock, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';
import { toast } from 'sonner';

interface PassportEntry {
  id: string;
  entry_type: string;
  title: string;
  description: string;
  evidence_url: string;
  issued_at: string;
}

interface IssuedCredential {
  id: string;
  verification_code: string;
  issued_at: string;
  credential: {
    title: string;
    description: string;
    credential_type: string;
    level: string;
    issuer_type: string;
  };
}

interface Passport {
  id: string;
  student_name: string;
  visibility: 'private' | 'parent_only' | 'shareable';
  public_share_token: string | null;
  headline: string;
  bio: string;
  entries: PassportEntry[];
  credentials: IssuedCredential[];
}

const ENTRY_ICONS: Record<string, any> = {
  certificate: Award,
  badge: Trophy,
  project: BookOpen,
  assessment: BookOpen,
  teacher_feedback: Sparkles,
  exam_report: BookOpen,
  peer_contribution: Sparkles,
  track_completion: Trophy,
};

export const LearningPassportPage: React.FC = () => {
  const [p, setP] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  const load = async () => {
    const { data } = await apiGet<Passport>('/passport/my/');
    if (data) setP(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading || !p) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const shareLink = p.public_share_token
    ? `${window.location.origin}/passport/public/${p.public_share_token}`
    : null;

  const handleShare = async () => {
    setSharing(true);
    const { data } = await apiPost<{ public_share_token: string }>('/passport/share/', {});
    setSharing(false);
    if (data) {
      await load();
      toast.success('Passport is now shareable.');
    }
  };

  const handleStopSharing = async () => {
    await apiPost('/passport/stop-sharing/', {});
    await load();
    toast.success('Sharing stopped. Old link no longer works.');
  };

  const copyLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    toast.success('Link copied');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-xs font-bold tracking-widest text-indigo-700 uppercase mb-2">
              <Sparkles className="w-3 h-3" /> Learning Passport
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{p.student_name}</h1>
            {p.headline && <p className="text-slate-700 mt-1">{p.headline}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="bg-white">{p.visibility}</Badge>
            {p.visibility === 'shareable' ? (
              <Button variant="outline" size="sm" onClick={handleStopSharing}>
                <Lock className="w-4 h-4 mr-1" /> Stop sharing
              </Button>
            ) : (
              <Button size="sm" onClick={handleShare} disabled={sharing} className="bg-indigo-600 hover:bg-indigo-700">
                <Share2 className="w-4 h-4 mr-1" /> Make shareable
              </Button>
            )}
          </div>
        </div>

        {shareLink && (
          <Card className="bg-indigo-50 border-indigo-100">
            <CardContent className="p-4 flex items-center gap-3">
              <Share2 className="w-4 h-4 text-indigo-700" />
              <span className="text-sm flex-1 truncate font-mono text-indigo-900">{shareLink}</span>
              <Button variant="outline" size="sm" onClick={copyLink}><Copy className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        )}

        {/* Credentials */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-600" /> My Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            {p.credentials.length === 0 ? (
              <p className="text-sm text-slate-600">
                Complete the required lessons, practice labs, and project to unlock your first credential.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {p.credentials.map(c => (
                  <div key={c.id} className="rounded-xl border border-slate-100 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.credential.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{c.credential.credential_type} · {c.credential.issuer_type}</p>
                      </div>
                      <Award className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{c.credential.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Verify</span>
                      <code className="text-xs text-slate-700">{c.verification_code}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entries */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Proof of Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {p.entries.length === 0 ? (
              <p className="text-sm text-slate-600">
                Passport entries appear here every time you complete a track, finish a practice lab, or receive teacher feedback.
              </p>
            ) : (
              <ul className="space-y-3">
                {p.entries.map(e => {
                  const Icon = ENTRY_ICONS[e.entry_type] || BookOpen;
                  return (
                    <li key={e.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                      <Icon className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                        {e.description && <p className="text-xs text-slate-600 mt-0.5">{e.description}</p>}
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{e.entry_type.replace('_', ' ')}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500 text-center">
          Every passport entry is earned through verified evidence — completed lessons, reviewed projects, assessment results, and teacher feedback.
        </p>
      </div>
    </div>
  );
};

export default LearningPassportPage;

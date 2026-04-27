import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, BookOpen, Video, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { apiGet } from '../lib/apiClient';

interface TeacherProfile {
  full_name: string;
  username?: string;
  email?: string;
  bio?: string;
  subjects?: string[];
  languages?: string[];
  rating?: number;
  rating_count?: number;
  avatar?: string;
  is_verified?: boolean;
}

interface ListingRow {
  id: number | string;
  title: string;
  subject_name?: string;
  type?: string;
  price?: number;
  currency?: string;
  status?: string;
  cover_image?: string | null;
  enrollment_count?: number;
  rating?: number;
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Public teacher storefront. Loads the teacher's profile + marketplace
 * listings by username and renders subjects, bio, ratings, and offered
 * classes / courses. URL: /t/:username.
 */
export const TeacherStorefront: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    (async () => {
      const [p, l] = await Promise.all([
        apiGet<TeacherProfile>(`/users/profile/${username}/`),
        apiGet<any>(`/marketplace/listings/?teacher_username=${encodeURIComponent(username)}`),
      ]);
      if (cancelled) return;
      if (p.error) setError(p.error.message);
      else setProfile(p.data ?? null);
      if (!l.error) setListings(arr<ListingRow>(l.data));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [username]);

  if (!username) {
    return <div className="container mx-auto p-8"><p>No teacher specified.</p></div>;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-rose-800">Could not load this storefront.</p>
            <p className="mt-1 text-sm text-rose-700">{error || 'Teacher profile not found.'}</p>
            <Link to="/marketplace" className="mt-3 inline-block text-sm font-semibold text-rose-800 underline">
              Back to marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative h-56 bg-gradient-to-r from-blue-700 to-indigo-900 border-b" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
            <img
              src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&size=192&background=e2e8f0`}
              alt={profile.full_name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-md border-4 border-white -mt-16 md:-mt-20"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{profile.full_name}</h1>
                {profile.is_verified && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Verified</Badge>
                )}
              </div>
              {profile.subjects && profile.subjects.length > 0 && (
                <p className="mt-1 text-sm text-slate-600">{profile.subjects.join(' · ')}</p>
              )}
              {typeof profile.rating === 'number' && profile.rating > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-900">{profile.rating.toFixed(1)}</span>
                  {typeof profile.rating_count === 'number' && (
                    <span className="text-xs text-slate-500">({profile.rating_count} reviews)</span>
                  )}
                </div>
              )}
              {profile.bio && (
                <p className="mt-3 text-slate-700 leading-relaxed">{profile.bio}</p>
              )}
              {profile.languages && profile.languages.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Languages: {profile.languages.join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Lessons & sessions</h2>
          {listings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">{profile.full_name} hasn't published any listings yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((l) => <ListingCard key={String(l.id)} listing={l} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const ListingCard: React.FC<{ listing: ListingRow }> = ({ listing }) => {
  const Icon = listing.type === 'live' || listing.type === 'recorded' ? Video : FileText;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{listing.title}</CardTitle>
          {listing.status && listing.status !== 'published' && (
            <Badge variant="outline">{listing.status}</Badge>
          )}
        </div>
        {listing.subject_name && (
          <p className="text-xs text-slate-500">{listing.subject_name}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Icon className="w-4 h-4" /> {listing.type || 'Lesson'}
          </span>
          {typeof listing.enrollment_count === 'number' && (
            <span>{listing.enrollment_count} learners</span>
          )}
          {typeof listing.price === 'number' && listing.price > 0 && (
            <span className="font-semibold text-slate-900">
              {listing.currency || ''} {listing.price.toLocaleString()}
            </span>
          )}
        </div>
        {typeof listing.rating === 'number' && listing.rating > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-900">{listing.rating.toFixed(1)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherStorefront;

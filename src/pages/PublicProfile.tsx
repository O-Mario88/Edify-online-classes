import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GraduationCap, MapPin, Share2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BadgeShowcase, AchievementBadge } from '../components/badges/BadgeShowcase';
import { CertificateCard, Certificate } from '../components/badges/CertificateCard';
import { apiGet } from '../lib/apiClient';

// Profile data shape — will be populated by the public profile API when available
interface PublicProfileData {
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
  joinedDate: string;
  badges: AchievementBadge[];
  certificates: Certificate[];
}

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await apiGet<PublicProfileData>(`/users/profile/${username}/`);
        if (error) throw error;
        setProfile(data ?? null);
      } catch (error) {
        console.error('Error fetching public profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  if (loading) return <div className="p-8 text-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading profile...</p></div>;

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Coming Soon</h2>
        <p className="text-gray-500">Public profiles will be available once the profile system is fully set up.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 w-full relative">
         <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            
            <div className="relative">
              <img 
                 src={profile.avatar} 
                 alt={profile.name} 
                 className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white shadow-lg object-cover"
                 onError={(e) => {
                   e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=160&background=f8f9fa`;
                 }}
              />
              <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md tooltip" title="Verified Learner">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Share2 size={16} /> Share
                </Button>
              </div>
              <p className="text-gray-500 font-mono text-sm mb-4">@{profile.username}</p>
              
              <p className="text-gray-700 max-w-2xl text-base mb-4 leading-relaxed">
                {profile.bio}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400" />
                  {profile.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-green-500" />
                  Joined {new Date(profile.joinedDate).getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-8">
           <BadgeShowcase badges={profile.badges} />
        </div>

        {/* Certificates Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             <GraduationCap className="text-blue-600" /> Confirmed Certificates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {profile.certificates.map(cert => (
               <CertificateCard key={cert.id} certificate={cert} isPublicView={true} />
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

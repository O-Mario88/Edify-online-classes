import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GraduationCap, MapPin, Share2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BadgeShowcase, AchievementBadge } from '../components/badges/BadgeShowcase';
import { CertificateCard, Certificate } from '../components/badges/CertificateCard';

// Realistically, this would fetch from a public /api/profile endpoint
const getMockPublicProfile = (username: string) => {
  return {
    name: "Grace Nakato",
    username: username,
    bio: "Top-performing science student at Kampala High School. Aspiring software engineer with a passion for algorithms.",
    location: "Kampala, Uganda",
    avatar: "/images/students/grace-nakato.jpg",
    joinedDate: "2024-01-15",
    badges: [
      {
        id: "b-01",
        name: "Physics Master",
        description: "Scored 95%+ in 5 consecutive advanced Physics exams.",
        rarity: "epic",
        unlockedAt: "2024-02-10T10:00:00Z"
      },
      {
        id: "b-02",
        name: "Peer Tutor",
        description: "Verified community tutor with 50+ hours of sessions.",
        rarity: "rare",
        unlockedAt: "2024-03-01T10:00:00Z"
      },
      {
        id: "b-03",
        name: "100 Day Streak",
        description: "Logged in and learned for 100 days straight.",
        rarity: "rare",
        unlockedAt: "2024-04-20T10:00:00Z"
      },
      {
        id: "b-04",
        name: "First Project",
        description: "Completed your first collaborative project.",
        rarity: "common",
        unlockedAt: "2024-01-20T10:00:00Z"
      }
    ] as AchievementBadge[],
    certificates: [
      {
         id: "cert-01",
         title: "Advanced Mathematics Mastery: Calculus",
         issuedTo: "Grace Nakato",
         issuedDate: "2024-03-05T00:00:00Z",
         issuerLogo: "/icons/maple.png",
         verificationHash: "0x8F9aC24B2eD9F5b7"
      }
    ] as Certificate[]
  };
};

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ReturnType<typeof getMockPublicProfile> | null>(null);

  useEffect(() => {
    // Mocking an API call
    if (username) {
      setProfile(getMockPublicProfile(username));
    }
  }, [username]);

  if (!profile) return <div className="p-8 text-center mt-20">Loading profile data...</div>;

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

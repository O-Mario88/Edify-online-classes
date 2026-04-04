import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Crown, Star, TrendingUp, DollarSign, Users, BookOpen, Trophy, Medal, Award } from 'lucide-react';

interface LeaderEntry {
  rank: number;
  name: string;
  subject: string;
  value: string;
  avatar?: string;
}

interface TeacherLeaderboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string; // tailwind color prefix e.g. 'amber', 'blue', 'emerald'
  entries: LeaderEntry[];
  valueLabel: string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-amber-500" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-slate-400" />;
  if (rank === 3) return <Award className="w-4 h-4 text-amber-700" />;
  return <span className="text-xs font-bold text-slate-400 w-4 text-center">#{rank}</span>;
};

const getRankBg = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
  if (rank === 2) return 'bg-slate-50/70 border-slate-200';
  if (rank === 3) return 'bg-orange-50/50 border-orange-100';
  return 'bg-white border-slate-100';
};

const TeacherLeaderboardCard: React.FC<TeacherLeaderboardCardProps> = ({
  title,
  description,
  icon,
  accentColor,
  entries,
  valueLabel
}) => {
  return (
    <Card className="h-full flex flex-col shadow-sm border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className={`pb-3 border-b border-slate-100 bg-gradient-to-r from-${accentColor}-50/50 to-white`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg bg-${accentColor}-100`}>
            {icon}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-sm font-bold text-slate-800 leading-tight">{title}</CardTitle>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="divide-y divide-slate-50 flex-1">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50/50 ${idx === 0 ? 'bg-gradient-to-r from-amber-50/40 to-transparent' : ''}`}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${getRankBg(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>

              {/* Name + Subject */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold text-slate-800 truncate ${entry.rank === 1 ? 'text-amber-900' : ''}`}>
                  {entry.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium truncate">{entry.subject}</p>
              </div>

              {/* Value */}
              <div className="text-right shrink-0">
                <span className={`text-sm font-bold ${entry.rank === 1 ? 'text-amber-700' : 'text-slate-700'}`}>
                  {entry.value}
                </span>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{valueLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


export const TeacherCompetitionLeaderboards: React.FC = () => {
  const contentReviewBoard: LeaderEntry[] = [
    { rank: 1, name: 'Ms. Sarah Nakamya', subject: 'Senior 4 Mathematics', value: '4.9 ★' },
    { rank: 2, name: 'Mr. John Oketcho', subject: 'Senior 3 Physics', value: '4.8 ★' },
    { rank: 3, name: 'Mrs. Grace Atim', subject: 'Senior 5 Chemistry', value: '4.7 ★' },
    { rank: 4, name: 'Mr. Peter Ssempa', subject: 'Senior 2 Biology', value: '4.6 ★' },
    { rank: 5, name: 'Ms. Joy Nalubega', subject: 'Senior 6 Mathematics', value: '4.5 ★' },
  ];

  const contentUploadBoard: LeaderEntry[] = [
    { rank: 1, name: 'Ms. Sarah Nakamya', subject: 'Mathematics', value: '1,240' },
    { rank: 2, name: 'Mr. John Oketcho', subject: 'Physics', value: '980' },
    { rank: 3, name: 'Mrs. Agnes Nambi', subject: 'English Language', value: '865' },
    { rank: 4, name: 'Mrs. Grace Atim', subject: 'Chemistry', value: '720' },
    { rank: 5, name: 'Mr. David Kamau', subject: 'Geography', value: '685' },
  ];

  const topEarnersBoard: LeaderEntry[] = [
    { rank: 1, name: 'Ms. Sarah Nakamya', subject: 'Mathematics', value: 'UGX 2.4M' },
    { rank: 2, name: 'Mr. John Oketcho', subject: 'Physics', value: 'UGX 1.8M' },
    { rank: 3, name: 'Mrs. Grace Atim', subject: 'Chemistry', value: 'UGX 1.5M' },
    { rank: 4, name: 'Mrs. Agnes Nambi', subject: 'English Language', value: 'UGX 1.2M' },
    { rank: 5, name: 'Mr. Peter Ssempa', subject: 'Biology', value: 'UGX 980K' },
  ];

  const topAttendanceBoard: LeaderEntry[] = [
    { rank: 1, name: 'Mr. John Oketcho', subject: 'Senior 3 Physics', value: '98%' },
    { rank: 2, name: 'Ms. Sarah Nakamya', subject: 'Senior 4 Mathematics', value: '96%' },
    { rank: 3, name: 'Mrs. Agnes Nambi', subject: 'Senior 2 English', value: '94%' },
    { rank: 4, name: 'Mr. David Kamau', subject: 'Senior 5 Geography', value: '93%' },
    { rank: 5, name: 'Mrs. Grace Atim', subject: 'Senior 3 Chemistry', value: '91%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <TeacherLeaderboardCard
        title="Content Review Stars"
        description="Top rated teachers by students"
        icon={<Star className="w-4 h-4 text-amber-600" />}
        accentColor="amber"
        entries={contentReviewBoard}
        valueLabel="rating"
      />
      <TeacherLeaderboardCard
        title="Most Accessed Content"
        description="Highest student engagement"
        icon={<BookOpen className="w-4 h-4 text-blue-600" />}
        accentColor="blue"
        entries={contentUploadBoard}
        valueLabel="accesses"
      />
      <TeacherLeaderboardCard
        title="Top Platform Earners"
        description="Highest earning teachers"
        icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
        accentColor="emerald"
        entries={topEarnersBoard}
        valueLabel="earned"
      />
      <TeacherLeaderboardCard
        title="Best Class Attendance"
        description="Most attended live sessions"
        icon={<Users className="w-4 h-4 text-indigo-600" />}
        accentColor="indigo"
        entries={topAttendanceBoard}
        valueLabel="attendance"
      />
    </div>
  );
};

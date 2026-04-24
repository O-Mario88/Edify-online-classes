import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, BookOpen, Award, Sparkles, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export interface MasteryTrack {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
  target_role: string;
  subject_name?: string | null;
  class_level_name?: string | null;
  level: string;
  exam_track?: string;
  estimated_duration_weeks: number;
  estimated_hours_per_week: number;
  is_premium: boolean;
  is_featured?: boolean;
  cover_image?: string;
  outcome_statement?: string;
  total_items: number;
  total_required_items: number;
}

interface Props {
  track: MasteryTrack;
}

export const MasteryTrackCard: React.FC<Props> = ({ track }) => {
  return (
    <Card className="h-full border-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden">
      <div className="h-28 bg-gradient-to-br from-indigo-600 to-blue-700 relative">
        {track.cover_image ? (
          <img src={track.cover_image} alt={track.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {track.is_premium && (
            <Badge className="bg-amber-400 text-amber-950 border-amber-300">Premium</Badge>
          )}
          {track.is_featured && (
            <Badge className="bg-white/90 text-indigo-700 border-white">Featured</Badge>
          )}
        </div>
      </div>
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {track.subject_name && (
            <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 text-xs">{track.subject_name}</Badge>
          )}
          {track.class_level_name && (
            <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 text-xs">{track.class_level_name}</Badge>
          )}
          {track.exam_track && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{track.exam_track}</Badge>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-tight">{track.title}</h3>
        {track.tagline && (
          <p className="text-sm text-slate-600 mt-1">{track.tagline}</p>
        )}
        <div className="flex gap-4 text-xs text-slate-500 mt-4">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{track.estimated_duration_weeks}w</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{track.total_items} items</span>
          <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{track.level}</span>
        </div>
        <Link to={`/mastery/${track.slug}`} className="mt-auto pt-5">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800">
            Preview track <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
};

export default MasteryTrackCard;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Award, Star, TrendingUp, CalendarDays, HeartHandshake, Shield } from 'lucide-react';
import { Badge } from '../ui/badge';

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string; // If null, we use a lucide icon based on category
  category: 'academic' | 'improvement' | 'consistency' | 'peer_support' | 'leadership' | 'attendance';
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementShowcaseProps {
  badges: AchievementBadge[];
}

export const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({ badges }) => {
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'improvement': return <TrendingUp className="h-7 w-7 text-white drop-shadow-md group-hover:animate-bounce" />;
      case 'consistency': return <CalendarDays className="h-7 w-7 text-white drop-shadow-md group-hover:animate-pulse" />;
      case 'peer_support': return <HeartHandshake className="h-7 w-7 text-white drop-shadow-md group-hover:animate-pulse" />;
      case 'leadership': return <Shield className="h-7 w-7 text-white drop-shadow-md group-hover:animate-pulse" />;
      default: return <Star className="h-7 w-7 text-white drop-shadow-md group-hover:animate-pulse" />;
    }
  };

  return (
    <Card className="shadow-sm border border-indigo-100/50">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
            <Award className="h-5 w-5 text-purple-500" />
            My Achievements
          </CardTitle>
          <Badge variant="outline" className="text-gray-500 font-medium">
             {badges.length} Unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border hover:shadow-md transition-shadow group cursor-pointer"
              title={badge.description}
            >
              <div className={`
                h-14 w-14 rounded-full flex items-center justify-center mb-3 shadow-inner relative
                ${badge.rarity === 'legendary' ? 'bg-gradient-to-br from-red-500 to-orange-600 border-2 border-red-300' 
                : badge.rarity === 'epic' ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-yellow-200' 
                : badge.rarity === 'rare' ? 'bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-purple-300'
                : 'bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-300'}
              `}>
                {badge.iconUrl ? (
                  <img src={badge.iconUrl} alt={badge.name} className="h-7 w-7 object-contain" />
                ) : (
                  getIconForCategory(badge.category)
                )}
              </div>
              <h4 className="font-semibold text-sm text-center line-clamp-1">{badge.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">{badge.rarity}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Award, Star } from 'lucide-react';

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic';
}

interface BadgeShowcaseProps {
  badges: AchievementBadge[];
}

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Award className="h-6 w-6 text-purple-700" />
          Achievement Showcase
        </CardTitle>
        <CardDescription>Verified skills and milestones</CardDescription>
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
                h-16 w-16 rounded-full flex items-center justify-center mb-3 shadow-inner
                ${badge.rarity === 'epic' ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-yellow-200' 
                : badge.rarity === 'rare' ? 'bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-purple-300'
                : 'bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-300'}
              `}>
                {badge.iconUrl ? (
                  <img src={badge.iconUrl} alt={badge.name} className="h-8 w-8 object-contain" />
                ) : (
                   <Star className="h-8 w-8 text-white drop-shadow-md group-hover:animate-pulse" />
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

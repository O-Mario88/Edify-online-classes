import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Award, TrendingUp, CheckCircle, Clock, HeartHandshake } from 'lucide-react';
import { Badge } from '../ui/badge';

export interface MeritEvent {
  id: string;
  category: 'academic' | 'attendance' | 'consistency' | 'peer_support' | 'improvement';
  description: string;
  points: number;
  timestamp: string;
}

interface MeritEngineWidgetProps {
  totalPoints: number;
  housePointsContributed: number;
  recentEvents: MeritEvent[];
}

export const MeritEngineWidget: React.FC<MeritEngineWidgetProps> = ({ 
  totalPoints, 
  housePointsContributed, 
  recentEvents 
}) => {

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'attendance': return <Clock className="w-4 h-4 text-green-500" />;
      case 'consistency': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'peer_support': return <HeartHandshake className="w-4 h-4 text-pink-500" />;
      case 'improvement': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default: return <Award className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full shadow-sm border border-indigo-100/50">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
             <Award className="w-5 h-5 text-indigo-500" />
             Merit & Points
          </CardTitle>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
             Top 20% in Class
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
           <div className="p-4 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Merits</p>
              <p className="text-3xl font-black text-indigo-600">{totalPoints}</p>
           </div>
           <div className="p-4 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">House Contribution</p>
              <p className="text-3xl font-black text-blue-600">+{housePointsContributed}</p>
           </div>
        </div>

        <div className="p-4">
           <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase">Recent Activity</h4>
           {recentEvents.length > 0 ? (
             <div className="space-y-3">
               {recentEvents.map(event => (
                 <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                       <div className="hidden sm:flex">{getCategoryIcon(event.category)}</div>
                       <span className="font-medium text-gray-700">{event.description}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      <span className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-bold text-green-600">+{event.points}</span>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-sm text-gray-500 text-center py-4">No points earned recently. Complete a module to start earning!</p>
           )}
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TopicConfidenceRadarProps {
  topicsConfidence: Array<{ subject: string; confidence: number }>;
}

export const TopicConfidenceRadar: React.FC<TopicConfidenceRadarProps> = ({ topicsConfidence }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Subject Confidence</CardTitle>
        <CardDescription>Visual breakdown of your strengths</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={topicsConfidence}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" className="text-xs fill-muted-foreground" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar
                name="Confidence %"
                dataKey="confidence"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

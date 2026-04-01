import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { Target } from 'lucide-react';

interface UNEBReadinessGaugeProps {
  score: number;
  examTarget: 'UCE' | 'UACE';
  predictedDivision?: number;
}

export const UNEBReadinessGauge: React.FC<UNEBReadinessGaugeProps> = ({ score, examTarget, predictedDivision }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  let color = '#ef4444'; // Red
  if (score >= 75) color = '#22c55e'; // Green
  else if (score >= 50) color = '#eab308'; // Yellow

  return (
    <Card className="h-full border-2 border-primary/10 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Target size={120} />
      </div>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          AI {examTarget} Readiness
        </CardTitle>
        <CardDescription>Based on quiz performance & assignments</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 relative z-10">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell key="cell-0" fill={color} />
                <Cell key="cell-1" fill="#f1f5f9" />
                <Label
                  value={`${score}%`}
                  position="centerBottom"
                  className="text-3xl font-bold fill-gray-800"
                  dy={-20}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-[-30px]">
          {predictedDivision && (
            <div className="inline-block bg-primary/10 text-primary font-semibold px-4 py-1 rounded-full text-sm">
              Predicted: Division {predictedDivision}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-3">
             {score >= 75 ? "Excellent! You are fully prepared to sit the exams." 
             : score >= 50 ? "Good progress, but specific subject targeted revision is needed." 
             : "You are currently at risk. Consider generating a 30-Day Rescue Plan."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Compass, Lightbulb, TrendingUp, Cpu, Leaf, ShieldAlert, ShieldCheck, BrainCircuit, HeartHandshake } from 'lucide-react';

const strengthData = [
  { subject: 'Analytical Thinking', A: 85, fullMark: 100 },
  { subject: 'Creativity & Design', A: 90, fullMark: 100 },
  { subject: 'Teamwork & Empathy', A: 75, fullMark: 100 },
  { subject: 'Practical Execution', A: 65, fullMark: 100 },
  { subject: 'Persistence', A: 80, fullMark: 100 },
  { subject: 'Communication', A: 70, fullMark: 100 },
];

export function CareerGuidanceWidget() {
  return (
    <div className="space-y-6">
      
      {/* Module Intro Bar */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2 mb-2">
              <Compass className="w-6 h-6 text-indigo-300" /> Career Guidance & Future Fit
            </h2>
            <p className="text-indigo-100 max-w-2xl">
              Based on your ongoing academic performance, project work, and behavioral consistency, we've identified key human strengths and pathways that align with your natural abilities.
            </p>
          </div>
          <Badge className="bg-indigo-500/30 text-indigo-100 ring-1 ring-indigo-400">Updates dynamically with every project</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Strength Profile */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
             <CardTitle className="flex items-center gap-2 text-lg">
               <BrainCircuit className="w-5 h-5 text-purple-500" /> Human Strength Profile
             </CardTitle>
             <CardDescription>Synthesized from 12 projects and 4 term exams.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={strengthData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" className="text-xs font-semibold fill-slate-600 dark:fill-slate-400" />
                  <Radar name="Student" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
               <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                 <strong className="text-purple-700 dark:text-purple-400">Core Insight:</strong> You possess a highly analytical mind balanced with extreme creativity. You excel at taking abstract concepts and designing concrete solutions.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Future Readiness Factors */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-lg">
               <TrendingUp className="w-5 h-5 text-emerald-500" /> Future Readiness Matrix
             </CardTitle>
             <CardDescription>How your strengths map to long-term macro trends.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                 <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                   <ShieldCheck className="w-4 h-4 text-emerald-600" /> Automation Resilience Indicator
                 </div>
                 <span className="text-emerald-600 font-bold">High</span>
               </div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
               </div>
               <p className="text-xs text-slate-500">Your strong focus on Creativity and Analytical problem-solving translates heavily to careers that require non-routine human judgment. These are highly resistant to AI disruption.</p>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-end">
                 <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                   <HeartHandshake className="w-4 h-4 text-blue-600" /> Human-Value Demand
                 </div>
                 <span className="text-blue-600 font-bold">Growing</span>
               </div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[70%] rounded-full"></div>
               </div>
               <p className="text-xs text-slate-500">Your empathy and communication markers are good, but strengthening collaborative projects will boost your fitness for leadership layers.</p>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-end">
                 <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                   <Cpu className="w-4 h-4 text-amber-500" /> Digital Economy Adaptation
                 </div>
                 <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20">Needs Polish</Badge>
               </div>
               <p className="text-xs text-slate-500 mt-1">Some fields you lean towards naturally (like physical layout design) are under immense automation pressure. You should integrate more digital software literacy into your next projects to stay hybrid.</p>
            </div>

          </CardContent>
        </Card>

        {/* Pathway Recommendations */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-lg">
               <Lightbulb className="w-5 h-5 text-amber-500" /> Suggested Pathways
             </CardTitle>
             <CardDescription>Data-grounded directions to consider.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            
            {/* Pathway 1 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Architecture & Green Design</h4>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">92% Match</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Your physics performance combined with your exceptional geography modeling project suggests a profound fit for sustainable infrastructure.
              </p>
              <div className="text-xs border-t border-slate-200 dark:border-slate-700 pt-3">
                 <strong className="text-slate-700 dark:text-slate-300">Action Plan:</strong> Focus intensely on S4 Mathematics and try to request a 3D modeling project from your teacher next term.
              </div>
            </div>

            {/* Pathway 2 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Software Engineering</h4>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">86% Match</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Your analytical logic scores are elite, and your persistence in solving the Term 2 coding challenges flags high resilience for debugging systems.
              </p>
              <div className="text-xs border-t border-slate-200 dark:border-slate-700 pt-3">
                 <strong className="text-slate-700 dark:text-slate-300">Action Plan:</strong> You need to actively boost your "Communication" markers. Software is highly collaborative. Join a peer-tutoring bounty!
              </div>
            </div>

          </CardContent>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center border-t border-slate-100 dark:border-slate-800 rounded-b-xl">
             <p className="text-xs text-slate-500 italic">These AI-driven pathways are guides, not limits. The more evidence you produce, the smarter this becomes.</p>
          </div>
        </Card>

      </div>
    </div>
  );
}

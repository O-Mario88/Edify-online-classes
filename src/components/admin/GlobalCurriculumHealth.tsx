import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, AlertTriangle, ShieldAlert, Sparkles, BellRing, Siren } from 'lucide-react';
import { Badge } from '../ui/badge';

interface GlobalCurriculumHealthProps {
  onOpenMap?: (topic: string) => void;
}

export const GlobalCurriculumHealth: React.FC<GlobalCurriculumHealthProps> = ({ onOpenMap }) => {
  const [alertSent, setAlertSent] = React.useState(false);
  const [dangerSent, setDangerSent] = React.useState(false);

  const handleAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  const handleDanger = () => {
    setDangerSent(true);
    setTimeout(() => setDangerSent(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Mastered Column (Green) */}
      <Card className="h-full flex flex-col shadow-sm border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-5 flex-1 flex flex-col justify-between">
          <div>
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                   <Sparkles className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-emerald-900 leading-tight">Mastered Topics</h3>
                   <p className="text-xs text-emerald-700">Platform-wide excellence</p>
                </div>
             </div>
             
             <div className="space-y-3 mb-6">
                <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm flex justify-between items-center">
                   <div>
                      <p className="text-sm font-bold text-slate-800">Biology: Genetics</p>
                      <p className="text-xs text-slate-700">82% Avg Score</p>
                   </div>
                   <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Top 10%</Badge>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm flex justify-between items-center">
                   <div>
                      <p className="text-sm font-bold text-slate-800">History: World War II</p>
                      <p className="text-xs text-slate-700">79% Avg Score</p>
                   </div>
                   <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Rising</Badge>
                </div>
             </div>
          </div>
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700 mt-auto"
            onClick={() => onOpenMap && onOpenMap('National Mastery Analytics')}
          >
             <CheckCircle className="w-4 h-4 mr-2" /> View Distribution Map
          </Button>
        </CardContent>
      </Card>

      {/* Warning Column (Amber) */}
      <Card className="h-full flex flex-col shadow-sm border-amber-200 bg-amber-50/30">
        <CardContent className="p-5 flex-1 flex flex-col justify-between">
          <div>
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-100 rounded-full text-amber-800">
                   <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-amber-900 leading-tight">Warning Zone</h3>
                   <p className="text-xs text-amber-700">Topics slipping in performance</p>
                </div>
             </div>
             
             <div className="space-y-3 mb-6">
                <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex justify-between items-center opacity-90">
                   <div>
                      <p className="text-sm font-bold text-slate-800">Physics: Kinematics</p>
                      <p className="text-xs text-slate-700">54% Avg Score</p>
                   </div>
                   <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">-12% drop</Badge>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex justify-between items-center opacity-90">
                   <div>
                      <p className="text-sm font-bold text-slate-800">Math: Vectors</p>
                      <p className="text-xs text-slate-700">58% Avg Score</p>
                   </div>
                   <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Underperforming</Badge>
                </div>
             </div>
          </div>
          <Button 
             className={`w-full ${alertSent ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'} text-white mt-auto`}
             onClick={handleAlert}
          >
             {alertSent ? (
               <><CheckCircle className="w-4 h-4 mr-2" /> Email sent to Head Teacher & DoS</>
             ) : (
               <><BellRing className="w-4 h-4 mr-2" /> Alert Department Heads</>
             )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Column (Red) */}
      <Card className="h-full flex flex-col shadow-sm border-red-200 bg-red-50/30">
        <CardContent className="p-5 flex-1 flex flex-col justify-between">
          <div>
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-100 rounded-full text-red-800">
                   <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-red-900 leading-tight">Critical Failure Risk</h3>
                   <p className="text-xs text-red-700">Immediate intervention required</p>
                </div>
             </div>
             
             <div className="space-y-3 mb-6">
                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm flex justify-between items-center relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                   <div>
                      <p className="text-sm font-bold text-slate-800 pl-2">Chem: Mole Concept</p>
                      <p className="text-xs text-slate-700 pl-2">38% Avg Score</p>
                   </div>
                   <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">8% Spike Failure</Badge>
                </div>
                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm flex justify-between items-center relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                   <div>
                      <p className="text-sm font-bold text-slate-800 pl-2">Literature: Poetry Analysis</p>
                      <p className="text-xs text-slate-700 pl-2">41% Avg Score</p>
                   </div>
                   <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">14 Orgs failing</Badge>
                </div>
             </div>
          </div>
          <Button 
            className={`w-full border shadow ${dangerSent ? 'bg-green-600 border-green-700 hover:bg-green-700' : 'bg-red-600 border-red-700 hover:bg-red-700'} text-white mt-auto`}
            onClick={handleDanger}
          >
             {dangerSent ? (
               <><CheckCircle className="w-4 h-4 mr-2" /> Strategy Emails Sent to All DoS & Heads</>
             ) : (
               <><Siren className="w-4 h-4 mr-2" /> Broadcast Institution Alerts</>
             )}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
};

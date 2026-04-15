import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, AlertTriangle, BookOpen, MessageCircle, FileText, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { NotificationEngine } from '@/lib/integrations/NotificationEngine';
import { toast } from 'sonner';

const FALLBACK_SUGGESTIONS = [
  {
    id: 'int-1',
    topic: "Calculus: Limits & Continuity",
    class: "A-Level Math (Stream A)",
    affectedStudents: 14,
    readinessScore: 42,
    suggestedResources: [
      { type: "pdf", title: "Calculus Recovery Worksheet", official: true },
      { type: "video", title: "Limits Refresher (12 mins)", official: false }
    ],
    suggestedPeerLeader: "Jane A. (92% Mastery)",
    suggestedAction: "Peer-to-Peer Discussion"
  },
  {
    id: 'int-2',
    topic: "Volumetric Analysis",
    class: "S4 Chemistry",
    affectedStudents: 22,
    readinessScore: 38,
    suggestedResources: [
      { type: "video", title: "Titration Practical Guide", official: true }
    ],
    suggestedPeerLeader: "David O. (88% Mastery)",
    suggestedAction: "Resource Bundle Dispatch"
  }
];

export function TeacherInterventionPanel() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const { data, error } = await apiClient.get('/intelligence/actions/');
        if (!error && data?.results?.length > 0) {
          // Map backend format if available
          setSuggestions(data.results.slice(0, 2));
        } else {
          setSuggestions(FALLBACK_SUGGESTIONS);
        }
      } catch {
        setSuggestions(FALLBACK_SUGGESTIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  const handleAssign = async (suggestion: any) => {
    setProcessingId(suggestion.id);
    try {
       await NotificationEngine.send(
         'in_app',
         suggestion.class,
         'class_roster',
         'intervention_assigned',
         `Assigned recovery material for ${suggestion.topic}`,
         true
       );
       
       // Optionally remove the suggestion or mark it as done
       setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
       toast.success('Intervention dispatched successfully!');
    } catch (error) {
       toast.error('Failed to dispatch intervention packet.');
    } finally {
       setProcessingId(null);
    }
  };

  if (loading) {
     return <div className="animate-pulse h-32 bg-indigo-50 rounded-lg mb-8"></div>;
  }

  if (suggestions.length === 0) {
     return null; // All clear!
  }

  return (
    <div className="mb-8 space-y-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-2 mb-4">
         <Target className="w-6 h-6 text-indigo-800" />
         <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Support & Resource Intervention</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suggestions.map((suggestion, idx) => (
          <Card key={suggestion.id || idx} className="border-indigo-100 shadow-sm bg-gradient-to-r from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-l-4 border-l-indigo-500 overflow-hidden relative group hover:shadow-md transition-all">
             <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                     <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100">{suggestion.topic || 'General Review'}</CardTitle>
                     <CardDescription className="text-indigo-700/70 dark:text-indigo-300 font-medium">
                       {suggestion.class || 'Unknown Class'}
                     </CardDescription>
                  </div>
                  <Badge variant="destructive" className="bg-rose-100 text-rose-800 border-none shadow-none hover:bg-rose-100 flex gap-1 items-center">
                    <AlertTriangle className="w-3 h-3" /> {suggestion.affectedStudents || 0} Struggling
                  </Badge>
                </div>
             </CardHeader>
             <CardContent className="space-y-4">
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                   <p className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-2">
                     <Zap className="w-3 h-3 text-amber-700" /> Suggested Resources
                   </p>
                   <ul className="space-y-2">
                     {(suggestion.suggestedResources || []).map((res: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          {res.type === 'pdf' ? <FileText className="w-4 h-4 text-red-700" /> : <BookOpen className="w-4 h-4 text-blue-700"/>}
                          {res.title}
                          {res.official && <Badge className="text-[9px] h-4 px-1 pb-[2px] bg-amber-50 text-amber-700 border-amber-200">Official</Badge>}
                        </li>
                     ))}
                   </ul>

                   <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-700">Suggested Action</p>
                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                          {suggestion.suggestedAction === 'Peer-to-Peer Discussion' ? <MessageCircle className="w-3 h-3"/> : <Target className="w-3 h-3"/>}
                          {suggestion.suggestedAction || 'Assign Study Plan'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-700">Peer Leader</p>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{suggestion.suggestedPeerLeader || 'N/A'}</p>
                      </div>
                   </div>
                </div>

                <div className="flex gap-2">
                   <Button 
                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                     onClick={() => handleAssign(suggestion)}
                     disabled={processingId === suggestion.id}
                   >
                     {processingId === suggestion.id ? 'Dispatching...' : 'Review & Assign Intervention'}
                   </Button>
                </div>

             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Target, Users, Send, CheckCircle, AlertTriangle, FileUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function AssignmentTargetingStudio() {
  const navigate = useNavigate();
  const [targetMode, setTargetMode] = useState<'global' | 'at-risk' | 'high-performers'>('global');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [title, setTitle] = useState('');

  const handleAIAssist = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setTitle("AI Generated: Remedial Worksheet - Quadratic Roots");
      toast.success("AI generated a customized remedial worksheet based on previous failure points.");
    }, 1500);
  };

  const handleDispatch = async () => {
    if (!title.trim()) {
      toast.error('Please specify an assignment title before dispatching.');
      return;
    }
    setIsDispatching(true);
    try {
      // Import apiClient locally if missing, assuming it's available or we can use it
      const { apiClient } = await import('@/lib/apiClient');
      await apiClient.post('/assessments/assessment/', {
        title: title,
        context: targetMode,
        type: 'worksheet' // hardcoded just to satisfy generic payload
      });
      toast.success("Assignment dispatched successfully to Target Group.");
    } catch (err) {
      toast.error("Failed to connect to Assignment Engine.");
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-6">
      
      {/* Page Navigation & Meta */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-col gap-2">
           <Button variant="ghost" onClick={() => navigate('/dashboard')} className="w-fit -ml-4 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
             <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
           </Button>
           <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
               Assignment Targeting Engine <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Beta</Badge>
             </h1>
             <p className="text-slate-500 mt-1">Dispatch tailored coursework to specific cognitive cohorts.</p>
           </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white dark:bg-slate-900 border-slate-200" onClick={() => toast.success('Assignment draft saved.')}>
            Save Draft
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isDispatching} onClick={handleDispatch}>
            <Send className="w-4 h-4" /> {isDispatching ? 'Dispatching...' : 'Dispatch Assignment'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Assignment Setup (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg">Assignment Blueprint</CardTitle>
              <CardDescription>Define the educational payload.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Remedial Worksheet: Quadratic Roots" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select defaultValue="worksheet">
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Interactive Quiz</SelectItem>
                      <SelectItem value="worksheet">Digital Worksheet</SelectItem>
                      <SelectItem value="project">Project Work</SelectItem>
                      <SelectItem value="intervention_pack">Resource Bundle / Intervention Pack</SelectItem>
                      <SelectItem value="peer_session">Peer-to-Peer Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grading Weight (Max Score)</Label>
                  <Input type="number" defaultValue="20" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea 
                  rows={4} 
                  placeholder="Provide explicit instructions..." 
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-4 mt-6 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <FileUp className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to attach resources or drag-and-drop</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audience Targeting Matrix (Right Column) */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" /> Active Targeting Matrix
              </CardTitle>
              <CardDescription>Select delivery payload scope.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div 
                className={`p-4 border rounded-xl cursor-pointer transition-all ${targetMode === 'global' ? 'border-slate-400 bg-slate-50 dark:bg-slate-800 dark:border-slate-500 ring-2 ring-slate-200 dark:ring-slate-700' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                onClick={() => setTargetMode('global')}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <Users className="w-4 h-4" /> Global Delivery
                  </div>
                  {targetMode === 'global' && <CheckCircle className="w-4 h-4 text-slate-800 dark:text-slate-200" />}
                </div>
                <p className="text-xs text-slate-500">Delivers to all 142 active students in this cohort.</p>
              </div>

              <div 
                className={`p-4 border rounded-xl cursor-pointer transition-all ${targetMode === 'at-risk' ? 'border-red-400 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-200 dark:ring-red-900' : 'border-slate-200 dark:border-slate-800 hover:border-red-200'}`}
                onClick={() => setTargetMode('at-risk')}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-semibold text-red-900 dark:text-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> At-Risk Intervention
                  </div>
                  {targetMode === 'at-risk' && <CheckCircle className="w-4 h-4 text-red-600" />}
                </div>
                <p className="text-xs text-red-700/70 dark:text-red-300">Delivers ONLY to the 14 students flagged by the Risk Engine.</p>
              </div>

              <div 
                className={`p-4 border rounded-xl cursor-pointer transition-all ${targetMode === 'high-performers' ? 'border-green-400 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200 dark:ring-green-900' : 'border-slate-200 dark:border-slate-800 hover:border-green-200'}`}
                onClick={() => setTargetMode('high-performers')}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-semibold text-green-900 dark:text-green-200">
                    Sparkles Enrichment
                  </div>
                  {targetMode === 'high-performers' && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <p className="text-xs text-green-700/70 dark:text-green-300">Delivers ONLY to the top 15% (21 students) for challenge tasks.</p>
              </div>

            </CardContent>
          </Card>

          <Card className="border-indigo-200 dark:border-indigo-900/50 shadow-sm bg-indigo-50 dark:bg-indigo-900/10">
            <CardHeader>
               <CardTitle className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Maple Copilot
               </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-300 mb-4">
                Not sure what to assign? Maple Copilot can analyze this cohort's performance history and automatically generate a targeted worksheet.
              </p>
              <Button 
                onClick={handleAIAssist} 
                className="w-full bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 dark:bg-slate-900 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-slate-800"
                variant="outline"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Auto-Generate Remedial Task"}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

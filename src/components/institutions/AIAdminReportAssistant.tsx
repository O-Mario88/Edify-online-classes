import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Sparkles, FileText, CheckCircle, Copy, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const REPORT_TYPES = [
  'Weekly School Summary',
  'Academic Review Memo',
  'Teacher Performance',
  'Board Report',
  'Parent Communication'
];

export const AIAdminReportAssistant: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setDraft(null);
    
    // Simulate AI generation time
    setTimeout(() => {
      setDraft(`CONFIDENTIAL - DRAFT

Subject: ${selectedReport} - Kampala Model High School
Date: ${new Date().toLocaleDateString()}

Dear Stakeholders,

This week, the institution maintained an overall health score of 74%, with notable improvements in student behavior (+5%). However, academic interventions in Senior 4 Mathematics require immediate attention, as completion rates dropped to 55%.

Key Highlights:
1. Syllabus coverage tracks exactly to the NCDC mandate (82%).
2. The Term 2 Study Sprint challenge has 850 active participants.
3. Exam Readiness Tracker flags 42 unpaid candidates as a seating risk.

Action items have been dispatched to department heads.

Prepared by Maple Intelligence`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card className="shadow-sm border-indigo-200 h-full">
       <CardHeader className="bg-indigo-50/40 border-b border-indigo-100 pb-3">
          <CardTitle className="flex items-center gap-2 text-indigo-900 text-lg text-md">
            <Sparkles className="w-5 h-5 text-indigo-800" />
            AI Report Assistant
          </CardTitle>
          <CardDescription>Rapidly draft data-backed memos for leadership.</CardDescription>
       </CardHeader>
       <CardContent className="p-5">
          <div className="flex flex-wrap gap-2 mb-6">
            {REPORT_TYPES.map(type => (
              <Badge 
                key={type} 
                variant={selectedReport === type ? "default" : "outline"}
                className={`cursor-pointer ${selectedReport === type ? 'bg-indigo-600' : 'text-slate-800 hover:bg-slate-50'}`}
                onClick={() => setSelectedReport(type)}
              >
                {type}
              </Badge>
            ))}
          </div>

          {!draft && !isGenerating && (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
               <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
               <p className="text-sm text-slate-700 mb-4 max-w-xs mx-auto">Select a report type above and let the Maple intelligence engine draft a baseline memo using real-time institution data.</p>
               <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700">
                  Generate Draft
               </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
               <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
               <p className="text-sm text-indigo-800 font-medium animate-pulse">Synthesizing platform data...</p>
            </div>
          )}

          {draft && !isGenerating && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <span className="text-xs font-bold uppercase text-emerald-800 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Draft Ready</span>
                 <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-slate-700"><Copy className="w-4 h-4 mr-1" /> Copy</Button>
                 </div>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-lg text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner max-h-[300px] overflow-y-auto">
                {draft}
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" onClick={handleGenerate} className="w-full text-slate-800">Regenerate</Button>
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-700"><Send className="w-4 h-4 mr-2" /> Share via Email</Button>
              </div>
            </div>
          )}
       </CardContent>
    </Card>
  );
};

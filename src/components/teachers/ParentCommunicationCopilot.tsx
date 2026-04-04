import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { MessageSquare, Wand2, RefreshCw, Send, Info } from 'lucide-react';

export const ParentCommunicationCopilot: React.FC = () => {
  const [studentSearch, setStudentSearch] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedContext, setSelectedContext] = useState<'attendance' | 'praise' | 'intervention'>('attendance');

  const handleGenerate = () => {
    if (!studentSearch) return;
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      let draft = '';
      if (selectedContext === 'attendance') {
        draft = `Dear Parent/Guardian,\n\nI am writing to share that Joan has missed the last two live sessions for Mathematics. Attendance is critical for her success in the upcoming topic on Vectors. Please encourage her to review the recorded sessions on her dashboard.\n\nBest regards,\nYour Teacher`;
      } else if (selectedContext === 'praise') {
        draft = `Dear Parent/Guardian,\n\nI want to celebrate Joan's incredible effort this week! She scored 85% on her recent Physics makeup quiz, showing great resilience after a tough week. She is doing a fantastic job.\n\nBest regards,\nYour Teacher`;
      } else {
        draft = `Dear Parent/Guardian,\n\nWe noticed Joan has been struggling with Kinematics recently. I have assigned a targeted intervention bundle to her dashboard today. Please ensure she spends 30 minutes tonight reviewing this material.\n\nBest regards,\nYour Teacher`;
      }
      setGeneratedDraft(draft);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <Card className="h-full flex flex-col justify-between shadow-sm border-blue-100 bg-white">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Parent Communication Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {/* Guidance Description */}
          <div className="flex gap-2.5 p-3 bg-blue-50/70 rounded-lg border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Quickly draft professional messages to parents about attendance, academic praise, or intervention needs. Select a student, choose a context, and let AI generate the message for you.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Context Target</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Student Name e.g. Joan Doe" 
                className="w-2/3 text-sm p-2 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <select 
                className="w-1/3 text-sm p-2 border border-slate-200 rounded-md focus:outline-none"
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value as any)}
              >
                <option value="attendance">Absence Concern</option>
                <option value="praise">Performance Praise</option>
                <option value="intervention">Intervention Notice</option>
              </select>
            </div>
          </div>

          {!generatedDraft ? (
            <Button 
              onClick={handleGenerate} 
              disabled={!studentSearch || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Draft Message
            </Button>
          ) : (
            <div className="space-y-3 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <textarea 
                  className="w-full text-sm p-3 border border-blue-200 rounded-lg min-h-[140px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 text-slate-800"
                  value={generatedDraft}
                  onChange={(e) => setGeneratedDraft(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleGenerate}>
                  <RefreshCw className="w-4 h-4 mr-2 text-slate-500" /> Retry
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" /> Send via Platform
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

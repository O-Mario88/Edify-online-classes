import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { BrainCircuit, BookOpen, PenTool, Search, MessageSquare, Send, HelpCircle, FileText, RefreshCw } from 'lucide-react';

export const AITeachingPartner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (type: string) => {
    setIsGenerating(true);
    let sample = '';
    
    setTimeout(() => {
      if (type === 'quiz') {
        sample = "Here are 5 generated quiz questions based on the current 'Kinematics' topic your S3 class is struggling with:\n\n1. If a car accelerates at 2m/s², how long until it reaches 20m/s from rest?\n2. What is the difference between speed and velocity?\n(and 3 more questions tailored to address their specific weak points...)";
      } else if (type === 'rubric') {
        sample = "Grading Rubric for 'Physics Lab Report':\n\n- Data Accuracy (30%)\n- Methodology Clarity (30%)\n- Error Analysis (20%)\n- Conclusion (20%)\n\nNote: I've heavily weighted 'Error Analysis' as this was a weak point in last term's reports.";
      } else {
        sample = "Here is a simplified explanation of Vectors you can use in your next live session, avoiding the jargon that confused 14 students last week...";
      }
      setOutput(sample);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCustomSubmit = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      setOutput(`Based on your class data, here is my response to: "${prompt}"\n\n...[Contextual AI Output]...`);
      setIsGenerating(false);
      setPrompt('');
    }, 1200);
  };

  return (
    <Card className="shadow-sm border-purple-200 h-full flex flex-col bg-white">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white pb-3 border-b border-purple-100">
        <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-600" />
          AI Teaching Partner
        </CardTitle>
        <p className="text-xs text-purple-700 font-medium">Grounded in your S3 & S4 class data</p>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex gap-2 mb-4">
          <Button 
            variant={activeTab === 'generate' ? 'default' : 'outline'} 
            size="sm" 
            className={`flex-1 ${activeTab === 'generate' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-200 text-purple-700'}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate Content
          </Button>
          <Button 
            variant={activeTab === 'analyze' ? 'default' : 'outline'} 
            size="sm" 
            className={`flex-1 ${activeTab === 'analyze' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-200 text-purple-700'}`}
            onClick={() => setActiveTab('analyze')}
          >
            Analyze Data
          </Button>
        </div>

        {activeTab === 'generate' && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button variant="outline" size="sm" className="border-slate-200 justify-start" onClick={() => handleGenerate('quiz')}>
              <HelpCircle className="w-4 h-4 mr-2 text-indigo-500" /> 5-Q Topic Quiz
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 justify-start" onClick={() => handleGenerate('rubric')}>
              <PenTool className="w-4 h-4 mr-2 text-green-500" /> Grading Rubric
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 justify-start" onClick={() => handleGenerate('explain')}>
              <BookOpen className="w-4 h-4 mr-2 text-orange-500" /> Simpler Explanation
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 justify-start" onClick={() => handleGenerate('plan')}>
              <FileText className="w-4 h-4 mr-2 text-blue-500" /> Lesson Plan
            </Button>
          </div>
        )}

        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-y-auto mb-4 min-h-[120px]">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Thinking...
            </div>
          ) : output ? (
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{output}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Select an action or type a custom prompt below.
            </div>
          )}
        </div>

        <div className="relative mt-auto">
          <input 
            type="text" 
            placeholder="E.g. Create a revision pack for failing students..."
            className="w-full text-sm p-3 pr-10 border border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800 disabled:opacity-50"
            disabled={!prompt || isGenerating}
            onClick={handleCustomSubmit}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

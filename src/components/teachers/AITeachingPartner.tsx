import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { BrainCircuit, BookOpen, PenTool, Search, MessageSquare, Send, HelpCircle, FileText, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

export const AITeachingPartner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (type: string) => {
    setIsGenerating(true);
    try {
      const promptMap: Record<string, string> = {
        quiz: "Generate a 5 question quiz on Kinematics",
        rubric: "Generate a grading rubric for Physics Lab Reports",
        explain: "Explain Vectors to struggling students in simpler terms",
        plan: "Create a 45 minute lesson plan on Kinematics"
      };
      
      const { data, error } = await apiClient.post<{ reply?: string }>('/ai/copilot/ask/', {
        content: promptMap[type] || "Hello",
        context: 'teaching_analytics'
      });
      
      if (error) throw error;
      setOutput(data?.reply || 'No response from AI.');
    } catch {
      setOutput("Failed to generate AI response. Using offline fallback:\n\n[Fallback Placeholder for " + type + "]");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const { data, error } = await apiClient.post<{ reply?: string }>('/ai/copilot/ask/', {
        content: prompt,
        context: 'general'
      });
      if (error) throw error;
      setOutput(data?.reply || 'No response from AI.');
      setPrompt('');
    } catch {
      setOutput(`Failed to connect to AI server. Mock response to "${prompt}"\n\n...[Contextual AI Output]...`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-sm border-purple-200 h-full flex flex-col bg-white">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white pb-3 border-b border-purple-100">
        <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-800" />
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
              <HelpCircle className="w-4 h-4 mr-2 text-indigo-700" /> 5-Q Topic Quiz
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 justify-start" onClick={() => handleGenerate('rubric')}>
              <PenTool className="w-4 h-4 mr-2 text-emerald-700" /> Grading Rubric
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 justify-start" onClick={() => handleGenerate('explain')}>
              <BookOpen className="w-4 h-4 mr-2 text-orange-500" /> Simpler Explanation
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 justify-start" onClick={() => handleGenerate('plan')}>
              <FileText className="w-4 h-4 mr-2 text-blue-700" /> Lesson Plan
            </Button>
          </div>
        )}

        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-y-auto mb-4 min-h-[120px] flex flex-col pt-3">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full text-slate-700 text-sm italic">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Thinking...
            </div>
          ) : output ? (
            <>
              <div className="text-sm text-slate-700 whitespace-pre-wrap flex-1">{output}</div>
              {output.includes('quiz') || output.includes('questions') ? (
                <div className="mt-4 border-t border-slate-200 pt-3 flex justify-end">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                    onClick={async () => {
                      try {
                        await apiClient.post('/assessments/assessment/', {
                          title: 'AI Generated Quick Quiz',
                          type: 'quiz',
                          config: { ai_generated: true },
                          description: 'Deployed instantly from AI Teaching Partner'
                        });
                        toast.success('Deployed to Classroom Successfully!');
                      } catch {
                        toast.error('Failed to deploy quiz. Check network.');
                      }
                    }}
                  >
                    Deploy to Classroom
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 h-full text-slate-800 text-sm text-center">
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
            className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-800 hover:text-purple-800 disabled:opacity-50"
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

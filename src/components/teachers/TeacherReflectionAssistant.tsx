import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, CheckCircle, Lightbulb, PenTool } from 'lucide-react';

export const TeacherReflectionAssistant: React.FC = () => {
  const [reflectionPhase, setReflectionPhase] = useState<'prompt' | 'input' | 'completed'>('prompt');
  const [inputText, setInputText] = useState('');

  const handleComplete = () => {
    if (inputText.trim()) setReflectionPhase('completed');
  };

  return (
    <Card className="h-full flex flex-col justify-between shadow-sm border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
      <CardHeader className="pb-3 border-b border-purple-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Reflection Assistant
          </CardTitle>
          {reflectionPhase === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col justify-between">
        {reflectionPhase === 'prompt' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">Taking 2 minutes to reflect drastically improves long-term teaching impact. Ready to review your week?</p>
            <div className="bg-white p-3 rounded-lg border border-purple-100 text-sm italic text-slate-600 mb-2">
              "You assigned 3 interventions this week. Only 1 led to immediate recovery. What adjustment could be made to the other 2?"
            </div>
            <Button onClick={() => setReflectionPhase('input')} className="w-full bg-purple-600 hover:bg-purple-700">
              <PenTool className="w-4 h-4 mr-2" /> Start Reflection
            </Button>
          </div>
        )}

        {reflectionPhase === 'input' && (
          <div className="space-y-3">
            <div className="flex gap-2 text-sm text-slate-700 mb-2 font-medium">
              <Lightbulb className="w-4 h-4 text-amber-500" /> What worked well? Who struggled?
            </div>
            <textarea
              className="w-full text-sm p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] bg-white"
              placeholder="Jot down your thoughts here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>
            <div className="flex gap-2">
              <Button onClick={() => setReflectionPhase('prompt')} variant="outline" className="flex-1 border-purple-200 text-purple-700">Cancel</Button>
              <Button onClick={handleComplete} className="flex-1 bg-purple-600 hover:bg-purple-700">Log Journal</Button>
            </div>
          </div>
        )}

        {reflectionPhase === 'completed' && (
          <div className="text-center py-4 space-y-3">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-bold text-slate-800">Reflection Logged</h4>
            <p className="text-sm text-slate-600">Your insights have been securely saved to your Teacher Growth Passport.</p>
            <Button onClick={() => { setInputText(''); setReflectionPhase('prompt'); }} variant="outline" className="mt-2 text-xs">
              Reflect Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

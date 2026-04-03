import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';
import { Button } from '../ui/button';

export const VoiceNoteWidget: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // Note: True media recording logic would go here.
  // This is the UI mock for the interaction.

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecording(true);
      setDuration(14); // Mock 14s recording
    } else {
      setIsRecording(true);
      setHasRecording(false);
      setDuration(0);
    }
  };

  const handleDelete = () => {
    setHasRecording(false);
    setIsRecording(false);
    setDuration(0);
  };

  return (
    <Card className="border border-slate-200 shadow-sm bg-slate-50 relative overflow-hidden">
       {isRecording && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse m-3" />}
       <CardContent className="p-4 flex flex-col items-center justify-center space-y-4">
          
          {!hasRecording && (
             <div className="flex flex-col items-center justify-center py-4">
                <button 
                  onClick={handleToggleRecord}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105
                    ${isRecording ? 'bg-red-100 text-red-600 animate-pulse border-2 border-red-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                  `}
                >
                  {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
                </button>
                <p className="text-xs text-slate-500 mt-3 font-medium">
                  {isRecording ? 'Recording Audio Note...' : 'Tap to Record Micro-Lesson'}
                </p>
             </div>
          )}

          {hasRecording && (
             <div className="w-full">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 hover:bg-indigo-200"
                   >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                   </button>
                   
                   <div className="flex-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className={`h-full bg-indigo-500 ${isPlaying ? 'w-[45%]' : 'w-0'} transition-all duration-1000`}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                         <span>0:00</span>
                         <span>0:{duration}</span>
                      </div>
                   </div>

                   <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
                
                <div className="mt-4 flex gap-2">
                   <Button variant="outline" className="w-full text-xs" onClick={handleDelete}>Discard</Button>
                   <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs"><Send className="w-3 h-3 mr-1.5"/> Attach to Topic</Button>
                </div>
             </div>
          )}

       </CardContent>
    </Card>
  );
};

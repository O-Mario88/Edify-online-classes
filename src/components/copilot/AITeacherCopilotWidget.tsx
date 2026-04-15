import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/apiClient';

export const AITeacherCopilotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai'|'user', content: string}[]>([
    { role: 'ai', content: "Hi! I'm Maple Copilot. I can help draft lesson plans, grade assignments via OCR, or identify students at risk of drop-out. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await apiClient.post('/ai/copilot/ask/', {
        content: userMessage,
        context: 'teacher_studio'
      });
      setMessages(prev => [...prev, { role: 'ai', content: (res.data as any).reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm currently offline and couldn't process that request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-white z-50 animate-in slide-in-from-bottom"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Widget Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 md:w-96 shadow-2xl z-50 flex flex-col border-purple-200 border-2 overflow-hidden animate-in slide-in-from-bottom flex flex-col max-h-[600px] h-[80vh]">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex flex-row items-center justify-between p-4 shrink-0 rounded-t-lg">
            <CardTitle className="text-sm font-bold flex items-center">
              <Bot className="w-5 h-5 mr-2" /> Maple Copilot
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-gray-50/50">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`text-sm px-4 py-2 rounded-2xl max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none prose prose-p:my-1 prose-strong:text-purple-700'
                  }`}>
                    {/* Render basic markdown bold text */}
                    {msg.content.split('**').map((segment, i) => i % 2 === 1 ? <strong key={i}>{segment}</strong> : segment)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-3 rounded-bl-none text-gray-800">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-800" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 p-2 focus-within:ring-2 focus-within:ring-purple-200 focus-within:border-purple-400 transition-all">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask for a lesson plan..."
                  className="w-full bg-transparent border-0 outline-none resize-none px-2 py-1 text-sm max-h-32 min-h-[40px]"
                />
                <Button size="icon" className="shrink-0 h-8 w-8 bg-purple-600 hover:bg-purple-700 rounded-lg" disabled={!input.trim() || isTyping} onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-[10px] text-center text-gray-800 font-medium mt-2">
                AI can make mistakes. Check important information.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

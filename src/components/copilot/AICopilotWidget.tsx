import React, { useState, useRef, useEffect } from 'react';
import { useCopilot } from '../../contexts/AICopilotContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { BotIcon, SendHorizontal, Trash2, X } from 'lucide-react';
import { Input } from '../ui/input';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '../ui/scroll-area';

export const AICopilotWidget: React.FC = () => {
  const { isOpen, setIsOpen, toggleCopilot, messages, sendMessage, isLoading, clearHistory } = useCopilot();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        size="icon"
        onClick={toggleCopilot}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl transition-all hover:scale-105 z-50 bg-primary text-primary-foreground"
      >
        <BotIcon size={28} />
      </Button>

      {/* Slide-out Sheet for Chat */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col h-full bg-background border-l">
          <SheetHeader className="p-4 border-b bg-card text-card-foreground flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full text-primary">
                <BotIcon size={20} />
              </div>
              <SheetTitle className="text-lg">AI Study Copilot</SheetTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={clearHistory} title="Clear Chat">
                <Trash2 size={18} className="text-muted-foreground" />
              </Button>
            </div>
          </SheetHeader>

          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start py-2">
                   <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                     <BotIcon size={16} className="animate-pulse" />
                   </div>
                   <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce delay-75"></span>
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce delay-150"></span>
                   </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-card">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <Input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Ask your AI tutor a question..."
                className="rounded-full shadow-sm pr-12 focus-visible:ring-primary/50"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputText.trim() || isLoading}
                className="absolute right-6 rounded-full w-8 h-8 bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
              >
                <SendHorizontal size={16} />
              </Button>
            </form>
            <div className="text-center mt-2 flex justify-center space-x-2 text-[10px] text-muted-foreground font-medium">
               <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => setInputText('Give me a quiz on Physics')}>Physics Quiz</span>
               <span>•</span>
               <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => setInputText("Summarize today's lesson")}>Summarize Lesson</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

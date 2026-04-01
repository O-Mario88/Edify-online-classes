import React from 'react';
import { AICopilotMessage } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: AICopilotMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex w-full gap-3 py-2', isAssistant ? 'justify-start' : 'justify-end')}>
      {isAssistant && (
        <Avatar className="h-8 w-8 bg-primary/10 text-primary">
          <AvatarFallback><Bot size={16} /></AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
        isAssistant 
          ? 'bg-muted/60 text-foreground rounded-tl-sm' 
          : 'bg-primary text-primary-foreground rounded-tr-sm'
      )}>
        {isAssistant ? (
           <div className="prose prose-sm dark:prose-invert break-words text-foreground">
             <ReactMarkdown>{message.content}</ReactMarkdown>
           </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>

      {!isAssistant && (
        <Avatar className="h-8 w-8 bg-primary/20">
          <AvatarFallback><User size={16} /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AICopilotMessage } from '../types';
import { useAuth } from './AuthContext';
import apiClient from '@/lib/apiClient';

interface AICopilotContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleCopilot: () => void;
  messages: AICopilotMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  clearHistory: () => void;
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

export const useCopilot = () => {
  const context = useContext(AICopilotContext);
  if (context === undefined) {
    throw new Error('useCopilot must be used within an AICopilotProvider');
  }
  return context;
};

export const AICopilotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AICopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load chat history if user is logged in
    if (user?.id) {
      fetch('/data/copilot-history.json')
        .then(res => res.json())
        .then(data => {
          if (data[user.id]) {
            setMessages(data[user.id]);
          } else {
            // Default greeting
            setMessages([{
              id: Date.now().toString(),
              role: 'assistant',
              content: `Hello ${user.name}! I'm your Maple AI Copilot. I'm here to help you understand tough concepts, quiz you, or help build your next study plan. How can I help today?`,
              timestamp: new Date().toISOString()
            }]);
          }
        })
        .catch(err => console.error("Could not load copilot history", err));
    } else {
      setMessages([]);
    }
  }, [user]);

  const toggleCopilot = () => setIsOpen(prev => !prev);

  const sendMessage = async (content: string) => {
    const newMessage: AICopilotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
       const res = await apiClient.post<{ job_id: number; reply: string }>('/ai/copilot/ask/', { content });
       const aiResponse: AICopilotMessage = {
          id: res.data.job_id.toString(),
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toISOString()
       };
       setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
       console.error("Failed to query AI copilot", err);
       const errorMsg: AICopilotMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm having trouble connecting to the backend right now. Ensure your internet connection is stable.",
          timestamp: new Date().toISOString()
       };
       setMessages(prev => [...prev, errorMsg]);
    } finally {
       setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (user) {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: `Chat cleared. How can I assist you today, ${user.name}?`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <AICopilotContext.Provider value={{ isOpen, setIsOpen, toggleCopilot, messages, sendMessage, isLoading, clearHistory }}>
      {children}
    </AICopilotContext.Provider>
  );
};

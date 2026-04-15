import React, { useState, useEffect } from 'react';
import { X, Send, Phone, Video, Search, MessageSquare, MoreVertical, Paperclip, Smile, ShieldAlert, CheckCheck, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface WhatsAppCommunicationHubProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: {
    id: string;
    name: string;
    role: string;
    phone: string;
    context?: string;
  };
}

export const WhatsAppCommunicationHub: React.FC<WhatsAppCommunicationHubProps> = ({ 
  isOpen, 
  onClose, 
  defaultRecipient 
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const recipient = defaultRecipient || {
     id: 'tutor_123', name: 'John Doe (Tutor)', role: 'Tutor', phone: '+256 700 000 000', context: 'Math Concerns'
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, recipient.id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/notifications/notification/whatsapp-history/?recipient_id=${recipient.id}`);
      const data: any = response.data || [];
      const history = data.map((msg: any) => ({
        id: msg.id,
        sender: msg.direction === 'outbound' ? 'me' : 'them',
        text: msg.message_body,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: msg.status
      }));
      setMessages(history);
    } catch (error) {
      console.error("Failed to fetch WhatsApp history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const tempId = Date.now();
    const newMsg = {
       id: tempId,
       sender: 'me',
       text: inputValue,
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
       status: 'sending'
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');

    try {
      const response = await apiClient.post('/notifications/notification/send/', {
        message: newMsg.text,
        recipient_id: recipient.id,
        phone: recipient.phone
      });
      
      const savedMsg: any = response.data;
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: savedMsg.status || 'sent', id: savedMsg.id } : msg
      ));
    } catch (error) {
      toast.error("Failed to send message via WhatsApp API.");
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-[#efeae2] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        
        {/* WhatsApp Style Header */}
        <div className="bg-[#00a884] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden shadow-inner flex items-center justify-center text-slate-700 font-bold">
                {recipient.name.charAt(0)}
             </div>
             <div>
               <h3 className="font-bold text-sm leading-tight">{recipient.name}</h3>
               <p className="text-[10px] text-white/80">{recipient.role} • {recipient.phone}</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-white">
             <Video className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => window.open('https://meet.google.com/new', '_blank')} />
             <Phone className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => window.open(`tel:${recipient.phone}`)} />
             <div className="w-px h-5 bg-white/30" />
             <X className="w-6 h-6 cursor-pointer" onClick={onClose} />
          </div>
        </div>

        {/* AI Analytics & Feedback Toolbar */}
        <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-slate-200 shadow-sm text-xs">
           <div className="flex items-center gap-2">
             <ShieldAlert className="w-4 h-4 text-orange-500" />
             <span className="font-semibold text-slate-700">Sentiment: <span className="text-orange-600">Concerned</span></span>
           </div>
           <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => toast.success('Feedback logged for analytics.')}>
              <TrendingUp className="w-3 h-3 mr-1" /> Log as Feedback
           </Badge>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://whatsapp-clone-web.netlify.app/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] bg-opacity-50">
           {/* Context Banner */}
           <div className="bg-yellow-100 text-yellow-800 text-xs text-center py-1.5 px-4 rounded-md mx-auto w-max mb-4 shadow-sm border border-yellow-200">
              System Context: {recipient.context}
           </div>

           {messages.length === 0 && !loading && (
             <div className="text-center text-slate-500 text-xs my-4 bg-white/80 w-max mx-auto px-4 py-2 rounded-lg shadow-sm">
               No message history. Start the conversation!
             </div>
           )}

           {messages.map(msg => (
             <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm text-sm ${msg.sender === 'me' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                 <p className="text-slate-800">{msg.text}</p>
                 <div className="flex justify-end items-center gap-1 mt-1">
                   <span className="text-[10px] text-slate-700">{msg.time}</span>
                   {msg.sender === 'me' && (
                     msg.status === 'sending' ? <Clock className="w-3 h-3 text-slate-400" /> :
                     msg.status === 'failed' ? <ShieldAlert className="w-3 h-3 text-red-500" /> :
                     <CheckCheck className="w-3.5 h-3.5 text-blue-700" />
                   )}
                 </div>
               </div>
             </div>
           ))}
        </div>

        {/* Action Panel */}
        <div className="bg-[#f0f2f5] p-3 flex items-center gap-2">
           <Smile className="w-6 h-6 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors shrink-0" onClick={() => setInputValue(prev => prev + ' 😊')} />
           <Paperclip className="w-6 h-6 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors shrink-0" onClick={() => toast.info('File attachments coming soon.')} />
           <Input 
             className="flex-1 bg-white border-none rounded-lg h-10 shadow-sm"
             placeholder="Type a message or use /ai for auto-reply"
             value={inputValue}
             onChange={(e) => setInputValue(e.target.value)}
             onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
           />
           {inputValue.trim() ? (
             <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center cursor-pointer shadow-sm" onClick={handleSend}>
                 <Send className="w-5 h-5 ml-1" />
             </div>
           ) : (
             <div className="w-10 h-10 rounded-full bg-slate-300 text-white flex items-center justify-center pointer-events-none">
                 <Send className="w-5 h-5 ml-1" />
             </div>
           )}
        </div>
      </div>
    </>
  );
};


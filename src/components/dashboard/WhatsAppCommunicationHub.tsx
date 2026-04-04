import React, { useState } from 'react';
import { X, Send, Phone, Video, Search, MessageSquare, MoreVertical, Paperclip, Smile, ShieldAlert, CheckCheck, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

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
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hello, I am concerned about my childs recent scores in Mathematics.', time: '10:42 AM' },
    { id: 2, sender: 'me', text: 'Thank you for reaching out. Joan has been struggling with Vectors specifically.', time: '10:45 AM' },
    { id: 3, sender: 'them', text: 'Is there any extra notes or past papers we can use?', time: '10:46 AM' }
  ]);
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const recipient = defaultRecipient || {
     id: 'u1', name: 'John Doe (Parent)', role: 'Parent', phone: '+256 700 000 000', context: 'Math Concerns'
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, {
       id: Date.now(),
       sender: 'me',
       text: inputValue,
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputValue('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-[#efeae2] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        
        {/* WhatsApp Style Header */}
        <div className="bg-[#00a884] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden shadow-inner flex items-center justify-center text-slate-500 font-bold">
                {recipient.name.charAt(0)}
             </div>
             <div>
               <h3 className="font-bold text-sm leading-tight">{recipient.name}</h3>
               <p className="text-[10px] text-white/80">{recipient.role} • {recipient.phone}</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-white">
             <Video className="w-5 h-5 cursor-pointer" />
             <Phone className="w-5 h-5 cursor-pointer" />
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
           <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer">
              <TrendingUp className="w-3 h-3 mr-1" /> Log as Feedback
           </Badge>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://whatsapp-clone-web.netlify.app/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] bg-opacity-50">
           {/* Context Banner */}
           <div className="bg-yellow-100 text-yellow-800 text-xs text-center py-1.5 px-4 rounded-md mx-auto w-max mb-4 shadow-sm border border-yellow-200">
              System Context: {recipient.context}
           </div>

           {messages.map(msg => (
             <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm text-sm ${msg.sender === 'me' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                 <p className="text-slate-800">{msg.text}</p>
                 <div className="flex justify-end items-center gap-1 mt-1">
                   <span className="text-[10px] text-slate-500">{msg.time}</span>
                   {msg.sender === 'me' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                 </div>
               </div>
             </div>
           ))}
        </div>

        {/* Action Panel */}
        <div className="bg-[#f0f2f5] p-3 flex items-center gap-2">
           <Smile className="w-6 h-6 text-slate-500 cursor-pointer shrink-0" />
           <Paperclip className="w-6 h-6 text-slate-500 cursor-pointer shrink-0" />
           <Input 
             className="flex-1 bg-white border-none rounded-lg h-10 shadow-sm"
             placeholder="Type a message or use /ai for auto-reply"
             value={inputValue}
             onChange={(e) => setInputValue(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Package, Video, FileText, CheckCircle, Send, Plus, Search, HelpCircle, Users, MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface ResourceItem {
  id: string;
  type: 'video' | 'note' | 'quiz' | 'discussion' | 'peer_support' | 'parent_note';
  title: string;
  isIncluded?: boolean;
}

export interface InterventionBuilderData {
  topicName: string;
  targetStudentsCount: number;
  availableResources: ResourceItem[];
}

export const SmartInterventionBuilder: React.FC<{ data: InterventionBuilderData }> = ({ data }) => {
  const [resources, setResources] = useState<ResourceItem[]>(
    data.availableResources.map(r => ({ ...r, isIncluded: true }))
  );
  const [isSent, setIsSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-500" />;
      case 'note': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'quiz': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'discussion': return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'peer_support': return <Users className="w-4 h-4 text-teal-500" />;
      case 'parent_note': return <MessageSquare className="w-4 h-4 text-pink-500" />;
      default: return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  const includedCount = resources.filter(r => r.isIncluded).length;

  const handleToggle = (id: string) => {
    setResources(resources.map(r => r.id === id ? { ...r, isIncluded: !r.isIncluded } : r));
  };

  const handleDispatch = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setIsEditing(false);
    }, 3000);
  };

  return (
    <Card className="h-full flex flex-col shadow-sm border border-slate-200 bg-white">
       <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex justify-between items-start">
             <div>
               <CardTitle className="flex items-center gap-2 text-md text-slate-800">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Smart Intervention Builder
               </CardTitle>
               <CardDescription className="text-slate-500 text-xs mt-1">1-Click targeted resource bundling</CardDescription>
             </div>
             <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 cursor-pointer">
               {data.targetStudentsCount} At-Risk Students
             </Badge>
          </div>
       </CardHeader>
       <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div>
             <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-slate-900">Topic: {data.topicName}</h4>
                <Button variant="ghost" size="sm" className="h-6 text-indigo-600 text-xs p-0 px-2" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Done Editing' : 'Edit Bundle'}
                </Button>
             </div>

             <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {resources.filter(r => isEditing || r.isIncluded).map((res) => (
                  <div key={res.id} className={`flex justify-between items-center p-2 rounded-md border transition-colors ${res.isIncluded ? 'bg-slate-50 border-indigo-100' : 'bg-white border-slate-100 opacity-60'}`}>
                     <div className="flex items-center gap-2">
                        {getIcon(res.type)}
                        <span className={`text-xs font-semibold ${res.isIncluded ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{res.title}</span>
                     </div>
                     {isEditing && (
                       <button onClick={() => handleToggle(res.id)} className={`w-5 h-5 flex justify-center items-center rounded-full border ${res.isIncluded ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                          {res.isIncluded ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                       </button>
                     )}
                  </div>
                ))}
             </div>
          </div>
          
          <div className="pt-2">
             <Button 
                className={`w-full ${isSent ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} shadow-sm transition-all`}
                onClick={handleDispatch}
                disabled={isSent || includedCount === 0}
             >
                {isSent ? (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Dispatched Successfully!</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Dispatch {includedCount} Items to {data.targetStudentsCount} Students</>
                )}
             </Button>
          </div>
       </CardContent>
    </Card>
  );
};

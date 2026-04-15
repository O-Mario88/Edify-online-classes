import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Share2, FileText, Download, Users } from 'lucide-react';
import { Badge } from '../ui/badge';

export const TeacherCollabHub: React.FC = () => {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
         <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Teacher Collaboration
            <Badge variant="outline" className="ml-auto bg-slate-100 text-slate-700 text-xs border-slate-200">
               Institution Hub
            </Badge>
         </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
           
           <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                 <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Mr. Okello shared an Intervention</h4>
                    <p className="text-xs text-slate-700 mt-0.5">Topic: Organic Chemistry | For: S4</p>
                 </div>
                 <Badge className="bg-teal-50 text-teal-700 border-teal-200">New</Badge>
              </div>
              <p className="text-xs text-slate-800 mb-3 bg-white p-2 border border-slate-100 rounded-md">
                "I put together this bundle of notes and a quick quiz. It worked really well to recover my 8 failing students this morning."
              </p>
              <div className="flex gap-2">
                 <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                    <FileText className="w-3 h-3 mr-1.5" /> Preview
                 </Button>
                 <Button size="sm" className="flex-1 text-xs h-8 bg-teal-600 hover:bg-teal-700">
                    <Download className="w-3 h-3 mr-1.5" /> Clone Bundle
                 </Button>
              </div>
           </div>

           <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                 <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Department Resource Request</h4>
                    <p className="text-xs text-slate-700 mt-0.5">From: Head of Sciences</p>
                 </div>
              </div>
              <p className="text-xs text-slate-800 mb-3 bg-red-50 p-2 border border-red-100 rounded-md text-red-800">
                "We are missing a good mock exam for S2 Physics. Does anyone have one they can upload to the shared drive?"
              </p>
              <Button size="sm" variant="outline" className="w-full text-xs h-8">
                 <Share2 className="w-3 h-3 mr-1.5" /> Share Resource
              </Button>
           </div>
           
        </div>
      </CardContent>
    </Card>
  );
};

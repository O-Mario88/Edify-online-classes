import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Play, FileText, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardLibraryPage = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Study Library</h1>
            <p className="text-gray-500">Access your saved materials, active books, and offline synced content.</p>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input className="w-64 border rounded-full pl-10 pr-4 py-2 text-sm bg-white" placeholder="Search my library..." />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center">
             <Clock className="w-4 h-4 mr-2" /> Continue Studying
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-0">
                <div className="h-32 bg-amber-100/50 flex items-center justify-center border-b">
                   <Play className="w-10 h-10 text-amber-500/50" />
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2 text-amber-600 border-amber-200">Video Lesson</Badge>
                  <h4 className="font-bold text-gray-900 mb-1">Forces in Nature</h4>
                  <p className="text-xs text-gray-500 mb-3">S1 Physics • 12 mins left</p>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[60%] h-full bg-amber-500 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center">
               <BookOpen className="w-4 h-4 mr-2" /> Saved Resources
             </h3>
             <Link to="/library" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
                Browse Full Catalog <ArrowRight className="w-4 h-4 ml-1" />
             </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-lg text-blue-600">
                   <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                   <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Algebra Comprehensive Notes</h4>
                   <p className="text-xs text-gray-500">PDF Document • 2.4 MB</p>
                </div>
                <Button variant="outline" size="sm">Open</Button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default DashboardLibraryPage;

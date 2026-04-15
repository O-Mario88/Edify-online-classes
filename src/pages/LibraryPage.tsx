import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen } from 'lucide-react';

const LibraryPage: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
    <Card className="shadow-xl border-0 max-w-xl w-full">
      <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-indigo-100 to-blue-50 dark:from-indigo-900 dark:to-blue-950 rounded-t-xl">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center mb-2">
          <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-indigo-900 dark:text-white">Resource Library</CardTitle>
        <CardDescription className="text-base text-slate-600 dark:text-slate-300">All your premium resources, notes, and learning materials in one place.</CardDescription>
      </CardHeader>
      <CardContent className="py-10 flex flex-col items-center">
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-6 text-center">This page is under construction. All dashboard action links to <span className="font-semibold text-indigo-700 dark:text-indigo-300">/dashboard/library</span> now resolve here.</p>
        <Button variant="outline" className="rounded-full px-8 py-3 text-indigo-700 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 shadow-md font-semibold text-base">Browse All Resources</Button>
      </CardContent>
    </Card>
  </div>
);

export default LibraryPage;

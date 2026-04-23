import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InteractivePracticeEngine } from '../components/academic/InteractivePracticeEngine';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState<any>(null);

  useEffect(() => {
    // Simulate fetching exercise data
    setLoading(true);
    setTimeout(() => {
      // Mock data specifically for act-2 or generic
      let mockResource = {
        id: exerciseId || 'act-2',
        title: 'Generic Exercise',
        authorName: 'System',
        description: 'Complete the structured task and objective knowledge checks.',
        type: 'exercise',
        subject: 'General'
      };

      if (exerciseId === 'act-2') {
        mockResource = {
          id: 'act-2',
          title: 'Thermodynamics Lab Report',
          authorName: 'Dr. Sarah Jenkins',
          description: 'Physics • S4 Core',
          type: 'exercise',
          subject: 'Physics'
        };
      } else if (exerciseId === 'act-1') {
        mockResource = {
          id: 'act-1',
          title: 'Computer Science Final Project',
          authorName: 'Mr. Emmanuel Kato',
          description: 'Build a Next.js Web App',
          type: 'project',
          subject: 'Computer Science'
        };
      }

      setExerciseData(mockResource);
      setLoading(false);
    }, 600);
  }, [exerciseId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!exerciseData) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Exercise Not Found</h2>
        <p className="text-slate-600 mb-6">The assignment or exercise you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-950 pb-12">
      {/* Header Strip */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{exerciseData.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{exerciseData.description} • Teacher: {exerciseData.authorName}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full text-sm font-bold border border-rose-100">
          <Clock className="w-4 h-4" /> Due Soon
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-8">
        <InteractivePracticeEngine 
          resource={exerciseData as any} 
          studentId={user?.id?.toString() || 'student-1'}
          onComplete={() => {
            setTimeout(() => {
              navigate('/dashboard/student');
            }, 2000);
          }} 
        />
      </div>
    </div>
  );
};

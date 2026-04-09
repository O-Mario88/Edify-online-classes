import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import {
  ClipboardList, X, CheckCircle, Calendar, Target,
  Users, AlertTriangle, Sparkles, Send, FileUp
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface AssignmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: 'topic' | 'lesson';
  contextName: string;
  subjectName: string;
  className: string;
}

export const AssignmentCreateModal: React.FC<AssignmentCreateModalProps> = ({
  isOpen,
  onClose,
  contextType,
  contextName,
  subjectName,
  className: classLabel
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [assignmentType, setAssignmentType] = useState('worksheet');
  const [targetMode, setTargetMode] = useState<'global' | 'at-risk' | 'enrichment'>('global');
  const [maxScore, setMaxScore] = useState('20');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/assessments/assessment/', {
        type: assignmentType === 'intervention' ? 'assignment' : assignmentType,
        max_score: parseFloat(maxScore) || 100.0,
        source: assignmentType === 'project' ? 'project' : 'platform_quiz',
        // Optional payload depending on backend completion
        meta: { title, instructions, dueDate, targetMode } 
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setTitle('');
        setInstructions('');
      }, 1500);
    } catch (error) {
      console.error('Failed to create assignment', error);
      alert('Failed to save assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" /> Create Assignment
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px]">{classLabel}</Badge>
              <Badge variant="outline" className="text-[10px]">{subjectName}</Badge>
              <Badge className="bg-indigo-100 text-indigo-700 border-none text-[10px]">
                {contextType === 'topic' ? '📁 Topic' : '📄 Lesson'}: {contextName}
              </Badge>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <CardContent className="p-6 space-y-5">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Assignment Created!</h3>
              <p className="text-gray-500 mt-2">Students can now see it under this {contextType}.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Assignment Title *</label>
                <Input
                  placeholder="e.g. Practice Problems: Chapter 3"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Type</label>
                  <select
                    value={assignmentType}
                    onChange={e => setAssignmentType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="worksheet">Worksheet</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="project">Project Work</option>
                    <option value="intervention">Intervention Pack</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Max Score</label>
                  <Input type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Due Date</label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Instructions</label>
                <Textarea
                  placeholder="Describe what students should do..."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Targeting */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Audience Targeting</label>
                <div className="space-y-2">
                  {[
                    { value: 'global' as const, label: 'All Students', desc: 'Deliver to entire class', icon: Users, color: 'border-gray-300 bg-gray-50' },
                    { value: 'at-risk' as const, label: 'At-Risk Intervention', desc: 'Only students below threshold', icon: AlertTriangle, color: 'border-red-200 bg-red-50' },
                    { value: 'enrichment' as const, label: 'Enrichment', desc: 'Top performers only', icon: Sparkles, color: 'border-green-200 bg-green-50' }
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTargetMode(t.value)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        targetMode === t.value
                          ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50'
                          : `${t.color} hover:border-gray-400`
                      }`}
                    >
                      <t.icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                        <p className="text-xs text-gray-500">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attach Files */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-all cursor-pointer">
                <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Attach files (optional)</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-11"
                >
                  {isSubmitting ? 'Creating...' : '📋 Create & Dispatch'}
                </Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

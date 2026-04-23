import React, { useState } from 'react';
import { toast } from 'sonner';
import { ClipboardList, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { apiClient } from '../../lib/apiClient';

/**
 * TeacherQuickAssignment
 *
 * Compact form for teachers to publish a text assignment. POSTs to
 * /api/v1/assessments/assessment/ with `type='assignment'` and
 * `is_published=true`; the backend stamps `created_by` from the auth
 * header. Students then see it via the standard assessment list.
 *
 * Frontend half of Phase 4.3 (grading loop).
 */
export const TeacherQuickAssignment: React.FC<{ onPublished?: (id: number) => void }> = ({
  onPublished,
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setInstructions('');
    setMaxScore('100');
    setOpen(false);
  };

  const publish = async () => {
    if (!title.trim() || !instructions.trim()) {
      toast.error('Title and instructions are both required.');
      return;
    }
    const parsedScore = Number(maxScore);
    if (!Number.isFinite(parsedScore) || parsedScore <= 0) {
      toast.error('Max score must be a positive number.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await apiClient.post<{ id: number }>(
        '/assessments/assessment/',
        {
          title: title.trim(),
          instructions: instructions.trim(),
          type: 'assignment',
          source: 'manual_school_test',
          max_score: parsedScore,
          is_published: true,
        },
      );
      if (error) throw error;
      toast.success('Assignment published — students can start working on it.');
      if (data?.id && onPublished) onPublished(data.id);
      reset();
    } catch (err) {
      console.error('Failed to publish assignment', err);
      toast.error('Could not publish the assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        className="text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
        onClick={() => setOpen(true)}
      >
        <ClipboardList className="w-4 h-4 mr-2" />
        Publish an assignment
      </Button>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm w-full max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Publish an assignment</h3>
        <button
          type="button"
          onClick={reset}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        placeholder="e.g. Essay 1 — Factorisation in daily life"
        maxLength={255}
      />
      <label className="block text-xs font-medium text-slate-600 mb-1">Instructions / prompt</label>
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
        placeholder="Describe what the student should do, the scope, and how they should submit..."
      />
      <label className="block text-xs font-medium text-slate-600 mb-1">Max score</label>
      <input
        type="number"
        value={maxScore}
        onChange={(e) => setMaxScore(e.target.value)}
        className="w-32 border border-slate-300 rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        min="1"
        max="1000"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={reset} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={publish} disabled={submitting}>
          <Send className="w-4 h-4 mr-2" />
          {submitting ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </div>
  );
};

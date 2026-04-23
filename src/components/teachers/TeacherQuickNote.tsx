import React, { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { apiClient } from '../../lib/apiClient';

/**
 * TeacherQuickNote
 *
 * Minimal text-note publisher for teachers. Opens an inline form, POSTs
 * to /api/v1/content/items/ with content_type="notes", and makes the note
 * immediately visible to students (visibility_scope=global, published).
 *
 * This is the teacher half of Phase 4 slice #1 (content loop).
 */
export const TeacherQuickNote: React.FC<{ onPublished?: (id: string) => void }> = ({
  onPublished,
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setBody('');
    setOpen(false);
  };

  const publish = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are both required.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await apiClient.post<{ id: string }>(
        '/content/items/',
        {
          title: title.trim(),
          description: body.trim(),
          content_type: 'notes',
          owner_type: 'teacher',
          visibility_scope: 'global',
          publication_status: 'published',
        },
      );
      if (error) throw error;
      toast.success('Note published — students can see it now.');
      if (data?.id && onPublished) onPublished(data.id);
      reset();
    } catch (err) {
      console.error('Failed to publish note', err);
      toast.error('Could not publish the note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
        onClick={() => setOpen(true)}
      >
        <FileText className="w-4 h-4 mr-2" />
        Publish a note
      </Button>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm w-full max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Publish a note</h3>
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
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
        placeholder="e.g. Factorisation basics"
        maxLength={200}
      />
      <label className="block text-xs font-medium text-slate-600 mb-1">Body</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-200"
        placeholder="Type the note students should read..."
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

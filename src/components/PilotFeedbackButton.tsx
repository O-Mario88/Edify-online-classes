import React, { useState } from 'react';
import { toast } from 'sonner';
import { MessageSquareWarning, Send, X } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

type Severity = 'bug' | 'confusing' | 'idea' | 'other';

/**
 * PilotFeedbackButton
 *
 * Floating bottom-right "Report an issue" button that opens a small
 * popover. Submits to POST /api/v1/feedback/ with the current URL
 * pre-filled so we can see where the user was when they hit it.
 *
 * Shown on pilot-role dashboards only. See docs/PILOT.md.
 */
export const PilotFeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<Severity>('bug');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setMessage('');
    setSeverity('bug');
    setOpen(false);
  };

  const submit = async () => {
    if (!message.trim()) {
      toast.error('Describe what happened before sending.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await apiClient.post('/feedback/', {
        severity,
        message: message.trim(),
        page_url: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
      });
      if (error) throw error;
      toast.success('Thanks — your note is logged. I will look at it.');
      reset();
    } catch (err) {
      console.error('Feedback submit failed', err);
      toast.error('Could not send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div className="w-80 rounded-xl border border-slate-200 bg-white shadow-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Report an issue</h3>
            <button
              type="button"
              onClick={reset}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close feedback form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="w-full border border-slate-300 rounded-md px-2 py-2 mb-3 text-sm"
          >
            <option value="bug">Something is broken</option>
            <option value="confusing">Something is confusing</option>
            <option value="idea">Idea for improvement</option>
            <option value="other">Other</option>
          </select>
          <label className="block text-xs font-medium text-slate-600 mb-1">What happened?</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you were trying to do and what went wrong."
            className="w-full border border-slate-300 rounded-md px-2 py-2 mb-3 text-sm min-h-[90px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
            maxLength={2000}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={submitting}
              className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium shadow-lg hover:bg-slate-800"
          aria-label="Report an issue"
        >
          <MessageSquareWarning className="w-4 h-4" />
          Report an issue
        </button>
      )}
    </div>
  );
};

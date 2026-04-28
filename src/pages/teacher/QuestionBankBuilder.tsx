import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Loader2, AlertTriangle, CheckCircle2, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, apiPatch, apiDelete, API_BASE_URL } from '../../lib/apiClient';

type QuestionType = 'mcq' | 'short_answer' | 'essay';

interface Option {
  id: string;
  label: string;
  is_correct: boolean;
}

interface QuestionDraft {
  id?: number;            // Server id (set after save)
  localId: string;        // Client-side id used while drafting
  type: QuestionType;
  content: string;
  marks: number;
  order: number;
  options: Option[];      // MCQ only
  correct_answer: string; // For short_answer; for MCQ this is set from options
  saving?: boolean;
  saved?: boolean;
  error?: string;
}

interface AssessmentMeta {
  id: number;
  title: string;
  type: string;
  max_score: number;
  is_published: boolean;
  questions?: Array<{
    id: number;
    type: QuestionType;
    content: string;
    marks: number;
    order: number;
    options?: Array<{ id?: string; label: string; is_correct?: boolean }> | string[];
    correct_answer?: string;
  }>;
}

const newDraft = (order: number, type: QuestionType = 'mcq'): QuestionDraft => ({
  localId: `draft-${Date.now()}-${order}`,
  type,
  content: '',
  marks: 1,
  order,
  options: type === 'mcq' ? [
    { id: 'a', label: '', is_correct: false },
    { id: 'b', label: '', is_correct: false },
    { id: 'c', label: '', is_correct: false },
    { id: 'd', label: '', is_correct: false },
  ] : [],
  correct_answer: '',
});

/**
 * Question Bank Builder. Lets teachers add, edit, and delete questions
 * for an existing Assessment. Three question types — MCQ, short
 * answer, essay — each with marks weighting and optional rubric for
 * the essay type.
 *
 * Route: /dashboard/teacher/assessments/:assessmentId/questions
 *
 * Each question is saved independently (POST or PATCH) so a teacher
 * mid-build doesn't lose draft work if the network drops. When all
 * questions are saved the teacher publishes the whole assessment from
 * a single button.
 */
export const QuestionBankBuilder: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [meta, setMeta] = useState<AssessmentMeta | null>(null);
  const [drafts, setDrafts] = useState<QuestionDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Initial load
  useEffect(() => {
    if (!assessmentId) return;
    let cancelled = false;
    (async () => {
      const r = await apiGet<AssessmentMeta>(`${API_BASE_URL}/api/v1/assessments/assessment/${assessmentId}/`);
      if (cancelled) return;
      if (r.error) {
        setError(r.error.message);
      } else if (r.data) {
        setMeta(r.data);
        const fromServer: QuestionDraft[] = (r.data.questions || []).map((q, i) => ({
          id: q.id,
          localId: `srv-${q.id}`,
          type: q.type,
          content: q.content || '',
          marks: Number(q.marks) || 1,
          order: q.order ?? i + 1,
          options: normaliseOptions(q.options),
          correct_answer: q.correct_answer || '',
          saved: true,
        }));
        setDrafts(fromServer.length > 0 ? fromServer : [newDraft(1)]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [assessmentId]);

  const totalMarks = drafts.reduce((sum, d) => sum + (Number.isFinite(d.marks) ? d.marks : 0), 0);
  const allSaved = drafts.length > 0 && drafts.every((d) => d.saved);

  const addQuestion = (type: QuestionType) => {
    setDrafts((prev) => [...prev, newDraft(prev.length + 1, type)]);
  };

  const updateDraft = (localId: string, patch: Partial<QuestionDraft>) => {
    setDrafts((prev) => prev.map((d) => (d.localId === localId ? { ...d, ...patch, saved: false } : d)));
  };

  const removeDraft = async (d: QuestionDraft) => {
    if (d.id) {
      await apiDelete(`${API_BASE_URL}/api/v1/assessments/question/${d.id}/`);
    }
    setDrafts((prev) => prev.filter((x) => x.localId !== d.localId).map((x, i) => ({ ...x, order: i + 1 })));
  };

  const saveDraft = async (d: QuestionDraft) => {
    if (!assessmentId) return;
    if (!d.content.trim()) {
      updateDraft(d.localId, { error: 'Question text is required.' });
      return;
    }
    if (d.type === 'mcq') {
      const filled = d.options.filter((o) => o.label.trim());
      if (filled.length < 2) {
        updateDraft(d.localId, { error: 'MCQ needs at least two options.' });
        return;
      }
      if (!filled.some((o) => o.is_correct)) {
        updateDraft(d.localId, { error: 'Mark the correct option.' });
        return;
      }
    }

    updateDraft(d.localId, { saving: true, error: undefined });

    const payload: any = {
      assessment: assessmentId,
      type: d.type,
      content: d.content,
      marks: d.marks,
      order: d.order,
      options: d.type === 'mcq' ? d.options.filter((o) => o.label.trim()) : [],
      correct_answer: d.type === 'mcq'
        ? d.options.find((o) => o.is_correct)?.id || ''
        : d.correct_answer,
    };

    const url = d.id
      ? `${API_BASE_URL}/api/v1/assessments/question/${d.id}/`
      : `${API_BASE_URL}/api/v1/assessments/question/`;
    const r = d.id ? await apiPatch<any>(url, payload) : await apiPost<any>(url, payload);

    if (r.error) {
      updateDraft(d.localId, { saving: false, error: r.error.message });
      return;
    }
    updateDraft(d.localId, {
      saving: false,
      saved: true,
      id: r.data?.id ?? d.id,
    });
  };

  const saveAll = async () => {
    for (const d of drafts) {
      if (!d.saved) await saveDraft(d);
    }
  };

  const publish = async () => {
    if (!assessmentId) return;
    if (!allSaved) {
      await saveAll();
    }
    setPublishing(true);
    const r = await apiPatch<AssessmentMeta>(
      `${API_BASE_URL}/api/v1/assessments/assessment/${assessmentId}/`,
      { is_published: true, max_score: totalMarks },
    );
    setPublishing(false);
    if (r.error) {
      setError(r.error.message);
      return;
    }
    setMeta((m) => (m ? { ...m, is_published: true, max_score: totalMarks } : m));
    navigate(`/dashboard/teacher`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && !meta) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-1" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/dashboard/teacher"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Question Bank</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {meta?.title || 'Untitled assessment'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {drafts.length} question{drafts.length === 1 ? '' : 's'} · {totalMarks} marks · {meta?.is_published ? 'Published' : 'Draft'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={saveAll}
            disabled={allSaved || drafts.some((d) => d.saving)}
          >
            <Save className="w-4 h-4 mr-2" />
            {allSaved ? 'All saved' : 'Save all'}
          </Button>
          <Button
            className="rounded-full bg-slate-900 hover:bg-slate-800 text-white"
            onClick={publish}
            disabled={publishing || drafts.length === 0}
          >
            {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Add question dropdown */}
      <Card className="mb-6 border-dashed">
        <CardContent className="p-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-slate-700">Add question:</span>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => addQuestion('mcq')}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Multiple choice
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => addQuestion('short_answer')}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Short answer
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => addQuestion('essay')}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Essay
          </Button>
        </CardContent>
      </Card>

      {/* Question list */}
      <div className="space-y-4">
        {drafts.map((d) => (
          <QuestionCard
            key={d.localId}
            draft={d}
            onChange={(patch) => updateDraft(d.localId, patch)}
            onSave={() => saveDraft(d)}
            onDelete={() => removeDraft(d)}
          />
        ))}
      </div>

      {drafts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>No questions yet. Add one to get started.</p>
        </div>
      )}
    </div>
  );
};

const QuestionCard: React.FC<{
  draft: QuestionDraft;
  onChange: (patch: Partial<QuestionDraft>) => void;
  onSave: () => void;
  onDelete: () => void;
}> = ({ draft, onChange, onSave, onDelete }) => {
  const TYPE_LABEL: Record<QuestionType, string> = {
    mcq: 'Multiple Choice',
    short_answer: 'Short Answer',
    essay: 'Essay',
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-slate-300" />
            <span className="text-xs font-bold text-slate-500">Q{draft.order}</span>
            <Badge variant="outline" className="text-xs">{TYPE_LABEL[draft.type]}</Badge>
            {draft.saved && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">Saved</Badge>}
            {draft.saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete question">
              <Trash2 className="w-4 h-4 text-rose-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Question</Label>
          <Textarea
            className="mt-1.5"
            placeholder="Type the question prompt"
            value={draft.content}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={2}
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Marks</Label>
            <Input
              type="number"
              min={0.5}
              step={0.5}
              className="mt-1.5"
              value={draft.marks}
              onChange={(e) => onChange({ marks: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="w-48">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</Label>
            <Select value={draft.type} onValueChange={(v) => onChange({ type: v as QuestionType })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple choice</SelectItem>
                <SelectItem value="short_answer">Short answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {draft.type === 'mcq' && (
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Options</Label>
            <div className="mt-2 space-y-2">
              {draft.options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = draft.options.map((o, i) => ({ ...o, is_correct: i === idx }));
                      onChange({ options: next });
                    }}
                    aria-label={opt.is_correct ? 'Correct option' : 'Mark as correct'}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      opt.is_correct ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {opt.is_correct && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-xs font-bold text-slate-500 w-4">{opt.id.toUpperCase()}.</span>
                  <Input
                    placeholder={`Option ${opt.id.toUpperCase()}`}
                    value={opt.label}
                    onChange={(e) => {
                      const next = draft.options.map((o, i) => (i === idx ? { ...o, label: e.target.value } : o));
                      onChange({ options: next });
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Tap the circle to mark the correct answer.</p>
          </div>
        )}

        {draft.type === 'short_answer' && (
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Correct answer (for auto-grading)</Label>
            <Input
              className="mt-1.5"
              placeholder="The expected answer text"
              value={draft.correct_answer}
              onChange={(e) => onChange({ correct_answer: e.target.value })}
            />
          </div>
        )}

        {draft.error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="text-xs text-rose-700">{draft.error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={onSave}
            disabled={draft.saving || draft.saved}
          >
            {draft.saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            {draft.saved ? 'Saved' : draft.saving ? 'Saving' : 'Save question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function normaliseOptions(raw: unknown): Option[] {
  if (!Array.isArray(raw)) return defaultOptions();
  if (raw.length === 0) return defaultOptions();
  // Server may store options as strings (legacy) or objects.
  return raw.map((o, i) => {
    if (typeof o === 'string') {
      return { id: String.fromCharCode(97 + i), label: o, is_correct: false };
    }
    const obj = o as { id?: string; label?: string; is_correct?: boolean };
    return {
      id: obj.id || String.fromCharCode(97 + i),
      label: obj.label || '',
      is_correct: !!obj.is_correct,
    };
  });
}

function defaultOptions(): Option[] {
  return [
    { id: 'a', label: '', is_correct: false },
    { id: 'b', label: '', is_correct: false },
    { id: 'c', label: '', is_correct: false },
    { id: 'd', label: '', is_correct: false },
  ];
}

export default QuestionBankBuilder;

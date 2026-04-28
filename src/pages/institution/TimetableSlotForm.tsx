import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface ClassRow { id: number; title?: string; class_level_name?: string; subject_name?: string }
interface Term { id: number; name: string; is_active: boolean }
interface Room { id: number; name: string }
interface Subject { id: number; name: string }

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

const DAYS = [
  { v: 0, label: 'Monday' }, { v: 1, label: 'Tuesday' }, { v: 2, label: 'Wednesday' },
  { v: 3, label: 'Thursday' }, { v: 4, label: 'Friday' }, { v: 5, label: 'Saturday' }, { v: 6, label: 'Sunday' },
];

/**
 * Timetable slot creation. Replaces the stub save handler in
 * InstitutionTimetableStudio with a real form. Conflicts (same
 * teacher/room/class double-booked) surface via the backend's
 * TimetableConflict model on next refresh.
 *
 * Route: /dashboard/institution/timetable/slots/new
 */
export const TimetableSlotForm: React.FC = () => {
  const navigate = useNavigate();

  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [day, setDay] = useState<string>('0');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [tR, cR, rR, sR] = await Promise.all([
        apiGet<any>(`${API_BASE_URL}/api/v1/scheduling/terms/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/classes/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/scheduling/rooms/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/curriculum/subjects/`),
      ]);
      if (cancelled) return;
      const ts = arr<Term>(tR.data);
      setTerms(ts);
      const active = ts.find((t) => t.is_active);
      if (active) setTermId(String(active.id));
      setClasses(arr<ClassRow>(cR.data));
      setRooms(arr<Room>(rR.data));
      setSubjects(arr<Subject>(sR.data));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!termId || !classId || !day || !startTime || !endTime) {
      setError('Term, class, day, and times are required.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }
    setSubmitting(true);
    const r = await apiPost<any>(`${API_BASE_URL}/api/v1/scheduling/timetable/`, {
      term: termId,
      assigned_class: classId,
      subject: subjectId || null,
      room: roomId || null,
      day_of_week: parseInt(day),
      start_time: startTime,
      end_time: endTime,
      is_active: true,
      is_draft: false,
    });
    setSubmitting(false);
    if (r.error) { setError(r.error.message); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Slot added</h1>
          <p className="mt-2 text-slate-600">If there's a teacher / room / class conflict, you'll see it on the timetable studio.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate('/dashboard/institution/timetable')} className="rounded-full">View timetable</Button>
            <Button variant="outline" onClick={() => { setSuccess(false); setSubjectId(''); setRoomId(''); }} className="rounded-full">Add another</Button>
          </div>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/dashboard/institution/timetable" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to timetable
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Timetable</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Add a timetable slot</h1>
        <p className="mt-2 text-slate-600">Pick the term, class, day, and time. Subject and room are optional.</p>
      </header>

      <Card><CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Term *</Label>
              <Select value={termId} onValueChange={setTermId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick'} /></SelectTrigger>
                <SelectContent>{terms.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}{t.is_active ? ' · active' : ''}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Class *</Label>
              <Select value={classId} onValueChange={setClassId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick'} /></SelectTrigger>
                <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title || `Class ${c.id}`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Room</Label>
              <Select value={roomId} onValueChange={setRoomId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{rooms.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Day *</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map((d) => <SelectItem key={d.v} value={String(d.v)}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500"><Clock className="w-3.5 h-3.5 inline mr-1" /> Start *</Label>
              <Input type="time" className="mt-1.5" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">End *</Label>
              <Input type="time" className="mt-1.5" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" /><p className="text-sm text-rose-700">{error}</p></div>}
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save slot
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
};

export default TimetableSlotForm;

/**
 * Teacher Attendance — mobile-first PWA wedge surface.
 *
 * Job-to-be-done: "Take attendance for my class in under 60 seconds, even when
 * the WiFi is bad, then move on with my day."
 *
 * Design principles applied (see docs/DESIGN_SYSTEM.md + the elite-product-builder
 * skill's UI design playbook):
 *
 *   - Default = present. The teacher only marks exceptions, not every student.
 *   - Optimistic UI. Status changes apply instantly; save is explicit so the
 *     teacher always knows what shipped.
 *   - Six states designed: loading, empty, error, default, submitted, offline.
 *   - 44px+ tap targets everywhere. Primary action lives in the bottom 1/3 of
 *     the screen (thumb reach).
 *   - Trust signals: online/offline indicator, last-saved timestamp, explicit
 *     parent-notification confirmation copy on success.
 *   - Microcopy sounds like a human; failure messages name a recovery action.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  RotateCcw,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiClient, API_ENDPOINTS } from '@/lib/apiClient';
import { OfflineSyncEngine } from '@/lib/offlineSync';
import { toast } from 'sonner';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

type AttendanceStatus =
  | 'present'
  | 'late'
  | 'authorized_absent'
  | 'unauthorized_absent';

interface StudentRow {
  /** Backend attendance-record ID (undefined until first save). */
  recordId?: number;
  /** Backend user ID for the student. */
  studentUserId?: number;
  /** Local-only stable key (for list rendering). */
  key: string;
  name: string;
  status: AttendanceStatus;
}

type PageState = 'loading' | 'ready' | 'empty' | 'error' | 'submitted';

// ────────────────────────────────────────────────────────────────────────────
// Status presentation map — single source of truth for label, color, icon.
// ────────────────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  AttendanceStatus,
  { label: string; chipClass: string; dotClass: string }
> = {
  present: {
    label: 'Present',
    chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  late: {
    label: 'Late',
    chipClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  authorized_absent: {
    label: 'Excused',
    chipClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  },
  unauthorized_absent: {
    label: 'Absent',
    chipClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
};

const STATUS_ORDER: AttendanceStatus[] = [
  'present',
  'late',
  'authorized_absent',
  'unauthorized_absent',
];

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase() || '?';
}

/** Stable, deterministic avatar tint per student name — no randomness. */
function avatarTint(name: string): string {
  const palette = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-indigo-100 text-indigo-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function todayHumanDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

function formatRelativeTime(date: Date): string {
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSec < 30) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.round(diffSec / 60);
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

/** Color-coded status chip. Doubles as the picker trigger. */
const StatusChip: React.FC<{
  status: AttendanceStatus;
  onPick: (next: AttendanceStatus) => void;
  studentName: string;
}> = ({ status, onPick, studentName }) => {
  const meta = STATUS_META[status];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${studentName} — currently ${meta.label}. Tap to change.`}
          className={`focus-ring tap-target motion-fast transition-colors inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-body-sm font-medium ${meta.chipClass}`}
        >
          <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} aria-hidden />
          {meta.label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="center"
        className="w-44 p-1 elevation-3 motion-fast"
      >
        <ul role="listbox" aria-label="Set attendance status">
          {STATUS_ORDER.map((next) => {
            const m = STATUS_META[next];
            const selected = next === status;
            return (
              <li key={next}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onPick(next)}
                  className={`focus-ring motion-fast transition-colors flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-body-sm hover:bg-slate-50 ${
                    selected ? 'font-semibold' : 'font-medium text-slate-700'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${m.dotClass}`} aria-hidden />
                  {m.label}
                  {selected && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-slate-500" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

/** A single student row — avatar, name, status chip. */
const StudentRowItem: React.FC<{
  row: StudentRow;
  onChange: (key: string, next: AttendanceStatus) => void;
}> = ({ row, onChange }) => (
  <li className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
    <Avatar className={`h-10 w-10 ${avatarTint(row.name)}`}>
      <AvatarFallback className="bg-transparent text-body-sm font-semibold">
        {initialsOf(row.name)}
      </AvatarFallback>
    </Avatar>
    <span className="flex-1 truncate text-body-default font-medium text-slate-900">
      {row.name}
    </span>
    <StatusChip
      status={row.status}
      studentName={row.name}
      onPick={(next) => onChange(row.key, next)}
    />
  </li>
);

/** Skeleton list shown while the roster loads. Matches final layout. */
const RosterSkeleton: React.FC = () => (
  <ul aria-busy="true" aria-label="Loading roster">
    {Array.from({ length: 8 }).map((_, i) => (
      <li
        key={i}
        className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
      >
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="h-2 w-1/4 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
      </li>
    ))}
  </ul>
);

/** Top-of-screen banner shown while the device is offline. */
const OfflineBanner: React.FC<{ queueSize: number }> = ({ queueSize }) => (
  <div
    role="status"
    aria-live="polite"
    className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-body-sm text-amber-900"
  >
    <WifiOff className="h-4 w-4" aria-hidden />
    <span className="flex-1">
      You&apos;re offline — changes are saved on this phone and will sync when you&apos;re back.
    </span>
    {queueSize > 0 && (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-caption font-semibold">
        {queueSize} pending
      </span>
    )}
  </div>
);

/** Inline connectivity + last-saved chip in the top bar. */
const SyncChip: React.FC<{ online: boolean; lastSavedAt: Date | null }> = ({
  online,
  lastSavedAt,
}) => {
  if (!online) {
    return (
      <span className="inline-flex items-center gap-1.5 text-caption font-medium text-amber-700">
        <WifiOff className="h-3.5 w-3.5" aria-hidden />
        Offline
      </span>
    );
  }
  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-caption font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        Saved {formatRelativeTime(lastSavedAt)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-caption font-medium text-slate-500">
      <Wifi className="h-3.5 w-3.5" aria-hidden />
      Online
    </span>
  );
};

/** Counts strip — quiet, three numbers, no chart-junk. */
const CountsBar: React.FC<{
  counts: Record<AttendanceStatus, number>;
  total: number;
}> = ({ counts, total }) => {
  // Live region so screen readers announce changes as the teacher taps.
  const summary = STATUS_ORDER
    .filter((s) => counts[s] > 0)
    .map((s) => `${counts[s]} ${STATUS_META[s].label.toLowerCase()}`)
    .join(', ');

  return (
    <div
      className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 py-3"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-caption font-medium text-slate-500">
        Class roster · {total} student{total === 1 ? '' : 's'}
      </span>
      <span className="sr-only">{summary || 'all marked present'}</span>
      <div className="flex items-center gap-3">
        {STATUS_ORDER.map((s) => {
          const n = counts[s];
          if (n === 0) return null;
          const meta = STATUS_META[s];
          return (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-slate-700"
            >
              <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} aria-hidden />
              {n}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Full-page empty state — designed, not a blank screen. */
const EmptyState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
      <Users className="h-8 w-8 text-slate-400" aria-hidden />
    </div>
    <h2 className="text-h2 mb-2 text-slate-900">No students yet</h2>
    <p className="text-body-default mb-8 max-w-sm text-slate-600">
      Once you add students to this class, they&apos;ll show up here every morning.
      Adding a class takes about a minute.
    </p>
    <Button onClick={onBack} className="focus-ring motion-base">
      Back to dashboard
    </Button>
  </div>
);

/** Full-page error state with a clear recovery action. */
const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
      <AlertCircle className="h-8 w-8 text-red-500" aria-hidden />
    </div>
    <h2 className="text-h2 mb-2 text-slate-900">We couldn&apos;t load today&apos;s roster</h2>
    <p className="text-body-default mb-8 max-w-sm text-slate-600">
      This usually means a brief network hiccup. Tap try again — your phone will
      remember any changes you make while we reconnect.
    </p>
    <Button onClick={onRetry} className="focus-ring motion-base">
      <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
      Try again
    </Button>
  </div>
);

/** Full-page success state shown after a successful submit. */
const SubmittedState: React.FC<{
  counts: Record<AttendanceStatus, number>;
  total: number;
  onContinue: () => void;
  onUndo: () => void;
}> = ({ counts, total, onContinue, onUndo }) => {
  const absent = counts.unauthorized_absent;
  const late = counts.late;
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <Sparkles className="h-8 w-8 text-emerald-600" aria-hidden />
      </div>
      <h2 className="text-h2 mb-2 text-slate-900">Attendance saved</h2>
      <p className="text-body-default mb-2 max-w-sm text-slate-600">
        {total} student{total === 1 ? '' : 's'} recorded for today.
      </p>
      {absent + late > 0 ? (
        <p className="text-body-sm mb-8 max-w-sm text-slate-500">
          Parents of the {absent} absent and {late} late student{absent + late === 1 ? '' : 's'}{' '}
          will get a WhatsApp message within a minute.
        </p>
      ) : (
        <p className="text-body-sm mb-8 max-w-sm text-slate-500">
          Everyone is here today. Nothing to send home.
        </p>
      )}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button onClick={onContinue} className="focus-ring motion-base h-12 text-body-default">
          Back to dashboard
        </Button>
        <button
          type="button"
          onClick={onUndo}
          className="focus-ring motion-fast text-body-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Wait, I need to fix something
        </button>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export const AttendanceTodayPage: React.FC = () => {
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  // Stable class title — once real data flows, this comes from the class.
  // For now show today's date so the screen still feels grounded.
  const className = 'Your class';
  const dateLabel = useMemo(() => todayHumanDate(), []);

  // ── Connectivity listeners ────────────────────────────────────────────
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // ── Roster load ───────────────────────────────────────────────────────
  const loadRoster = useCallback(async () => {
    setPageState('loading');
    try {
      const res = await apiClient.get(
        `${API_ENDPOINTS.DAILY_ATTENDANCE}?record_date=${todayIsoDate()}`,
      );
      const raw = Array.isArray(res.data)
        ? res.data
        : (res.data as { results?: unknown[] } | null)?.results ?? [];
      if (!Array.isArray(raw) || raw.length === 0) {
        setPageState('empty');
        return;
      }
      const rows: StudentRow[] = (raw as Array<Record<string, unknown>>).map((r, i) => ({
        recordId: typeof r.id === 'number' ? r.id : undefined,
        studentUserId: typeof r.student === 'number' ? r.student : undefined,
        key: `s-${(r.id as number | undefined) ?? `idx-${i}`}`,
        name:
          (typeof r.student_name === 'string' && r.student_name) ||
          (typeof r.student === 'number' ? `Student ${r.student}` : 'Unknown student'),
        status: ((r.status as AttendanceStatus | undefined) ?? 'present'),
      }));
      setStudents(rows);
      setPageState(rows.length === 0 ? 'empty' : 'ready');
    } catch {
      setPageState('error');
    }
  }, []);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  // ── Status change (optimistic, local) ─────────────────────────────────
  const updateStatus = useCallback((key: string, next: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((row) => (row.key === key ? { ...row, status: next } : row)),
    );
  }, []);

  // ── Submit / save ─────────────────────────────────────────────────────
  const submitAttendance = useCallback(async () => {
    if (submitting || students.length === 0) return;
    setSubmitting(true);
    const recordDate = todayIsoDate();

    if (!OfflineSyncEngine.isOnline()) {
      OfflineSyncEngine.queueJob('upload_assignment', {
        type: 'attendance',
        record_date: recordDate,
        students,
      });
      setSubmitting(false);
      setLastSavedAt(new Date());
      setPageState('submitted');
      toast.success('Saved on your phone — we&apos;ll sync when you&apos;re online.');
      return;
    }

    try {
      const payloads = students.map((s) => {
        const body: Record<string, unknown> = {
          record_date: recordDate,
          status: s.status,
          notes: '',
        };
        if (s.studentUserId != null) body.student = s.studentUserId;
        return { row: s, body };
      });
      const results = await Promise.allSettled(
        payloads.map(({ row, body }) =>
          row.recordId
            ? apiClient.patch(`${API_ENDPOINTS.DAILY_ATTENDANCE}${row.recordId}/`, body)
            : apiClient.post(API_ENDPOINTS.DAILY_ATTENDANCE, body),
        ),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed === 0) {
        setLastSavedAt(new Date());
        setPageState('submitted');
      } else {
        // Partial failure — queue the failures and tell the teacher honestly.
        OfflineSyncEngine.queueJob('upload_assignment', {
          type: 'attendance',
          record_date: recordDate,
          students,
        });
        setLastSavedAt(new Date());
        setPageState('submitted');
        toast.warning(
          `Most students saved — ${failed} entries will retry automatically.`,
        );
      }
    } catch {
      OfflineSyncEngine.queueJob('upload_assignment', {
        type: 'attendance',
        record_date: recordDate,
        students,
      });
      setLastSavedAt(new Date());
      setPageState('submitted');
      toast.info('Saved on your phone — we&apos;ll sync as soon as the network is back.');
    } finally {
      setSubmitting(false);
    }
  }, [students, submitting]);

  // ── Derived values ────────────────────────────────────────────────────
  const counts = useMemo<Record<AttendanceStatus, number>>(() => {
    const c: Record<AttendanceStatus, number> = {
      present: 0,
      late: 0,
      authorized_absent: 0,
      unauthorized_absent: 0,
    };
    for (const s of students) c[s.status] += 1;
    return c;
  }, [students]);

  const total = students.length;
  const exceptionCount = total - counts.present;
  const submitLabel =
    exceptionCount === 0
      ? `Confirm everyone is here (${total})`
      : `Save attendance · ${counts.present} present · ${exceptionCount} marked`;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar — back, title, sync chip */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        {!online && <OfflineBanner queueSize={0} />}
        <div className="flex items-center gap-2 px-2 py-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
            className="focus-ring tap-target motion-fast rounded-full text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex-1">
            <h1 className="text-h3 text-slate-900">Today&apos;s attendance</h1>
            <p className="text-caption text-slate-500">
              {className} · {dateLabel}
            </p>
          </div>
          <div className="pr-2">
            <SyncChip online={online} lastSavedAt={lastSavedAt} />
          </div>
        </div>
      </header>

      {/* Body — switches on page state */}
      <main className="flex flex-1 flex-col">
        {pageState === 'loading' && (
          <>
            <div className="border-b border-slate-100 bg-white px-4 py-3">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
            </div>
            <RosterSkeleton />
          </>
        )}

        {pageState === 'empty' && <EmptyState onBack={() => navigate('/dashboard')} />}

        {pageState === 'error' && <ErrorState onRetry={loadRoster} />}

        {pageState === 'submitted' && (
          <SubmittedState
            counts={counts}
            total={total}
            onContinue={() => navigate('/dashboard')}
            onUndo={() => setPageState('ready')}
          />
        )}

        {pageState === 'ready' && (
          <>
            <CountsBar counts={counts} total={total} />
            {exceptionCount === 0 && (
              <p className="text-body-sm border-b border-slate-100 bg-white px-4 py-2 text-slate-500">
                Everyone is present. Tap a name to mark exceptions.
              </p>
            )}
            <ul className="bg-white pb-32">
              {students.map((row) => (
                <StudentRowItem key={row.key} row={row} onChange={updateStatus} />
              ))}
            </ul>
          </>
        )}
      </main>

      {/* Sticky bottom CTA — only on the ready state */}
      {pageState === 'ready' && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 pt-3 elevation-overlay"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 0.75rem)' }}
        >
          <Button
            onClick={submitAttendance}
            disabled={submitting || total === 0}
            className="focus-ring motion-base h-12 w-full text-body-default font-semibold"
          >
            {submitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceTodayPage;

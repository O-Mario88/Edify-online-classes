import React, { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiClient } from '../../lib/apiClient';

interface NotificationItem {
  id: number;
  channel: string;
  status: string;
  payload: { title?: string; message?: string; [k: string]: any };
  created_at: string;
  read_at: string | null;
}

interface InboxResponse {
  unread_count: number;
  items: NotificationItem[];
}

interface NotificationsDrawerProps {
  /** When true, render only the icon trigger (no sheet content). Caller is
   *  responsible for rendering the sheet via the imperative open function.
   *  Default false: trigger + sheet. */
  iconOnly?: boolean;
  /** Render mode: 'glass' for dark dashboards, 'light' for public pages. */
  variant?: 'glass' | 'light';
}

/**
 * Persistent inbox sheet anchored in the navigation chrome. Polls the
 * /notifications/notification/inbox/ endpoint every 60s for unread count
 * and refreshes the full list on open.
 */
export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ variant = 'light' }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<InboxResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: payload } = await apiClient.get<InboxResponse>(
      '/notifications/notification/inbox/',
    );
    setData(payload || { unread_count: 0, items: [] });
    setLoading(false);
  }, []);

  // Initial fetch + 60s poll for unread count. We re-use `load` so the
  // open-time render shows fresh data without an extra round-trip.
  useEffect(() => {
    load();
    const id = window.setInterval(load, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  // When the sheet is opened, refresh immediately so a long-idle session
  // doesn't show stale data.
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const markAllRead = async () => {
    await apiClient.post('/notifications/notification/mark-all-read/', {});
    load();
  };

  const markOneRead = async (id: number) => {
    await apiClient.post(`/notifications/notification/${id}/mark-read/`, {});
    load();
  };

  const unread = data?.unread_count || 0;
  const items = data?.items || [];

  const triggerCls =
    variant === 'glass'
      ? 'relative inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors'
      : 'relative inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerCls}
        aria-label={unread > 0 ? `Open notifications (${unread} unread)` : 'Open notifications'}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                Notifications
                {unread > 0 && <Badge variant="outline" className="ml-1">{unread} new</Badge>}
              </SheetTitle>
              {unread > 0 && (
                <Button size="sm" variant="ghost" onClick={markAllRead} className="text-xs">
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto bg-slate-50">
            {loading && items.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">Loading…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="py-12 text-center px-6">
                <BellOff className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">You're all caught up.</p>
                <p className="text-xs text-slate-500 mt-1">
                  When teachers, parents, or the platform notify you about anything, it'll appear here.
                </p>
              </div>
            )}
            {items.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => {
                  const title = n.payload?.title || `${n.channel} notification`;
                  const message = n.payload?.message || '';
                  const isUnread = !n.read_at;
                  return (
                    <li
                      key={n.id}
                      className={`px-5 py-3 cursor-pointer hover:bg-white transition-colors ${isUnread ? 'bg-white' : 'bg-slate-50/60'}`}
                      onClick={() => isUnread && markOneRead(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        {isUnread && <span className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />}
                        <div className={`flex-1 min-w-0 ${isUnread ? '' : 'pl-5'}`}>
                          <p className={`text-sm leading-snug ${isUnread ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                            {title}
                          </p>
                          {message && (
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-3 whitespace-pre-wrap break-words">{message}</p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleString()} · via {n.channel}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, GraduationCap } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

export interface LinkedChild {
  student_user_id: number;
  student_email: string;
  student_name: string;
  student_stage?: string | null;
  relationship?: string;
  link_id: number;
}

interface ChildSelectorProps {
  /** Called whenever the selected child changes (or once initial load resolves). */
  onChange?: (child: LinkedChild | null) => void;
}

/**
 * Inline child selector for the parent dashboard. Pulls every linked
 * student from /parent-portal/parent-student-link/my-children/ and
 * renders a chip-bar so a parent with two or three kids can flip
 * between them without leaving the dashboard.
 *
 * Renders nothing while loading; renders nothing if the parent has
 * exactly one linked child (no point showing a single chip). Always
 * fires onChange so consumers know the selected child.
 */
export const ChildSelector: React.FC<ChildSelectorProps> = ({ onChange }) => {
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await apiClient.get<LinkedChild[]>(
        '/parent-portal/parent-student-link/my-children/',
      );
      const list = Array.isArray(data) ? data : [];
      setChildren(list);
      const first = list[0] || null;
      setSelectedId(first ? first.student_user_id : null);
      onChange?.(first);
      setLoading(false);
    };
    load();
    // We deliberately load once. Caller-provided onChange would otherwise
    // re-fire fetches in dev because of identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || children.length <= 1) return null;

  const select = (child: LinkedChild) => {
    setSelectedId(child.student_user_id);
    onChange?.(child);
  };

  return (
    <Card className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardContent className="py-3 px-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
          <Users className="w-3.5 h-3.5" /> Viewing
        </span>
        {children.map((c) => {
          const active = c.student_user_id === selectedId;
          return (
            <Button
              key={c.student_user_id}
              size="sm"
              variant={active ? 'default' : 'outline'}
              onClick={() => select(c)}
              className={
                active
                  ? 'h-8 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 px-3.5'
                  : 'h-8 rounded-full text-slate-700 hover:bg-slate-50 px-3.5'
              }
            >
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
              {c.student_name}
              {c.student_stage && (
                <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 bg-white/40 border-white/30">
                  {c.student_stage === 'primary' ? 'P4–P7' : 'S1–S6'}
                </Badge>
              )}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

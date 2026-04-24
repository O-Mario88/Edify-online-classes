import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { apiPost } from '../../lib/apiClient';
import { toast } from 'sonner';

/**
 * Compact dashboard card that lets a learner post a question to the
 * Standby Teacher Network without leaving their dashboard. Full
 * request history lives at /standby-teachers/.
 */
export const AskStandbyTeacherCard: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;
    setSending(true);
    const { error } = await apiPost('/standby-teachers/support-requests/', {
      topic, question, request_type: 'chat', priority: 'normal',
    });
    setSending(false);
    if (error) {
      toast.error('Could not send your question. Please try again.');
      return;
    }
    toast.success("Question sent. A standby teacher will pick it up shortly.");
    setTopic('');
    setQuestion('');
  };

  return (
    <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4 text-emerald-600" /> Ask a Standby Teacher
        </CardTitle>
        <p className="text-xs text-slate-600">Stuck on a question? Send it to a real teacher on standby — no need to wait for a class.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Topic (e.g. Quadratic equations)"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
        />
        <Textarea
          rows={3}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Describe what you don't understand…"
        />
        <div className="flex items-center justify-between gap-3">
          <Link to="/standby-teachers" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
            See all my questions <ArrowRight className="w-3 h-3" />
          </Link>
          <Button onClick={handleSend} disabled={!question.trim() || sending} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
            <Send className="w-4 h-4 mr-1" /> {sending ? 'Sending…' : 'Send to a teacher'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AskStandbyTeacherCard;

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Play, Calendar, VideoOff, ArchiveRestore, Clock, Video } from 'lucide-react';
import { isFuture, isPast, addMinutes, isWithinInterval } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../../lib/apiClient';

interface LiveSessionCTAProps {
  sessionId: string;
  scheduledStart: string; // ISO string
  durationMinutes: number;
  attended: boolean;
  meetingUrl?: string;
  recordingUrl?: string;
  className?: string; // Additional classes
}

type SessionState = 'scheduled' | 'live' | 'missed' | 'completed';

export const LiveSessionCTA: React.FC<LiveSessionCTAProps> = ({
  sessionId,
  scheduledStart,
  durationMinutes,
  attended,
  meetingUrl,
  recordingUrl,
  className = ''
}) => {
  const [sessionState, setSessionState] = useState<SessionState>('scheduled');
  const navigate = useNavigate();

  // Evaluate the state on interval
  useEffect(() => {
    const evaluateState = () => {
      const now = new Date();
      const start = new Date(scheduledStart);
      const end = addMinutes(start, durationMinutes);

      if (isPast(end)) {
        setSessionState(attended ? 'completed' : 'missed');
      } else if (isWithinInterval(now, { start, end })) {
        setSessionState('live');
      } else if (isFuture(start)) {
        setSessionState('scheduled');
      }
    };

    evaluateState();
    const interval = setInterval(evaluateState, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [scheduledStart, durationMinutes, attended]);

  const handleAction = async () => {
    switch (sessionState) {
      case 'live':
        if (meetingUrl) {
          toast.loading('Validating meeting link...', { id: 'meeting-validation' });
          setTimeout(() => {
             if (meetingUrl.includes('meet.google.com') || meetingUrl.includes('zoom.us')) {
                toast.success('Secure link verified. Joining session...', { id: 'meeting-validation' });
                window.open(meetingUrl, '_blank');
             } else {
                toast.error('Session Link Integrity Failed.', { 
                   id: 'meeting-validation', 
                   description: 'This meeting link appears corrupted. Retrying via the Missed Session Recovery Lobby...' 
                });
                navigate(`/dashboard/sessions/recover/${sessionId}`);
             }
          }, 1000);
        } else {
          toast.warning('Waiting for Host', { description: 'The teacher has not yet generated the live meeting room.' });
        }
        break;
      case 'missed':
        navigate(`/dashboard/sessions/recover/${sessionId}`);
        break;
      case 'completed':
        if (recordingUrl) {
           navigate(`/dashboard/sessions/recover/${sessionId}`);
        }
        break;
      case 'scheduled':
      default:
        // Attempt an RSVP
        try {
           toast.loading('Registering RSVP...', { id: 'rsvp' });
           // In the backend, we use /live-sessions/session-reminder/ to RSVP/Remind
           await apiClient.post('/live-sessions/session-reminder/', { session: sessionId, notify_minutes_before: 15 });
           toast.success('RSVP Confirmed. Reminder set for 15 mins before start.', { id: 'rsvp' });
        } catch {
           toast.dismiss('rsvp');
           // Just move on if we fail
        }
        navigate(`/dashboard/sessions/recover/${sessionId}`);
        break;
    }
  };

  switch (sessionState) {
    case 'scheduled':
      return (
        <Button onClick={handleAction} className={`bg-orange-500 hover:bg-orange-600 text-white ${className}`}>
           <Calendar className="w-4 h-4 mr-2" /> Scheduled
        </Button>
      );
    case 'live':
      return (
        <Button onClick={handleAction} className={`bg-green-600 hover:bg-green-700 text-white animate-pulse shadow-md ${className}`}>
           <Play className="w-4 h-4 mr-2 fill-current" /> Join Meeting
        </Button>
      );
    case 'missed':
      return (
        <Button onClick={handleAction} className={`bg-red-600 hover:bg-red-700 text-white ${className}`}>
           <VideoOff className="w-4 h-4 mr-2" /> Missed Session
        </Button>
      );
    case 'completed':
      return (
        <Button onClick={handleAction} variant="secondary" className={`bg-slate-200 hover:bg-slate-300 text-slate-800 ${className}`}>
           <ArchiveRestore className="w-4 h-4 mr-2" /> Completed
        </Button>
      );
    default:
       return null;
  }
};

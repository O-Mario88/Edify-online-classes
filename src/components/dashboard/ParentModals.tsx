import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Settings, MessageSquare, Calendar, User, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export const ParentSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate backend save delay
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Notification preferences updated successfully');
      onClose();
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-sm bg-white shadow-2xl overflow-hidden flex flex-col">
        <CardHeader className="border-b bg-gray-50 flex justify-between flex-row items-center">
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-gray-700"/> Preferences</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-gray-900">Email Alerts</span>
              <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-gray-900">SMS Alerts</span>
              <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
            </label>
            <p className="text-xs text-gray-500">Receive alerts for attendance, failing grades, and tutor nudges.</p>
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const MessageTutorModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await apiClient.post('/notifications/notification/send/', {
        message: message,
        recipient_id: 'tutor_123'
      });
      toast.success('WhatsApp message sent to primary tutor');
      onClose();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg bg-white shadow-2xl overflow-hidden flex flex-col">
        <CardHeader className="border-b bg-indigo-50 flex justify-between flex-row items-center">
          <CardTitle className="flex items-center gap-2 text-indigo-700"><MessageSquare className="w-5 h-5"/> Message Tutor</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <User className="w-8 h-8 text-gray-400 bg-white p-1 rounded-full shadow-sm" />
            <div>
              <p className="font-bold text-gray-900 leading-tight">Mr. Jonathan Doe</p>
              <p className="text-xs text-gray-500">Primary Form Tutor</p>
            </div>
          </div>
          <textarea 
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
            rows={4} 
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button className="w-full flex items-center gap-2" onClick={handleSend} disabled={sending || !message.trim()}>
            <Send className="w-4 h-4"/> {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const BookMeetingModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [date, setDate] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  if (!isOpen) return null;

  const handleBook = async () => {
    if (!date) return;
    setBooking(true);
    try {
      await apiClient.post('/notifications/meetings/request/', {
        date: date,
        recipient_id: 'tutor_123'
      });
      setBooked(true);
      setTimeout(() => {
        onClose();
        setBooked(false);
      }, 2000);
    } catch {
      toast.error('Failed to request meeting');
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-sm bg-white shadow-2xl overflow-hidden flex flex-col">
        <CardHeader className="border-b bg-emerald-50 flex justify-between flex-row items-center">
          <CardTitle className="flex items-center gap-2 text-emerald-700"><Calendar className="w-5 h-5"/> Book Meeting</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={booking}>Close</Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4 text-center">
          {booked ? (
            <div className="py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Request Sent</h3>
              <p className="text-sm text-gray-500">The teacher will conform your appointment soon.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 text-left">Select a preferred date for your parent-teacher conference.</p>
              <input 
                type="date" 
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleBook} disabled={booking || !date}>
                {booking ? 'Requesting...' : 'Request Appointment'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

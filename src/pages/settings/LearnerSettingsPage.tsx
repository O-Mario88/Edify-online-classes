import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, MessageCircle, Download, Headphones, Loader2, ArrowLeft, Mail, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import { useLearnerSettings } from '../../hooks/useLearnerSettings';
import { isDemoModeOn, setDemoMode } from '../../lib/demoSamples';

export const LearnerSettingsPage: React.FC = () => {
  const { settings, loading, update } = useLearnerSettings();
  const [demoOn, setDemoOn] = React.useState<boolean>(isDemoModeOn());

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const toggle = async <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    try {
      await update({ [key]: value } as any);
    } catch {
      toast.error('Could not save that change. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        <Link to="/dashboard/student" className="text-sm text-slate-500 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My settings</h1>
          <p className="text-sm text-slate-600">Make Maple fit how you learn and how your network holds up.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-indigo-600" /> Preview mode</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingRow
              title="Show a preview on empty cards"
              description="When a card has no real data yet (e.g. your first week), Maple will fill it with a realistic example labeled 'Preview' so you can see what it will look like."
              control={
                <Switch checked={demoOn} onCheckedChange={v => {
                  setDemoMode(v);
                  setDemoOn(v);
                  toast.success(v ? 'Preview mode on — refresh to see examples.' : 'Preview mode off.');
                }} />
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Smartphone className="w-4 h-4 text-indigo-600" /> Data + bandwidth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              title="Low-data mode"
              description="Serve lower-resolution images, skip autoplay, and prefer audio when available."
              control={
                <Switch checked={settings.low_data_mode} onCheckedChange={v => toggle('low_data_mode', v)} />
              }
            />
            <SettingRow
              title="Prefer audio lessons"
              description="Where a lesson has both a video and an audio version, default to audio."
              icon={<Headphones className="w-4 h-4 text-slate-400" />}
              control={
                <Switch checked={settings.prefer_audio_lessons} onCheckedChange={v => toggle('prefer_audio_lessons', v)} />
              }
            />
            <SettingRow
              title="Allow offline lesson notes"
              description="Cache lesson notes so you can read them on the bus or at home without Wi-Fi."
              icon={<Download className="w-4 h-4 text-slate-400" />}
              control={
                <Switch checked={settings.allow_offline_downloads} onCheckedChange={v => toggle('allow_offline_downloads', v)} />
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="w-4 h-4 text-emerald-600" /> Reminders + reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">How should Maple send your weekly progress brief?</p>
              <div className="grid grid-cols-3 gap-2">
                {(['email', 'whatsapp', 'sms'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggle('weekly_brief_delivery', opt)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      settings.weekly_brief_delivery === opt
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt === 'email' ? <Mail className="w-4 h-4 inline mr-1" /> : <MessageCircle className="w-4 h-4 inline mr-1" />}
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <SettingRow
              title="WhatsApp alerts"
              description="Opt in to receive short progress alerts on WhatsApp."
              control={<Switch checked={settings.whatsapp_optin} onCheckedChange={v => toggle('whatsapp_optin', v)} />}
            />
            <SettingRow
              title="SMS alerts"
              description="If you don't use WhatsApp, Maple can send essential alerts by SMS."
              control={<Switch checked={settings.sms_optin} onCheckedChange={v => toggle('sms_optin', v)} />}
            />

            {(settings.whatsapp_optin || settings.sms_optin || settings.weekly_brief_delivery !== 'email') && (
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-1">Contact phone</label>
                <Input
                  value={settings.contact_phone}
                  onChange={e => toggle('contact_phone', e.target.value)}
                  placeholder="+256700000000"
                />
                <p className="text-xs text-slate-500 mt-1">Used only for reminders you've opted into. Never shared outside Maple.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500 text-center">
          Maple never auto-enrolls you in messaging. Nothing is sent to your phone unless you opt in, and you can turn it off here at any time.
        </p>
      </div>
    </div>
  );
};


const SettingRow: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  control: React.ReactNode;
}> = ({ title, description, icon, control }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3 min-w-0">
      {icon && <div className="pt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="shrink-0 pt-1">{control}</div>
  </div>
);

export default LearnerSettingsPage;

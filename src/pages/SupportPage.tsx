import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Mail, MessageSquareWarning, BookOpen, LifeBuoy, Phone, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * /support — single landing page every "Help" / "Contact Support" link
 * across the app routes to. Pilot-grade: lists the channels we actually
 * monitor (email + in-app feedback) plus a phone fallback. No FAQ
 * search, no chatbot, no ticket portal — those are post-pilot.
 */
export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const isAuthed = !!user;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 mb-4">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">We're here to help</h1>
          <p className="text-slate-600">
            Pick the channel that fits. We respond to every pilot user within 24 hours, often the same day.
          </p>
        </header>

        <div className="space-y-4">
          {isAuthed && (
            <Card className="border-indigo-200 bg-indigo-50/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4 text-indigo-600" />
                  Report something broken (in-app)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-2">
                <p>
                  Use the "Report an issue" button at the bottom-right of any page. It captures the URL, your account, and a one-paragraph description — nothing else.
                </p>
                <p className="text-xs text-slate-500">
                  Best for: a button that didn't work, a page that crashed, a confusing label, an idea for a feature.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                Email us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-3">
              <div>
                <p className="font-semibold text-slate-900">support@maple.edify</p>
                <p className="text-xs text-slate-500">General questions, account issues, or anything that isn't urgent.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">billing@maple.edify</p>
                <p className="text-xs text-slate-500">Subscription, upgrade, refund, or invoice questions.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">schools@maple.edify</p>
                <p className="text-xs text-slate-500">For institution admins — onboarding, fee setup, capacity changes.</p>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <a href="mailto:support@maple.edify">Open mail app</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                Phone (Uganda)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900">+256 700 000 000</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Mon–Fri, 09:00–17:00 EAT.
              </p>
              <p className="text-xs text-slate-500">
                Outside hours, leave a voicemail or send WhatsApp to the same number — we read both.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                Common questions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-3">
              <details className="group">
                <summary className="cursor-pointer font-semibold text-slate-800 hover:text-slate-900">
                  How do I change my child's class?
                </summary>
                <p className="mt-2 text-slate-600">
                  Email schools@maple.edify with your child's name and the new class. Class changes need a registrar's confirmation so we don't move accidentally.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-semibold text-slate-800 hover:text-slate-900">
                  My subscription says "Free" but I paid through my school. Why?
                </summary>
                <p className="mt-2 text-slate-600">
                  School-paid subscriptions are tied to your institutional account, not your personal one. If your institution is on a paid plan you'll see "Through your school" in the access banner. If not, contact your school's admin office or email schools@maple.edify.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-semibold text-slate-800 hover:text-slate-900">
                  I requested an upgrade. How long does approval take?
                </summary>
                <p className="mt-2 text-slate-600">
                  We commit to 24-hour approval for pilot users. If you've waited longer, email billing@maple.edify with your registered email.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-semibold text-slate-800 hover:text-slate-900">
                  Can I export my child's grades?
                </summary>
                <p className="mt-2 text-slate-600">
                  Open the Parent Dashboard → "View Full Report" → "Print / Save as PDF" in the modal header. Use your browser's print dialog to save a clean PDF.
                </p>
              </details>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-10">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to Maple
          </Link>
        </div>
      </div>
    </div>
  );
};

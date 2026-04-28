import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { CheckCircle, Star, Send, AlertTriangle } from 'lucide-react';
import { apiPost, API_BASE_URL } from '../lib/apiClient';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !feedback.trim()) return;
    setSubmitting(true);
    setError(null);
    const r = await apiPost<{ id?: number }>(`${API_BASE_URL}/api/v1/feedback/`, {
      message: feedback,
      contact_email: email || undefined,
      rating: rating || undefined,
      kind: 'pilot_general',
    });
    setSubmitting(false);
    if (r.error) {
      setError(r.error.message);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="pb-2 border-b-0">
          <CardTitle className="text-3xl font-bold text-indigo-900 flex items-center gap-2">
            <Star className="w-7 h-7 text-yellow-400" /> Feedback & Suggestions
          </CardTitle>
          <CardDescription className="text-slate-500 mt-2 text-base">
            We value your input! Share your thoughts, suggestions, or report any issues to help us improve your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Thank you for your feedback!</h3>
              <p className="text-gray-600 mt-2">We appreciate your input and will use it to enhance our platform.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Feedback *</label>
                <Textarea
                  required
                  rows={5}
                  placeholder="Share your experience, suggestions, or report an issue..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="resize-none border-indigo-200 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email (optional)</label>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="border-indigo-200 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={
                        star <= rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star className="w-6 h-6" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">{rating > 0 ? `${rating}/5` : 'No rating'}</span>
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Sending…' : 'Submit Feedback'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

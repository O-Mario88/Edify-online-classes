import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface Question {
  id: string | number;
  type: string;
  content: string;
  marks: string;
  order: number;
  options: string[];
}

interface ActiveAssessmentProps {
  assessmentId: string | number;
  onComplete?: (result: any) => void;
}

export const ActiveAssessment: React.FC<ActiveAssessmentProps> = ({ assessmentId, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const { data } = await apiClient.get(`/assessments/assessment/${assessmentId}/`);
        setAssessment(data);
      } catch (err) {
        console.error("Failed to load assessment", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId]);

  const handleSelectAnswer = (questionId: string | number, value: string) => {
    setAnswers(prev => ({ ...prev, [String(questionId)]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/assessments/submission/', {
        assessment: assessmentId,
        answers_data: answers
      });
      setResult(data);
      if (onComplete) onComplete(data);
    } catch (err) {
      console.error("Failed to submit assessment", err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Clock className="w-6 h-6 animate-spin mx-auto text-blue-700 mb-2"/> Loading Assessment...</div>;
  }

  if (!assessment) {
    return <div className="p-8 text-center text-red-700"><AlertCircle className="w-8 h-8 mx-auto mb-2"/> Failed to load assessment.</div>;
  }

  if (result) {
    return (
      <Card className="max-w-2xl mx-auto mt-8 border-green-200">
        <CardHeader className="bg-green-50/50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-6 h-6 text-emerald-700" />
            Assessment Submitted
          </CardTitle>
          <CardDescription>Your responses have been recorded.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {result.status === 'graded' ? (
            <div className="text-center">
              <h1 className="text-4xl font-black text-gray-900 mb-2">{result.total_score}</h1>
              <p className="text-gray-700 uppercase tracking-widest text-sm font-bold">Total Score</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-800">Your assignment is pending manual review by your teacher.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto mt-8 shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{assessment.type.toUpperCase()}</CardTitle>
            <CardDescription className="mt-1">Please answer all questions before submitting.</CardDescription>
          </div>
          <div className="text-xs font-bold text-gray-700 uppercase bg-gray-200 px-3 py-1 rounded">
            {assessment.questions?.length || 0} Questions
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {assessment.questions?.map((q: Question, idx: number) => (
            <div key={q.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-medium text-gray-900">
                  <span className="text-gray-800 mr-2">{idx + 1}.</span> {q.content}
                </h3>
                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {q.marks} marks
                </span>
              </div>

              {q.type === 'mcq' && q.options && (
                <RadioGroup 
                  onValueChange={(val) => handleSelectAnswer(q.id, val)}
                  value={answers[String(q.id)] || ""}
                  className="space-y-3 mt-4"
                >
                  {q.options.map((opt: string, optIdx: number) => (
                    <div key={optIdx} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`q${q.id}-opt${optIdx}`} />
                      <Label htmlFor={`q${q.id}-opt${optIdx}`} className="text-sm font-normal text-gray-700 cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {q.type !== 'mcq' && (
                <textarea 
                  className="w-full mt-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                  rows={4}
                  placeholder="Type your answer here..."
                  value={answers[String(q.id)] || ""}
                  onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50/50 border-t p-6 flex justify-between items-center">
        <span className="text-sm text-gray-700">
          Answered: {Object.keys(answers).length} / {assessment.questions?.length || 0}
        </span>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Assessment'}
        </Button>
      </CardFooter>
    </Card>
  );
};

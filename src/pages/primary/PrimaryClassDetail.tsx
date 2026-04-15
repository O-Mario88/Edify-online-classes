import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  BookOpen, ChevronRight, ArrowLeft, Play, FileText, PenTool,
  CheckCircle, Clock, Users, GraduationCap, Sparkles, ArrowRight
} from 'lucide-react';
import { getGradesForSchoolLevel } from '../../lib/curriculum';
import { getPrimarySubjectsForClass, getPrimaryTopics } from '../../lib/curriculum/ugandaPrimaryContent';
import { toast } from 'sonner';

export const PrimaryClassDetail: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const grades = getGradesForSchoolLevel('uganda', 'primary');
  const grade = grades.find((g) => g.id === classId);
  const classLevel = classId?.toUpperCase() || 'P4';
  const subjects = getPrimarySubjectsForClass(classLevel);

  if (!grade) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500">Class not found.</p>
        <Button variant="ghost" onClick={() => navigate('/primary')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Primary Classes
        </Button>
      </div>
    );
  }

  const isP7 = grade.isExamYear;
  const isTransition = grade.isTransitionYear;

  // If a subject is selected, show topics
  if (selectedSubject) {
    const subject = subjects.find((s) => s.id === selectedSubject);
    const topics = getPrimaryTopics(selectedSubject, classLevel);

    // If a topic is selected, show subtopics and lessons
    if (selectedTopic && subject) {
      const topic = topics.find((t) => t.id === selectedTopic);
      if (!topic) return null;

      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {subject.name} Topics
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
            <p className="text-gray-500">{grade.name} → {subject.name}</p>
          </div>

          <div className="space-y-4">
            {topic.subtopics?.map((subtopic, idx) => (
              <Card key={subtopic.id} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{subtopic.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Mock lesson items */}
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toast.info(`Opening lesson: ${subtopic.name}`)}>
                      <div className="p-1.5 bg-blue-100 rounded"><Play className="w-3.5 h-3.5 text-blue-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Lesson: {subtopic.name}</p>
                        <p className="text-xs text-gray-400">Video · 15 min</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toast.info(`Starting practice: ${subtopic.name} Exercise`)}>
                      <div className="p-1.5 bg-purple-100 rounded"><PenTool className="w-3.5 h-3.5 text-purple-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Practice: {subtopic.name} Exercise</p>
                        <p className="text-xs text-gray-400">Interactive · 10 min</p>
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toast.info(`Opening activity: ${subtopic.name} Project`)}>
                      <div className="p-1.5 bg-green-100 rounded"><FileText className="w-3.5 h-3.5 text-green-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Activity: {subtopic.name} Project</p>
                        <p className="text-xs text-gray-400">Assignment · Due in 3 days</p>
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toast.info(`Opening notes: ${subtopic.name}`)}>
                      <div className="p-1.5 bg-amber-100 rounded"><BookOpen className="w-3.5 h-3.5 text-amber-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Notes: {subtopic.name}</p>
                        <p className="text-xs text-gray-400">PDF Resource</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // Show topics list
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => setSelectedSubject(null)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to {grade.name} Subjects
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{subject?.name}</h1>
          <p className="text-gray-500">{grade.name} · {topics.length} Topics</p>
        </div>

        <div className="space-y-3">
          {topics.map((topic, idx) => (
            <Card
              key={topic.id}
              className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
              onClick={() => setSelectedTopic(topic.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{topic.name}</p>
                      <p className="text-xs text-gray-500">
                        {topic.subtopics?.length || 0} subtopics · Lessons, Practice & Activities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (idx + 1) * 15)}%` }} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Subject listing view (Level 2)
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/primary')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Primary Classes
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900">{grade.name}</h1>
        {isP7 && (
          <Badge variant="destructive" className="bg-amber-600">
            <GraduationCap className="w-3 h-3 mr-1" /> PLE Year
          </Badge>
        )}
        {isTransition && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Sparkles className="w-3 h-3 mr-1" /> Transition Year
          </Badge>
        )}
      </div>
      <p className="text-gray-500 mb-6">{grade.description}</p>

      {isTransition && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Transition Year Guidance</p>
                <p className="text-sm text-blue-700 mt-1">
                  Primary 4 marks the transition from lower to upper primary. The learning experience is more structured
                  with guided support to help learners adjust to the increased academic load. Teachers receive
                  transition-specific support notes, and parents get additional guidance on supporting this change.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isP7 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">PLE Examination Year</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Primary 7 is the final year of primary education. Learners sit the national PLE exam.
                    The readiness system tracks preparation across all subjects.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => navigate('/primary/p7-readiness')}
              >
                View P7 Readiness
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Subjects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const topicCount = getPrimaryTopics(subject.id, classLevel).length;
          const colors: Record<string, string> = {
            'English': 'from-blue-50 to-blue-100 border-blue-200',
            'Mathematics': 'from-green-50 to-green-100 border-green-200',
            'Social Studies': 'from-amber-50 to-amber-100 border-amber-200',
            'Integrated Science': 'from-purple-50 to-purple-100 border-purple-200',
            'Religious Education': 'from-indigo-50 to-indigo-100 border-indigo-200',
            'Local Language': 'from-rose-50 to-rose-100 border-rose-200',
            'Creative Arts and Physical Education': 'from-teal-50 to-teal-100 border-teal-200',
          };
          const colorClass = colors[subject.name] || 'from-gray-50 to-gray-100 border-gray-200';

          return (
            <Card
              key={subject.id}
              className={`cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br ${colorClass} border`}
              onClick={() => setSelectedSubject(subject.id)}
            >
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{subject.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{topicCount} Topics · Term 1-3</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mt-3">
                  <div className="w-full bg-white/60 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.floor(Math.random() * 50) + 20}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </div>
  );
};

export default PrimaryClassDetail;

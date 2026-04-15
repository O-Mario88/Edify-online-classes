import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  BookOpen, Users, GraduationCap, Star, ArrowRight,
  Clock, CheckCircle, AlertTriangle, TrendingUp, Sparkles
} from 'lucide-react';
import { getCurriculumForSchoolLevel, getGradesForSchoolLevel } from '../../lib/curriculum';
import { getPrimarySubjectsForClass, getPrimaryTopics } from '../../lib/curriculum/ugandaPrimaryContent';
import type { SchoolLevel } from '../../types';

// Default stats — will be populated from analytics API when available
const DEFAULT_STATS = { students: 0, teachers: 0, avgProgress: 0, activeSubjects: 0 };

export const PrimaryClassLanding: React.FC = () => {
  const navigate = useNavigate();
  const grades = getGradesForSchoolLevel('uganda', 'primary');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Primary Classes</h1>
        <p className="text-gray-600 mt-1">Uganda NCDC Upper Primary Curriculum — P4 to P7</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {grades.map((grade) => {
          const mock = DEFAULT_STATS;
          const isP7 = grade.isExamYear;
          const isTransition = grade.isTransitionYear;

          return (
            <Card
              key={grade.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
                isP7
                  ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
                  : isTransition
                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
                  : 'border-gray-200 hover:border-primary/30'
              }`}
              onClick={() => navigate(`/primary/class/${grade.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{grade.name}</CardTitle>
                  {isP7 && (
                    <Badge variant="destructive" className="bg-amber-600">
                      <GraduationCap className="w-3 h-3 mr-1" /> PLE Year
                    </Badge>
                  )}
                  {isTransition && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Sparkles className="w-3 h-3 mr-1" /> Transition
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">{grade.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{mock.students} Learners</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{mock.activeSubjects} Subjects</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Class Progress</span>
                      <span>{mock.avgProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          mock.avgProgress >= 60
                            ? 'bg-green-500'
                            : mock.avgProgress >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${mock.avgProgress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full justify-between text-primary hover:text-primary/80"
                    size="sm"
                  >
                    View Class
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions summary */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Overall Progress</p>
                <p className="text-2xl font-bold text-green-700">56%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">P7 Readiness Avg</p>
                <p className="text-2xl font-bold text-amber-700">62%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">Total Enrolled</p>
                <p className="text-2xl font-bold text-blue-700">185</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default PrimaryClassLanding;

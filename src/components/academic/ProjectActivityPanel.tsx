import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import {
  Lightbulb, Award, Users, Clock, Calendar,
  CheckCircle, PlayCircle, FileText, Plus
} from 'lucide-react';

interface ProjectActivityPanelProps {
  contextType: 'topic' | 'lesson';
  contextId: string;
  contextName: string;
}

const MOCK_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Real-World Application Report',
    type: 'project' as const,
    description: 'Apply the concepts learned in this topic to a real-world scenario in your community. Write a 2-page report with diagrams.',
    status: 'active' as const,
    dueDate: '2026-04-30',
    groupSize: '2-3 members',
    progress: 35,
    members: ['Grace N.', 'David M.', 'You']
  },
  {
    id: 'proj-2',
    title: 'Cross-Topic Integration Assessment',
    type: 'activity' as const,
    description: 'This Activity of Integration connects knowledge from the previous 3 topics. Complete the structured worksheet linking concepts across chapters.',
    status: 'pending' as const,
    dueDate: '2026-05-10',
    groupSize: 'Individual',
    progress: 0,
    members: []
  }
];

const MOCK_COMPLETED = [
  {
    id: 'proj-c1',
    title: 'Data Collection Mini-Project',
    type: 'activity' as const,
    completedDate: '2026-03-15',
    score: '18/20',
    rating: 4.5
  }
];

export const ProjectActivityPanel: React.FC<ProjectActivityPanelProps> = ({ contextType, contextId, contextName }) => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-800" />
            Projects & Activities
          </h3>
          <p className="text-sm text-gray-700 mt-1">
            {contextType === 'topic'
              ? 'Project work and activities of integration for this topic'
              : 'Activities specific to this lesson'}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create
        </Button>
      </div>

      {/* Active Projects/Activities */}
      {MOCK_PROJECTS.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Active</h4>
          {MOCK_PROJECTS.map(proj => (
            <Card key={proj.id} className="border-gray-200 hover:shadow-md transition-all overflow-hidden">
              <div className={`h-1 w-full ${proj.type === 'project' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {proj.type === 'project' ? (
                      <Badge className="bg-purple-100 text-purple-700 border-none text-[10px]">
                        <Lightbulb className="h-3 w-3 mr-0.5" /> Project Work
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px]">
                        <Award className="h-3 w-3 mr-0.5" /> Activity of Integration
                      </Badge>
                    )}
                    <Badge variant="outline" className={`text-[10px] ${
                      proj.status === 'active' ? 'text-blue-800 border-blue-200' : 'text-gray-700'
                    }`}>
                      {proj.status === 'active' ? 'In Progress' : 'Not Started'}
                    </Badge>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-1">{proj.title}</h4>
                <p className="text-sm text-gray-800 mb-3">{proj.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-700 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: {proj.dueDate}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {proj.groupSize}</span>
                </div>

                {proj.status === 'active' && (
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">Progress</span>
                      <span className="font-medium text-gray-700">{proj.progress}%</span>
                    </div>
                    <Progress value={proj.progress} className="h-1.5" />
                  </div>
                )}

                {proj.members.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    {proj.members.map((m, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{m}</Badge>
                    ))}
                  </div>
                )}

                <Button size="sm" variant="outline" className="w-full">
                  <PlayCircle className="h-3.5 w-3.5 mr-2" />
                  {proj.status === 'active' ? 'Continue Working' : 'Start'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed */}
      {MOCK_COMPLETED.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Completed</h4>
          {MOCK_COMPLETED.map(proj => (
            <div key={proj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-700 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{proj.title}</p>
                  <p className="text-xs text-gray-700">Completed {proj.completedDate} · Score: {proj.score}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost"><FileText className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      )}

      {MOCK_PROJECTS.length === 0 && MOCK_COMPLETED.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
          <Lightbulb className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No projects or activities yet</p>
          <p className="text-sm text-gray-800 mt-1">Teachers can create project work and activities of integration here.</p>
        </div>
      )}
    </div>
  );
};

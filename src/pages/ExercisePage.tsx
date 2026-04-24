import React from 'react';
import { useParams } from 'react-router-dom';
import { FeatureNotReady } from '../components/FeatureNotReady';

/**
 * Exercise runner — was hardcoded mock resource data keyed by URL param.
 * The real "student submits an answer" flow now lives in
 * StudentAssignmentsPanel on the Student Dashboard. This placeholder catches
 * any old links (/exercises/:id, /assignments/:id, /projects/:id/submit)
 * and points users at the actual submission surface.
 */
export const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  return (
    <FeatureNotReady
      title="Exercise runner"
      summary={
        exerciseId
          ? `The exercise runner (${exerciseId}) is not yet backed by a real API. Use the Student Dashboard's "My assignments" section to view and submit your teacher's assignments.`
          : 'The exercise runner is not yet backed by a real API. Use the Student Dashboard to view and submit assignments from your teacher.'
      }
      backTo="/dashboard/student"
      backLabel="Go to Student Dashboard"
    />
  );
};

export default ExercisePage;

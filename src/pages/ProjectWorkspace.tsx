import React from 'react';
import { FeatureNotReady } from '../components/FeatureNotReady';

/**
 * Per-project workspace — not wired. See ProjectsPage.tsx for context.
 */
const ProjectWorkspace: React.FC = () => (
  <FeatureNotReady
    title="Project workspace"
    summary="Per-project workspace with submissions, discussion, and deadline tracking. Parked until the projects backend exists."
    backTo="/projects"
    backLabel="Back to Projects"
  />
);

export default ProjectWorkspace;

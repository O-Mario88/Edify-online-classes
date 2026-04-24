import React from 'react';
import { FeatureNotReady } from '../components/FeatureNotReady';

/**
 * Group projects / cross-class collaboration feature — not wired.
 *
 * The previous page rendered hardcoded `projectTemplates` arrays with
 * fake participant counts and join-request flows. There is no `projects`
 * Django app backing any of it. Replaced with an honest placeholder;
 * revisit once a project model + API exists.
 */
const ProjectsPage: React.FC = () => (
  <FeatureNotReady
    title="Projects"
    summary="Group projects and cross-class collaboration space. The backend for this isn't implemented yet — coming after the core teacher/student/parent loops are verified with real users."
  />
);

export default ProjectsPage;

import React from 'react';
import { ProjectsPage } from './ProjectsPage';

/**
 * `/projects/:projectId` renders the same Maple Online School project
 * workspace as the listing page. Once per-project content is wired up
 * to the API, swap this for a parameterised version that hydrates the
 * shared UI from `useParams().projectId`.
 */
const ProjectWorkspace: React.FC = () => <ProjectsPage />;

export default ProjectWorkspace;

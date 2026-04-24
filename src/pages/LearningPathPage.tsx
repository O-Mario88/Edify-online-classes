import React from 'react';
import { FeatureNotReady } from '../components/FeatureNotReady';

/**
 * Personalised learning pathway view — not yet implemented on the backend.
 *
 * The prior version rendered three hardcoded arrays (subjects, skillNodes,
 * weeklyPlan) behind a fake 1-second loading spinner. That was misleading:
 * users saw convincing progress numbers that never came from a real API.
 * Replaced with an honest placeholder until the `intelligence.StudyPlan`
 * data can drive this view end-to-end.
 */
const LearningPathPage: React.FC = () => (
  <FeatureNotReady
    title="Learning path"
    summary="A personalised pathway of topics and practice tasks, driven by the Intelligence Engine. The planning UI is still being wired up to real data."
  />
);

export default LearningPathPage;

/**
 * Maple Online School — unified Content Reader types.
 *
 * One model that powers every reading surface across the platform:
 * notes, textbooks, revision notes, study guides, worked examples.
 * Drives the same UI shell across every subject, every level, and
 * every chapter — math formula boxes, biology diagrams, history
 * timelines, English grammar callouts all consume the same structure.
 */

export type Stage = 'primary' | 'secondary';

export type ResourceType =
  | 'note'
  | 'textbook'
  | 'revision_note'
  | 'study_guide'
  | 'worked_example';

/** Content blocks the renderer understands. Subject-agnostic. */
export type ContentBlock =
  | { type: 'heading'; content: string; level?: 1 | 2 | 3 }
  | { type: 'paragraph'; content: string; emphasis?: { word: string; tone?: 'navy' | 'copper' }[] }
  | { type: 'formula'; tex: string; display?: 'inline' | 'block'; caption?: string }
  | { type: 'definition'; term: string; body: string }
  | { type: 'theorem'; title: string; body: string }
  | {
      type: 'example';
      number?: number;
      title: string;
      question: string;
      questionTex?: string;
      solutionSteps: ExampleStep[];
      finalAnswer?: string;
    }
  | { type: 'diagram'; svgKey?: string; src?: string; caption: string; align?: 'left' | 'right' | 'center' }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success' | 'note' | 'practice'; title?: string; body: string }
  | { type: 'key_points'; title?: string; columns: KeyPointColumn[] }
  | { type: 'split'; left: ContentBlock[]; right: ContentBlock[] }
  | { type: 'glossary'; terms: { term: string; meaning: string }[] }
  | { type: 'timeline'; events: { date: string; title: string; body?: string }[] }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'code'; language?: string; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface ExampleStep {
  /** Optional preface before the math line, e.g. "Using the quadratic formula" */
  text?: string;
  /** Math expression rendered with the formula formatter */
  tex?: string;
  /** Optional inline label — e.g. "Therefore," */
  label?: string;
  /** Render as final-answer highlight strip */
  highlight?: boolean;
}

export interface KeyPointColumn {
  title: string;
  icon?: 'check' | 'discriminant' | 'roots' | 'method' | 'note' | 'warn';
  items: { label?: string; tex?: string; body?: string }[];
}

export interface QuickReferenceItem {
  /** What to show as the row label (e.g. "Standard Form" or "Photosynthesis") */
  label: string;
  /** Plain text or formula — formula is detected by `kind` */
  value: string;
  /** Optional second line / extra context */
  meta?: string;
  kind?: 'formula' | 'keyword' | 'date' | 'concept' | 'rule';
}

export interface QuickReferenceCard {
  title: string;
  items: QuickReferenceItem[];
}

export interface RelatedResource {
  id: string;
  title: string;
  meta: string;
  kind:
    | 'practice'
    | 'video'
    | 'examples'
    | 'past_paper'
    | 'summary'
    | 'mind_map'
    | 'flashcard'
    | 'textbook'
    | 'lab'
    | 'audio';
}

export interface TopicNode {
  /** URL-safe slug used as the route param */
  id: string;
  title: string;
  pages?: number;
}

export interface ChapterNode {
  id: string;
  num: number;
  title: string;
  topics?: TopicNode[];
}

export interface ResourceContent {
  id: string;
  title: string;
  type: ResourceType;

  /** Subject metadata — drives top bar + sidebar branding */
  subject: string; // slug, e.g. "mathematics"
  subjectLabel: string; // display label, e.g. "Mathematics"
  classLevel: string; // e.g. "Secondary Year 10"
  stage: Stage;

  chapterId: string;
  chapterNum: number;
  chapterTitle: string;

  topicId: string;
  topicTitle: string;

  estimatedReadingMinutes: number;
  totalPages: number;
  currentPage: number;
  progressPercent: number;
  motivationalMessage?: string;

  blocks: ContentBlock[];
  quickReference?: QuickReferenceCard;
  relatedResources?: RelatedResource[];
}

export interface SubjectContent {
  subject: string;
  subjectLabel: string;
  level: string;
  stage: Stage;
  /** Fully fledged chapter tree shown in the left sidebar */
  chapters: ChapterNode[];
  /**
   * Resource registry keyed by `${chapterId}/${topicId}`. The reader
   * resolves the URL params against this map. Topics that ship without
   * a registered resource fall back to a "coming soon" placeholder.
   */
  resources: Record<string, ResourceContent>;
}

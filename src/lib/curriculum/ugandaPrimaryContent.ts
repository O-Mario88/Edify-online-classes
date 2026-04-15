// Temporary placeholder for Integrated Science topics
const sciTopics: ContentTopic[] = [];
/**
 * Uganda P4–P7 NCDC Curriculum Content
 * Aligned to the National Curriculum Development Centre (NCDC) Upper Primary Syllabus.
 * Covers all 7 examinable and co-curricular subjects for P4-P7.
 */
import { ContentSubject, ContentTopic, ContentSubtopic } from './types';

// ─────────────────────────────────────────
// ENGLISH — P4 to P7 (NCDC Thematic Syllabus)
// ─────────────────────────────────────────
const englishTopics: ContentTopic[] = [
  // ── P4 ──
  { id: 'ug-primary-english-p4-1', subjectId: 'ug-pri-eng', classLevel: 'P4', name: 'Our School', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p4-1a', topicId: 'ug-primary-english-p4-1', name: 'Listening & Speaking: Describing our school', order: 1 },
      { id: 'eng-p4-1b', topicId: 'ug-primary-english-p4-1', name: 'Reading & Comprehension: School life passages', order: 2 },
      { id: 'eng-p4-1c', topicId: 'ug-primary-english-p4-1', name: 'Grammar: Nouns and Articles', order: 3 },
      { id: 'eng-p4-1d', topicId: 'ug-primary-english-p4-1', name: 'Writing: Guided composition about school', order: 4 },
    ]},
  { id: 'ug-primary-english-p4-2', subjectId: 'ug-pri-eng', classLevel: 'P4', name: 'Our Home', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p4-2a', topicId: 'ug-primary-english-p4-2', name: 'Listening & Speaking: Talking about family', order: 1 },
      { id: 'eng-p4-2b', topicId: 'ug-primary-english-p4-2', name: 'Reading: Stories about home and family', order: 2 },
      { id: 'eng-p4-2c', topicId: 'ug-primary-english-p4-2', name: 'Grammar: Pronouns and Possessives', order: 3 },
      { id: 'eng-p4-2d', topicId: 'ug-primary-english-p4-2', name: 'Writing: Describing your home', order: 4 },
    ]},
  { id: 'ug-primary-english-p4-3', subjectId: 'ug-pri-eng', classLevel: 'P4', name: 'Our Health', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p4-3a', topicId: 'ug-primary-english-p4-3', name: 'Listening & Speaking: Health practices discussion', order: 1 },
      { id: 'eng-p4-3b', topicId: 'ug-primary-english-p4-3', name: 'Reading: Health and hygiene passages', order: 2 },
      { id: 'eng-p4-3c', topicId: 'ug-primary-english-p4-3', name: 'Grammar: Adjectives', order: 3 },
      { id: 'eng-p4-3d', topicId: 'ug-primary-english-p4-3', name: 'Writing: A letter about keeping healthy', order: 4 },
    ]},
  { id: 'ug-primary-english-p4-4', subjectId: 'ug-pri-eng', classLevel: 'P4', name: 'Our Environment', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p4-4a', topicId: 'ug-primary-english-p4-4', name: 'Listening & Speaking: Describing the environment', order: 1 },
      { id: 'eng-p4-4b', topicId: 'ug-primary-english-p4-4', name: 'Reading & Comprehension: Environment texts', order: 2 },
      { id: 'eng-p4-4c', topicId: 'ug-primary-english-p4-4', name: 'Grammar: Verbs (present tense)', order: 3 },
      { id: 'eng-p4-4d', topicId: 'ug-primary-english-p4-4', name: 'Writing: Descriptive paragraph', order: 4 },
    ]},
  { id: 'ug-primary-english-p4-5', subjectId: 'ug-pri-eng', classLevel: 'P4', name: 'Transport and Communication', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p4-5a', topicId: 'ug-primary-english-p4-5', name: 'Listening & Speaking: Means of transport', order: 1 },
      { id: 'eng-p4-5b', topicId: 'ug-primary-english-p4-5', name: 'Reading: Transport and communication passages', order: 2 },
      { id: 'eng-p4-5c', topicId: 'ug-primary-english-p4-5', name: 'Grammar: Verbs (past tense)', order: 3 },
      { id: 'eng-p4-5d', topicId: 'ug-primary-english-p4-5', name: 'Writing: Narrative composition', order: 4 },
    ]},
  { id: 'ug-primary-english-p4-6', subjectId: 'ug-pri-eng', classLevel: 'P4', name: 'Our Culture', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p4-6a', topicId: 'ug-primary-english-p4-6', name: 'Listening & Speaking: Discussing cultural practices', order: 1 },
      { id: 'eng-p4-6b', topicId: 'ug-primary-english-p4-6', name: 'Reading: Folk tales and cultural stories', order: 2 },
      { id: 'eng-p4-6c', topicId: 'ug-primary-english-p4-6', name: 'Grammar: Adverbs', order: 3 },
      { id: 'eng-p4-6d', topicId: 'ug-primary-english-p4-6', name: 'Writing: Retelling a cultural story', order: 4 },
    ]},
  { id: 'ug-primary-english-p4-7', subjectId: 'ug-pri-eng', classLevel: 'P4', name: 'Food and Nutrition', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p4-7a', topicId: 'ug-primary-english-p4-7', name: 'Listening & Speaking: Talking about foods', order: 1 },
      { id: 'eng-p4-7b', topicId: 'ug-primary-english-p4-7', name: 'Reading: Passages on balanced diet', order: 2 },
      { id: 'eng-p4-7c', topicId: 'ug-primary-english-p4-7', name: 'Grammar: Prepositions', order: 3 },
      { id: 'eng-p4-7d', topicId: 'ug-primary-english-p4-7', name: 'Writing: A recipe or food description', order: 4 },
    ]},
  { id: 'ug-primary-english-p4-8', subjectId: 'ug-pri-eng', classLevel: 'P4', name: 'Animals in Our Environment', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p4-8a', topicId: 'ug-primary-english-p4-8', name: 'Listening & Speaking: Describing animals', order: 1 },
      { id: 'eng-p4-8b', topicId: 'ug-primary-english-p4-8', name: 'Reading: Stories about animals', order: 2 },
      { id: 'eng-p4-8c', topicId: 'ug-primary-english-p4-8', name: 'Grammar: Conjunctions and sentence joining', order: 3 },
      { id: 'eng-p4-8d', topicId: 'ug-primary-english-p4-8', name: 'Writing: Descriptive composition about an animal', order: 4 },
    ]},

  // ── P5 ──
  { id: 'ug-primary-english-p5-1', subjectId: 'ug-pri-eng', classLevel: 'P5', name: 'Education', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p5-1a', topicId: 'ug-primary-english-p5-1', name: 'Listening & Speaking: Importance of education', order: 1 },
      { id: 'eng-p5-1b', topicId: 'ug-primary-english-p5-1', name: 'Reading & Comprehension: Education passages', order: 2 },
      { id: 'eng-p5-1c', topicId: 'ug-primary-english-p5-1', name: 'Grammar: Tenses (simple present & past)', order: 3 },
      { id: 'eng-p5-1d', topicId: 'ug-primary-english-p5-1', name: 'Writing: Formal letter writing', order: 4 },
    ]},
  { id: 'ug-primary-english-p5-2', subjectId: 'ug-pri-eng', classLevel: 'P5', name: 'Health', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p5-2a', topicId: 'ug-primary-english-p5-2', name: 'Listening & Speaking: Discussing health issues', order: 1 },
      { id: 'eng-p5-2b', topicId: 'ug-primary-english-p5-2', name: 'Reading: Health-related texts', order: 2 },
      { id: 'eng-p5-2c', topicId: 'ug-primary-english-p5-2', name: 'Grammar: Continuous tenses', order: 3 },
      { id: 'eng-p5-2d', topicId: 'ug-primary-english-p5-2', name: 'Writing: Report writing on health', order: 4 },
    ]},
  { id: 'ug-primary-english-p5-3', subjectId: 'ug-pri-eng', classLevel: 'P5', name: 'Agriculture', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p5-3a', topicId: 'ug-primary-english-p5-3', name: 'Listening & Speaking: Agricultural activities', order: 1 },
      { id: 'eng-p5-3b', topicId: 'ug-primary-english-p5-3', name: 'Reading: Passages on farming', order: 2 },
      { id: 'eng-p5-3c', topicId: 'ug-primary-english-p5-3', name: 'Grammar: Subject-verb agreement', order: 3 },
      { id: 'eng-p5-3d', topicId: 'ug-primary-english-p5-3', name: 'Writing: Guided composition on farming', order: 4 },
    ]},
  { id: 'ug-primary-english-p5-4', subjectId: 'ug-pri-eng', classLevel: 'P5', name: 'Transport and Communication', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p5-4a', topicId: 'ug-primary-english-p5-4', name: 'Listening & Speaking: Modern communication', order: 1 },
      { id: 'eng-p5-4b', topicId: 'ug-primary-english-p5-4', name: 'Reading: Transport development passages', order: 2 },
      { id: 'eng-p5-4c', topicId: 'ug-primary-english-p5-4', name: 'Grammar: Direct and indirect speech', order: 3 },
      { id: 'eng-p5-4d', topicId: 'ug-primary-english-p5-4', name: 'Writing: Informal letter writing', order: 4 },
    ]},
  { id: 'ug-primary-english-p5-5', subjectId: 'ug-pri-eng', classLevel: 'P5', name: 'Our Culture', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p5-5a', topicId: 'ug-primary-english-p5-5', name: 'Listening & Speaking: Cultural practices and values', order: 1 },
      { id: 'eng-p5-5b', topicId: 'ug-primary-english-p5-5', name: 'Reading: Cultural texts and stories', order: 2 },
      { id: 'eng-p5-5c', topicId: 'ug-primary-english-p5-5', name: 'Grammar: Comparative and superlative adjectives', order: 3 },
      { id: 'eng-p5-5d', topicId: 'ug-primary-english-p5-5', name: 'Writing: Story writing', order: 4 },
    ]},
  { id: 'ug-primary-english-p5-6', subjectId: 'ug-pri-eng', classLevel: 'P5', name: 'The Environment', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p5-6a', topicId: 'ug-primary-english-p5-6', name: 'Listening & Speaking: Environmental conservation', order: 1 },
      { id: 'eng-p5-6b', topicId: 'ug-primary-english-p5-6', name: 'Reading: Environmental protection texts', order: 2 },
      { id: 'eng-p5-6c', topicId: 'ug-primary-english-p5-6', name: 'Grammar: Passive voice', order: 3 },
      { id: 'eng-p5-6d', topicId: 'ug-primary-english-p5-6', name: 'Writing: Persuasive paragraph', order: 4 },
    ]},
  { id: 'ug-primary-english-p5-7', subjectId: 'ug-pri-eng', classLevel: 'P5', name: 'People and Places', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p5-7a', topicId: 'ug-primary-english-p5-7', name: 'Listening & Speaking: Describing people and places', order: 1 },
      { id: 'eng-p5-7b', topicId: 'ug-primary-english-p5-7', name: 'Reading: Biographical passages', order: 2 },
      { id: 'eng-p5-7c', topicId: 'ug-primary-english-p5-7', name: 'Grammar: Relative clauses', order: 3 },
      { id: 'eng-p5-7d', topicId: 'ug-primary-english-p5-7', name: 'Writing: Biographical composition', order: 4 },
    ]},
  { id: 'ug-primary-english-p5-8', subjectId: 'ug-pri-eng', classLevel: 'P5', name: 'Science and Technology', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p5-8a', topicId: 'ug-primary-english-p5-8', name: 'Listening & Speaking: Discussing inventions', order: 1 },
      { id: 'eng-p5-8b', topicId: 'ug-primary-english-p5-8', name: 'Reading: Science and technology texts', order: 2 },
      { id: 'eng-p5-8c', topicId: 'ug-primary-english-p5-8', name: 'Grammar: Conditional sentences', order: 3 },
      { id: 'eng-p5-8d', topicId: 'ug-primary-english-p5-8', name: 'Writing: Expository composition', order: 4 },
    ]},

  // ── P6 ──
  { id: 'ug-primary-english-p6-1', subjectId: 'ug-pri-eng', classLevel: 'P6', name: 'Education', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p6-1a', topicId: 'ug-primary-english-p6-1', name: 'Listening & Speaking: Debate on education issues', order: 1 },
      { id: 'eng-p6-1b', topicId: 'ug-primary-english-p6-1', name: 'Reading: Education policy passages', order: 2 },
      { id: 'eng-p6-1c', topicId: 'ug-primary-english-p6-1', name: 'Grammar: Complex sentences', order: 3 },
      { id: 'eng-p6-1d', topicId: 'ug-primary-english-p6-1', name: 'Writing: Argumentative composition', order: 4 },
    ]},
  { id: 'ug-primary-english-p6-2', subjectId: 'ug-pri-eng', classLevel: 'P6', name: 'Health', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p6-2a', topicId: 'ug-primary-english-p6-2', name: 'Listening & Speaking: Health awareness campaigns', order: 1 },
      { id: 'eng-p6-2b', topicId: 'ug-primary-english-p6-2', name: 'Reading: Health research articles', order: 2 },
      { id: 'eng-p6-2c', topicId: 'ug-primary-english-p6-2', name: 'Grammar: Reported speech', order: 3 },
      { id: 'eng-p6-2d', topicId: 'ug-primary-english-p6-2', name: 'Writing: Report writing', order: 4 },
    ]},
  { id: 'ug-primary-english-p6-3', subjectId: 'ug-pri-eng', classLevel: 'P6', name: 'Agriculture', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p6-3a', topicId: 'ug-primary-english-p6-3', name: 'Listening & Speaking: Agricultural practices', order: 1 },
      { id: 'eng-p6-3b', topicId: 'ug-primary-english-p6-3', name: 'Reading: Agricultural development texts', order: 2 },
      { id: 'eng-p6-3c', topicId: 'ug-primary-english-p6-3', name: 'Grammar: Active and passive voice', order: 3 },
      { id: 'eng-p6-3d', topicId: 'ug-primary-english-p6-3', name: 'Writing: Process description (how to grow crops)', order: 4 },
    ]},
  { id: 'ug-primary-english-p6-4', subjectId: 'ug-pri-eng', classLevel: 'P6', name: 'Communication', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p6-4a', topicId: 'ug-primary-english-p6-4', name: 'Listening & Speaking: Means of communication', order: 1 },
      { id: 'eng-p6-4b', topicId: 'ug-primary-english-p6-4', name: 'Reading: Communication technology texts', order: 2 },
      { id: 'eng-p6-4c', topicId: 'ug-primary-english-p6-4', name: 'Grammar: Phrasal verbs', order: 3 },
      { id: 'eng-p6-4d', topicId: 'ug-primary-english-p6-4', name: 'Writing: Formal and informal letters', order: 4 },
    ]},
  { id: 'ug-primary-english-p6-5', subjectId: 'ug-pri-eng', classLevel: 'P6', name: 'Culture', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p6-5a', topicId: 'ug-primary-english-p6-5', name: 'Listening & Speaking: Cultural presentations', order: 1 },
      { id: 'eng-p6-5b', topicId: 'ug-primary-english-p6-5', name: 'Reading: Cultural diversity passages', order: 2 },
      { id: 'eng-p6-5c', topicId: 'ug-primary-english-p6-5', name: 'Grammar: Idiomatic expressions', order: 3 },
      { id: 'eng-p6-5d', topicId: 'ug-primary-english-p6-5', name: 'Writing: Narrative composition', order: 4 },
    ]},
  { id: 'ug-primary-english-p6-6', subjectId: 'ug-pri-eng', classLevel: 'P6', name: 'The Environment', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p6-6a', topicId: 'ug-primary-english-p6-6', name: 'Listening & Speaking: Environmental campaigns', order: 1 },
      { id: 'eng-p6-6b', topicId: 'ug-primary-english-p6-6', name: 'Reading: Environmental conservation texts', order: 2 },
      { id: 'eng-p6-6c', topicId: 'ug-primary-english-p6-6', name: 'Grammar: Concord (agreement)', order: 3 },
      { id: 'eng-p6-6d', topicId: 'ug-primary-english-p6-6', name: 'Writing: Speech writing', order: 4 },
    ]},
  { id: 'ug-primary-english-p6-7', subjectId: 'ug-pri-eng', classLevel: 'P6', name: 'Commerce and Industry', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p6-7a', topicId: 'ug-primary-english-p6-7', name: 'Listening & Speaking: Trade and business', order: 1 },
      { id: 'eng-p6-7b', topicId: 'ug-primary-english-p6-7', name: 'Reading: Business and commerce passages', order: 2 },
      { id: 'eng-p6-7c', topicId: 'ug-primary-english-p6-7', name: 'Grammar: Punctuation and capitalisation', order: 3 },
      { id: 'eng-p6-7d', topicId: 'ug-primary-english-p6-7', name: 'Writing: Application letter', order: 4 },
    ]},
  { id: 'ug-primary-english-p6-8', subjectId: 'ug-pri-eng', classLevel: 'P6', name: 'Science and Technology', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p6-8a', topicId: 'ug-primary-english-p6-8', name: 'Listening & Speaking: Technology debate', order: 1 },
      { id: 'eng-p6-8b', topicId: 'ug-primary-english-p6-8', name: 'Reading: Scientific articles', order: 2 },
      { id: 'eng-p6-8c', topicId: 'ug-primary-english-p6-8', name: 'Grammar: Sentence transformation', order: 3 },
      { id: 'eng-p6-8d', topicId: 'ug-primary-english-p6-8', name: 'Writing: Summary writing', order: 4 },
    ]},

  // ── P7 ──
  { id: 'ug-primary-english-p7-1', subjectId: 'ug-pri-eng', classLevel: 'P7', name: 'Education', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p7-1a', topicId: 'ug-primary-english-p7-1', name: 'Listening & Speaking: Panel discussion on education', order: 1 },
      { id: 'eng-p7-1b', topicId: 'ug-primary-english-p7-1', name: 'Reading & Comprehension: Education system texts', order: 2 },
      { id: 'eng-p7-1c', topicId: 'ug-primary-english-p7-1', name: 'Grammar: Revision of tenses', order: 3 },
      { id: 'eng-p7-1d', topicId: 'ug-primary-english-p7-1', name: 'Writing: Essay writing (opinion)', order: 4 },
    ]},
  { id: 'ug-primary-english-p7-2', subjectId: 'ug-pri-eng', classLevel: 'P7', name: 'Health', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p7-2a', topicId: 'ug-primary-english-p7-2', name: 'Listening & Speaking: Health challenges discussion', order: 1 },
      { id: 'eng-p7-2b', topicId: 'ug-primary-english-p7-2', name: 'Reading: Diseases and prevention passages', order: 2 },
      { id: 'eng-p7-2c', topicId: 'ug-primary-english-p7-2', name: 'Grammar: Clauses and phrases', order: 3 },
      { id: 'eng-p7-2d', topicId: 'ug-primary-english-p7-2', name: 'Writing: Formal letter (to a health officer)', order: 4 },
    ]},
  { id: 'ug-primary-english-p7-3', subjectId: 'ug-pri-eng', classLevel: 'P7', name: 'Agriculture', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p7-3a', topicId: 'ug-primary-english-p7-3', name: 'Listening & Speaking: Modern farming methods', order: 1 },
      { id: 'eng-p7-3b', topicId: 'ug-primary-english-p7-3', name: 'Reading: Agriculture and economy texts', order: 2 },
      { id: 'eng-p7-3c', topicId: 'ug-primary-english-p7-3', name: 'Grammar: Concord and sentence structure', order: 3 },
      { id: 'eng-p7-3d', topicId: 'ug-primary-english-p7-3', name: 'Writing: Guided composition', order: 4 },
    ]},
  { id: 'ug-primary-english-p7-4', subjectId: 'ug-pri-eng', classLevel: 'P7', name: 'Transport and Communication', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p7-4a', topicId: 'ug-primary-english-p7-4', name: 'Listening & Speaking: Media and communication', order: 1 },
      { id: 'eng-p7-4b', topicId: 'ug-primary-english-p7-4', name: 'Reading: Transport systems passages', order: 2 },
      { id: 'eng-p7-4c', topicId: 'ug-primary-english-p7-4', name: 'Grammar: Sentence transformation & rewriting', order: 3 },
      { id: 'eng-p7-4d', topicId: 'ug-primary-english-p7-4', name: 'Writing: Dialogue and conversation writing', order: 4 },
    ]},
  { id: 'ug-primary-english-p7-5', subjectId: 'ug-pri-eng', classLevel: 'P7', name: 'Culture and Social Life', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p7-5a', topicId: 'ug-primary-english-p7-5', name: 'Listening & Speaking: Cultural celebrations', order: 1 },
      { id: 'eng-p7-5b', topicId: 'ug-primary-english-p7-5', name: 'Reading: Social life narratives', order: 2 },
      { id: 'eng-p7-5c', topicId: 'ug-primary-english-p7-5', name: 'Grammar: Vocabulary and word formation', order: 3 },
      { id: 'eng-p7-5d', topicId: 'ug-primary-english-p7-5', name: 'Writing: Narrative composition', order: 4 },
    ]},
  { id: 'ug-primary-english-p7-6', subjectId: 'ug-pri-eng', classLevel: 'P7', name: 'The Environment', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p7-6a', topicId: 'ug-primary-english-p7-6', name: 'Listening & Speaking: Environmental conservation debate', order: 1 },
      { id: 'eng-p7-6b', topicId: 'ug-primary-english-p7-6', name: 'Reading: Global environment texts', order: 2 },
      { id: 'eng-p7-6c', topicId: 'ug-primary-english-p7-6', name: 'Grammar: Revision of all structures', order: 3 },
      { id: 'eng-p7-6d', topicId: 'ug-primary-english-p7-6', name: 'Writing: Comprehension and summary', order: 4 },
    ]},
  { id: 'ug-primary-english-p7-7', subjectId: 'ug-pri-eng', classLevel: 'P7', name: 'Commerce and Industry', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p7-7a', topicId: 'ug-primary-english-p7-7', name: 'Listening & Speaking: Business communication', order: 1 },
      { id: 'eng-p7-7b', topicId: 'ug-primary-english-p7-7', name: 'Reading: Trade and industry passages', order: 2 },
      { id: 'eng-p7-7c', topicId: 'ug-primary-english-p7-7', name: 'Grammar: PLE-style structure questions', order: 3 },
      { id: 'eng-p7-7d', topicId: 'ug-primary-english-p7-7', name: 'Writing: Letter of application', order: 4 },
    ]},
  { id: 'ug-primary-english-p7-8', subjectId: 'ug-pri-eng', classLevel: 'P7', name: 'Science and Technology', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'eng-p7-8a', topicId: 'ug-primary-english-p7-8', name: 'Listening & Speaking: Technology and society', order: 1 },
      { id: 'eng-p7-8b', topicId: 'ug-primary-english-p7-8', name: 'Reading: Science and innovation passages', order: 2 },
      { id: 'eng-p7-8c', topicId: 'ug-primary-english-p7-8', name: 'Grammar: PLE revision (all grammar areas)', order: 3 },
      { id: 'eng-p7-8d', topicId: 'ug-primary-english-p7-8', name: 'Writing: PLE composition practice', order: 4 },
    ]},
];

// ─────────────────────────────────────────
// MATHEMATICS — P4 to P7 (NCDC Syllabus)
// ─────────────────────────────────────────
const mathTopics: ContentTopic[] = [
  // ── P4 ──
  { id: 'ug-primary-math-p4-1', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Set Concepts', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-1a', topicId: 'ug-primary-math-p4-1', name: 'Describing and listing sets', order: 1 },
      { id: 'math-p4-1b', topicId: 'ug-primary-math-p4-1', name: 'Membership and types of sets', order: 2 },
      { id: 'math-p4-1c', topicId: 'ug-primary-math-p4-1', name: 'Venn diagrams (one and two sets)', order: 3 },
    ]},
  { id: 'ug-primary-math-p4-2', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Whole Numbers (up to 100,000)', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-2a', topicId: 'ug-primary-math-p4-2', name: 'Place values up to 100,000', order: 1 },
      { id: 'math-p4-2b', topicId: 'ug-primary-math-p4-2', name: 'Reading and writing numerals in words and figures', order: 2 },
      { id: 'math-p4-2c', topicId: 'ug-primary-math-p4-2', name: 'Comparing and ordering numbers', order: 3 },
      { id: 'math-p4-2d', topicId: 'ug-primary-math-p4-2', name: 'Rounding off to nearest 10, 100, 1000', order: 4 },
      { id: 'math-p4-2e', topicId: 'ug-primary-math-p4-2', name: 'Roman numerals (I to C)', order: 5 },
    ]},
  { id: 'ug-primary-math-p4-3', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Operations on Whole Numbers', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-3a', topicId: 'ug-primary-math-p4-3', name: 'Addition (with carrying)', order: 1 },
      { id: 'math-p4-3b', topicId: 'ug-primary-math-p4-3', name: 'Subtraction (with borrowing)', order: 2 },
      { id: 'math-p4-3c', topicId: 'ug-primary-math-p4-3', name: 'Multiplication of 2-digit by 2-digit numbers', order: 3 },
      { id: 'math-p4-3d', topicId: 'ug-primary-math-p4-3', name: 'Division with remainders', order: 4 },
      { id: 'math-p4-3e', topicId: 'ug-primary-math-p4-3', name: 'Word problems', order: 5 },
    ]},
  { id: 'ug-primary-math-p4-4', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Number Patterns and Sequences', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-4a', topicId: 'ug-primary-math-p4-4', name: 'Identifying number patterns', order: 1 },
      { id: 'math-p4-4b', topicId: 'ug-primary-math-p4-4', name: 'Multiples and factors', order: 2 },
      { id: 'math-p4-4c', topicId: 'ug-primary-math-p4-4', name: 'Even and odd numbers', order: 3 },
    ]},
  { id: 'ug-primary-math-p4-5', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Fractions', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-5a', topicId: 'ug-primary-math-p4-5', name: 'Types of fractions (proper, improper, mixed)', order: 1 },
      { id: 'math-p4-5b', topicId: 'ug-primary-math-p4-5', name: 'Equivalent fractions', order: 2 },
      { id: 'math-p4-5c', topicId: 'ug-primary-math-p4-5', name: 'Addition and subtraction of fractions', order: 3 },
      { id: 'math-p4-5d', topicId: 'ug-primary-math-p4-5', name: 'Comparing and ordering fractions', order: 4 },
    ]},
  { id: 'ug-primary-math-p4-6', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Measurement of Length', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-6a', topicId: 'ug-primary-math-p4-6', name: 'Standard units (mm, cm, m, km)', order: 1 },
      { id: 'math-p4-6b', topicId: 'ug-primary-math-p4-6', name: 'Conversion between units', order: 2 },
      { id: 'math-p4-6c', topicId: 'ug-primary-math-p4-6', name: 'Perimeter of rectangles and squares', order: 3 },
    ]},
  { id: 'ug-primary-math-p4-7', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Measurement of Mass/Weight', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-7a', topicId: 'ug-primary-math-p4-7', name: 'Standard units (g, kg)', order: 1 },
      { id: 'math-p4-7b', topicId: 'ug-primary-math-p4-7', name: 'Conversion and comparison', order: 2 },
      { id: 'math-p4-7c', topicId: 'ug-primary-math-p4-7', name: 'Word problems on mass', order: 3 },
    ]},
  { id: 'ug-primary-math-p4-8', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Measurement of Capacity', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-8a', topicId: 'ug-primary-math-p4-8', name: 'Standard units (ml, l)', order: 1 },
      { id: 'math-p4-8b', topicId: 'ug-primary-math-p4-8', name: 'Conversion and word problems', order: 2 },
    ]},
  { id: 'ug-primary-math-p4-9', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Measurement of Time', order: 9, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-9a', topicId: 'ug-primary-math-p4-9', name: 'Reading time (12-hour clock)', order: 1 },
      { id: 'math-p4-9b', topicId: 'ug-primary-math-p4-9', name: 'Days, weeks, months (calendar)', order: 2 },
      { id: 'math-p4-9c', topicId: 'ug-primary-math-p4-9', name: 'Duration and time calculations', order: 3 },
    ]},
  { id: 'ug-primary-math-p4-10', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Money', order: 10, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-10a', topicId: 'ug-primary-math-p4-10', name: 'Uganda currency (coins and notes)', order: 1 },
      { id: 'math-p4-10b', topicId: 'ug-primary-math-p4-10', name: 'Addition and subtraction of money', order: 2 },
      { id: 'math-p4-10c', topicId: 'ug-primary-math-p4-10', name: 'Shopping and giving change', order: 3 },
    ]},
  { id: 'ug-primary-math-p4-11', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Lines, Angles and Geometric Shapes', order: 11, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-11a', topicId: 'ug-primary-math-p4-11', name: 'Types of lines (parallel, perpendicular)', order: 1 },
      { id: 'math-p4-11b', topicId: 'ug-primary-math-p4-11', name: 'Types of angles (right, acute, obtuse)', order: 2 },
      { id: 'math-p4-11c', topicId: 'ug-primary-math-p4-11', name: 'Squares, rectangles, triangles, circles', order: 3 },
    ]},
  { id: 'ug-primary-math-p4-12', subjectId: 'ug-pri-math', classLevel: 'P4', name: 'Data Handling', order: 12, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p4-12a', topicId: 'ug-primary-math-p4-12', name: 'Collecting and recording data', order: 1 },
      { id: 'math-p4-12b', topicId: 'ug-primary-math-p4-12', name: 'Pictographs and bar charts', order: 2 },
      { id: 'math-p4-12c', topicId: 'ug-primary-math-p4-12', name: 'Interpreting simple graphs', order: 3 },
    ]},

  // ── P5 ──
  { id: 'ug-primary-math-p5-1', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Set Concepts', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-1a', topicId: 'ug-primary-math-p5-1', name: 'Subsets and universal sets', order: 1 },
      { id: 'math-p5-1b', topicId: 'ug-primary-math-p5-1', name: 'Union and intersection of sets', order: 2 },
      { id: 'math-p5-1c', topicId: 'ug-primary-math-p5-1', name: 'Venn diagrams with two sets', order: 3 },
    ]},
  { id: 'ug-primary-math-p5-2', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Whole Numbers (up to 1,000,000)', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-2a', topicId: 'ug-primary-math-p5-2', name: 'Place values up to millions', order: 1 },
      { id: 'math-p5-2b', topicId: 'ug-primary-math-p5-2', name: 'Roman numerals (I to M)', order: 2 },
      { id: 'math-p5-2c', topicId: 'ug-primary-math-p5-2', name: 'Rounding off to nearest 10,000', order: 3 },
    ]},
  { id: 'ug-primary-math-p5-3', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Operations on Whole Numbers', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-3a', topicId: 'ug-primary-math-p5-3', name: 'Multiplication of 3-digit by 2-digit', order: 1 },
      { id: 'math-p5-3b', topicId: 'ug-primary-math-p5-3', name: 'Long division', order: 2 },
      { id: 'math-p5-3c', topicId: 'ug-primary-math-p5-3', name: 'Order of operations (BODMAS)', order: 3 },
      { id: 'math-p5-3d', topicId: 'ug-primary-math-p5-3', name: 'Word problems (multi-step)', order: 4 },
    ]},
  { id: 'ug-primary-math-p5-4', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Number Patterns and Sequences', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-4a', topicId: 'ug-primary-math-p5-4', name: 'LCM and HCF', order: 1 },
      { id: 'math-p5-4b', topicId: 'ug-primary-math-p5-4', name: 'Prime numbers and prime factorisation', order: 2 },
      { id: 'math-p5-4c', topicId: 'ug-primary-math-p5-4', name: 'Number sequences and patterns', order: 3 },
    ]},
  { id: 'ug-primary-math-p5-5', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Fractions', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-5a', topicId: 'ug-primary-math-p5-5', name: 'Addition and subtraction of mixed numbers', order: 1 },
      { id: 'math-p5-5b', topicId: 'ug-primary-math-p5-5', name: 'Multiplication of fractions', order: 2 },
      { id: 'math-p5-5c', topicId: 'ug-primary-math-p5-5', name: 'Fraction of a quantity', order: 3 },
    ]},
  { id: 'ug-primary-math-p5-6', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Decimals', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-6a', topicId: 'ug-primary-math-p5-6', name: 'Place value of decimals', order: 1 },
      { id: 'math-p5-6b', topicId: 'ug-primary-math-p5-6', name: 'Addition and subtraction of decimals', order: 2 },
      { id: 'math-p5-6c', topicId: 'ug-primary-math-p5-6', name: 'Converting fractions to decimals', order: 3 },
    ]},
  { id: 'ug-primary-math-p5-7', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Measurement of Length', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-7a', topicId: 'ug-primary-math-p5-7', name: 'Conversion of units (km, m, cm, mm)', order: 1 },
      { id: 'math-p5-7b', topicId: 'ug-primary-math-p5-7', name: 'Perimeter of compound shapes', order: 2 },
    ]},
  { id: 'ug-primary-math-p5-8', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Area', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-8a', topicId: 'ug-primary-math-p5-8', name: 'Area of rectangles and squares', order: 1 },
      { id: 'math-p5-8b', topicId: 'ug-primary-math-p5-8', name: 'Area of triangles', order: 2 },
      { id: 'math-p5-8c', topicId: 'ug-primary-math-p5-8', name: 'Units of area (cm squared, m squared)', order: 3 },
    ]},
  { id: 'ug-primary-math-p5-9', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Measurement of Capacity', order: 9, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-9a', topicId: 'ug-primary-math-p5-9', name: 'Litres and millilitres', order: 1 },
      { id: 'math-p5-9b', topicId: 'ug-primary-math-p5-9', name: 'Word problems on capacity', order: 2 },
    ]},
  { id: 'ug-primary-math-p5-10', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Measurement of Time', order: 10, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-10a', topicId: 'ug-primary-math-p5-10', name: '24-hour clock', order: 1 },
      { id: 'math-p5-10b', topicId: 'ug-primary-math-p5-10', name: 'Timetables and schedules', order: 2 },
      { id: 'math-p5-10c', topicId: 'ug-primary-math-p5-10', name: 'Duration problems', order: 3 },
    ]},
  { id: 'ug-primary-math-p5-11', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Money', order: 11, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-11a', topicId: 'ug-primary-math-p5-11', name: 'Profit and loss', order: 1 },
      { id: 'math-p5-11b', topicId: 'ug-primary-math-p5-11', name: 'Bills and receipts', order: 2 },
      { id: 'math-p5-11c', topicId: 'ug-primary-math-p5-11', name: 'Simple budgets', order: 3 },
    ]},
  { id: 'ug-primary-math-p5-12', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Lines, Angles and Geometric Shapes', order: 12, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-12a', topicId: 'ug-primary-math-p5-12', name: 'Measuring and drawing angles', order: 1 },
      { id: 'math-p5-12b', topicId: 'ug-primary-math-p5-12', name: 'Properties of triangles', order: 2 },
      { id: 'math-p5-12c', topicId: 'ug-primary-math-p5-12', name: 'Quadrilaterals', order: 3 },
      { id: 'math-p5-12d', topicId: 'ug-primary-math-p5-12', name: 'Symmetry', order: 4 },
    ]},
  { id: 'ug-primary-math-p5-13', subjectId: 'ug-pri-math', classLevel: 'P5', name: 'Data Handling', order: 13, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p5-13a', topicId: 'ug-primary-math-p5-13', name: 'Frequency tables', order: 1 },
      { id: 'math-p5-13b', topicId: 'ug-primary-math-p5-13', name: 'Bar graphs and pie charts', order: 2 },
      { id: 'math-p5-13c', topicId: 'ug-primary-math-p5-13', name: 'Mean (average)', order: 3 },
    ]},

  // ── P6 ──
  { id: 'ug-primary-math-p6-1', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Set Concepts', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-1a', topicId: 'ug-primary-math-p6-1', name: 'Complement of a set', order: 1 },
      { id: 'math-p6-1b', topicId: 'ug-primary-math-p6-1', name: 'Venn diagrams with three sets', order: 2 },
      { id: 'math-p6-1c', topicId: 'ug-primary-math-p6-1', name: 'Number of elements in intersections', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-2', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Whole Numbers (up to 10,000,000)', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-2a', topicId: 'ug-primary-math-p6-2', name: 'Place values up to ten millions', order: 1 },
      { id: 'math-p6-2b', topicId: 'ug-primary-math-p6-2', name: 'Rounding off large numbers', order: 2 },
      { id: 'math-p6-2c', topicId: 'ug-primary-math-p6-2', name: 'Squares and square roots', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-3', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Operations on Whole Numbers', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-3a', topicId: 'ug-primary-math-p6-3', name: 'Long multiplication and division', order: 1 },
      { id: 'math-p6-3b', topicId: 'ug-primary-math-p6-3', name: 'BODMAS with brackets', order: 2 },
      { id: 'math-p6-3c', topicId: 'ug-primary-math-p6-3', name: 'Multi-step word problems', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-4', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Fractions', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-4a', topicId: 'ug-primary-math-p6-4', name: 'Multiplication and division of fractions', order: 1 },
      { id: 'math-p6-4b', topicId: 'ug-primary-math-p6-4', name: 'Operations with mixed numbers', order: 2 },
      { id: 'math-p6-4c', topicId: 'ug-primary-math-p6-4', name: 'Fraction word problems', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-5', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Decimals', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-5a', topicId: 'ug-primary-math-p6-5', name: 'Multiplication and division of decimals', order: 1 },
      { id: 'math-p6-5b', topicId: 'ug-primary-math-p6-5', name: 'Converting fractions, decimals and percentages', order: 2 },
    ]},
  { id: 'ug-primary-math-p6-6', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Percentages', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-6a', topicId: 'ug-primary-math-p6-6', name: 'Percentage of a quantity', order: 1 },
      { id: 'math-p6-6b', topicId: 'ug-primary-math-p6-6', name: 'Percentage increase and decrease', order: 2 },
      { id: 'math-p6-6c', topicId: 'ug-primary-math-p6-6', name: 'Simple interest', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-7', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Integers', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-7a', topicId: 'ug-primary-math-p6-7', name: 'Number line with negative numbers', order: 1 },
      { id: 'math-p6-7b', topicId: 'ug-primary-math-p6-7', name: 'Addition and subtraction of integers', order: 2 },
      { id: 'math-p6-7c', topicId: 'ug-primary-math-p6-7', name: 'Ordering integers', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-8', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Measurement of Length', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-8a', topicId: 'ug-primary-math-p6-8', name: 'Scale drawing and maps', order: 1 },
      { id: 'math-p6-8b', topicId: 'ug-primary-math-p6-8', name: 'Circumference of a circle', order: 2 },
    ]},
  { id: 'ug-primary-math-p6-9', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Area and Perimeter', order: 9, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-9a', topicId: 'ug-primary-math-p6-9', name: 'Area of parallelograms and trapeziums', order: 1 },
      { id: 'math-p6-9b', topicId: 'ug-primary-math-p6-9', name: 'Area of a circle', order: 2 },
      { id: 'math-p6-9c', topicId: 'ug-primary-math-p6-9', name: 'Composite shapes', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-10', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Volume and Capacity', order: 10, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-10a', topicId: 'ug-primary-math-p6-10', name: 'Volume of cuboids', order: 1 },
      { id: 'math-p6-10b', topicId: 'ug-primary-math-p6-10', name: 'Relationship between litres and cubic centimetres', order: 2 },
    ]},
  { id: 'ug-primary-math-p6-11', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Time', order: 11, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-11a', topicId: 'ug-primary-math-p6-11', name: 'Time zones and world time', order: 1 },
      { id: 'math-p6-11b', topicId: 'ug-primary-math-p6-11', name: 'Speed, distance and time', order: 2 },
    ]},
  { id: 'ug-primary-math-p6-12', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Money', order: 12, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-12a', topicId: 'ug-primary-math-p6-12', name: 'Foreign currency and exchange rates', order: 1 },
      { id: 'math-p6-12b', topicId: 'ug-primary-math-p6-12', name: 'Hire purchase', order: 2 },
      { id: 'math-p6-12c', topicId: 'ug-primary-math-p6-12', name: 'Discount and tax', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-13', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Geometry', order: 13, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-13a', topicId: 'ug-primary-math-p6-13', name: 'Angles on a straight line and at a point', order: 1 },
      { id: 'math-p6-13b', topicId: 'ug-primary-math-p6-13', name: 'Angle sum of a triangle', order: 2 },
      { id: 'math-p6-13c', topicId: 'ug-primary-math-p6-13', name: 'Construction of triangles', order: 3 },
      { id: 'math-p6-13d', topicId: 'ug-primary-math-p6-13', name: 'Nets of 3D shapes', order: 4 },
    ]},
  { id: 'ug-primary-math-p6-14', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Algebra', order: 14, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-14a', topicId: 'ug-primary-math-p6-14', name: 'Algebraic expressions', order: 1 },
      { id: 'math-p6-14b', topicId: 'ug-primary-math-p6-14', name: 'Substitution', order: 2 },
      { id: 'math-p6-14c', topicId: 'ug-primary-math-p6-14', name: 'Simple equations', order: 3 },
    ]},
  { id: 'ug-primary-math-p6-15', subjectId: 'ug-pri-math', classLevel: 'P6', name: 'Data Handling', order: 15, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p6-15a', topicId: 'ug-primary-math-p6-15', name: 'Pie charts', order: 1 },
      { id: 'math-p6-15b', topicId: 'ug-primary-math-p6-15', name: 'Line graphs', order: 2 },
      { id: 'math-p6-15c', topicId: 'ug-primary-math-p6-15', name: 'Mean, mode and median', order: 3 },
    ]},

  // ── P7 ──
  { id: 'ug-primary-math-p7-1', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Set Concepts', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-1a', topicId: 'ug-primary-math-p7-1', name: 'Three-set Venn diagrams', order: 1 },
      { id: 'math-p7-1b', topicId: 'ug-primary-math-p7-1', name: 'Set notation and formulae', order: 2 },
      { id: 'math-p7-1c', topicId: 'ug-primary-math-p7-1', name: 'Word problems on sets', order: 3 },
    ]},
  { id: 'ug-primary-math-p7-2', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Whole Numbers (up to Billions)', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-2a', topicId: 'ug-primary-math-p7-2', name: 'Place values up to billions', order: 1 },
      { id: 'math-p7-2b', topicId: 'ug-primary-math-p7-2', name: 'Indices and powers', order: 2 },
      { id: 'math-p7-2c', topicId: 'ug-primary-math-p7-2', name: 'Squares, cubes and roots', order: 3 },
    ]},
  { id: 'ug-primary-math-p7-3', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Operations on Whole Numbers', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-3a', topicId: 'ug-primary-math-p7-3', name: 'BODMAS (complex expressions)', order: 1 },
      { id: 'math-p7-3b', topicId: 'ug-primary-math-p7-3', name: 'PLE-style computation problems', order: 2 },
    ]},
  { id: 'ug-primary-math-p7-4', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Number Patterns and Sequences', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-4a', topicId: 'ug-primary-math-p7-4', name: 'LCM and HCF (advanced)', order: 1 },
      { id: 'math-p7-4b', topicId: 'ug-primary-math-p7-4', name: 'Prime factorisation', order: 2 },
    ]},
  { id: 'ug-primary-math-p7-5', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Fractions', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-5a', topicId: 'ug-primary-math-p7-5', name: 'All four operations on fractions', order: 1 },
      { id: 'math-p7-5b', topicId: 'ug-primary-math-p7-5', name: 'Complex fraction word problems', order: 2 },
    ]},
  { id: 'ug-primary-math-p7-6', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Decimals', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-6a', topicId: 'ug-primary-math-p7-6', name: 'Operations on decimals (all four)', order: 1 },
      { id: 'math-p7-6b', topicId: 'ug-primary-math-p7-6', name: 'Recurring decimals', order: 2 },
    ]},
  { id: 'ug-primary-math-p7-7', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Percentages', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-7a', topicId: 'ug-primary-math-p7-7', name: 'Percentage profit and loss', order: 1 },
      { id: 'math-p7-7b', topicId: 'ug-primary-math-p7-7', name: 'Simple and compound interest', order: 2 },
      { id: 'math-p7-7c', topicId: 'ug-primary-math-p7-7', name: 'Discount and commission', order: 3 },
    ]},
  { id: 'ug-primary-math-p7-8', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Integers', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-8a', topicId: 'ug-primary-math-p7-8', name: 'All operations on integers', order: 1 },
      { id: 'math-p7-8b', topicId: 'ug-primary-math-p7-8', name: 'Number line applications', order: 2 },
    ]},
  { id: 'ug-primary-math-p7-9', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Measurement', order: 9, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-9a', topicId: 'ug-primary-math-p7-9', name: 'Length, mass and capacity conversions', order: 1 },
      { id: 'math-p7-9b', topicId: 'ug-primary-math-p7-9', name: 'Speed, distance and time', order: 2 },
    ]},
  { id: 'ug-primary-math-p7-10', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Area, Perimeter and Volume', order: 10, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-10a', topicId: 'ug-primary-math-p7-10', name: 'Area of circles, triangles, parallelograms', order: 1 },
      { id: 'math-p7-10b', topicId: 'ug-primary-math-p7-10', name: 'Surface area of cuboids and cylinders', order: 2 },
      { id: 'math-p7-10c', topicId: 'ug-primary-math-p7-10', name: 'Volume of cylinders', order: 3 },
    ]},
  { id: 'ug-primary-math-p7-11', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Time', order: 11, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-11a', topicId: 'ug-primary-math-p7-11', name: 'Time calculations (advanced)', order: 1 },
      { id: 'math-p7-11b', topicId: 'ug-primary-math-p7-11', name: 'Travel timetables', order: 2 },
    ]},
  { id: 'ug-primary-math-p7-12', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Money', order: 12, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-12a', topicId: 'ug-primary-math-p7-12', name: 'Profit, loss, discount', order: 1 },
      { id: 'math-p7-12b', topicId: 'ug-primary-math-p7-12', name: 'Currency conversion', order: 2 },
      { id: 'math-p7-12c', topicId: 'ug-primary-math-p7-12', name: 'Budgeting and accounts', order: 3 },
    ]},
  { id: 'ug-primary-math-p7-13', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Geometry', order: 13, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-13a', topicId: 'ug-primary-math-p7-13', name: 'Angle properties (parallel lines, polygons)', order: 1 },
      { id: 'math-p7-13b', topicId: 'ug-primary-math-p7-13', name: 'Constructions (bisectors, perpendiculars)', order: 2 },
      { id: 'math-p7-13c', topicId: 'ug-primary-math-p7-13', name: 'Bearings and scale drawing', order: 3 },
      { id: 'math-p7-13d', topicId: 'ug-primary-math-p7-13', name: 'Symmetry and transformation', order: 4 },
    ]},
  { id: 'ug-primary-math-p7-14', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Algebra', order: 14, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-14a', topicId: 'ug-primary-math-p7-14', name: 'Simplifying expressions', order: 1 },
      { id: 'math-p7-14b', topicId: 'ug-primary-math-p7-14', name: 'Solving equations', order: 2 },
      { id: 'math-p7-14c', topicId: 'ug-primary-math-p7-14', name: 'Inequalities', order: 3 },
      { id: 'math-p7-14d', topicId: 'ug-primary-math-p7-14', name: 'Graphs of linear equations', order: 4 },
    ]},
  { id: 'ug-primary-math-p7-15', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Ratio and Proportion', order: 15, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-15a', topicId: 'ug-primary-math-p7-15', name: 'Simplifying ratios', order: 1 },
      { id: 'math-p7-15b', topicId: 'ug-primary-math-p7-15', name: 'Direct and indirect proportion', order: 2 },
      { id: 'math-p7-15c', topicId: 'ug-primary-math-p7-15', name: 'Sharing in a given ratio', order: 3 },
    ]},
  { id: 'ug-primary-math-p7-16', subjectId: 'ug-pri-math', classLevel: 'P7', name: 'Data Handling and Probability', order: 16, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'math-p7-16a', topicId: 'ug-primary-math-p7-16', name: 'Pie charts (construction and interpretation)', order: 1 },
      { id: 'math-p7-16b', topicId: 'ug-primary-math-p7-16', name: 'Mean, mode, median and range', order: 2 },
      { id: 'math-p7-16c', topicId: 'ug-primary-math-p7-16', name: 'Introduction to probability', order: 3 },
    ]},
];

// ─────────────────────────────────────────
// SOCIAL STUDIES — P4 to P7 (NCDC Syllabus)
// ─────────────────────────────────────────
const sstTopics: ContentTopic[] = [
  // ── P4: Our District ──
  { id: 'ug-primary-sst-p4-1', subjectId: 'ug-pri-sst', classLevel: 'P4', name: 'Our Sub-county', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p4-1a', topicId: 'ug-primary-sst-p4-1', name: 'Location and boundaries', order: 1 },
      { id: 'sst-p4-1b', topicId: 'ug-primary-sst-p4-1', name: 'Physical features of the sub-county', order: 2 },
      { id: 'sst-p4-1c', topicId: 'ug-primary-sst-p4-1', name: 'Economic activities', order: 3 },
      { id: 'sst-p4-1d', topicId: 'ug-primary-sst-p4-1', name: 'Leadership and administration', order: 4 },
    ]},
  { id: 'ug-primary-sst-p4-2', subjectId: 'ug-pri-sst', classLevel: 'P4', name: 'Our District', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p4-2a', topicId: 'ug-primary-sst-p4-2', name: 'Location and map of the district', order: 1 },
      { id: 'sst-p4-2b', topicId: 'ug-primary-sst-p4-2', name: 'People and tribes in the district', order: 2 },
      { id: 'sst-p4-2c', topicId: 'ug-primary-sst-p4-2', name: 'Social services in the district', order: 3 },
      { id: 'sst-p4-2d', topicId: 'ug-primary-sst-p4-2', name: 'District administration and councils', order: 4 },
    ]},
  { id: 'ug-primary-sst-p4-3', subjectId: 'ug-pri-sst', classLevel: 'P4', name: 'Map Work', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p4-3a', topicId: 'ug-primary-sst-p4-3', name: 'Directions and compass points', order: 1 },
      { id: 'sst-p4-3b', topicId: 'ug-primary-sst-p4-3', name: 'Symbols and keys on maps', order: 2 },
      { id: 'sst-p4-3c', topicId: 'ug-primary-sst-p4-3', name: 'Sketch maps of the school and home', order: 3 },
    ]},
  { id: 'ug-primary-sst-p4-4', subjectId: 'ug-pri-sst', classLevel: 'P4', name: 'Weather and Climate', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p4-4a', topicId: 'ug-primary-sst-p4-4', name: 'Elements of weather', order: 1 },
      { id: 'sst-p4-4b', topicId: 'ug-primary-sst-p4-4', name: 'Weather instruments', order: 2 },
      { id: 'sst-p4-4c', topicId: 'ug-primary-sst-p4-4', name: 'Seasons in Uganda', order: 3 },
    ]},
  { id: 'ug-primary-sst-p4-5', subjectId: 'ug-pri-sst', classLevel: 'P4', name: 'Agriculture in Our District', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p4-5a', topicId: 'ug-primary-sst-p4-5', name: 'Types of farming (subsistence and commercial)', order: 1 },
      { id: 'sst-p4-5b', topicId: 'ug-primary-sst-p4-5', name: 'Crops and animals in the district', order: 2 },
      { id: 'sst-p4-5c', topicId: 'ug-primary-sst-p4-5', name: 'Problems of farming', order: 3 },
    ]},
  { id: 'ug-primary-sst-p4-6', subjectId: 'ug-pri-sst', classLevel: 'P4', name: 'Culture and Traditions', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p4-6a', topicId: 'ug-primary-sst-p4-6', name: 'Cultural practices in the district', order: 1 },
      { id: 'sst-p4-6b', topicId: 'ug-primary-sst-p4-6', name: 'Traditional leaders', order: 2 },
      { id: 'sst-p4-6c', topicId: 'ug-primary-sst-p4-6', name: 'Cultural sites and heritage', order: 3 },
    ]},
  { id: 'ug-primary-sst-p4-7', subjectId: 'ug-pri-sst', classLevel: 'P4', name: 'Transport and Communication', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p4-7a', topicId: 'ug-primary-sst-p4-7', name: 'Means of transport in the district', order: 1 },
      { id: 'sst-p4-7b', topicId: 'ug-primary-sst-p4-7', name: 'Means of communication', order: 2 },
      { id: 'sst-p4-7c', topicId: 'ug-primary-sst-p4-7', name: 'Road safety', order: 3 },
    ]},
  { id: 'ug-primary-sst-p4-8', subjectId: 'ug-pri-sst', classLevel: 'P4', name: 'Population and Health', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p4-8a', topicId: 'ug-primary-sst-p4-8', name: 'Population distribution in the district', order: 1 },
      { id: 'sst-p4-8b', topicId: 'ug-primary-sst-p4-8', name: 'Health services and facilities', order: 2 },
      { id: 'sst-p4-8c', topicId: 'ug-primary-sst-p4-8', name: 'Common diseases and prevention', order: 3 },
    ]},

  // ── P5: Uganda ──
  { id: 'ug-primary-sst-p5-1', subjectId: 'ug-pri-sst', classLevel: 'P5', name: 'Uganda — Location and Physical Features', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p5-1a', topicId: 'ug-primary-sst-p5-1', name: 'Position and boundaries of Uganda', order: 1 },
      { id: 'sst-p5-1b', topicId: 'ug-primary-sst-p5-1', name: 'Relief features (mountains, rift valley, lakes)', order: 2 },
      { id: 'sst-p5-1c', topicId: 'ug-primary-sst-p5-1', name: 'Drainage (rivers, lakes, swamps)', order: 3 },
      { id: 'sst-p5-1d', topicId: 'ug-primary-sst-p5-1', name: 'Vegetation types in Uganda', order: 4 },
    ]},
  { id: 'ug-primary-sst-p5-2', subjectId: 'ug-pri-sst', classLevel: 'P5', name: 'Climate of Uganda', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p5-2a', topicId: 'ug-primary-sst-p5-2', name: 'Factors affecting climate', order: 1 },
      { id: 'sst-p5-2b', topicId: 'ug-primary-sst-p5-2', name: 'Climate zones in Uganda', order: 2 },
      { id: 'sst-p5-2c', topicId: 'ug-primary-sst-p5-2', name: 'Effects of climate on people', order: 3 },
    ]},
  { id: 'ug-primary-sst-p5-3', subjectId: 'ug-pri-sst', classLevel: 'P5', name: 'People and Population of Uganda', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p5-3a', topicId: 'ug-primary-sst-p5-3', name: 'Tribes and ethnic groups of Uganda', order: 1 },
      { id: 'sst-p5-3b', topicId: 'ug-primary-sst-p5-3', name: 'Population distribution and density', order: 2 },
      { id: 'sst-p5-3c', topicId: 'ug-primary-sst-p5-3', name: 'Migration and urbanisation', order: 3 },
    ]},
  { id: 'ug-primary-sst-p5-4', subjectId: 'ug-pri-sst', classLevel: 'P5', name: 'Economic Activities in Uganda', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p5-4a', topicId: 'ug-primary-sst-p5-4', name: 'Agriculture (cash crops and food crops)', order: 1 },
      { id: 'sst-p5-4b', topicId: 'ug-primary-sst-p5-4', name: 'Mining and industry', order: 2 },
      { id: 'sst-p5-4c', topicId: 'ug-primary-sst-p5-4', name: 'Tourism in Uganda', order: 3 },
      { id: 'sst-p5-4d', topicId: 'ug-primary-sst-p5-4', name: 'Trade (internal and external)', order: 4 },
    ]},
  { id: 'ug-primary-sst-p5-5', subjectId: 'ug-pri-sst', classLevel: 'P5', name: 'Transport and Communication in Uganda', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p5-5a', topicId: 'ug-primary-sst-p5-5', name: 'Road network and railway', order: 1 },
      { id: 'sst-p5-5b', topicId: 'ug-primary-sst-p5-5', name: 'Water and air transport', order: 2 },
      { id: 'sst-p5-5c', topicId: 'ug-primary-sst-p5-5', name: 'Modern communication (media, internet)', order: 3 },
    ]},
  { id: 'ug-primary-sst-p5-6', subjectId: 'ug-pri-sst', classLevel: 'P5', name: 'History of Uganda', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p5-6a', topicId: 'ug-primary-sst-p5-6', name: 'Early people and kingdoms of Uganda', order: 1 },
      { id: 'sst-p5-6b', topicId: 'ug-primary-sst-p5-6', name: 'Coming of traders, missionaries and colonialists', order: 2 },
      { id: 'sst-p5-6c', topicId: 'ug-primary-sst-p5-6', name: 'Uganda under colonial rule', order: 3 },
      { id: 'sst-p5-6d', topicId: 'ug-primary-sst-p5-6', name: 'Struggle for independence', order: 4 },
    ]},
  { id: 'ug-primary-sst-p5-7', subjectId: 'ug-pri-sst', classLevel: 'P5', name: 'Government and Civics', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p5-7a', topicId: 'ug-primary-sst-p5-7', name: 'The Constitution of Uganda', order: 1 },
      { id: 'sst-p5-7b', topicId: 'ug-primary-sst-p5-7', name: 'Arms of government (Executive, Legislature, Judiciary)', order: 2 },
      { id: 'sst-p5-7c', topicId: 'ug-primary-sst-p5-7', name: 'Local government system', order: 3 },
      { id: 'sst-p5-7d', topicId: 'ug-primary-sst-p5-7', name: 'Democracy and elections', order: 4 },
    ]},
  { id: 'ug-primary-sst-p5-8', subjectId: 'ug-pri-sst', classLevel: 'P5', name: 'Social Services', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p5-8a', topicId: 'ug-primary-sst-p5-8', name: 'Education system in Uganda', order: 1 },
      { id: 'sst-p5-8b', topicId: 'ug-primary-sst-p5-8', name: 'Health services', order: 2 },
      { id: 'sst-p5-8c', topicId: 'ug-primary-sst-p5-8', name: 'Water and sanitation', order: 3 },
    ]},

  // ── P6: East Africa ──
  { id: 'ug-primary-sst-p6-1', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'East Africa — Location and Physical Features', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-1a', topicId: 'ug-primary-sst-p6-1', name: 'Position and boundaries of East African countries', order: 1 },
      { id: 'sst-p6-1b', topicId: 'ug-primary-sst-p6-1', name: 'Relief features (Great Rift Valley, mountains)', order: 2 },
      { id: 'sst-p6-1c', topicId: 'ug-primary-sst-p6-1', name: 'Drainage systems (Nile, lakes, rivers)', order: 3 },
      { id: 'sst-p6-1d', topicId: 'ug-primary-sst-p6-1', name: 'Vegetation and climate zones', order: 4 },
    ]},
  { id: 'ug-primary-sst-p6-2', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'Climate of East Africa', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-2a', topicId: 'ug-primary-sst-p6-2', name: 'Factors influencing climate', order: 1 },
      { id: 'sst-p6-2b', topicId: 'ug-primary-sst-p6-2', name: 'Climate types in East Africa', order: 2 },
    ]},
  { id: 'ug-primary-sst-p6-3', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'Agriculture in East Africa', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-3a', topicId: 'ug-primary-sst-p6-3', name: 'Cash crops (coffee, tea, sisal, pyrethrum)', order: 1 },
      { id: 'sst-p6-3b', topicId: 'ug-primary-sst-p6-3', name: 'Livestock keeping (pastoralism, ranching)', order: 2 },
      { id: 'sst-p6-3c', topicId: 'ug-primary-sst-p6-3', name: 'Fishing industry', order: 3 },
    ]},
  { id: 'ug-primary-sst-p6-4', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'Mining and Industry in East Africa', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-4a', topicId: 'ug-primary-sst-p6-4', name: 'Minerals in East Africa', order: 1 },
      { id: 'sst-p6-4b', topicId: 'ug-primary-sst-p6-4', name: 'Industries in Kenya, Tanzania and Uganda', order: 2 },
      { id: 'sst-p6-4c', topicId: 'ug-primary-sst-p6-4', name: 'Energy sources', order: 3 },
    ]},
  { id: 'ug-primary-sst-p6-5', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'Trade and Tourism in East Africa', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-5a', topicId: 'ug-primary-sst-p6-5', name: 'East African Community (EAC)', order: 1 },
      { id: 'sst-p6-5b', topicId: 'ug-primary-sst-p6-5', name: 'Tourist attractions', order: 2 },
      { id: 'sst-p6-5c', topicId: 'ug-primary-sst-p6-5', name: 'Imports and exports', order: 3 },
    ]},
  { id: 'ug-primary-sst-p6-6', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'Transport and Communication in East Africa', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-6a', topicId: 'ug-primary-sst-p6-6', name: 'Road and rail networks', order: 1 },
      { id: 'sst-p6-6b', topicId: 'ug-primary-sst-p6-6', name: 'Water and air transport', order: 2 },
      { id: 'sst-p6-6c', topicId: 'ug-primary-sst-p6-6', name: 'Ports (Mombasa, Dar es Salaam)', order: 3 },
    ]},
  { id: 'ug-primary-sst-p6-7', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'Population of East Africa', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-7a', topicId: 'ug-primary-sst-p6-7', name: 'Population distribution and growth', order: 1 },
      { id: 'sst-p6-7b', topicId: 'ug-primary-sst-p6-7', name: 'Problems of rapid population growth', order: 2 },
    ]},
  { id: 'ug-primary-sst-p6-8', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'History of East Africa', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-8a', topicId: 'ug-primary-sst-p6-8', name: 'Early people and migration', order: 1 },
      { id: 'sst-p6-8b', topicId: 'ug-primary-sst-p6-8', name: 'Scramble and partition of East Africa', order: 2 },
      { id: 'sst-p6-8c', topicId: 'ug-primary-sst-p6-8', name: 'Colonialism and its effects', order: 3 },
      { id: 'sst-p6-8d', topicId: 'ug-primary-sst-p6-8', name: 'Independence struggles', order: 4 },
    ]},
  { id: 'ug-primary-sst-p6-9', subjectId: 'ug-pri-sst', classLevel: 'P6', name: 'Government and Co-operation', order: 9, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p6-9a', topicId: 'ug-primary-sst-p6-9', name: 'Government systems in East Africa', order: 1 },
      { id: 'sst-p6-9b', topicId: 'ug-primary-sst-p6-9', name: 'Regional co-operation and EAC', order: 2 },
      { id: 'sst-p6-9c', topicId: 'ug-primary-sst-p6-9', name: 'International organisations (UN, AU)', order: 3 },
    ]},

  // ── P7: Africa and the World ──
  { id: 'ug-primary-sst-p7-1', subjectId: 'ug-pri-sst', classLevel: 'P7', name: 'Africa — Location and Physical Features', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p7-1a', topicId: 'ug-primary-sst-p7-1', name: 'Position and size of Africa', order: 1 },
      { id: 'sst-p7-1b', topicId: 'ug-primary-sst-p7-1', name: 'Relief features (Sahara, Atlas, Kilimanjaro)', order: 2 },
      { id: 'sst-p7-1c', topicId: 'ug-primary-sst-p7-1', name: 'Major rivers and lakes of Africa', order: 3 },
      { id: 'sst-p7-1d', topicId: 'ug-primary-sst-p7-1', name: 'Climate and vegetation zones of Africa', order: 4 },
    ]},
  { id: 'ug-primary-sst-p7-2', subjectId: 'ug-pri-sst', classLevel: 'P7', name: 'People and Population of Africa', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p7-2a', topicId: 'ug-primary-sst-p7-2', name: 'Major language groups', order: 1 },
      { id: 'sst-p7-2b', topicId: 'ug-primary-sst-p7-2', name: 'Population distribution and growth', order: 2 },
      { id: 'sst-p7-2c', topicId: 'ug-primary-sst-p7-2', name: 'Urbanisation in Africa', order: 3 },
    ]},
  { id: 'ug-primary-sst-p7-3', subjectId: 'ug-pri-sst', classLevel: 'P7', name: 'Economic Activities in Africa', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p7-3a', topicId: 'ug-primary-sst-p7-3', name: 'Agriculture in Africa (cocoa, cotton, coffee, rubber)', order: 1 },
      { id: 'sst-p7-3b', topicId: 'ug-primary-sst-p7-3', name: 'Mining (gold, diamonds, oil, copper)', order: 2 },
      { id: 'sst-p7-3c', topicId: 'ug-primary-sst-p7-3', name: 'Industry and manufacturing', order: 3 },
      { id: 'sst-p7-3d', topicId: 'ug-primary-sst-p7-3', name: 'Trade (Africa and the world)', order: 4 },
    ]},
  { id: 'ug-primary-sst-p7-4', subjectId: 'ug-pri-sst', classLevel: 'P7', name: 'Transport and Communication in Africa', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p7-4a', topicId: 'ug-primary-sst-p7-4', name: 'Road, rail, water and air transport', order: 1 },
      { id: 'sst-p7-4b', topicId: 'ug-primary-sst-p7-4', name: 'Problems of transport in Africa', order: 2 },
    ]},
  { id: 'ug-primary-sst-p7-5', subjectId: 'ug-pri-sst', classLevel: 'P7', name: 'History of Africa', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p7-5a', topicId: 'ug-primary-sst-p7-5', name: 'Early civilisations (Egypt, Ghana, Mali, Zimbabwe)', order: 1 },
      { id: 'sst-p7-5b', topicId: 'ug-primary-sst-p7-5', name: 'Slave trade in Africa', order: 2 },
      { id: 'sst-p7-5c', topicId: 'ug-primary-sst-p7-5', name: 'Scramble for and partition of Africa', order: 3 },
      { id: 'sst-p7-5d', topicId: 'ug-primary-sst-p7-5', name: 'Nationalism and independence movements', order: 4 },
    ]},
  { id: 'ug-primary-sst-p7-6', subjectId: 'ug-pri-sst', classLevel: 'P7', name: 'Government and Co-operation in Africa', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p7-6a', topicId: 'ug-primary-sst-p7-6', name: 'Types of government in Africa', order: 1 },
      { id: 'sst-p7-6b', topicId: 'ug-primary-sst-p7-6', name: 'African Union (AU)', order: 2 },
      { id: 'sst-p7-6c', topicId: 'ug-primary-sst-p7-6', name: 'Human rights and democracy', order: 3 },
    ]},
  { id: 'ug-primary-sst-p7-7', subjectId: 'ug-pri-sst', classLevel: 'P7', name: 'The World', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p7-7a', topicId: 'ug-primary-sst-p7-7', name: 'Continents and oceans', order: 1 },
      { id: 'sst-p7-7b', topicId: 'ug-primary-sst-p7-7', name: 'Lines of latitude and longitude', order: 2 },
      { id: 'sst-p7-7c', topicId: 'ug-primary-sst-p7-7', name: 'The United Nations (UN)', order: 3 },
      { id: 'sst-p7-7d', topicId: 'ug-primary-sst-p7-7', name: 'World problems (war, disease, poverty)', order: 4 },
    ]},
  { id: 'ug-primary-sst-p7-8', subjectId: 'ug-pri-sst', classLevel: 'P7', name: 'Environment and Natural Resources', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sst-p7-8a', topicId: 'ug-primary-sst-p7-8', name: 'Environmental problems (deforestation, pollution)', order: 1 },
      { id: 'sst-p7-8b', topicId: 'ug-primary-sst-p7-8', name: 'Conservation and sustainable development', order: 2 },
      { id: 'sst-p7-8c', topicId: 'ug-primary-sst-p7-8', name: 'Climate change and global warming', order: 3 },
    ]},
];

// ─────────────────────────────────────────
// INTEGRATED SCIENCE — P4 to P7 (NCDC Syllabus)
// ─────────────────────────────────────────
const scienceTopics: ContentTopic[] = [
  // ── P4 ──
  { id: 'ug-primary-sci-p4-1', subjectId: 'ug-pri-sci', classLevel: 'P4', name: 'Living Things and Non-living Things', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p4-1a', topicId: 'ug-primary-sci-p4-1', name: 'Characteristics of living things', order: 1 },
      { id: 'sci-p4-1b', topicId: 'ug-primary-sci-p4-1', name: 'Classification of living things', order: 2 },
      { id: 'sci-p4-1c', topicId: 'ug-primary-sci-p4-1', name: 'Differences between plants and animals', order: 3 },
    ]},
  { id: 'ug-primary-sci-p4-2', subjectId: 'ug-pri-sci', classLevel: 'P4', name: 'Plants', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p4-2a', topicId: 'ug-primary-sci-p4-2', name: 'Parts of a plant and their functions', order: 1 },
      { id: 'sci-p4-2b', topicId: 'ug-primary-sci-p4-2', name: 'Types of plants (flowering and non-flowering)', order: 2 },
      { id: 'sci-p4-2c', topicId: 'ug-primary-sci-p4-2', name: 'Germination and growth', order: 3 },
      { id: 'sci-p4-2d', topicId: 'ug-primary-sci-p4-2', name: 'Importance of plants', order: 4 },
    ]},
  { id: 'ug-primary-sci-p4-3', subjectId: 'ug-pri-sci', classLevel: 'P4', name: 'Animals', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p4-3a', topicId: 'ug-primary-sci-p4-3', name: 'Groups of animals (vertebrates and invertebrates)', order: 1 },
      { id: 'sci-p4-3b', topicId: 'ug-primary-sci-p4-3', name: 'Feeding habits of animals', order: 2 },
      { id: 'sci-p4-3c', topicId: 'ug-primary-sci-p4-3', name: 'Habitats of animals', order: 3 },
    ]},
  { id: 'ug-primary-sci-p4-4', subjectId: 'ug-pri-sci', classLevel: 'P4', name: 'Human Body', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p4-4a', topicId: 'ug-primary-sci-p4-4', name: 'External body parts', order: 1 },
      { id: 'sci-p4-4b', topicId: 'ug-primary-sci-p4-4', name: 'Skeletal system', order: 2 },
      { id: 'sci-p4-4c', topicId: 'ug-primary-sci-p4-4', name: 'Sense organs', order: 3 },
      { id: 'sci-p4-4d', topicId: 'ug-primary-sci-p4-4', name: 'Personal hygiene', order: 4 },
    ]},
  { id: 'ug-primary-sci-p4-5', subjectId: 'ug-pri-sci', classLevel: 'P4', name: 'Health and Diseases', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p4-5a', topicId: 'ug-primary-sci-p4-5', name: 'Common diseases (malaria, diarrhoea, worms)', order: 1 },
      { id: 'sci-p4-5b', topicId: 'ug-primary-sci-p4-5', name: 'Prevention and treatment', order: 2 },
      { id: 'sci-p4-5c', topicId: 'ug-primary-sci-p4-5', name: 'Immunisation', order: 3 },
    ]},
  { id: 'ug-primary-sci-p4-6', subjectId: 'ug-pri-sci', classLevel: 'P4', name: 'Food and Nutrition', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p4-6a', topicId: 'ug-primary-sci-p4-6', name: 'Classes of food (proteins, carbohydrates, fats, vitamins)', order: 1 },
      { id: 'sci-p4-6b', topicId: 'ug-primary-sci-p4-6', name: 'Balanced diet', order: 2 },
      { id: 'sci-p4-6c', topicId: 'ug-primary-sci-p4-6', name: 'Food storage and preservation', order: 3 },
    ]},
  { id: 'ug-primary-sci-p4-7', subjectId: 'ug-pri-sci', classLevel: 'P4', name: 'Matter', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p4-7a', topicId: 'ug-primary-sci-p4-7', name: 'States of matter (solid, liquid, gas)', order: 1 },
      { id: 'sci-p4-7b', topicId: 'ug-primary-sci-p4-7', name: 'Properties of matter', order: 2 },
      { id: 'sci-p4-7c', topicId: 'ug-primary-sci-p4-7', name: 'Changes of state', order: 3 },
    ]},
  { id: 'ug-primary-sci-p4-8', subjectId: 'ug-pri-sci', classLevel: 'P4', name: 'Water', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p4-8a', topicId: 'ug-primary-sci-p4-8', name: 'Sources of water', order: 1 },
      { id: 'sci-p4-8b', topicId: 'ug-primary-sci-p4-8', name: 'Uses of water', order: 2 },
      { id: 'sci-p4-8c', topicId: 'ug-primary-sci-p4-8', name: 'Water purification', order: 3 },
      { id: 'sci-p4-8d', topicId: 'ug-primary-sci-p4-8', name: 'The water cycle', order: 4 },
    ]},

  // ── P5 ──
  { id: 'ug-primary-sci-p5-1', subjectId: 'ug-pri-sci', classLevel: 'P5', name: 'Classification of Living Things', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p5-1a', topicId: 'ug-primary-sci-p5-1', name: 'Five kingdoms of living things', order: 1 },
      { id: 'sci-p5-1b', topicId: 'ug-primary-sci-p5-1', name: 'Classification of vertebrates (5 classes)', order: 2 },
      { id: 'sci-p5-1c', topicId: 'ug-primary-sci-p5-1', name: 'Classification of invertebrates', order: 3 },
    ]},
  { id: 'ug-primary-sci-p5-2', subjectId: 'ug-pri-sci', classLevel: 'P5', name: 'Plants', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p5-2a', topicId: 'ug-primary-sci-p5-2', name: 'Reproduction in plants (pollination, dispersal)', order: 1 },
      { id: 'sci-p5-2b', topicId: 'ug-primary-sci-p5-2', name: 'Photosynthesis', order: 2 },
      { id: 'sci-p5-2c', topicId: 'ug-primary-sci-p5-2', name: 'Transpiration', order: 3 },
    ]},
  { id: 'ug-primary-sci-p5-3', subjectId: 'ug-pri-sci', classLevel: 'P5', name: 'Animals', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p5-3a', topicId: 'ug-primary-sci-p5-3', name: 'Reproduction in animals', order: 1 },
      { id: 'sci-p5-3b', topicId: 'ug-primary-sci-p5-3', name: 'Life cycles (insects, frog)', order: 2 },
      { id: 'sci-p5-3c', topicId: 'ug-primary-sci-p5-3', name: 'Adaptation of animals', order: 3 },
    ]},
  { id: 'ug-primary-sci-p5-4', subjectId: 'ug-pri-sci', classLevel: 'P5', name: 'Human Body Systems', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p5-4a', topicId: 'ug-primary-sci-p5-4', name: 'Digestive system', order: 1 },
      { id: 'sci-p5-4b', topicId: 'ug-primary-sci-p5-4', name: 'Circulatory system', order: 2 },
      { id: 'sci-p5-4c', topicId: 'ug-primary-sci-p5-4', name: 'Respiratory system', order: 3 },
      { id: 'sci-p5-4d', topicId: 'ug-primary-sci-p5-4', name: 'Teeth (types, care, dental formula)', order: 4 },
    ]},
  { id: 'ug-primary-sci-p5-5', subjectId: 'ug-pri-sci', classLevel: 'P5', name: 'Health', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p5-5a', topicId: 'ug-primary-sci-p5-5', name: 'Communicable diseases (TB, cholera, typhoid)', order: 1 },
      { id: 'sci-p5-5b', topicId: 'ug-primary-sci-p5-5', name: 'Vectors and disease transmission', order: 2 },
      { id: 'sci-p5-5c', topicId: 'ug-primary-sci-p5-5', name: 'Sanitation and waste management', order: 3 },
    ]},
  { id: 'ug-primary-sci-p5-6', subjectId: 'ug-pri-sci', classLevel: 'P5', name: 'Soil', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p5-6a', topicId: 'ug-primary-sci-p5-6', name: 'Types of soil (sand, clay, loam)', order: 1 },
      { id: 'sci-p5-6b', topicId: 'ug-primary-sci-p5-6', name: 'Properties of soil', order: 2 },
      { id: 'sci-p5-6c', topicId: 'ug-primary-sci-p5-6', name: 'Soil erosion and conservation', order: 3 },
    ]},
  { id: 'ug-primary-sci-p5-7', subjectId: 'ug-pri-sci', classLevel: 'P5', name: 'Energy', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p5-7a', topicId: 'ug-primary-sci-p5-7', name: 'Forms of energy (heat, light, sound)', order: 1 },
      { id: 'sci-p5-7b', topicId: 'ug-primary-sci-p5-7', name: 'Sources of energy', order: 2 },
      { id: 'sci-p5-7c', topicId: 'ug-primary-sci-p5-7', name: 'Heat transfer (conduction, convection, radiation)', order: 3 },
    ]},
  { id: 'ug-primary-sci-p5-8', subjectId: 'ug-pri-sci', classLevel: 'P5', name: 'Simple Machines', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p5-8a', topicId: 'ug-primary-sci-p5-8', name: 'Types of simple machines (lever, pulley, inclined plane)', order: 1 },
      { id: 'sci-p5-8b', topicId: 'ug-primary-sci-p5-8', name: 'Effort, load and fulcrum', order: 2 },
      { id: 'sci-p5-8c', topicId: 'ug-primary-sci-p5-8', name: 'Uses of simple machines', order: 3 },
    ]},

  // ── P6 ──
  { id: 'ug-primary-sci-p6-1', subjectId: 'ug-pri-sci', classLevel: 'P6', name: 'Crop Farming', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p6-1a', topicId: 'ug-primary-sci-p6-1', name: 'Crop husbandry (planting, weeding, harvesting)', order: 1 },
      { id: 'sci-p6-1b', topicId: 'ug-primary-sci-p6-1', name: 'Pests and diseases of crops', order: 2 },
      { id: 'sci-p6-1c', topicId: 'ug-primary-sci-p6-1', name: 'Soil fertility and manures', order: 3 },
    ]},
  { id: 'ug-primary-sci-p6-2', subjectId: 'ug-pri-sci', classLevel: 'P6', name: 'Animal Husbandry', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p6-2a', topicId: 'ug-primary-sci-p6-2', name: 'Rearing animals (poultry, cattle, goats)', order: 1 },
      { id: 'sci-p6-2b', topicId: 'ug-primary-sci-p6-2', name: 'Diseases of livestock', order: 2 },
      { id: 'sci-p6-2c', topicId: 'ug-primary-sci-p6-2', name: 'Importance of livestock farming', order: 3 },
    ]},
  { id: 'ug-primary-sci-p6-3', subjectId: 'ug-pri-sci', classLevel: 'P6', name: 'Human Body (Reproduction)', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p6-3a', topicId: 'ug-primary-sci-p6-3', name: 'Reproductive system (male and female)', order: 1 },
      { id: 'sci-p6-3b', topicId: 'ug-primary-sci-p6-3', name: 'Adolescence and puberty', order: 2 },
      { id: 'sci-p6-3c', topicId: 'ug-primary-sci-p6-3', name: 'Menstrual cycle', order: 3 },
    ]},
  { id: 'ug-primary-sci-p6-4', subjectId: 'ug-pri-sci', classLevel: 'P6', name: 'Health (HIV/AIDS and STIs)', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p6-4a', topicId: 'ug-primary-sci-p6-4', name: 'HIV/AIDS: transmission and prevention', order: 1 },
      { id: 'sci-p6-4b', topicId: 'ug-primary-sci-p6-4', name: 'Sexually transmitted infections', order: 2 },
      { id: 'sci-p6-4c', topicId: 'ug-primary-sci-p6-4', name: 'Living positively with HIV', order: 3 },
    ]},
  { id: 'ug-primary-sci-p6-5', subjectId: 'ug-pri-sci', classLevel: 'P6', name: 'Electricity and Magnetism', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p6-5a', topicId: 'ug-primary-sci-p6-5', name: 'Simple electric circuits', order: 1 },
      { id: 'sci-p6-5b', topicId: 'ug-primary-sci-p6-5', name: 'Conductors and insulators', order: 2 },
      { id: 'sci-p6-5c', topicId: 'ug-primary-sci-p6-5', name: 'Magnets (types, properties, uses)', order: 3 },
    ]},
  { id: 'ug-primary-sci-p6-6', subjectId: 'ug-pri-sci', classLevel: 'P6', name: 'Light', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p6-6a', topicId: 'ug-primary-sci-p6-6', name: 'Sources and properties of light', order: 1 },
      { id: 'sci-p6-6b', topicId: 'ug-primary-sci-p6-6', name: 'Reflection and mirrors', order: 2 },
      { id: 'sci-p6-6c', topicId: 'ug-primary-sci-p6-6', name: 'Refraction and lenses', order: 3 },
      { id: 'sci-p6-6d', topicId: 'ug-primary-sci-p6-6', name: 'The human eye and defects of vision', order: 4 },
    ]},
  { id: 'ug-primary-sci-p6-7', subjectId: 'ug-pri-sci', classLevel: 'P6', name: 'Sound', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p6-7a', topicId: 'ug-primary-sci-p6-7', name: 'Sources and production of sound', order: 1 },
      { id: 'sci-p6-7b', topicId: 'ug-primary-sci-p6-7', name: 'Sound travel and echoes', order: 2 },
      { id: 'sci-p6-7c', topicId: 'ug-primary-sci-p6-7', name: 'The human ear', order: 3 },
    ]},
  { id: 'ug-primary-sci-p6-8', subjectId: 'ug-pri-sci', classLevel: 'P6', name: 'The Environment', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p6-8a', topicId: 'ug-primary-sci-p6-8', name: 'Ecosystems and food chains', order: 1 },
      { id: 'sci-p6-8b', topicId: 'ug-primary-sci-p6-8', name: 'Pollution (air, water, land)', order: 2 },
      { id: 'sci-p6-8c', topicId: 'ug-primary-sci-p6-8', name: 'Conservation of the environment', order: 3 },
    ]},

  // ── P7 ──
  { id: 'ug-primary-sci-p7-1', subjectId: 'ug-pri-sci', classLevel: 'P7', name: 'Classification of Living Things', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p7-1a', topicId: 'ug-primary-sci-p7-1', name: 'Detailed classification of plants', order: 1 },
      { id: 'sci-p7-1b', topicId: 'ug-primary-sci-p7-1', name: 'Detailed classification of animals', order: 2 },
      { id: 'sci-p7-1c', topicId: 'ug-primary-sci-p7-1', name: 'Micro-organisms (bacteria, viruses, fungi)', order: 3 },
    ]},
  { id: 'ug-primary-sci-p7-2', subjectId: 'ug-pri-sci', classLevel: 'P7', name: 'Plants (Revision)', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p7-2a', topicId: 'ug-primary-sci-p7-2', name: 'Photosynthesis (detailed)', order: 1 },
      { id: 'sci-p7-2b', topicId: 'ug-primary-sci-p7-2', name: 'Transport in plants', order: 2 },
      { id: 'sci-p7-2c', topicId: 'ug-primary-sci-p7-2', name: 'Plant diseases', order: 3 },
    ]},
  { id: 'ug-primary-sci-p7-3', subjectId: 'ug-pri-sci', classLevel: 'P7', name: 'Human Body Systems (Revision)', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p7-3a', topicId: 'ug-primary-sci-p7-3', name: 'Excretory system (kidneys, skin, lungs)', order: 1 },
      { id: 'sci-p7-3b', topicId: 'ug-primary-sci-p7-3', name: 'Nervous system', order: 2 },
      { id: 'sci-p7-3c', topicId: 'ug-primary-sci-p7-3', name: 'Muscular system', order: 3 },
    ]},
  { id: 'ug-primary-sci-p7-4', subjectId: 'ug-pri-sci', classLevel: 'P7', name: 'Health and Nutrition (Revision)', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p7-4a', topicId: 'ug-primary-sci-p7-4', name: 'Nutritional deficiency diseases', order: 1 },
      { id: 'sci-p7-4b', topicId: 'ug-primary-sci-p7-4', name: 'Drug and substance abuse', order: 2 },
      { id: 'sci-p7-4c', topicId: 'ug-primary-sci-p7-4', name: 'First aid', order: 3 },
    ]},
  { id: 'ug-primary-sci-p7-5', subjectId: 'ug-pri-sci', classLevel: 'P7', name: 'Force and Pressure', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p7-5a', topicId: 'ug-primary-sci-p7-5', name: 'Types of forces (gravity, friction, magnetic)', order: 1 },
      { id: 'sci-p7-5b', topicId: 'ug-primary-sci-p7-5', name: 'Pressure in solids, liquids and gases', order: 2 },
      { id: 'sci-p7-5c', topicId: 'ug-primary-sci-p7-5', name: 'Floating and sinking', order: 3 },
    ]},
  { id: 'ug-primary-sci-p7-6', subjectId: 'ug-pri-sci', classLevel: 'P7', name: 'Electricity and Magnetism (Revision)', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p7-6a', topicId: 'ug-primary-sci-p7-6', name: 'Generation of electricity', order: 1 },
      { id: 'sci-p7-6b', topicId: 'ug-primary-sci-p7-6', name: 'Effects of electric current', order: 2 },
      { id: 'sci-p7-6c', topicId: 'ug-primary-sci-p7-6', name: 'Electromagnetism', order: 3 },
      { id: 'sci-p7-6d', topicId: 'ug-primary-sci-p7-6', name: 'Safety with electricity', order: 4 },
    ]},
  { id: 'ug-primary-sci-p7-7', subjectId: 'ug-pri-sci', classLevel: 'P7', name: 'The Solar System', order: 7, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p7-7a', topicId: 'ug-primary-sci-p7-7', name: 'The sun and planets', order: 1 },
      { id: 'sci-p7-7b', topicId: 'ug-primary-sci-p7-7', name: 'The moon, eclipses and tides', order: 2 },
      { id: 'sci-p7-7c', topicId: 'ug-primary-sci-p7-7', name: 'Day and night, seasons', order: 3 },
    ]},
  { id: 'ug-primary-sci-p7-8', subjectId: 'ug-pri-sci', classLevel: 'P7', name: 'The Environment (Revision)', order: 8, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'sci-p7-8a', topicId: 'ug-primary-sci-p7-8', name: 'Air composition and properties', order: 1 },
      { id: 'sci-p7-8b', topicId: 'ug-primary-sci-p7-8', name: 'Weather and climate', order: 2 },
      { id: 'sci-p7-8c', topicId: 'ug-primary-sci-p7-8', name: 'Natural disasters and their management', order: 3 },
    ]},
];


// ─────────────────────────────────────────
// RELIGIOUS EDUCATION (CRE/IRE) — P4 to P7 (NCDC Syllabus)
// ─────────────────────────────────────────
const reTopics: ContentTopic[] = [
  // P4
  { id: 'ug-primary-re-p4-1', subjectId: 'ug-pri-re', classLevel: 'P4', name: 'God the Creator', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p4-1a', topicId: 'ug-primary-re-p4-1', name: 'The creation story (Genesis 1-2)', order: 1 },
      { id: 're-p4-1b', topicId: 'ug-primary-re-p4-1', name: 'Caring for God\'s creation', order: 2 },
      { id: 're-p4-1c', topicId: 'ug-primary-re-p4-1', name: 'Human beings as special creation', order: 3 },
    ]},
  { id: 'ug-primary-re-p4-2', subjectId: 'ug-pri-re', classLevel: 'P4', name: 'The Fall of Man', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p4-2a', topicId: 'ug-primary-re-p4-2', name: 'Adam and Eve in the Garden of Eden', order: 1 },
      { id: 're-p4-2b', topicId: 'ug-primary-re-p4-2', name: 'Disobedience and its consequences', order: 2 },
      { id: 're-p4-2c', topicId: 'ug-primary-re-p4-2', name: 'Cain and Abel', order: 3 },
    ]},
  { id: 'ug-primary-re-p4-3', subjectId: 'ug-pri-re', classLevel: 'P4', name: 'God\'s Plan of Salvation', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p4-3a', topicId: 'ug-primary-re-p4-3', name: 'Noah and the flood', order: 1 },
      { id: 're-p4-3b', topicId: 'ug-primary-re-p4-3', name: 'The call of Abraham', order: 2 },
      { id: 're-p4-3c', topicId: 'ug-primary-re-p4-3', name: 'God\'s covenant with Abraham', order: 3 },
    ]},
  { id: 'ug-primary-re-p4-4', subjectId: 'ug-pri-re', classLevel: 'P4', name: 'The Exodus', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p4-4a', topicId: 'ug-primary-re-p4-4', name: 'Moses and the burning bush', order: 1 },
      { id: 're-p4-4b', topicId: 'ug-primary-re-p4-4', name: 'The ten plagues of Egypt', order: 2 },
      { id: 're-p4-4c', topicId: 'ug-primary-re-p4-4', name: 'Crossing the Red Sea', order: 3 },
    ]},
  { id: 'ug-primary-re-p4-5', subjectId: 'ug-pri-re', classLevel: 'P4', name: 'The Ten Commandments', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p4-5a', topicId: 'ug-primary-re-p4-5', name: 'Moses on Mount Sinai', order: 1 },
      { id: 're-p4-5b', topicId: 'ug-primary-re-p4-5', name: 'The Ten Commandments and their meaning', order: 2 },
      { id: 're-p4-5c', topicId: 'ug-primary-re-p4-5', name: 'Obeying God\'s laws today', order: 3 },
    ]},
  { id: 'ug-primary-re-p4-6', subjectId: 'ug-pri-re', classLevel: 'P4', name: 'Kings of Israel', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p4-6a', topicId: 'ug-primary-re-p4-6', name: 'King Saul', order: 1 },
      { id: 're-p4-6b', topicId: 'ug-primary-re-p4-6', name: 'King David', order: 2 },
      { id: 're-p4-6c', topicId: 'ug-primary-re-p4-6', name: 'King Solomon and the Temple', order: 3 },
    ]},
  // P5
  { id: 'ug-primary-re-p5-1', subjectId: 'ug-pri-re', classLevel: 'P5', name: 'The Prophets', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p5-1a', topicId: 'ug-primary-re-p5-1', name: 'Prophet Elijah', order: 1 },
      { id: 're-p5-1b', topicId: 'ug-primary-re-p5-1', name: 'Prophet Elisha', order: 2 },
      { id: 're-p5-1c', topicId: 'ug-primary-re-p5-1', name: 'Prophet Isaiah — the promised Messiah', order: 3 },
    ]},
  { id: 'ug-primary-re-p5-2', subjectId: 'ug-pri-re', classLevel: 'P5', name: 'The Birth and Early Life of Jesus', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p5-2a', topicId: 'ug-primary-re-p5-2', name: 'The annunciation to Mary', order: 1 },
      { id: 're-p5-2b', topicId: 'ug-primary-re-p5-2', name: 'The birth of Jesus in Bethlehem', order: 2 },
      { id: 're-p5-2c', topicId: 'ug-primary-re-p5-2', name: 'Presentation at the Temple', order: 3 },
      { id: 're-p5-2d', topicId: 'ug-primary-re-p5-2', name: 'The boy Jesus in the Temple', order: 4 },
    ]},
  { id: 'ug-primary-re-p5-3', subjectId: 'ug-pri-re', classLevel: 'P5', name: 'Baptism and Temptation of Jesus', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p5-3a', topicId: 'ug-primary-re-p5-3', name: 'John the Baptist', order: 1 },
      { id: 're-p5-3b', topicId: 'ug-primary-re-p5-3', name: 'The baptism of Jesus', order: 2 },
      { id: 're-p5-3c', topicId: 'ug-primary-re-p5-3', name: 'The temptation in the wilderness', order: 3 },
    ]},
  { id: 'ug-primary-re-p5-4', subjectId: 'ug-pri-re', classLevel: 'P5', name: 'Ministry of Jesus', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p5-4a', topicId: 'ug-primary-re-p5-4', name: 'Calling of the disciples', order: 1 },
      { id: 're-p5-4b', topicId: 'ug-primary-re-p5-4', name: 'The Sermon on the Mount', order: 2 },
      { id: 're-p5-4c', topicId: 'ug-primary-re-p5-4', name: 'Parables (Good Samaritan, Prodigal Son, Sower)', order: 3 },
    ]},
  { id: 'ug-primary-re-p5-5', subjectId: 'ug-pri-re', classLevel: 'P5', name: 'Miracles of Jesus', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p5-5a', topicId: 'ug-primary-re-p5-5', name: 'Healing miracles', order: 1 },
      { id: 're-p5-5b', topicId: 'ug-primary-re-p5-5', name: 'Nature miracles (calming the storm, feeding 5000)', order: 2 },
      { id: 're-p5-5c', topicId: 'ug-primary-re-p5-5', name: 'Raising the dead (Lazarus)', order: 3 },
    ]},
  { id: 'ug-primary-re-p5-6', subjectId: 'ug-pri-re', classLevel: 'P5', name: 'Christian Values', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p5-6a', topicId: 'ug-primary-re-p5-6', name: 'Forgiveness and reconciliation', order: 1 },
      { id: 're-p5-6b', topicId: 'ug-primary-re-p5-6', name: 'Honesty, truthfulness and integrity', order: 2 },
    ]},
  // P6
  { id: 'ug-primary-re-p6-1', subjectId: 'ug-pri-re', classLevel: 'P6', name: 'The Last Week of Jesus', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p6-1a', topicId: 'ug-primary-re-p6-1', name: 'Triumphal entry into Jerusalem', order: 1 },
      { id: 're-p6-1b', topicId: 'ug-primary-re-p6-1', name: 'The Last Supper', order: 2 },
      { id: 're-p6-1c', topicId: 'ug-primary-re-p6-1', name: 'Betrayal and arrest', order: 3 },
    ]},
  { id: 'ug-primary-re-p6-2', subjectId: 'ug-pri-re', classLevel: 'P6', name: 'Death and Resurrection of Jesus', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p6-2a', topicId: 'ug-primary-re-p6-2', name: 'The trial and crucifixion', order: 1 },
      { id: 're-p6-2b', topicId: 'ug-primary-re-p6-2', name: 'The resurrection', order: 2 },
      { id: 're-p6-2c', topicId: 'ug-primary-re-p6-2', name: 'The meaning of Easter', order: 3 },
    ]},
  { id: 'ug-primary-re-p6-3', subjectId: 'ug-pri-re', classLevel: 'P6', name: 'Ascension and Pentecost', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p6-3a', topicId: 'ug-primary-re-p6-3', name: 'Jesus ascends to heaven', order: 1 },
      { id: 're-p6-3b', topicId: 'ug-primary-re-p6-3', name: 'Coming of the Holy Spirit at Pentecost', order: 2 },
    ]},
  { id: 'ug-primary-re-p6-4', subjectId: 'ug-pri-re', classLevel: 'P6', name: 'The Early Church', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p6-4a', topicId: 'ug-primary-re-p6-4', name: 'The first Christians (Acts)', order: 1 },
      { id: 're-p6-4b', topicId: 'ug-primary-re-p6-4', name: 'Peter and the apostles', order: 2 },
      { id: 're-p6-4c', topicId: 'ug-primary-re-p6-4', name: 'Persecution of early Christians', order: 3 },
    ]},
  { id: 'ug-primary-re-p6-5', subjectId: 'ug-pri-re', classLevel: 'P6', name: 'Moral and Social Values', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p6-5a', topicId: 'ug-primary-re-p6-5', name: 'Honesty and integrity', order: 1 },
      { id: 're-p6-5b', topicId: 'ug-primary-re-p6-5', name: 'Respect and responsibility', order: 2 },
      { id: 're-p6-5c', topicId: 'ug-primary-re-p6-5', name: 'Service to others', order: 3 },
    ]},
  { id: 'ug-primary-re-p6-6', subjectId: 'ug-pri-re', classLevel: 'P6', name: 'Sacraments and Worship', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p6-6a', topicId: 'ug-primary-re-p6-6', name: 'Baptism and Holy Communion', order: 1 },
      { id: 're-p6-6b', topicId: 'ug-primary-re-p6-6', name: 'The role of the Church in society', order: 2 },
    ]},
  // P7
  { id: 'ug-primary-re-p7-1', subjectId: 'ug-pri-re', classLevel: 'P7', name: 'Spread of Christianity', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p7-1a', topicId: 'ug-primary-re-p7-1', name: 'Paul\'s missionary journeys', order: 1 },
      { id: 're-p7-1b', topicId: 'ug-primary-re-p7-1', name: 'Paul\'s letters to the churches', order: 2 },
    ]},
  { id: 'ug-primary-re-p7-2', subjectId: 'ug-pri-re', classLevel: 'P7', name: 'Christianity in East Africa', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p7-2a', topicId: 'ug-primary-re-p7-2', name: 'Coming of missionaries to East Africa', order: 1 },
      { id: 're-p7-2b', topicId: 'ug-primary-re-p7-2', name: 'The Uganda Martyrs', order: 2 },
      { id: 're-p7-2c', topicId: 'ug-primary-re-p7-2', name: 'Growth of Christianity in Uganda', order: 3 },
    ]},
  { id: 'ug-primary-re-p7-3', subjectId: 'ug-pri-re', classLevel: 'P7', name: 'World Religions', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p7-3a', topicId: 'ug-primary-re-p7-3', name: 'Islam: beliefs and practices', order: 1 },
      { id: 're-p7-3b', topicId: 'ug-primary-re-p7-3', name: 'African Traditional Religion', order: 2 },
      { id: 're-p7-3c', topicId: 'ug-primary-re-p7-3', name: 'Religious tolerance and co-existence', order: 3 },
    ]},
  { id: 'ug-primary-re-p7-4', subjectId: 'ug-pri-re', classLevel: 'P7', name: 'Social and Moral Issues', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p7-4a', topicId: 'ug-primary-re-p7-4', name: 'HIV/AIDS and the Christian response', order: 1 },
      { id: 're-p7-4b', topicId: 'ug-primary-re-p7-4', name: 'Child abuse and children\'s rights', order: 2 },
      { id: 're-p7-4c', topicId: 'ug-primary-re-p7-4', name: 'Environmental stewardship', order: 3 },
    ]},
  { id: 'ug-primary-re-p7-5', subjectId: 'ug-pri-re', classLevel: 'P7', name: 'PLE Religious Education Revision', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 're-p7-5a', topicId: 'ug-primary-re-p7-5', name: 'Key Bible stories (Old and New Testament)', order: 1 },
      { id: 're-p7-5b', topicId: 'ug-primary-re-p7-5', name: 'Ethics and society revision', order: 2 },
      { id: 're-p7-5c', topicId: 'ug-primary-re-p7-5', name: 'PLE past paper practice', order: 3 },
    ]},
];

// ─────────────────────────────────────────
// LOCAL LANGUAGE — P4 to P7 (NCDC Syllabus)
// ─────────────────────────────────────────
const llTopics: ContentTopic[] = [
  // P4
  { id: 'ug-primary-ll-p4-1', subjectId: 'ug-pri-ll', classLevel: 'P4', name: 'Listening and Speaking', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p4-1a', topicId: 'ug-primary-ll-p4-1', name: 'Oral communication and greetings', order: 1 },
      { id: 'll-p4-1b', topicId: 'ug-primary-ll-p4-1', name: 'Giving and following instructions', order: 2 },
      { id: 'll-p4-1c', topicId: 'ug-primary-ll-p4-1', name: 'Describing people, places and things', order: 3 },
    ]},
  { id: 'ug-primary-ll-p4-2', subjectId: 'ug-pri-ll', classLevel: 'P4', name: 'Reading (Word Recognition)', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p4-2a', topicId: 'ug-primary-ll-p4-2', name: 'Letter sounds and syllables', order: 1 },
      { id: 'll-p4-2b', topicId: 'ug-primary-ll-p4-2', name: 'Reading simple texts aloud', order: 2 },
      { id: 'll-p4-2c', topicId: 'ug-primary-ll-p4-2', name: 'Reading comprehension (basic)', order: 3 },
    ]},
  { id: 'ug-primary-ll-p4-3', subjectId: 'ug-pri-ll', classLevel: 'P4', name: 'Vocabulary and Word Building', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p4-3a', topicId: 'ug-primary-ll-p4-3', name: 'Common words and phrases', order: 1 },
      { id: 'll-p4-3b', topicId: 'ug-primary-ll-p4-3', name: 'Word families and opposites', order: 2 },
    ]},
  { id: 'ug-primary-ll-p4-4', subjectId: 'ug-pri-ll', classLevel: 'P4', name: 'Grammar and Sentence Structure', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p4-4a', topicId: 'ug-primary-ll-p4-4', name: 'Simple sentence construction', order: 1 },
      { id: 'll-p4-4b', topicId: 'ug-primary-ll-p4-4', name: 'Nouns and verbs in local language', order: 2 },
    ]},
  { id: 'ug-primary-ll-p4-5', subjectId: 'ug-pri-ll', classLevel: 'P4', name: 'Writing (Guided Composition)', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p4-5a', topicId: 'ug-primary-ll-p4-5', name: 'Handwriting practice', order: 1 },
      { id: 'll-p4-5b', topicId: 'ug-primary-ll-p4-5', name: 'Writing simple sentences and paragraphs', order: 2 },
    ]},
  { id: 'ug-primary-ll-p4-6', subjectId: 'ug-pri-ll', classLevel: 'P4', name: 'Cultural Expression', order: 6, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p4-6a', topicId: 'ug-primary-ll-p4-6', name: 'Proverbs and riddles', order: 1 },
      { id: 'll-p4-6b', topicId: 'ug-primary-ll-p4-6', name: 'Folk stories and oral traditions', order: 2 },
    ]},
  // P5
  { id: 'ug-primary-ll-p5-1', subjectId: 'ug-pri-ll', classLevel: 'P5', name: 'Oral Communication', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p5-1a', topicId: 'ug-primary-ll-p5-1', name: 'Discussions and narration', order: 1 },
      { id: 'll-p5-1b', topicId: 'ug-primary-ll-p5-1', name: 'Storytelling techniques', order: 2 },
    ]},
  { id: 'ug-primary-ll-p5-2', subjectId: 'ug-pri-ll', classLevel: 'P5', name: 'Reading and Comprehension', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p5-2a', topicId: 'ug-primary-ll-p5-2', name: 'Reading passages and answering questions', order: 1 },
      { id: 'll-p5-2b', topicId: 'ug-primary-ll-p5-2', name: 'Silent and loud reading', order: 2 },
    ]},
  { id: 'ug-primary-ll-p5-3', subjectId: 'ug-pri-ll', classLevel: 'P5', name: 'Grammar and Language Structure', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p5-3a', topicId: 'ug-primary-ll-p5-3', name: 'Tenses in local language', order: 1 },
      { id: 'll-p5-3b', topicId: 'ug-primary-ll-p5-3', name: 'Singular and plural forms', order: 2 },
    ]},
  { id: 'ug-primary-ll-p5-4', subjectId: 'ug-pri-ll', classLevel: 'P5', name: 'Writing and Composition', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p5-4a', topicId: 'ug-primary-ll-p5-4', name: 'Letter writing (informal)', order: 1 },
      { id: 'll-p5-4b', topicId: 'ug-primary-ll-p5-4', name: 'Narrative composition', order: 2 },
    ]},
  { id: 'ug-primary-ll-p5-5', subjectId: 'ug-pri-ll', classLevel: 'P5', name: 'Cultural Stories and Traditions', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p5-5a', topicId: 'ug-primary-ll-p5-5', name: 'Folk tales and legends', order: 1 },
      { id: 'll-p5-5b', topicId: 'ug-primary-ll-p5-5', name: 'Proverbs and riddles', order: 2 },
    ]},
  // P6
  { id: 'ug-primary-ll-p6-1', subjectId: 'ug-pri-ll', classLevel: 'P6', name: 'Advanced Communication', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p6-1a', topicId: 'ug-primary-ll-p6-1', name: 'Public speaking and presentations', order: 1 },
      { id: 'll-p6-1b', topicId: 'ug-primary-ll-p6-1', name: 'Dialogue and debate', order: 2 },
    ]},
  { id: 'ug-primary-ll-p6-2', subjectId: 'ug-pri-ll', classLevel: 'P6', name: 'Reading and Analysis', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p6-2a', topicId: 'ug-primary-ll-p6-2', name: 'Critical reading of texts', order: 1 },
      { id: 'll-p6-2b', topicId: 'ug-primary-ll-p6-2', name: 'Identifying themes and main ideas', order: 2 },
    ]},
  { id: 'ug-primary-ll-p6-3', subjectId: 'ug-pri-ll', classLevel: 'P6', name: 'Grammar (Complex Structures)', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p6-3a', topicId: 'ug-primary-ll-p6-3', name: 'Compound sentences', order: 1 },
      { id: 'll-p6-3b', topicId: 'ug-primary-ll-p6-3', name: 'Punctuation in local language', order: 2 },
    ]},
  { id: 'ug-primary-ll-p6-4', subjectId: 'ug-pri-ll', classLevel: 'P6', name: 'Creative Writing', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p6-4a', topicId: 'ug-primary-ll-p6-4', name: 'Story writing', order: 1 },
      { id: 'll-p6-4b', topicId: 'ug-primary-ll-p6-4', name: 'Descriptive and narrative writing', order: 2 },
    ]},
  { id: 'ug-primary-ll-p6-5', subjectId: 'ug-pri-ll', classLevel: 'P6', name: 'Poetry and Literature', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p6-5a', topicId: 'ug-primary-ll-p6-5', name: 'Poems and songs in local language', order: 1 },
      { id: 'll-p6-5b', topicId: 'ug-primary-ll-p6-5', name: 'Cultural heritage through literature', order: 2 },
    ]},
  // P7
  { id: 'ug-primary-ll-p7-1', subjectId: 'ug-pri-ll', classLevel: 'P7', name: 'Comprehensive Reading', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p7-1a', topicId: 'ug-primary-ll-p7-1', name: 'Reading complex texts', order: 1 },
      { id: 'll-p7-1b', topicId: 'ug-primary-ll-p7-1', name: 'Summary and inference skills', order: 2 },
    ]},
  { id: 'ug-primary-ll-p7-2', subjectId: 'ug-pri-ll', classLevel: 'P7', name: 'Advanced Grammar', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p7-2a', topicId: 'ug-primary-ll-p7-2', name: 'Complex grammatical structures', order: 1 },
      { id: 'll-p7-2b', topicId: 'ug-primary-ll-p7-2', name: 'Sentence transformation', order: 2 },
    ]},
  { id: 'ug-primary-ll-p7-3', subjectId: 'ug-pri-ll', classLevel: 'P7', name: 'Composition and Essay Writing', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p7-3a', topicId: 'ug-primary-ll-p7-3', name: 'Narrative essays', order: 1 },
      { id: 'll-p7-3b', topicId: 'ug-primary-ll-p7-3', name: 'Formal and informal letters in local language', order: 2 },
    ]},
  { id: 'ug-primary-ll-p7-4', subjectId: 'ug-pri-ll', classLevel: 'P7', name: 'Cultural Expression and Literature', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p7-4a', topicId: 'ug-primary-ll-p7-4', name: 'Cultural stories and moral lessons', order: 1 },
      { id: 'll-p7-4b', topicId: 'ug-primary-ll-p7-4', name: 'Poetry recitation and analysis', order: 2 },
    ]},
  { id: 'ug-primary-ll-p7-5', subjectId: 'ug-pri-ll', classLevel: 'P7', name: 'PLE Local Language Revision', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'll-p7-5a', topicId: 'ug-primary-ll-p7-5', name: 'Comprehension practice', order: 1 },
      { id: 'll-p7-5b', topicId: 'ug-primary-ll-p7-5', name: 'Grammar revision', order: 2 },
      { id: 'll-p7-5c', topicId: 'ug-primary-ll-p7-5', name: 'Composition practice', order: 3 },
    ]},
];

// ─────────────────────────────────────────
// CREATIVE ARTS & PHYSICAL EDUCATION (CAPE) — P4 to P7 (NCDC)
// Three strands: Music/Dance/Drama, Art & Technology, Physical Education
// ─────────────────────────────────────────
const capeTopics: ContentTopic[] = [
  // P4
  { id: 'ug-primary-cape-p4-1', subjectId: 'ug-pri-cape', classLevel: 'P4', name: 'Singing and Music', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p4-1a', topicId: 'ug-primary-cape-p4-1', name: 'Singing in parts (rounds and canons)', order: 1 },
      { id: 'cape-p4-1b', topicId: 'ug-primary-cape-p4-1', name: 'Basic sol-fa notation', order: 2 },
      { id: 'cape-p4-1c', topicId: 'ug-primary-cape-p4-1', name: 'Playing simple instruments (drums, shakers)', order: 3 },
    ]},
  { id: 'ug-primary-cape-p4-2', subjectId: 'ug-pri-cape', classLevel: 'P4', name: 'Traditional Dance', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p4-2a', topicId: 'ug-primary-cape-p4-2', name: 'Local traditional dances', order: 1 },
      { id: 'cape-p4-2b', topicId: 'ug-primary-cape-p4-2', name: 'Rhythmic movement and coordination', order: 2 },
    ]},
  { id: 'ug-primary-cape-p4-3', subjectId: 'ug-pri-cape', classLevel: 'P4', name: 'Drawing and Painting', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p4-3a', topicId: 'ug-primary-cape-p4-3', name: 'Observational drawing', order: 1 },
      { id: 'cape-p4-3b', topicId: 'ug-primary-cape-p4-3', name: 'Colour mixing and painting', order: 2 },
    ]},
  { id: 'ug-primary-cape-p4-4', subjectId: 'ug-pri-cape', classLevel: 'P4', name: 'Crafts and Design', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p4-4a', topicId: 'ug-primary-cape-p4-4', name: 'Weaving and plaiting', order: 1 },
      { id: 'cape-p4-4b', topicId: 'ug-primary-cape-p4-4', name: 'Modelling with clay', order: 2 },
    ]},
  { id: 'ug-primary-cape-p4-5', subjectId: 'ug-pri-cape', classLevel: 'P4', name: 'Physical Education', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p4-5a', topicId: 'ug-primary-cape-p4-5', name: 'Running, jumping and throwing', order: 1 },
      { id: 'cape-p4-5b', topicId: 'ug-primary-cape-p4-5', name: 'Basic ball games (football, netball)', order: 2 },
      { id: 'cape-p4-5c', topicId: 'ug-primary-cape-p4-5', name: 'Simple gymnastics', order: 3 },
    ]},
  // P5
  { id: 'ug-primary-cape-p5-1', subjectId: 'ug-pri-cape', classLevel: 'P5', name: 'Music Theory and Practice', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p5-1a', topicId: 'ug-primary-cape-p5-1', name: 'Staff notation basics', order: 1 },
      { id: 'cape-p5-1b', topicId: 'ug-primary-cape-p5-1', name: 'Singing in harmony', order: 2 },
    ]},
  { id: 'ug-primary-cape-p5-2', subjectId: 'ug-pri-cape', classLevel: 'P5', name: 'Dance and Drama', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p5-2a', topicId: 'ug-primary-cape-p5-2', name: 'Dances from different regions of Uganda', order: 1 },
      { id: 'cape-p5-2b', topicId: 'ug-primary-cape-p5-2', name: 'Role play and dramatisation', order: 2 },
    ]},
  { id: 'ug-primary-cape-p5-3', subjectId: 'ug-pri-cape', classLevel: 'P5', name: 'Art and Printing', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p5-3a', topicId: 'ug-primary-cape-p5-3', name: 'Still life drawing', order: 1 },
      { id: 'cape-p5-3b', topicId: 'ug-primary-cape-p5-3', name: 'Block printing and stencils', order: 2 },
    ]},
  { id: 'ug-primary-cape-p5-4', subjectId: 'ug-pri-cape', classLevel: 'P5', name: 'Crafts and Technology', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p5-4a', topicId: 'ug-primary-cape-p5-4', name: 'Paper craft and origami', order: 1 },
      { id: 'cape-p5-4b', topicId: 'ug-primary-cape-p5-4', name: 'Simple construction projects', order: 2 },
    ]},
  { id: 'ug-primary-cape-p5-5', subjectId: 'ug-pri-cape', classLevel: 'P5', name: 'Physical Education (Team Sports)', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p5-5a', topicId: 'ug-primary-cape-p5-5', name: 'Athletics (track and field)', order: 1 },
      { id: 'cape-p5-5b', topicId: 'ug-primary-cape-p5-5', name: 'Team ball games (football, netball, volleyball)', order: 2 },
      { id: 'cape-p5-5c', topicId: 'ug-primary-cape-p5-5', name: 'Gymnastics and fitness exercises', order: 3 },
    ]},
  // P6
  { id: 'ug-primary-cape-p6-1', subjectId: 'ug-pri-cape', classLevel: 'P6', name: 'Advanced Music', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p6-1a', topicId: 'ug-primary-cape-p6-1', name: 'Musical instruments (traditional and modern)', order: 1 },
      { id: 'cape-p6-1b', topicId: 'ug-primary-cape-p6-1', name: 'Composing simple tunes', order: 2 },
    ]},
  { id: 'ug-primary-cape-p6-2', subjectId: 'ug-pri-cape', classLevel: 'P6', name: 'Cultural Dance and Drama', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p6-2a', topicId: 'ug-primary-cape-p6-2', name: 'Regional dances of East Africa', order: 1 },
      { id: 'cape-p6-2b', topicId: 'ug-primary-cape-p6-2', name: 'Planning and staging a play', order: 2 },
    ]},
  { id: 'ug-primary-cape-p6-3', subjectId: 'ug-pri-cape', classLevel: 'P6', name: 'Advanced Art and Design', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p6-3a', topicId: 'ug-primary-cape-p6-3', name: 'Pottery and weaving', order: 1 },
      { id: 'cape-p6-3b', topicId: 'ug-primary-cape-p6-3', name: 'Batik and tie-dye', order: 2 },
    ]},
  { id: 'ug-primary-cape-p6-4', subjectId: 'ug-pri-cape', classLevel: 'P6', name: 'Design and Technology', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p6-4a', topicId: 'ug-primary-cape-p6-4', name: 'Simple construction projects', order: 1 },
      { id: 'cape-p6-4b', topicId: 'ug-primary-cape-p6-4', name: 'Design with local materials', order: 2 },
    ]},
  { id: 'ug-primary-cape-p6-5', subjectId: 'ug-pri-cape', classLevel: 'P6', name: 'Physical Education (Athletics)', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p6-5a', topicId: 'ug-primary-cape-p6-5', name: 'Track events (sprints, relays)', order: 1 },
      { id: 'cape-p6-5b', topicId: 'ug-primary-cape-p6-5', name: 'Field events (long jump, high jump)', order: 2 },
      { id: 'cape-p6-5c', topicId: 'ug-primary-cape-p6-5', name: 'Health, fitness and nutrition', order: 3 },
    ]},
  // P7
  { id: 'ug-primary-cape-p7-1', subjectId: 'ug-pri-cape', classLevel: 'P7', name: 'Music Appreciation', order: 1, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p7-1a', topicId: 'ug-primary-cape-p7-1', name: 'Listening and analysing music', order: 1 },
      { id: 'cape-p7-1b', topicId: 'ug-primary-cape-p7-1', name: 'Music from different cultures', order: 2 },
    ]},
  { id: 'ug-primary-cape-p7-2', subjectId: 'ug-pri-cape', classLevel: 'P7', name: 'Dance and Performance', order: 2, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p7-2a', topicId: 'ug-primary-cape-p7-2', name: 'Performance for cultural festivals', order: 1 },
      { id: 'cape-p7-2b', topicId: 'ug-primary-cape-p7-2', name: 'Creative choreography', order: 2 },
    ]},
  { id: 'ug-primary-cape-p7-3', subjectId: 'ug-pri-cape', classLevel: 'P7', name: 'Art Portfolio and Exhibition', order: 3, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p7-3a', topicId: 'ug-primary-cape-p7-3', name: 'Portfolio development', order: 1 },
      { id: 'cape-p7-3b', topicId: 'ug-primary-cape-p7-3', name: 'Mixed media art projects', order: 2 },
    ]},
  { id: 'ug-primary-cape-p7-4', subjectId: 'ug-pri-cape', classLevel: 'P7', name: 'Crafts and Innovation', order: 4, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p7-4a', topicId: 'ug-primary-cape-p7-4', name: 'Advanced craft projects', order: 1 },
      { id: 'cape-p7-4b', topicId: 'ug-primary-cape-p7-4', name: 'Technology and innovation', order: 2 },
    ]},
  { id: 'ug-primary-cape-p7-5', subjectId: 'ug-pri-cape', classLevel: 'P7', name: 'Physical Education (Sports)', order: 5, levelGroup: 'Upper Primary',
    subtopics: [
      { id: 'cape-p7-5a', topicId: 'ug-primary-cape-p7-5', name: 'Inter-school athletics', order: 1 },
      { id: 'cape-p7-5b', topicId: 'ug-primary-cape-p7-5', name: 'Team sports and sportsmanship', order: 2 },
      { id: 'cape-p7-5c', topicId: 'ug-primary-cape-p7-5', name: 'Physical fitness and health', order: 3 },
    ]},
];

// ─────────────────────────────────────────
// COMBINED CONTENT SUBJECTS
// ─────────────────────────────────────────
export const ugandaPrimaryContentSubjects: ContentSubject[] = [
  {
    id: 'ug-pri-eng', name: 'English', country: 'uganda', level: 'Primary',
    classLevels: ['P4', 'P5', 'P6', 'P7'], category: 'Core', active: true,
    topics: englishTopics,
  },
  {
    id: 'ug-pri-math', name: 'Mathematics', country: 'uganda', level: 'Primary',
    classLevels: ['P4', 'P5', 'P6', 'P7'], category: 'Core', active: true,
    topics: mathTopics,
  },
  {
    id: 'ug-pri-sst', name: 'Social Studies', country: 'uganda', level: 'Primary',
    classLevels: ['P4', 'P5', 'P6', 'P7'], category: 'Core', active: true,
    topics: sstTopics,
  },
  {
    id: 'ug-pri-sci', name: 'Integrated Science', country: 'uganda', level: 'Primary',
    classLevels: ['P4', 'P5', 'P6', 'P7'], category: 'Core', active: true,
    topics: sciTopics,
  },
  {
    id: 'ug-pri-re', name: 'Religious Education', country: 'uganda', level: 'Primary',
    classLevels: ['P4', 'P5', 'P6', 'P7'], category: 'Core', active: true,
    topics: reTopics,
  },
  {
    id: 'ug-pri-ll', name: 'Local Language', country: 'uganda', level: 'Primary',
    classLevels: ['P4', 'P5', 'P6', 'P7'], category: 'Core', active: true,
    topics: llTopics,
  },
  {
    id: 'ug-pri-cape', name: 'Creative Arts and Physical Education', country: 'uganda', level: 'Primary',
    classLevels: ['P4', 'P5', 'P6', 'P7'], category: 'Core', active: true,
    topics: capeTopics,
  },
];

/**
 * Get topics for a specific subject and class level.
 */
export const getPrimaryTopics = (subjectId: string, classLevel: string): ContentTopic[] => {
  const subject = ugandaPrimaryContentSubjects.find(s => s.id === subjectId);
  if (!subject?.topics) return [];
  return subject.topics.filter(t => t.classLevel === classLevel);
};

/**
 * Get all primary content subjects.
 */
export const getAllPrimarySubjects = () => ugandaPrimaryContentSubjects;

/**
 * Get subjects available for a specific primary class level.
 */
export const getPrimarySubjectsForClass = (classLevel: string): ContentSubject[] => {
  return ugandaPrimaryContentSubjects.filter(s => s.classLevels.includes(classLevel));
};

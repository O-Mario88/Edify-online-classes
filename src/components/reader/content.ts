import type { SubjectContent, ResourceContent } from './types';

/* ──────────────────────────────────────────────────────────────────────
   MATHEMATICS — Quadratic Equations Notes
   Designed to render the exact reference page. The rest of the chapter
   tree is populated so the left sidebar shows realistic structure.
   ──────────────────────────────────────────────────────────────────── */
const MATH_QUADRATICS_NOTES: ResourceContent = {
  id: 'math-quad-notes',
  title: 'Quadratic Equations',
  type: 'note',
  subject: 'mathematics',
  subjectLabel: 'Mathematics',
  classLevel: 'Secondary Year 10',
  stage: 'secondary',
  chapterId: 'quadratic-equations',
  chapterNum: 2,
  chapterTitle: 'Quadratic Equations',
  topicId: 'quadratic-equations-notes',
  topicTitle: 'Quadratic Equations Notes',
  estimatedReadingMinutes: 18,
  totalPages: 26,
  currentPage: 12,
  progressPercent: 46,
  motivationalMessage: "You're making great progress!",
  blocks: [
    { type: 'heading', content: 'Quadratic Equations', level: 1 },
    {
      type: 'paragraph',
      content: 'A quadratic equation is any equation that can be written in the form',
    },
    { type: 'formula', tex: 'ax^2 + bx + c = 0', display: 'block' },
    {
      type: 'paragraph',
      content:
        'where a, b, and c are real numbers and a ≠ 0. The values of x that satisfy the equation are called the roots or solutions of the equation.',
      emphasis: [
        { word: 'roots', tone: 'copper' },
        { word: 'solutions', tone: 'copper' },
      ],
    },
    {
      type: 'split',
      left: [
        {
          type: 'example',
          number: 1,
          title: 'Example 1',
          question: 'Solve the quadratic equation',
          questionTex: '2x^2 + 5x - 3 = 0.',
          solutionSteps: [
            { label: 'Solution:' },
            { text: 'Using the quadratic formula', tex: 'x = (-b ± sqrt(b^2 - 4ac))/(2a)' },
            { text: 'Here,', tex: 'a = 2, b = 5, c = -3' },
            { tex: 'x = (-5 ± sqrt(5^2 - 4(2)(-3)))/(2(2)) = (-5 ± sqrt(25 + 24))/(4) = (-5 ± 7)/(4)' },
            { tex: 'x = (-5 + 7)/(4) = (2)/(4) = (1)/(2)   or   x = (-5 - 7)/(4) = (-12)/(4) = -3' },
          ],
          finalAnswer: 'Therefore, the solutions are x = 1/2 and x = -3.',
        },
      ],
      right: [
        { type: 'heading', content: 'Graph of a Quadratic Equation', level: 3 },
        {
          type: 'paragraph',
          content: 'The graph of  y = ax² + bx + c  is a parabola.',
        },
        {
          type: 'list',
          items: [
            'If a > 0, the parabola opens upward.',
            'If a < 0, the parabola opens downward.',
          ],
        },
        { type: 'diagram', svgKey: 'parabola', caption: 'The points where the parabola crosses the x-axis are the real roots of the equation.' },
      ],
    },
    {
      type: 'key_points',
      title: 'Key Points',
      columns: [
        {
          title: 'Standard form:',
          icon: 'check',
          items: [{ tex: 'ax^2 + bx + c = 0,', body: 'where a ≠ 0' }],
        },
        {
          title: 'Discriminant:',
          icon: 'discriminant',
          items: [{ tex: 'Δ = b^2 - 4ac', body: 'determines the nature of the roots.' }],
        },
        {
          title: 'Two distinct real roots:',
          icon: 'roots',
          items: [
            { tex: 'Δ > 0' },
            { label: 'One real root:', tex: 'Δ = 0' },
            { label: 'No real roots:', tex: 'Δ < 0' },
          ],
        },
        {
          title: 'Common methods of solving:',
          icon: 'method',
          items: [
            { body: 'Factorisation' },
            { body: 'Completing the Square' },
            { body: 'Quadratic Formula' },
          ],
        },
      ],
    },
  ],
  quickReference: {
    title: 'Quick Key Formulas',
    items: [
      { label: 'Standard Form', value: 'ax^2 + bx + c = 0, a ≠ 0', kind: 'formula' },
      { label: 'Quadratic Formula', value: 'x = (-b ± sqrt(b^2 - 4ac))/(2a)', kind: 'formula' },
      { label: 'Discriminant', value: 'Δ = b^2 - 4ac', kind: 'formula' },
      { label: 'Sum of Roots', value: 'x_1 + x_2 = -b/a', kind: 'formula' },
      { label: 'Product of Roots', value: 'x_1 x_2 = c/a', kind: 'formula' },
    ],
  },
  relatedResources: [
    { id: 'r1', title: 'Practice Questions',      meta: '20 questions', kind: 'practice' },
    { id: 'r2', title: 'Worked Examples',         meta: '15 examples',  kind: 'examples' },
    { id: 'r3', title: 'Video Lesson',            meta: '18 min',       kind: 'video' },
  ],
};

/* ──────────────────────────────────────────────────────────────────────
   BIOLOGY — Cell Structure
   ──────────────────────────────────────────────────────────────────── */
const BIO_CELL_STRUCTURE: ResourceContent = {
  id: 'bio-cell-structure',
  title: 'Cell Structure & Function',
  type: 'note',
  subject: 'biology',
  subjectLabel: 'Biology',
  classLevel: 'Secondary Year 9',
  stage: 'secondary',
  chapterId: 'cell-biology',
  chapterNum: 1,
  chapterTitle: 'Cell Biology',
  topicId: 'cell-structure',
  topicTitle: 'Cell Structure & Function',
  estimatedReadingMinutes: 14,
  totalPages: 18,
  currentPage: 6,
  progressPercent: 33,
  motivationalMessage: 'Steady reading — keep it up.',
  blocks: [
    { type: 'heading', content: 'Cell Structure & Function', level: 1 },
    {
      type: 'paragraph',
      content:
        'Cells are the smallest units of life. Every living organism is built from one or many cells, each carrying out the processes that keep the organism alive.',
    },
    {
      type: 'definition',
      term: 'Cell',
      body: 'The basic structural and functional unit of all living organisms.',
    },
    {
      type: 'split',
      left: [
        { type: 'heading', content: 'Animal Cell Components', level: 3 },
        {
          type: 'list',
          items: [
            'Nucleus — controls cell activity and contains DNA.',
            'Cytoplasm — site of most chemical reactions.',
            'Cell membrane — controls movement of substances in and out.',
            'Mitochondria — release energy through respiration.',
            'Ribosomes — synthesise proteins.',
          ],
        },
      ],
      right: [
        { type: 'diagram', svgKey: 'animal-cell', caption: 'Generalised animal cell with major organelles labelled.' },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Quick check',
      body: 'Plant cells have all the structures of animal cells plus a cell wall, chloroplasts, and a permanent vacuole.',
    },
    {
      type: 'key_points',
      title: 'Key Points',
      columns: [
        { title: 'All cells contain:', icon: 'check', items: [{ body: 'Genetic material (DNA)' }, { body: 'Cytoplasm' }, { body: 'A cell membrane' }] },
        { title: 'Plant-only structures:', icon: 'note', items: [{ body: 'Cell wall' }, { body: 'Chloroplasts' }, { body: 'Permanent vacuole' }] },
        { title: 'Energy:', icon: 'method', items: [{ body: 'Respiration in mitochondria' }, { body: 'Photosynthesis in chloroplasts' }] },
        { title: 'Tools:', icon: 'roots', items: [{ body: 'Light microscope' }, { body: 'Electron microscope' }, { body: 'Cell staining' }] },
      ],
    },
  ],
  quickReference: {
    title: 'Quick Key Terms',
    items: [
      { label: 'Nucleus',     value: 'Controls cell activity, holds DNA',      kind: 'keyword' },
      { label: 'Mitochondria', value: 'Site of aerobic respiration',           kind: 'keyword' },
      { label: 'Chloroplast', value: 'Photosynthesis in plant cells',          kind: 'keyword' },
      { label: 'Ribosome',    value: 'Protein synthesis',                      kind: 'keyword' },
      { label: 'Vacuole',     value: 'Stores cell sap, supports plant cells',  kind: 'keyword' },
    ],
  },
  relatedResources: [
    { id: 'b1', title: 'Labelled Diagram Pack', meta: '12 diagrams', kind: 'examples' },
    { id: 'b2', title: 'Practice Questions',    meta: '24 questions', kind: 'practice' },
    { id: 'b3', title: 'Microscopy Lab',        meta: '40 min',       kind: 'lab' },
  ],
};

/* ──────────────────────────────────────────────────────────────────────
   HISTORY — Origins of the Cold War
   ──────────────────────────────────────────────────────────────────── */
const HIST_COLD_WAR: ResourceContent = {
  id: 'hist-cold-war',
  title: 'Origins of the Cold War',
  type: 'note',
  subject: 'history',
  subjectLabel: 'History',
  classLevel: 'Secondary Year 11',
  stage: 'secondary',
  chapterId: 'twentieth-century',
  chapterNum: 4,
  chapterTitle: 'The Twentieth Century',
  topicId: 'cold-war-origins',
  topicTitle: 'Origins of the Cold War',
  estimatedReadingMinutes: 22,
  totalPages: 24,
  currentPage: 9,
  progressPercent: 38,
  blocks: [
    { type: 'heading', content: 'Origins of the Cold War', level: 1 },
    {
      type: 'paragraph',
      content:
        'The Cold War emerged from the deep ideological, political, and economic differences between the United States and the Soviet Union following the Second World War.',
    },
    {
      type: 'timeline',
      events: [
        { date: '1945', title: 'Yalta Conference', body: 'Allied leaders meet to plan post-war Europe and a divided Germany.' },
        { date: '1947', title: 'Truman Doctrine',  body: 'United States pledges support to nations resisting communism.' },
        { date: '1948', title: 'Berlin Blockade',  body: 'Soviet forces blockade West Berlin; Allies respond with the Berlin Airlift.' },
        { date: '1949', title: 'NATO formed',      body: 'Western nations form a collective defence alliance.' },
        { date: '1955', title: 'Warsaw Pact',      body: 'Eastern bloc nations form a counter-alliance.' },
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Source extract — Churchill, 1946',
      body: '"From Stettin in the Baltic to Trieste in the Adriatic, an iron curtain has descended across the Continent."',
    },
    {
      type: 'key_points',
      title: 'Key Points',
      columns: [
        { title: 'Causes', icon: 'check', items: [{ body: 'Ideological clash — capitalism vs communism' }, { body: 'Mutual mistrust at Yalta and Potsdam' }, { body: 'Atomic monopoly and arms race' }] },
        { title: 'Consequences', icon: 'note', items: [{ body: 'Division of Europe' }, { body: 'Proxy wars across Asia and Africa' }, { body: 'Decades-long arms build-up' }] },
        { title: 'Key Figures', icon: 'roots', items: [{ body: 'Truman' }, { body: 'Stalin' }, { body: 'Churchill' }, { body: 'Marshall' }] },
        { title: 'Sources', icon: 'method', items: [{ body: 'Iron Curtain Speech' }, { body: 'Truman Doctrine' }, { body: 'Marshall Plan' }] },
      ],
    },
  ],
  quickReference: {
    title: 'Key Dates',
    items: [
      { label: '1945', value: 'Yalta Conference',  kind: 'date' },
      { label: '1947', value: 'Truman Doctrine',   kind: 'date' },
      { label: '1948', value: 'Berlin Blockade',   kind: 'date' },
      { label: '1949', value: 'NATO formed',       kind: 'date' },
      { label: '1955', value: 'Warsaw Pact',       kind: 'date' },
    ],
  },
  relatedResources: [
    { id: 'h1', title: 'Source Pack — Cold War', meta: '14 sources', kind: 'past_paper' },
    { id: 'h2', title: 'Essay Plans',            meta: '8 plans',    kind: 'examples' },
    { id: 'h3', title: 'Documentary Clip',       meta: '9 min',      kind: 'video' },
  ],
};

/* ──────────────────────────────────────────────────────────────────────
   ENGLISH — Persuasive Writing
   ──────────────────────────────────────────────────────────────────── */
const ENG_PERSUASIVE: ResourceContent = {
  id: 'eng-persuasive',
  title: 'Persuasive Writing',
  type: 'note',
  subject: 'english',
  subjectLabel: 'English Language',
  classLevel: 'Secondary Year 9',
  stage: 'secondary',
  chapterId: 'writing-skills',
  chapterNum: 3,
  chapterTitle: 'Writing Skills',
  topicId: 'persuasive-writing',
  topicTitle: 'Persuasive Writing',
  estimatedReadingMinutes: 16,
  totalPages: 20,
  currentPage: 5,
  progressPercent: 25,
  blocks: [
    { type: 'heading', content: 'Persuasive Writing', level: 1 },
    {
      type: 'paragraph',
      content:
        'Persuasive writing aims to convince the reader of a particular point of view. Strong persuasive pieces are clear, well-structured, and use deliberate rhetorical techniques.',
    },
    {
      type: 'definition',
      term: 'Rhetoric',
      body: 'The art of using language effectively and persuasively.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Grammar focus — modal verbs for emphasis',
      body: 'Use must, should, ought to, and need to to strengthen claims. "We must act now" carries more weight than "We could act now".',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'State your position clearly in the opening paragraph.',
        'Support each claim with evidence — facts, statistics, or anecdotes.',
        'Address counter-arguments fairly, then refute them.',
        'Use rhetorical devices — tripling, repetition, rhetorical questions.',
        'Close with a memorable call to action.',
      ],
    },
    {
      type: 'quote',
      text: '"It always seems impossible until it\'s done."',
      attribution: 'Nelson Mandela',
    },
    {
      type: 'key_points',
      title: 'Key Points',
      columns: [
        { title: 'Structure', icon: 'check', items: [{ body: 'Clear thesis' }, { body: 'Evidence per paragraph' }, { body: 'Strong conclusion' }] },
        { title: 'Devices',   icon: 'note',  items: [{ body: 'Rhetorical questions' }, { body: 'Tripling' }, { body: 'Anaphora' }, { body: 'Direct address' }] },
        { title: 'Tone',      icon: 'method', items: [{ body: 'Confident' }, { body: 'Respectful' }, { body: 'Engaged' }] },
        { title: 'Avoid',     icon: 'warn',  items: [{ body: 'Logical fallacies' }, { body: 'Unsupported claims' }, { body: 'Aggressive language' }] },
      ],
    },
  ],
  quickReference: {
    title: 'Rhetorical Devices',
    items: [
      { label: 'Anaphora',           value: 'Repetition at the start of clauses', kind: 'rule' },
      { label: 'Tripling',            value: 'Three parallel ideas for impact',     kind: 'rule' },
      { label: 'Rhetorical Question', value: 'Engages the reader directly',         kind: 'rule' },
      { label: 'Hyperbole',           value: 'Deliberate exaggeration',             kind: 'rule' },
      { label: 'Direct Address',      value: 'Speaking to "you" — the reader',      kind: 'rule' },
    ],
  },
  relatedResources: [
    { id: 'e1', title: 'Model Essays',        meta: '6 essays',     kind: 'examples' },
    { id: 'e2', title: 'Past Paper — Q3',      meta: '2023 paper',   kind: 'past_paper' },
    { id: 'e3', title: 'Grammar Mind Map',    meta: '1-page summary', kind: 'mind_map' },
  ],
};

/* ──────────────────────────────────────────────────────────────────────
   SUBJECT REGISTRY
   ──────────────────────────────────────────────────────────────────── */
export const CONTENT_REGISTRY: Record<string, SubjectContent> = {
  mathematics: {
    subject: 'mathematics',
    subjectLabel: 'Mathematics',
    level: 'Secondary Year 10',
    stage: 'secondary',
    chapters: [
      { id: 'number-and-algebra', num: 1, title: 'Number and Algebra', topics: [
        { id: 'integers-and-rationals', title: 'Integers and Rationals', pages: 12 },
        { id: 'algebraic-expressions', title: 'Algebraic Expressions', pages: 14 },
        { id: 'indices-and-surds', title: 'Indices and Surds', pages: 10 },
      ]},
      { id: 'quadratic-equations', num: 2, title: 'Quadratic Equations', topics: [
        { id: 'overview', title: 'Overview', pages: 6 },
        { id: 'quadratic-equations-notes', title: 'Quadratic Equations Notes', pages: 26 },
        { id: 'solving-by-factorisation', title: 'Solving by Factorisation', pages: 14 },
        { id: 'completing-the-square', title: 'Completing the Square', pages: 12 },
        { id: 'quadratic-formula', title: 'Quadratic Formula', pages: 10 },
        { id: 'discriminant', title: 'Discriminant', pages: 8 },
      ]},
      { id: 'factorisation', num: 3, title: 'Factorisation', topics: [
        { id: 'common-factors', title: 'Common Factors', pages: 8 },
        { id: 'grouping', title: 'Grouping', pages: 6 },
      ]},
      { id: 'graphs', num: 4, title: 'Graphs', topics: [
        { id: 'linear-graphs', title: 'Linear Graphs', pages: 8 },
        { id: 'quadratic-graphs', title: 'Quadratic Graphs', pages: 10 },
      ]},
      { id: 'simultaneous-equations', num: 5, title: 'Simultaneous Equations' },
      { id: 'trigonometry', num: 6, title: 'Trigonometry' },
    ],
    resources: {
      'quadratic-equations/quadratic-equations-notes': MATH_QUADRATICS_NOTES,
    },
  },

  biology: {
    subject: 'biology',
    subjectLabel: 'Biology',
    level: 'Secondary Year 9',
    stage: 'secondary',
    chapters: [
      { id: 'cell-biology', num: 1, title: 'Cell Biology', topics: [
        { id: 'cell-structure', title: 'Cell Structure & Function', pages: 18 },
        { id: 'cell-transport', title: 'Cell Transport', pages: 12 },
        { id: 'mitosis', title: 'Mitosis', pages: 10 },
      ]},
      { id: 'organisation', num: 2, title: 'Organisation' },
      { id: 'infection-and-response', num: 3, title: 'Infection and Response' },
      { id: 'bioenergetics', num: 4, title: 'Bioenergetics' },
    ],
    resources: {
      'cell-biology/cell-structure': BIO_CELL_STRUCTURE,
    },
  },

  history: {
    subject: 'history',
    subjectLabel: 'History',
    level: 'Secondary Year 11',
    stage: 'secondary',
    chapters: [
      { id: 'world-war-one', num: 1, title: 'World War I' },
      { id: 'interwar-period', num: 2, title: 'The Interwar Period' },
      { id: 'world-war-two', num: 3, title: 'World War II' },
      { id: 'twentieth-century', num: 4, title: 'The Twentieth Century', topics: [
        { id: 'cold-war-origins', title: 'Origins of the Cold War', pages: 24 },
        { id: 'cuban-missile-crisis', title: 'Cuban Missile Crisis', pages: 14 },
        { id: 'end-of-cold-war', title: 'End of the Cold War', pages: 16 },
      ]},
    ],
    resources: {
      'twentieth-century/cold-war-origins': HIST_COLD_WAR,
    },
  },

  english: {
    subject: 'english',
    subjectLabel: 'English Language',
    level: 'Secondary Year 9',
    stage: 'secondary',
    chapters: [
      { id: 'reading-skills', num: 1, title: 'Reading Skills' },
      { id: 'language-techniques', num: 2, title: 'Language Techniques' },
      { id: 'writing-skills', num: 3, title: 'Writing Skills', topics: [
        { id: 'descriptive-writing', title: 'Descriptive Writing', pages: 16 },
        { id: 'persuasive-writing', title: 'Persuasive Writing', pages: 20 },
        { id: 'narrative-writing', title: 'Narrative Writing', pages: 18 },
      ]},
      { id: 'speaking-and-listening', num: 4, title: 'Speaking & Listening' },
    ],
    resources: {
      'writing-skills/persuasive-writing': ENG_PERSUASIVE,
    },
  },
};

/** First subject — used as default when no slug is supplied. */
export const DEFAULT_SUBJECT = 'mathematics';

/** Resolve a resource from URL params; falls back gracefully. */
export function resolveResource(
  subjectSlug?: string,
  chapterSlug?: string,
  topicSlug?: string,
): { subject: SubjectContent; resource: ResourceContent | null } {
  const subject = CONTENT_REGISTRY[subjectSlug || DEFAULT_SUBJECT] ?? CONTENT_REGISTRY[DEFAULT_SUBJECT];
  if (!chapterSlug || !topicSlug) {
    // Default to the first registered resource of this subject.
    const firstKey = Object.keys(subject.resources)[0];
    return { subject, resource: firstKey ? subject.resources[firstKey] : null };
  }
  const key = `${chapterSlug}/${topicSlug}`;
  const direct = subject.resources[key];
  if (direct) return { subject, resource: direct };
  // Fallback to the first resource so the page still renders something
  // with the right chapter tree on the side.
  const firstKey = Object.keys(subject.resources)[0];
  return { subject, resource: firstKey ? subject.resources[firstKey] : null };
}

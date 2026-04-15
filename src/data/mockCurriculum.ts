/**
 * Mock Uganda Curriculum Data
 * Aligned to NCDC Lower Secondary Curriculum Framework (2019).
 *
 * S1-S2: 11 Compulsory + 1 Elective per the NCDC menu
 *   Compulsory: English, Mathematics, Physics, Biology, Chemistry,
 *     Geography, History & Political Education, Kiswahili,
 *     Religious Education, Physical Education, Entrepreneurship
 *   Elective (default): Agriculture
 *
 * S3-S4: 7 Compulsory + 2 Electives per the NCDC menu
 *   Compulsory: English, Mathematics, Physics, Biology, Chemistry,
 *     Geography, History & Political Education
 *   Electives: Entrepreneurship, Agriculture
 *
 * S5-S6: A-level (principal + subsidiary subjects)
 */

import { UgandaClass, UgandaLevel } from '../types';

/* ══════════════════════ HELPERS ══════════════════════ */

/** Generate standard lessons for a subtopic */
function makeLessons(prefix: string, subtopicName: string) {
  return [
    { id: `${prefix}-vid`, title: `${subtopicName} — Video Lesson`, type: 'video' as const, duration: '15 Min', completed: false },
    { id: `${prefix}-notes`, title: `${subtopicName} — Study Notes`, type: 'notes' as const, duration: '10 Min', completed: false },
    { id: `${prefix}-ex`, title: `${subtopicName} — Practice Exercise`, type: 'exercise' as const, duration: '20 Min', questions: 10, completed: false },
    { id: `${prefix}-proj`, title: `${subtopicName} — Project Activity`, type: 'exercise' as const, duration: '30 Min', questions: 5, completed: false },
  ];
}

/** Build a topic with auto-generated subtopics + lessons */
function t(id: string, name: string, description: string, subs: string[]) {
  return {
    id,
    name,
    description,
    subtopics: subs.map((subName, i) => ({
      id: `${id}-sub${i + 1}`,
      name: subName,
      lessons: makeLessons(`${id}-sub${i + 1}`, subName),
    })),
  };
}

/** Shorthand for building a subject */
function subj(
  id: string, name: string, desc: string,
  cat: 'compulsory' | 'principal' | 'subsidiary',
  stype: 'sciences' | 'humanities' | 'languages' | 'technical' | 'arts',
  tid: string,
  topics: ReturnType<typeof t>[],
  isCore = true,
) {
  return { id, name, description: desc, category: cat, subject_type: stype, teacherId: tid, isCore, topics };
}

/* ══════════════════════ S1 — SENIOR ONE ══════════════════════ */

const seniorOne: UgandaClass = {
  id: 's1', name: 'Senior 1', level: "O'level",
  description: 'Foundation year — 11 compulsory subjects plus one elective, aligned to the NCDC Lower Secondary Curriculum',
  price: 0, priceUGX: 0,
  terms: [
    /* ── TERM 1 ── */
    {
      id: 's1-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('s1-eng', 'English Language', 'Official language and medium of instruction', 'compulsory', 'languages', 't2', [
          t('s1-eng-1', 'Comprehension Skills', 'Reading and understanding passages', ['Identifying Main Ideas', 'Making Inferences', 'Vocabulary in Context']),
          t('s1-eng-2', 'Creative Writing', 'Narrative and descriptive composition', ['Story Structure', 'Descriptive Paragraphs', 'Writing Practice']),
          t('s1-eng-3', 'Grammar Foundations', 'Parts of speech and sentence construction', ['Nouns, Verbs & Adjectives', 'Tense Usage', 'Sentence Types']),
        ]),
        subj('s1-math', 'Mathematics', 'Fundamental to national prosperity — critical thinking and problem solving', 'compulsory', 'sciences', 't1', [
          t('s1-math-1', 'Number Bases', 'Binary, octal, and base conversions', ['Place Value in Different Bases', 'Converting Between Bases', 'Arithmetic in Bases']),
          t('s1-math-2', 'Working with Integers', 'Operations, order, and number line', ['Number Line & Ordering', 'Addition & Subtraction', 'Multiplication & Division']),
          t('s1-math-3', 'Fractions, Percentages & Decimals', 'Computing with fractions and percentages', ['Equivalent Fractions', 'Operations with Fractions', 'Percentage Calculations']),
          t('s1-math-4', 'Algebraic Expressions', 'Simplification and substitution', ['Like & Unlike Terms', 'Simplification', 'Substitution & Evaluation']),
        ]),
        subj('s1-phy', 'Physics', 'Understanding the natural world through scientific inquiry', 'compulsory', 'sciences', 't3', [
          t('s1-phy-1', 'Introduction to Physics', 'Scientific method and measurements', ['What is Physics?', 'Scientific Method', 'Laboratory Safety']),
          t('s1-phy-2', 'Measurement & Units', 'SI units, estimation, and errors', ['SI Base Units', 'Measuring Instruments', 'Estimation & Errors']),
          t('s1-phy-3', 'States of Matter', 'Solids, liquids, gases and kinetic theory', ['Properties of States', 'Kinetic Theory', 'Changes of State']),
        ]),
        subj('s1-bio', 'Biology', 'Understanding living systems for health and environment', 'compulsory', 'sciences', 't4', [
          t('s1-bio-1', 'Introduction to Biology', 'Characteristics of living things', ['What is Biology?', 'Characteristics of Life', 'Branches of Biology']),
          t('s1-bio-2', 'Cell Structure & Organisation', 'Plant and animal cells', ['Cell Structure', 'Plant vs Animal Cells', 'Cell Organisation']),
          t('s1-bio-3', 'Classification of Living Things', 'Kingdoms and taxonomy', ['Need for Classification', 'The Five Kingdoms', 'Dichotomous Keys']),
        ]),
        subj('s1-chem', 'Chemistry', 'Understanding the properties and transformations of matter', 'compulsory', 'sciences', 't5', [
          t('s1-chem-1', 'Introduction to Chemistry', 'What is chemistry and lab safety', ['Chemistry in Daily Life', 'Laboratory Apparatus', 'Safety Rules']),
          t('s1-chem-2', 'States of Matter', 'Properties and changes of state', ['Particle Theory', 'Melting & Boiling', 'Heating & Cooling Curves']),
          t('s1-chem-3', 'Mixtures & Separation', 'Filtration, distillation, chromatography', ['Types of Mixtures', 'Physical Separation Methods', 'Chromatography']),
        ]),
        subj('s1-geo', 'Geography', 'Understanding our environment and sustainable development', 'compulsory', 'humanities', 't6', [
          t('s1-geo-1', 'Map Work & Scale', 'Reading topographic maps', ['Types of Maps', 'Scale & Distance', 'Grid References']),
          t('s1-geo-2', 'Weather & Climate', 'Elements and instruments', ['Weather Elements', 'Weather Instruments', 'Recording Weather Data']),
        ]),
        subj('s1-hist', 'History & Political Education', 'Critical thinking about the past and governance', 'compulsory', 'humanities', 't7', [
          t('s1-hist-1', 'Pre-Colonial East Africa', 'Societies before colonialism', ['Early Communities', 'Social Organisation', 'Economic Activities']),
          t('s1-hist-2', 'Early Civilisations', 'Egypt, Mesopotamia and Great Zimbabwe', ['Egyptian Civilisation', 'Mesopotamia', 'Great Zimbabwe']),
        ]),
        subj('s1-kisw', 'Kiswahili', 'East African integration language', 'compulsory', 'languages', 't9', [
          t('s1-kisw-1', 'Utangulizi wa Kiswahili', 'Introduction to Kiswahili language', ['Greetings & Self-Introduction', 'Basic Vocabulary', 'Simple Sentences']),
          t('s1-kisw-2', 'Sarufi — Grammar Basics', 'Noun classes and verb forms', ['Noun Classes', 'Present Tense', 'Simple Conversations']),
        ]),
        subj('s1-re', 'Religious Education', 'Moral values and ethical living', 'compulsory', 'humanities', 't10', [
          t('s1-re-1', 'Creation & Human Dignity', 'Understanding creation and purpose', ['The Creation Story', 'Human Dignity', 'Stewardship']),
          t('s1-re-2', 'Living in Community', 'Family, respect and responsibility', ['Family Values', 'Respect for Others', 'Community Service']),
        ]),
        subj('s1-pe', 'Physical Education', 'Health, fitness and sports skills', 'compulsory', 'arts', 't11', [
          t('s1-pe-1', 'Fitness & Health', 'Components of physical fitness', ['Warm-Up Routines', 'Fitness Components', 'Healthy Living']),
          t('s1-pe-2', 'Athletics', 'Track and field events', ['Sprints & Relays', 'Long Jump', 'Shot Put']),
        ]),
        subj('s1-ent', 'Entrepreneurship', 'Innovation, creativity and wealth creation', 'compulsory', 'technical', 't12', [
          t('s1-ent-1', 'Understanding Business', 'What is entrepreneurship?', ['Definition & Importance', 'Qualities of an Entrepreneur', 'Types of Businesses']),
          t('s1-ent-2', 'Needs & Wants', 'Identifying opportunities from needs', ['Needs vs Wants', 'Business Opportunities', 'Problem Solving']),
        ]),
        // 1 Elective — Agriculture
        subj('s1-agri', 'Agriculture', 'Modern farming skills for self-employment', 'compulsory', 'technical', 't13', [
          t('s1-agri-1', 'Introduction to Agriculture', 'Importance of agriculture in Uganda', ['Role of Agriculture', 'Types of Farming', 'Farm Tools']),
          t('s1-agri-2', 'Soil Science', 'Soil formation, types, and conservation', ['Soil Formation', 'Soil Types', 'Soil Conservation']),
        ], false),
      ],
    },
    /* ── TERM 2 ── */
    {
      id: 's1-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('s1-eng-t2', 'English Language', 'Official language and medium of instruction', 'compulsory', 'languages', 't2', [
          t('s1-eng-4', 'Formal & Informal Letters', 'Letter writing conventions', ['Letter Layout', 'Formal Letters', 'Informal Letters']),
          t('s1-eng-5', 'Oral Communication', 'Speech and listening skills', ['Public Speaking', 'Listening Skills', 'Group Discussion']),
          t('s1-eng-6', 'Vocabulary Building', 'Word formation and synonyms', ['Prefixes & Suffixes', 'Synonyms & Antonyms', 'Context Clues']),
        ]),
        subj('s1-math-t2', 'Mathematics', 'Fundamental to national prosperity', 'compulsory', 'sciences', 't1', [
          t('s1-math-5', 'Linear Equations', 'Solving and graphing linear equations', ['Forming Equations', 'Solving Equations', 'Word Problems']),
          t('s1-math-6', 'Coordinates & Graphs', 'Cartesian plane and plotting', ['The Cartesian Plane', 'Plotting Points', 'Straight Line Graphs']),
          t('s1-math-7', 'Geometry — Angles & Lines', 'Types of angles and properties', ['Types of Angles', 'Angles on Lines', 'Angles in Triangles']),
        ]),
        subj('s1-phy-t2', 'Physics', 'Understanding the natural world', 'compulsory', 'sciences', 't3', [
          t('s1-phy-4', 'Force & Motion', "Newton's laws of motion", ['Types of Forces', "Newton's First Law", 'Speed & Velocity']),
          t('s1-phy-5', 'Pressure', 'Pressure in solids, liquids and gases', ['Pressure in Solids', 'Liquid Pressure', 'Atmospheric Pressure']),
        ]),
        subj('s1-bio-t2', 'Biology', 'Understanding living systems', 'compulsory', 'sciences', 't4', [
          t('s1-bio-4', 'Nutrition in Plants', 'Photosynthesis and mineral nutrition', ['Photosynthesis Process', 'Factors Affecting Photosynthesis', 'Mineral Nutrition']),
          t('s1-bio-5', 'Nutrition in Animals', 'Digestive system and enzymes', ['Food Groups', 'Digestive System', 'Enzymes & Digestion']),
        ]),
        subj('s1-chem-t2', 'Chemistry', 'Understanding matter transformations', 'compulsory', 'sciences', 't5', [
          t('s1-chem-4', 'Atomic Structure', 'Atoms, elements, and compounds', ['The Atom', 'Atomic Number & Mass', 'Elements vs Compounds']),
          t('s1-chem-5', 'Chemical Bonding', 'Ionic, covalent, and metallic bonds', ['Ionic Bonding', 'Covalent Bonding', 'Metallic Bonding']),
        ]),
        subj('s1-geo-t2', 'Geography', 'Understanding our environment', 'compulsory', 'humanities', 't6', [
          t('s1-geo-3', 'Physical Features of East Africa', 'Mountains, rift valleys & lakes', ['Rift Valley Formation', 'Mountains of East Africa', 'Lakes & Rivers']),
          t('s1-geo-4', 'Soils', 'Soil formation, types, and conservation', ['Soil Formation Process', 'Soil Profiles', 'Soil Conservation Methods']),
        ]),
        subj('s1-hist-t2', 'History & Political Education', 'Critical thinking about the past', 'compulsory', 'humanities', 't7', [
          t('s1-hist-3', 'Long-Distance Trade', 'Indian Ocean trade routes', ['Trade Routes', 'Goods Traded', 'Impact on Societies']),
          t('s1-hist-4', 'Early Kingdoms', 'Buganda, Bunyoro and other kingdoms', ['Kingdom of Buganda', 'Bunyoro-Kitara', 'Ankole & Toro']),
        ]),
        subj('s1-kisw-t2', 'Kiswahili', 'East African integration language', 'compulsory', 'languages', 't9', [
          t('s1-kisw-3', 'Kusoma — Reading', 'Reading Kiswahili texts', ['Simple Stories', 'Comprehension Practice', 'Vocabulary Expansion']),
        ]),
        subj('s1-re-t2', 'Religious Education', 'Moral values', 'compulsory', 'humanities', 't10', [
          t('s1-re-3', 'The Ten Commandments', 'Moral law and daily life', ['The Commandments', 'Application to Life', 'Moral Decision Making']),
        ]),
        subj('s1-pe-t2', 'Physical Education', 'Health and sports', 'compulsory', 'arts', 't11', [
          t('s1-pe-3', 'Ball Games', 'Football, netball and volleyball', ['Football Skills', 'Netball Skills', 'Volleyball Skills']),
        ]),
        subj('s1-ent-t2', 'Entrepreneurship', 'Innovation and wealth creation', 'compulsory', 'technical', 't12', [
          t('s1-ent-3', 'Generating Business Ideas', 'Creativity and opportunity identification', ['Brainstorming Techniques', 'Market Opportunities', 'Idea Evaluation']),
        ]),
        subj('s1-agri-t2', 'Agriculture', 'Modern farming skills', 'compulsory', 'technical', 't13', [
          t('s1-agri-3', 'Crop Production', 'Planting and crop management', ['Land Preparation', 'Planting Methods', 'Crop Care']),
        ], false),
      ],
    },
    /* ── TERM 3 ── */
    {
      id: 's1-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('s1-eng-t3', 'English Language', 'Official language and medium of instruction', 'compulsory', 'languages', 't2', [
          t('s1-eng-7', 'Summary Writing', 'Summarising passages accurately', ['Identifying Key Points', 'Paraphrasing', 'Summary Practice']),
          t('s1-eng-8', 'Argumentative Writing', 'Building and defending opinions', ['Taking a Position', 'Supporting Arguments', 'Counter-Arguments']),
        ]),
        subj('s1-math-t3', 'Mathematics', 'Fundamental to national prosperity', 'compulsory', 'sciences', 't1', [
          t('s1-math-8', 'Triangles & Congruence', 'Properties and proofs', ['Types of Triangles', 'Congruence Conditions', 'Construction of Triangles']),
          t('s1-math-9', 'Data Collection & Presentation', 'Tables, bar graphs, pie charts', ['Data Collection Methods', 'Bar Graphs & Pie Charts', 'Interpreting Data']),
          t('s1-math-10', 'Sets', 'Venn diagrams and set notation', ['Set Notation', 'Venn Diagrams', 'Union & Intersection']),
        ]),
        subj('s1-phy-t3', 'Physics', 'Understanding the natural world', 'compulsory', 'sciences', 't3', [
          t('s1-phy-6', 'Heat Transfer', 'Conduction, convection and radiation', ['Conduction', 'Convection', 'Radiation']),
          t('s1-phy-7', 'Light — Reflection', 'Laws of reflection and mirrors', ['Rectilinear Propagation', 'Laws of Reflection', 'Plane Mirrors']),
        ]),
        subj('s1-bio-t3', 'Biology', 'Understanding living systems', 'compulsory', 'sciences', 't4', [
          t('s1-bio-6', 'Transport in Plants', 'Xylem, phloem, and transpiration', ['Xylem & Phloem', 'Transpiration', 'Water Uptake']),
          t('s1-bio-7', 'Respiration', 'Aerobic and anaerobic respiration', ['Aerobic Respiration', 'Anaerobic Respiration', 'Comparing the Two']),
        ]),
        subj('s1-chem-t3', 'Chemistry', 'Understanding matter', 'compulsory', 'sciences', 't5', [
          t('s1-chem-6', 'Chemical Equations', 'Balancing and types of reactions', ['Word Equations', 'Balanced Symbol Equations', 'Types of Reactions']),
          t('s1-chem-7', 'Acids, Bases & Indicators', 'Introduction to pH', ['Acids & Bases', 'Indicators', 'pH Scale']),
        ]),
        subj('s1-geo-t3', 'Geography', 'Understanding our environment', 'compulsory', 'humanities', 't6', [
          t('s1-geo-5', 'Vegetation of East Africa', 'Tropical forests and savannah', ['Vegetation Zones', 'Factors Affecting Vegetation', 'Conservation']),
        ]),
        subj('s1-hist-t3', 'History & Political Education', 'Understanding the past', 'compulsory', 'humanities', 't7', [
          t('s1-hist-5', 'Migration & Settlement', 'Bantu and Nilotic migrations', ['Bantu Migration', 'Nilotic Peoples', 'Effects of Migration']),
        ]),
        subj('s1-kisw-t3', 'Kiswahili', 'East African integration language', 'compulsory', 'languages', 't9', [
          t('s1-kisw-4', 'Kuandika — Writing', 'Writing in Kiswahili', ['Simple Compositions', 'Letter Writing', 'Revision']),
        ]),
        subj('s1-re-t3', 'Religious Education', 'Moral values', 'compulsory', 'humanities', 't10', [
          t('s1-re-4', 'Prayer & Worship', 'Forms and importance of prayer', ['Types of Prayer', 'Worship Practices', 'Personal Devotion']),
        ]),
        subj('s1-pe-t3', 'Physical Education', 'Health and sports', 'compulsory', 'arts', 't11', [
          t('s1-pe-4', 'Swimming & Water Safety', 'Basic swimming strokes', ['Water Safety Rules', 'Floating & Kicking', 'Basic Strokes']),
        ]),
        subj('s1-ent-t3', 'Entrepreneurship', 'Innovation and wealth creation', 'compulsory', 'technical', 't12', [
          t('s1-ent-4', 'Record Keeping', 'Basic business records', ['Why Keep Records', 'Types of Records', 'Simple Bookkeeping']),
        ]),
        subj('s1-agri-t3', 'Agriculture', 'Modern farming skills', 'compulsory', 'technical', 't13', [
          t('s1-agri-4', 'Livestock Keeping', 'Introduction to animal husbandry', ['Types of Livestock', 'Animal Housing', 'Feeding & Care']),
        ], false),
      ],
    },
  ],
};

/* ══════════════════════ S2 — SENIOR TWO ══════════════════════ */

const seniorTwo: UgandaClass = {
  id: 's2', name: 'Senior 2', level: "O'level",
  description: 'Building deeper analytical and practical skills — 11 compulsory subjects plus one elective',
  price: 0, priceUGX: 0,
  terms: [
    {
      id: 's2-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('s2-eng', 'English Language', 'Official language and medium of instruction', 'compulsory', 'languages', 't2', [
          t('s2-eng-1', 'Advanced Comprehension', 'Inference and deduction', ['Inference Skills', 'Deduction from Text', 'Critical Reading']),
          t('s2-eng-2', 'Report Writing', 'Formal report structure', ['Report Structure', 'Factual Reporting', 'Formal Language']),
          t('s2-eng-3', 'Direct & Indirect Speech', 'Speech transformation rules', ['Direct Speech Rules', 'Indirect Speech', 'Transformation Practice']),
        ]),
        subj('s2-math', 'Mathematics', 'Critical thinking and problem solving', 'compulsory', 'sciences', 't1', [
          t('s2-math-1', 'Indices & Standard Form', 'Laws of indices and scientific notation', ['Laws of Indices', 'Standard Form', 'Calculations']),
          t('s2-math-2', 'Simultaneous Equations', 'Substitution and elimination methods', ['Substitution Method', 'Elimination Method', 'Word Problems']),
          t('s2-math-3', 'Quadratic Expressions', 'Factorisation and expansion', ['Expansion', 'Factorisation', 'Perfect Squares']),
          t('s2-math-4', 'Inequalities', 'Linear inequalities and number lines', ['Solving Inequalities', 'Number Line Representation', 'Combined Inequalities']),
        ]),
        subj('s2-phy', 'Physics', 'Understanding the natural world', 'compulsory', 'sciences', 't3', [
          t('s2-phy-1', 'Work, Energy & Power', 'Calculations and conservation', ['Work Done', 'Types of Energy', 'Power']),
          t('s2-phy-2', 'Simple Machines', 'Levers, pulleys and efficiency', ['Levers', 'Pulleys', 'Mechanical Advantage']),
          t('s2-phy-3', 'Thermal Expansion', 'Expansion in solids, liquids and gases', ['Expansion of Solids', 'Expansion of Liquids', 'Applications']),
        ]),
        subj('s2-bio', 'Biology', 'Understanding living systems', 'compulsory', 'sciences', 't4', [
          t('s2-bio-1', 'Circulatory System', 'Heart, blood vessels and blood', ['Structure of the Heart', 'Blood Vessels', 'Blood Components']),
          t('s2-bio-2', 'Gaseous Exchange', 'Lungs and gas exchange surfaces', ['Human Breathing System', 'Gas Exchange in Lungs', 'Breathing Mechanism']),
          t('s2-bio-3', 'Reproduction in Plants', 'Pollination, fertilisation and seed dispersal', ['Flower Structure', 'Pollination', 'Seed Dispersal']),
        ]),
        subj('s2-chem', 'Chemistry', 'Understanding matter transformations', 'compulsory', 'sciences', 't5', [
          t('s2-chem-1', 'Metals & Reactivity Series', 'Extraction and properties of metals', ['Properties of Metals', 'Reactivity Series', 'Metal Extraction']),
          t('s2-chem-2', 'Air & Combustion', 'Composition of air and rusting', ['Composition of Air', 'Combustion', 'Rusting & Prevention']),
          t('s2-chem-3', 'Carbon & Its Compounds', 'Allotropes and carbon dioxide', ['Allotropes of Carbon', 'Carbon Dioxide', 'Carbon Monoxide']),
        ]),
        subj('s2-geo', 'Geography', 'Understanding our environment', 'compulsory', 'humanities', 't6', [
          t('s2-geo-1', 'Weathering & Erosion', 'Types and landscape impact', ['Physical Weathering', 'Chemical Weathering', 'Erosion Agents']),
          t('s2-geo-2', 'River Systems', 'Drainage patterns of East Africa', ['River Stages', 'Drainage Patterns', 'Flooding']),
        ]),
        subj('s2-hist', 'History & Political Education', 'Critical thinking about the past', 'compulsory', 'humanities', 't7', [
          t('s2-hist-1', 'The Scramble for Africa', 'European partition of Africa', ['Causes of the Scramble', 'Berlin Conference', 'Effects on Africa']),
          t('s2-hist-2', 'Colonial Rule in East Africa', 'British and German systems', ['Direct Rule', 'Indirect Rule', 'Colonial Economy']),
        ]),
        subj('s2-kisw', 'Kiswahili', 'East African integration language', 'compulsory', 'languages', 't9', [
          t('s2-kisw-1', 'Ufahamu — Comprehension', 'Reading comprehension in Kiswahili', ['Reading Passages', 'Answering Questions', 'Vocabulary Growth']),
        ]),
        subj('s2-re', 'Religious Education', 'Moral values and ethical living', 'compulsory', 'humanities', 't10', [
          t('s2-re-1', 'The Beatitudes', 'Christian moral teaching', ['The Beatitudes Explained', 'Application in Life', 'Service to Others']),
        ]),
        subj('s2-pe', 'Physical Education', 'Health, fitness and sports skills', 'compulsory', 'arts', 't11', [
          t('s2-pe-1', 'Gymnastics', 'Basic gymnastic skills', ['Rolls & Balances', 'Floor Routines', 'Safety']),
        ]),
        subj('s2-ent', 'Entrepreneurship', 'Innovation and wealth creation', 'compulsory', 'technical', 't12', [
          t('s2-ent-1', 'Marketing Basics', 'Understanding markets and customers', ['What is Marketing?', 'Customer Needs', 'Market Research']),
        ]),
        subj('s2-agri', 'Agriculture', 'Modern farming skills', 'compulsory', 'technical', 't13', [
          t('s2-agri-1', 'Poultry Keeping', 'Chicken rearing for food and income', ['Breeds of Poultry', 'Housing & Equipment', 'Feeding & Health']),
        ], false),
      ],
    },
    {
      id: 's2-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('s2-eng-t2', 'English Language', 'Official language and medium of instruction', 'compulsory', 'languages', 't2', [
          t('s2-eng-4', 'Expository Writing', 'Explaining concepts clearly', ['Explaining Processes', 'Cause and Effect', 'Comparison Writing']),
          t('s2-eng-5', 'Active & Passive Voice', 'Sentence transformations', ['Active Voice', 'Passive Voice', 'Transformation Practice']),
          t('s2-eng-6', 'Poetry Analysis', 'Figurative language and themes', ['Simile & Metaphor', 'Themes in Poetry', 'Critical Appreciation']),
        ]),
        subj('s2-math-t2', 'Mathematics', 'Critical thinking and problem solving', 'compulsory', 'sciences', 't1', [
          t('s2-math-5', 'Circles & Constructions', 'Circle theorems and geometric constructions', ['Parts of a Circle', 'Geometric Constructions', 'Loci']),
          t('s2-math-6', 'Ratio & Proportion', 'Direct and inverse proportion', ['Simplifying Ratios', 'Direct Proportion', 'Inverse Proportion']),
          t('s2-math-7', 'Pythagoras Theorem', 'Applications in 2D problems', ['The Theorem', 'Finding Sides', 'Real-World Applications']),
        ]),
        subj('s2-phy-t2', 'Physics', 'Understanding the natural world', 'compulsory', 'sciences', 't3', [
          t('s2-phy-4', 'Current Electricity', "Circuits, Ohm's law, and resistance", ['Electric Current', "Ohm's Law", 'Series & Parallel Circuits']),
          t('s2-phy-5', 'Electrostatics', 'Charges and electric fields', ['Static Charge', 'Charging Methods', 'Electric Fields']),
        ]),
        subj('s2-bio-t2', 'Biology', 'Understanding living systems', 'compulsory', 'sciences', 't4', [
          t('s2-bio-4', 'Reproduction in Animals', 'Human reproductive system', ['Male Reproductive System', 'Female Reproductive System', 'Fertilisation & Development']),
          t('s2-bio-5', 'Ecology & Environment', 'Ecosystems and food chains', ['Ecosystems', 'Food Chains & Webs', 'Nutrient Cycling']),
        ]),
        subj('s2-chem-t2', 'Chemistry', 'Understanding matter', 'compulsory', 'sciences', 't5', [
          t('s2-chem-4', 'Rates of Reaction', 'Factors affecting speed of reactions', ['Measuring Rates', 'Factors Affecting Rate', 'Collision Theory']),
          t('s2-chem-5', 'Electrolysis', 'Ionic conduction and electroplating', ['Electrolysis of Water', 'Electrolysis of Brine', 'Electroplating']),
        ]),
        subj('s2-geo-t2', 'Geography', 'Understanding our environment', 'compulsory', 'humanities', 't6', [
          t('s2-geo-3', 'Mining & Industry', 'Mineral resources in East Africa', ['Types of Mining', 'Minerals in Uganda', 'Environmental Impact']),
        ]),
        subj('s2-hist-t2', 'History & Political Education', 'Critical thinking', 'compulsory', 'humanities', 't7', [
          t('s2-hist-3', 'Resistance to Colonial Rule', 'Rebellions and uprisings', ['Causes of Resistance', 'Key Resistances', 'Consequences']),
        ]),
        subj('s2-kisw-t2', 'Kiswahili', 'East African integration language', 'compulsory', 'languages', 't9', [
          t('s2-kisw-2', 'Mazungumzo — Conversations', 'Dialogue and conversational Kiswahili', ['Shopping Dialogues', 'Asking Directions', 'Cultural Expressions']),
        ]),
        subj('s2-re-t2', 'Religious Education', 'Moral values', 'compulsory', 'humanities', 't10', [
          t('s2-re-2', 'Forgiveness & Reconciliation', 'Healing relationships', ['Meaning of Forgiveness', 'Parables of Forgiveness', 'Reconciliation in Practice']),
        ]),
        subj('s2-pe-t2', 'Physical Education', 'Health and sports', 'compulsory', 'arts', 't11', [
          t('s2-pe-2', 'Team Sports', 'Handball and basketball', ['Basketball Skills', 'Handball Rules', 'Teamwork']),
        ]),
        subj('s2-ent-t2', 'Entrepreneurship', 'Innovation and wealth creation', 'compulsory', 'technical', 't12', [
          t('s2-ent-2', 'Financial Literacy', 'Saving, budgeting and banking', ['Saving Culture', 'Budgeting', 'Banking Services']),
        ]),
        subj('s2-agri-t2', 'Agriculture', 'Modern farming skills', 'compulsory', 'technical', 't13', [
          t('s2-agri-2', 'Vegetable Growing', 'Kitchen garden management', ['Selecting Vegetables', 'Planting & Spacing', 'Pest Control']),
        ], false),
      ],
    },
    {
      id: 's2-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('s2-eng-t3', 'English Language', 'Official language', 'compulsory', 'languages', 't2', [
          t('s2-eng-7', 'Debate & Discussion', 'Formal argumentation skills', ['Debate Format', 'Building Arguments', 'Rebuttal Skills']),
          t('s2-eng-8', 'Exam Revision', 'Past paper techniques', ['Paper Analysis', 'Answering Techniques', 'Time Management']),
        ]),
        subj('s2-math-t3', 'Mathematics', 'Critical thinking', 'compulsory', 'sciences', 't1', [
          t('s2-math-8', 'Trigonometry', 'Sine, cosine and tangent ratios', ['Trigonometric Ratios', 'Finding Angles', 'Finding Sides']),
          t('s2-math-9', 'Statistics', 'Mean, median, mode and range', ['Measures of Central Tendency', 'Grouped Data', 'Representing Data']),
          t('s2-math-10', 'Probability', 'Basic probability and tree diagrams', ['Probability Basics', 'Combined Events', 'Tree Diagrams']),
        ]),
        subj('s2-phy-t3', 'Physics', 'Understanding the natural world', 'compulsory', 'sciences', 't3', [
          t('s2-phy-6', 'Waves', 'Transverse and longitudinal waves', ['Wave Properties', 'Transverse Waves', 'Longitudinal Waves']),
          t('s2-phy-7', 'Sound', 'Production and properties of sound', ['Sound Production', 'Speed of Sound', 'Echo & Resonance']),
        ]),
        subj('s2-bio-t3', 'Biology', 'Understanding living systems', 'compulsory', 'sciences', 't4', [
          t('s2-bio-6', 'Nervous System', 'Brain, spinal cord and reflexes', ['Structure of Nervous System', 'Reflex Actions', 'Sense Organs']),
          t('s2-bio-7', 'Health & Disease', 'Common diseases and prevention', ['Communicable Diseases', 'Non-Communicable Diseases', 'Prevention Methods']),
        ]),
        subj('s2-chem-t3', 'Chemistry', 'Understanding matter', 'compulsory', 'sciences', 't5', [
          t('s2-chem-6', 'Energy Changes in Reactions', 'Exothermic and endothermic', ['Exothermic Reactions', 'Endothermic Reactions', 'Energy Diagrams']),
          t('s2-chem-7', 'The Periodic Table', 'Groups, periods, and trends', ['Structure of Periodic Table', 'Group Properties', 'Trends Across Periods']),
        ]),
        subj('s2-geo-t3', 'Geography', 'Understanding our environment', 'compulsory', 'humanities', 't6', [
          t('s2-geo-4', 'Population', 'Distribution, density, and growth', ['Population Distribution', 'Population Growth', 'Migration']),
        ]),
        subj('s2-hist-t3', 'History & Political Education', 'Understanding history', 'compulsory', 'humanities', 't7', [
          t('s2-hist-4', 'World War I & Africa', 'The Great War and its impact on East Africa', ['Causes of WWI', 'East Africa in WWI', 'Effects of the War']),
        ]),
        subj('s2-kisw-t3', 'Kiswahili', 'East African integration', 'compulsory', 'languages', 't9', [
          t('s2-kisw-3', 'Insha — Composition', 'Writing compositions in Kiswahili', ['Narrative Writing', 'Descriptive Writing', 'Revision']),
        ]),
        subj('s2-re-t3', 'Religious Education', 'Moral values', 'compulsory', 'humanities', 't10', [
          t('s2-re-3', 'Social Justice', 'Fairness, equity and human rights', ['Justice in Scripture', 'Human Rights', 'Being Just in Daily Life']),
        ]),
        subj('s2-pe-t3', 'Physical Education', 'Health and sports', 'compulsory', 'arts', 't11', [
          t('s2-pe-3', 'Health Education', 'Nutrition, hygiene and first aid', ['Balanced Diet', 'Personal Hygiene', 'Basic First Aid']),
        ]),
        subj('s2-ent-t3', 'Entrepreneurship', 'Innovation and wealth creation', 'compulsory', 'technical', 't12', [
          t('s2-ent-3', 'Business Planning', 'Creating a simple business plan', ['Components of a Plan', 'Revenue & Costs', 'Pitching an Idea']),
        ]),
        subj('s2-agri-t3', 'Agriculture', 'Modern farming skills', 'compulsory', 'technical', 't13', [
          t('s2-agri-3', 'Dairy Farming', 'Cattle breeds and milk production', ['Dairy Breeds', 'Feeding Dairy Cattle', 'Milk Handling']),
        ], false),
      ],
    },
  ],
};

/* ══════════════════════ S3 — SENIOR THREE ══════════════════════ */
/* 7 compulsory + 2 electives (Entrepreneurship, Agriculture) per NCDC */

const seniorThree: UgandaClass = {
  id: 's3', name: 'Senior 3', level: "O'level",
  description: 'Specialisation year — 7 compulsory subjects plus 2 electives, preparing for UCE',
  price: 0, priceUGX: 0,
  terms: [
    {
      id: 's3-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('s3-eng', 'English Language', 'Official language and medium of instruction', 'compulsory', 'languages', 't2', [
          t('s3-eng-1', 'Advanced Comprehension & Summary', 'Complex passages and inference', ['Implicit Meaning', 'Critical Analysis', 'Summary Techniques']),
          t('s3-eng-2', 'Functional Writing', 'Speeches, notices and minutes', ['Speech Writing', 'Notices & Memos', 'Minutes of Meetings']),
          t('s3-eng-3', 'Sentence Patterns & Clauses', 'Complex and compound sentences', ['Simple vs Complex', 'Relative Clauses', 'Conditional Sentences']),
        ]),
        subj('s3-math', 'Mathematics', 'Critical thinking and problem solving', 'compulsory', 'sciences', 't1', [
          t('s3-math-1', 'Quadratic Equations', 'Formula, completing the square, graphical', ['Factorisation Method', 'Quadratic Formula', 'Completing the Square']),
          t('s3-math-2', 'Matrices', 'Operations, determinants and inverses', ['Matrix Addition & Subtraction', 'Matrix Multiplication', 'Determinants & Inverses']),
          t('s3-math-3', 'Vectors in 2D', 'Position vectors and column vectors', ['Column Vectors', 'Magnitude & Direction', 'Vector Addition']),
          t('s3-math-4', 'Transformations', 'Reflection, rotation, translation, enlargement', ['Reflection', 'Rotation', 'Enlargement']),
        ]),
        subj('s3-phy', 'Physics', 'Understanding the natural world', 'compulsory', 'sciences', 't3', [
          t('s3-phy-1', 'Turning Effects of Forces', 'Moments and equilibrium', ['Moments', 'Principle of Moments', 'Equilibrium']),
          t('s3-phy-2', 'Density & Buoyancy', "Archimedes' principle and flotation", ['Density Calculations', "Archimedes' Principle", 'Flotation']),
          t('s3-phy-3', 'Electrical Energy', 'Power, cost and domestic wiring', ['Electrical Power', 'Cost of Electricity', 'Domestic Wiring']),
        ]),
        subj('s3-bio', 'Biology', 'Understanding living systems', 'compulsory', 'sciences', 't4', [
          t('s3-bio-1', 'Genetics & Heredity', "Mendel's laws and Punnett squares", ['Genes & Chromosomes', "Mendel's Laws", 'Punnett Squares']),
          t('s3-bio-2', 'Evolution & Natural Selection', "Darwin's theory and evidence", ['Evidence for Evolution', "Darwin's Theory", 'Natural Selection']),
        ]),
        subj('s3-chem', 'Chemistry', 'Understanding matter transformations', 'compulsory', 'sciences', 't5', [
          t('s3-chem-1', 'The Mole Concept', 'Calculations with moles and formulae', ['Relative Atomic Mass', 'Mole Calculations', 'Empirical Formulae']),
          t('s3-chem-2', 'Organic Chemistry Introduction', 'Hydrocarbons — alkanes and alkenes', ['Alkanes — Structure & Properties', 'Alkenes — Structure & Properties', 'Reactions of Hydrocarbons']),
        ]),
        subj('s3-geo', 'Geography', 'Understanding our environment', 'compulsory', 'humanities', 't6', [
          t('s3-geo-1', 'Coastal Landforms', 'Erosion and deposition at the coast', ['Wave Action', 'Erosion Features', 'Deposition Features']),
          t('s3-geo-2', 'Agriculture in East Africa', 'Farming systems and crops', ['Subsistence Farming', 'Commercial Farming', 'Cash Crops of Uganda']),
        ]),
        subj('s3-hist', 'History & Political Education', 'Critical thinking about the past', 'compulsory', 'humanities', 't7', [
          t('s3-hist-1', 'Nationalism in East Africa', 'Independence movements', ['Causes of Nationalism', 'Key Nationalist Leaders', 'Road to Independence']),
          t('s3-hist-2', 'Independence of Uganda', "Uganda's path to self-rule", ['Pre-Independence Politics', 'The 1962 Independence', 'First Government Challenges']),
        ]),
        // Elective 1
        subj('s3-ent', 'Entrepreneurship', 'Innovation and wealth creation', 'compulsory', 'technical', 't12', [
          t('s3-ent-1', 'Business Environment', 'Legal and economic framework', ['Types of Business Ownership', 'Legal Requirements', 'Economic Environment']),
          t('s3-ent-2', 'Product Development', 'Creating and improving products', ['Product Design', 'Prototyping', 'Value Addition']),
        ], false),
        // Elective 2
        subj('s3-agri', 'Agriculture', 'Modern farming skills', 'compulsory', 'technical', 't13', [
          t('s3-agri-1', 'Crop Diseases & Pests', 'Identification and control', ['Common Crop Diseases', 'Pest Identification', 'Integrated Pest Management']),
          t('s3-agri-2', 'Irrigation & Water Management', 'Water conservation in farming', ['Irrigation Methods', 'Water Harvesting', 'Drip Irrigation']),
        ], false),
      ],
    },
    {
      id: 's3-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('s3-eng-t2', 'English Language', 'Official language', 'compulsory', 'languages', 't2', [
          t('s3-eng-4', 'Persuasive Writing', 'Convincing the reader', ['Persuasive Techniques', 'Essay Structure', 'Practice Writing']),
          t('s3-eng-5', 'Literature Appreciation', 'Analysing prose and drama', ['Character Analysis', 'Theme Identification', 'Setting & Plot']),
        ]),
        subj('s3-math-t2', 'Mathematics', 'Critical thinking', 'compulsory', 'sciences', 't1', [
          t('s3-math-5', 'Travel Graphs', 'Speed-time and distance-time graphs', ['Distance-Time Graphs', 'Speed-Time Graphs', 'Acceleration']),
          t('s3-math-6', 'Circle Theorems', 'Cyclic quadrilaterals and tangent properties', ['Angle at Centre', 'Angles in Same Segment', 'Tangent Properties']),
        ]),
        subj('s3-phy-t2', 'Physics', 'Understanding the natural world', 'compulsory', 'sciences', 't3', [
          t('s3-phy-4', 'Electromagnetic Induction', "Faraday's law and generators", ["Faraday's Law", "Lenz's Law", 'AC Generators']),
          t('s3-phy-5', 'Radioactivity', 'Alpha, beta, gamma and half-life', ['Types of Radiation', 'Half-Life', 'Uses & Dangers']),
        ]),
        subj('s3-bio-t2', 'Biology', 'Understanding living systems', 'compulsory', 'sciences', 't4', [
          t('s3-bio-3', 'Homeostasis', 'Temperature and blood sugar regulation', ['What is Homeostasis?', 'Temperature Regulation', 'Blood Sugar Control']),
          t('s3-bio-4', 'Immunity & Vaccination', 'Antibodies and immune response', ['Immune System', 'Types of Immunity', 'Vaccination']),
        ]),
        subj('s3-chem-t2', 'Chemistry', 'Understanding matter', 'compulsory', 'sciences', 't5', [
          t('s3-chem-3', 'Nitrogen & Its Compounds', 'Haber process and fertilisers', ['Properties of Nitrogen', 'Haber Process', 'Fertilisers']),
          t('s3-chem-4', 'Sulphur & Its Compounds', 'Extraction and sulphuric acid', ['Properties of Sulphur', 'Contact Process', 'Uses of Sulphuric Acid']),
        ]),
        subj('s3-geo-t2', 'Geography', 'Understanding our environment', 'compulsory', 'humanities', 't6', [
          t('s3-geo-3', 'Industrialisation', 'Factors and types of industry', ['Types of Industry', 'Factors of Location', 'Industry in Uganda']),
        ]),
        subj('s3-hist-t2', 'History & Political Education', 'Understanding history', 'compulsory', 'humanities', 't7', [
          t('s3-hist-3', 'Post-Independence Uganda', 'Political developments since 1962', ['Obote I Regime', 'Idi Amin Era', 'Return to Democracy']),
        ]),
        subj('s3-ent-t2', 'Entrepreneurship', 'Innovation and wealth creation', 'compulsory', 'technical', 't12', [
          t('s3-ent-3', 'Marketing Strategies', 'The marketing mix (4Ps)', ['Product', 'Price', 'Place & Promotion']),
        ], false),
        subj('s3-agri-t2', 'Agriculture', 'Modern farming skills', 'compulsory', 'technical', 't13', [
          t('s3-agri-3', 'Soil Fertility & Fertilisers', 'Maintaining soil productivity', ['Organic Manure', 'Inorganic Fertilisers', 'Crop Rotation']),
        ], false),
      ],
    },
    {
      id: 's3-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('s3-eng-t3', 'English Language', 'Official language', 'compulsory', 'languages', 't2', [
          t('s3-eng-6', 'UCE Preparation — Paper 1', 'Comprehension & summary practice', ['Timed Practice', 'Marking Scheme Analysis', 'Common Mistakes']),
          t('s3-eng-7', 'UCE Preparation — Paper 2', 'Composition practice', ['Narrative Essays', 'Argumentative Essays', 'Descriptive Essays']),
        ]),
        subj('s3-math-t3', 'Mathematics', 'Critical thinking', 'compulsory', 'sciences', 't1', [
          t('s3-math-7', 'Linear Programming', 'Objective functions and constraints', ['Forming Inequalities', 'Graphical Method', 'Optimisation']),
          t('s3-math-8', 'Sequences & Series', 'Arithmetic and geometric progressions', ['Arithmetic Sequences', 'Geometric Sequences', 'Sum of Series']),
          t('s3-math-9', 'Commercial Arithmetic', 'Compound interest, depreciation, tax', ['Simple Interest', 'Compound Interest', 'Hire Purchase & Tax']),
        ]),
        subj('s3-phy-t3', 'Physics', 'Understanding the natural world', 'compulsory', 'sciences', 't3', [
          t('s3-phy-6', 'Earth & Space', 'Solar system and satellites', ['The Solar System', 'Satellites', 'Space Exploration']),
        ]),
        subj('s3-bio-t3', 'Biology', 'Understanding living systems', 'compulsory', 'sciences', 't4', [
          t('s3-bio-5', 'Biotechnology', 'Genetic engineering and applications', ['DNA Technology', 'GMOs', 'Ethics in Biotechnology']),
        ]),
        subj('s3-chem-t3', 'Chemistry', 'Understanding matter', 'compulsory', 'sciences', 't5', [
          t('s3-chem-5', 'Chemical Equilibrium', "Le Chatelier's principle", ['Reversible Reactions', "Le Chatelier's Principle", 'Industrial Applications']),
        ]),
        subj('s3-geo-t3', 'Geography', 'Understanding our environment', 'compulsory', 'humanities', 't6', [
          t('s3-geo-4', 'Energy Resources', 'Renewable and non-renewable energy', ['Fossil Fuels', 'Hydroelectric Power', 'Solar & Wind Energy']),
        ]),
        subj('s3-hist-t3', 'History & Political Education', 'Understanding history', 'compulsory', 'humanities', 't7', [
          t('s3-hist-4', 'East African Cooperation', 'Regional integration and the EAC', ['History of EAC', 'Benefits of Integration', 'Challenges']),
        ]),
        subj('s3-ent-t3', 'Entrepreneurship', 'Innovation and wealth creation', 'compulsory', 'technical', 't12', [
          t('s3-ent-4', 'Human Resource Management', 'Managing people in business', ['Recruitment', 'Motivation', 'Leadership']),
        ], false),
        subj('s3-agri-t3', 'Agriculture', 'Modern farming skills', 'compulsory', 'technical', 't13', [
          t('s3-agri-4', 'Fish Farming', 'Aquaculture basics', ['Pond Construction', 'Fish Species Selection', 'Feeding & Harvesting']),
        ], false),
      ],
    },
  ],
};

/* ══════════════════════ S4 — SENIOR FOUR (UCE YEAR) ══════════════════════ */

const seniorFour: UgandaClass = {
  id: 's4', name: 'Senior 4', level: "O'level",
  description: 'UCE candidate class — 7 compulsory subjects plus 2 electives, intensive revision and examination',
  price: 0, priceUGX: 0, isExamYear: true, examType: 'UCE',
  terms: [
    {
      id: 's4-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('s4-eng', 'English Language', 'UCE English preparation', 'compulsory', 'languages', 't2', [
          t('s4-eng-1', 'Paper 1: Comprehension & Summary', 'UCE Paper 1 preparation', ['Comprehension Techniques', 'Summary Skills', 'Timed Practice']),
          t('s4-eng-2', 'Paper 2: Composition', 'Narrative, descriptive, argumentative', ['Essay Planning', 'Effective Openings', 'Editing & Proofreading']),
          t('s4-eng-3', 'Paper 3: Grammar & Structure', 'Sentence construction and usage', ['Sentence Completion', 'Word Formation', 'Rewriting Sentences']),
        ]),
        subj('s4-math', 'Mathematics', 'UCE Mathematics revision', 'compulsory', 'sciences', 't1', [
          t('s4-math-1', 'Revision: Algebra & Equations', 'Full algebra revision for UCE', ['Linear Equations Review', 'Quadratics Review', 'Simultaneous Equations']),
          t('s4-math-2', 'Revision: Geometry & Trigonometry', 'Angles, circles, sine/cosine rule', ['Geometry Theorems', 'Sine & Cosine Rules', 'Bearings']),
          t('s4-math-3', 'Revision: Statistics & Probability', 'Cumulative frequency, probability trees', ['Cumulative Frequency', 'Histograms', 'Probability Trees']),
          t('s4-math-4', 'Revision: Vectors & Transformations', 'Combined transformations', ['Vector Operations', 'Combined Transformations', 'Matrices of Transformation']),
        ]),
        subj('s4-phy', 'Physics', 'UCE Physics revision', 'compulsory', 'sciences', 't3', [
          t('s4-phy-1', 'Revision: Mechanics', 'Forces, motion, energy', ['Forces & Motion', 'Energy & Power', 'Momentum']),
          t('s4-phy-2', 'Revision: Heat & Waves', 'Thermal physics and wave motion', ['Heat Transfer', 'Wave Properties', 'Sound & Light']),
          t('s4-phy-3', 'Revision: Electricity & Magnetism', 'Circuits, fields and induction', ['Current Electricity', 'Magnetism', 'Electromagnetic Induction']),
        ]),
        subj('s4-bio', 'Biology', 'UCE Biology revision', 'compulsory', 'sciences', 't4', [
          t('s4-bio-1', 'Revision: Cell Biology & Nutrition', 'Cells, enzymes and nutrition', ['Cell Biology Review', 'Enzymes', 'Human Nutrition']),
          t('s4-bio-2', 'Revision: Systems & Genetics', 'Human body systems + heredity', ['Transport Systems', 'Nervous & Endocrine', 'Genetics Review']),
        ]),
        subj('s4-chem', 'Chemistry', 'UCE Chemistry revision', 'compulsory', 'sciences', 't5', [
          t('s4-chem-1', 'Revision: Inorganic Chemistry', 'Metals, non-metals, periodic table', ['Metals & Extraction', 'Non-Metals', 'Periodic Table Trends']),
          t('s4-chem-2', 'Revision: Physical Chemistry', 'Moles, equilibrium, energetics', ['Mole Calculations', 'Rates & Equilibrium', 'Energetics']),
          t('s4-chem-3', 'Revision: Organic Chemistry', 'Hydrocarbons and functional groups', ['Alkanes & Alkenes', 'Alcohols & Acids', 'Polymers']),
        ]),
        subj('s4-geo', 'Geography', 'UCE Geography revision', 'compulsory', 'humanities', 't6', [
          t('s4-geo-1', 'Revision: Physical Geography', 'Landforms, climate, vegetation', ['Weathering & Erosion', 'Climate Zones', 'Vegetation Belts']),
          t('s4-geo-2', 'Revision: Human Geography', 'Population, settlement, industry', ['Population Studies', 'Urbanisation', 'Transport & Trade']),
        ]),
        subj('s4-hist', 'History & Political Education', 'UCE History revision', 'compulsory', 'humanities', 't7', [
          t('s4-hist-1', 'Revision: Pre-Colonial & Colonial', 'Societies, trade, colonialism', ['Pre-Colonial Societies', 'Scramble & Partition', 'Colonial Administration']),
          t('s4-hist-2', 'Revision: Nationalism & Independence', 'Movements and post-independence', ['Nationalist Movements', 'Independence Processes', 'Post-Independence Developments']),
        ]),
        subj('s4-ent', 'Entrepreneurship', 'UCE Entrepreneurship revision', 'compulsory', 'technical', 't12', [
          t('s4-ent-1', 'Business Plan Project', 'Complete business plan development', ['Executive Summary', 'Financial Projections', 'Presentation & Defence']),
        ], false),
        subj('s4-agri', 'Agriculture', 'UCE Agriculture revision', 'compulsory', 'technical', 't13', [
          t('s4-agri-1', 'Farm Management', 'Planning and running a farm', ['Farm Planning', 'Farm Records', 'Marketing Agricultural Products']),
        ], false),
      ],
    },
    {
      id: 's4-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('s4-eng-t2', 'English Language', 'UCE Mock Exams', 'compulsory', 'languages', 't2', [
          t('s4-eng-4', 'UCE Mock — Paper 1', 'Comprehension & summary mock', ['Timed Mock Paper', 'Marking & Review', 'Weak Areas']),
          t('s4-eng-5', 'UCE Mock — Paper 2', 'Composition mock', ['Timed Mock Paper', 'Peer Review', 'Improvement Plan']),
        ]),
        subj('s4-math-t2', 'Mathematics', 'UCE Mock Exams', 'compulsory', 'sciences', 't1', [
          t('s4-math-5', 'UCE Mock — Paper 1', 'Short answer questions', ['Timed Mock Paper 1', 'Marking & Analysis', 'Error Correction']),
          t('s4-math-6', 'UCE Mock — Paper 2', 'Extended questions', ['Timed Mock Paper 2', 'Solution Strategies', 'Revision of Gaps']),
        ]),
        subj('s4-phy-t2', 'Physics', 'UCE Mock Exams', 'compulsory', 'sciences', 't3', [
          t('s4-phy-4', 'UCE Mock — Theory Paper', 'Full physics mock', ['Timed Theory Mock', 'Mark Scheme Analysis', 'Targeted Revision']),
          t('s4-phy-5', 'UCE Mock — Practical Paper', 'Lab practical mock', ['Practical Skills Review', 'Timed Practical Mock', 'Lab Report Writing']),
        ]),
        subj('s4-bio-t2', 'Biology', 'UCE Mock Exams', 'compulsory', 'sciences', 't4', [
          t('s4-bio-3', 'UCE Mock — Paper 1', 'Structured questions', ['Timed Mock', 'Mark Scheme', 'Revision Plan']),
          t('s4-bio-4', 'UCE Mock — Paper 2', 'Essay and practical', ['Essay Technique', 'Practical Skills', 'Mock Examination']),
        ]),
        subj('s4-chem-t2', 'Chemistry', 'UCE Mock Exams', 'compulsory', 'sciences', 't5', [
          t('s4-chem-4', 'UCE Mock — Theory', 'Full mock paper', ['Timed Mock', 'Mark Scheme Review', 'Focused Revision']),
          t('s4-chem-5', 'UCE Mock — Practical', 'Qualitative analysis mock', ['Qualitative Analysis', 'Titration Practice', 'Mock Practical Exam']),
        ]),
        subj('s4-geo-t2', 'Geography', 'UCE Mock Exams', 'compulsory', 'humanities', 't6', [
          t('s4-geo-3', 'UCE Mock — Geography', 'Full geography mock', ['Map Work Mock', 'Physical Geography Mock', 'Human Geography Mock']),
        ]),
        subj('s4-hist-t2', 'History & Political Education', 'UCE Mock Exams', 'compulsory', 'humanities', 't7', [
          t('s4-hist-3', 'UCE Mock — History', 'Full history mock', ['Structured Questions Mock', 'Essay Questions Mock', 'Review & Revision']),
        ]),
        subj('s4-ent-t2', 'Entrepreneurship', 'UCE Mock Exams', 'compulsory', 'technical', 't12', [
          t('s4-ent-2', 'UCE Mock — Entrepreneurship', 'Full mock paper', ['Timed Mock', 'Case Study Analysis', 'Review']),
        ], false),
        subj('s4-agri-t2', 'Agriculture', 'UCE Mock Exams', 'compulsory', 'technical', 't13', [
          t('s4-agri-2', 'UCE Mock — Agriculture', 'Full mock paper', ['Theory Mock', 'Practical Mock', 'Review']),
        ], false),
      ],
    },
    {
      id: 's4-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('s4-rev', 'Final Revision', 'Intensive cross-subject UCE exam preparation', 'compulsory', 'sciences', 't1', [
          t('s4-rev-1', 'Cross-Subject Intensive Revision', 'Targeted revision of weak areas', ['Personalised Study Plans', 'Past Paper Marathon', 'Group Study Sessions']),
          t('s4-rev-2', 'UCE Examination Period', 'Final UNEB examinations', ['Exam Timetable & Preparation', 'Exam Technique Tips', 'Stress Management']),
        ], true),
      ],
    },
  ],
};

/* ══════════════════════ A-LEVEL CLASSES ══════════════════════ */

const seniorFive: UgandaClass = {
  id: 's5', name: 'Senior 5', level: "A'level",
  description: 'A-level foundation year with principal and subsidiary subjects',
  price: 0, priceUGX: 0,
  terms: [
    {
      id: 's5-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('s5-math', 'Mathematics', 'Advanced mathematics', 'principal', 'sciences', 't1', [
          t('s5-math-1', 'Functions & Relations', 'Domain, range, composite functions', ['Domain & Range', 'Composite Functions', 'Inverse Functions']),
          t('s5-math-2', 'Differentiation', 'First principles, rules, applications', ['First Principles', 'Product & Quotient Rules', 'Applications of Differentiation']),
          t('s5-math-3', 'Coordinate Geometry', 'Lines, circles, parametric equations', ['Equation of a Line', 'Equation of a Circle', 'Parametric Equations']),
          t('s5-math-4', 'Trigonometric Functions', 'Identities, equations, inverse trig', ['Trigonometric Identities', 'Solving Trig Equations', 'Inverse Trig Functions']),
        ]),
        subj('s5-phy', 'Physics', 'Advanced physics', 'principal', 'sciences', 't3', [
          t('s5-phy-1', 'Mechanics — Kinematics', 'Equations of motion, projectiles', ['Equations of Motion', 'Projectile Motion', 'Relative Velocity']),
          t('s5-phy-2', 'Mechanics — Dynamics', "Newton's laws, momentum, collisions", ['Force & Acceleration', 'Momentum', 'Collisions']),
          t('s5-phy-3', 'Circular Motion', 'Centripetal force and acceleration', ['Circular Motion Concepts', 'Centripetal Force', 'Applications']),
        ]),
        subj('s5-chem', 'Chemistry', 'Advanced chemistry', 'principal', 'sciences', 't5', [
          t('s5-chem-1', 'Atomic Structure & Periodicity', 'Electron configurations and trends', ['Electron Configuration', 'Ionisation Energy', 'Periodic Trends']),
          t('s5-chem-2', 'Chemical Bonding', 'Hybridization and molecular shapes', ['Hybridisation', 'VSEPR Theory', 'Molecular Shapes']),
          t('s5-chem-3', 'Energetics', "Hess's law and bond energies", ['Enthalpy Changes', "Hess's Law", 'Bond Energies']),
        ]),
        subj('s5-gp', 'General Paper', 'Critical thinking and current affairs', 'subsidiary', 'humanities', 't8', [
          t('s5-gp-1', 'Essay Writing Skills', 'Structure, argumentation, evidence', ['Essay Structure', 'Building Arguments', 'Using Evidence']),
          t('s5-gp-2', 'Comprehension & Summary', 'Advanced analysis of passages', ['Advanced Comprehension', 'Critical Analysis', 'Summary Practice']),
          t('s5-gp-3', 'Current Affairs — East Africa', 'Political, social and economic issues', ['Political Developments', 'Social Issues', 'Economic Trends']),
        ]),
        subj('s5-submath', 'Sub-Mathematics', 'Subsidiary mathematics', 'subsidiary', 'sciences', 't1', [
          t('s5-sm-1', 'Sets & Logic', 'Set theory and logical statements', ['Set Theory', 'Logical Statements', 'Truth Tables']),
          t('s5-sm-2', 'Matrices & Transformations', 'Matrix operations for A-level', ['Matrix Operations', 'Transformations', 'Applications']),
          t('s5-sm-3', 'Statistics', 'Measures of central tendency and dispersion', ['Mean, Median, Mode', 'Standard Deviation', 'Data Interpretation']),
        ]),
      ],
    },
    {
      id: 's5-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('s5-math-t2', 'Mathematics', 'Advanced mathematics', 'principal', 'sciences', 't1', [
          t('s5-math-5', 'Integration', 'Indefinite and definite integrals', ['Indefinite Integrals', 'Definite Integrals', 'Area Under Curves']),
          t('s5-math-6', 'Sequences & Series', 'Convergence, sigma notation, binomial theorem', ['Sigma Notation', 'Convergence Tests', 'Binomial Theorem']),
          t('s5-math-7', 'Partial Fractions', 'Decomposition techniques', ['Linear Factors', 'Repeated Factors', 'Improper Fractions']),
        ]),
        subj('s5-phy-t2', 'Physics', 'Advanced physics', 'principal', 'sciences', 't3', [
          t('s5-phy-4', 'Gravitational Fields', "Newton's law of gravitation and orbits", ['Gravitational Force', 'Gravitational Potential', 'Orbits']),
          t('s5-phy-5', 'Electric Fields', "Coulomb's law and potential", ["Coulomb's Law", 'Electric Potential', 'Field Lines']),
          t('s5-phy-6', 'Capacitance', 'Parallel plate capacitors and energy', ['Capacitance', 'Energy Stored', 'Charging & Discharging']),
        ]),
        subj('s5-chem-t2', 'Chemistry', 'Advanced chemistry', 'principal', 'sciences', 't5', [
          t('s5-chem-4', 'Kinetics', 'Rate laws, orders, and Arrhenius equation', ['Rate Laws', 'Reaction Orders', 'Arrhenius Equation']),
          t('s5-chem-5', 'Chemical Equilibrium', 'Kc, Kp, and Le Chatelier', ['Equilibrium Constants', "Le Chatelier's Principle", 'Industrial Equilibria']),
          t('s5-chem-6', 'Acids, Bases & Buffers', 'pH, indicators, and buffer solutions', ['pH Calculations', 'Indicators', 'Buffer Solutions']),
        ]),
        subj('s5-gp-t2', 'General Paper', 'Critical thinking', 'subsidiary', 'humanities', 't8', [
          t('s5-gp-4', 'Science, Technology & Society', 'Impact of technology on development', ['Technology in Africa', 'Digital Revolution', 'Ethical Implications']),
          t('s5-gp-5', 'Education & Development', 'Role of education in national growth', ['Education Systems', 'Skills Development', 'Education Policy']),
        ]),
      ],
    },
    {
      id: 's5-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('s5-math-t3', 'Mathematics', 'Advanced mathematics', 'principal', 'sciences', 't1', [
          t('s5-math-8', 'Vectors in 3D', 'Scalar and vector products', ['3D Vectors', 'Scalar Product', 'Vector Product']),
          t('s5-math-9', 'Exponential & Logarithmic Functions', 'Laws, equations and graphs', ['Exponential Functions', 'Logarithmic Functions', 'Exponential Growth & Decay']),
          t('s5-math-10', 'Numerical Methods', 'Newton-Raphson and trapezium rule', ['Iterative Methods', 'Newton-Raphson', 'Trapezium Rule']),
        ]),
        subj('s5-phy-t3', 'Physics', 'Advanced physics', 'principal', 'sciences', 't3', [
          t('s5-phy-7', 'Magnetic Fields', 'Force on current-carrying conductors', ['Magnetic Force', 'Force on a Conductor', 'Motor Effect']),
          t('s5-phy-8', 'Alternating Current', 'RMS values and transformers', ['AC Theory', 'RMS Values', 'Transformers']),
          t('s5-phy-9', 'Thermal Physics', 'Gas laws and kinetic theory', ['Gas Laws', 'Kinetic Theory', 'Internal Energy']),
        ]),
        subj('s5-chem-t3', 'Chemistry', 'Advanced chemistry', 'principal', 'sciences', 't5', [
          t('s5-chem-7', 'Organic Chemistry — Alcohols', 'Reactions and isomerism', ['Alcohol Reactions', 'Isomerism', 'Oxidation Products']),
          t('s5-chem-8', 'Organic Chemistry — Carbonyls', 'Aldehydes and ketones', ['Carbonyl Reactions', 'Testing for Carbonyls', 'Reduction & Oxidation']),
          t('s5-chem-9', 'Transition Metals', 'Properties and complex ions', ['Transition Metal Properties', 'Complex Ions', 'Catalysis']),
        ]),
      ],
    },
  ],
};

const seniorSix: UgandaClass = {
  id: 's6', name: 'Senior 6', level: "A'level",
  description: 'UACE candidate class — advanced mastery and exam readiness',
  price: 0, priceUGX: 0, isExamYear: true, examType: 'UACE',
  terms: [
    {
      id: 's6-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('s6-math', 'Mathematics', 'Advanced mathematics', 'principal', 'sciences', 't1', [
          t('s6-math-1', 'Further Differentiation', 'Implicit, parametric, related rates', ['Implicit Differentiation', 'Parametric Differentiation', 'Related Rates']),
          t('s6-math-2', 'Further Integration', 'By parts, substitution, volume of revolution', ['Integration by Parts', 'Substitution', 'Volumes of Revolution']),
          t('s6-math-3', 'Differential Equations', 'First order ODEs and applications', ['Separable ODEs', 'Integrating Factor', 'Modelling with ODEs']),
          t('s6-math-4', 'Complex Numbers', 'Argand diagrams and operations', ['Complex Arithmetic', 'Argand Diagrams', 'Modulus-Argument Form']),
        ]),
        subj('s6-phy', 'Physics', 'Advanced physics', 'principal', 'sciences', 't3', [
          t('s6-phy-1', 'Quantum Physics', 'Photoelectric effect and wave-particle duality', ['Photoelectric Effect', 'Wave-Particle Duality', 'Energy Levels']),
          t('s6-phy-2', 'Nuclear Physics', 'Radioactive decay, fission and fusion', ['Radioactive Decay', 'Nuclear Fission', 'Nuclear Fusion']),
          t('s6-phy-3', 'Electromagnetic Induction', "Faraday's and Lenz's laws in depth", ["Faraday's Law", "Lenz's Law", 'Applications']),
        ]),
        subj('s6-chem', 'Chemistry', 'Advanced chemistry', 'principal', 'sciences', 't5', [
          t('s6-chem-1', 'Organic Synthesis', 'Multi-step organic reactions', ['Synthetic Routes', 'Functional Group Interconversions', 'Retrosynthesis']),
          t('s6-chem-2', 'Spectroscopy', 'IR, NMR and mass spectrometry', ['IR Spectroscopy', 'NMR Spectroscopy', 'Mass Spectrometry']),
          t('s6-chem-3', 'Electrochemistry', 'Electrode potentials and cells', ['Electrode Potentials', 'Electrochemical Cells', 'Electrolysis']),
        ]),
        subj('s6-gp', 'General Paper', 'Critical thinking', 'subsidiary', 'humanities', 't8', [
          t('s6-gp-1', 'Global Issues', 'Climate, conflict and governance', ['Climate Change', 'International Conflict', 'Global Governance']),
          t('s6-gp-2', 'Ethics & Morality', 'Contemporary ethical debates', ['Medical Ethics', 'Technology Ethics', 'Environmental Ethics']),
          t('s6-gp-3', 'UACE Paper Practice', 'Past paper revision and technique', ['Essay Practice', 'Comprehension Practice', 'Exam Strategy']),
        ]),
      ],
    },
    {
      id: 's6-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('s6-math-t2', 'Mathematics', 'Advanced mathematics', 'principal', 'sciences', 't1', [
          t('s6-math-5', 'UACE Mock — Paper 1 (Pure)', 'Full mock examination', ['Timed Pure Mock', 'Mark Scheme Analysis', 'Revision Plan']),
          t('s6-math-6', 'UACE Mock — Paper 2 (Applied)', 'Mechanics and statistics mock', ['Mechanics Mock', 'Statistics Mock', 'Combined Mock']),
        ]),
        subj('s6-phy-t2', 'Physics', 'Advanced physics', 'principal', 'sciences', 't3', [
          t('s6-phy-4', 'UACE Mock — Physics Paper 1', 'Theory paper mock', ['Timed Theory Mock', 'Marking & Review', 'Targeted Revision']),
          t('s6-phy-5', 'UACE Mock — Physics Paper 2', 'Structured questions mock', ['Timed Mock', 'Analysis', 'Improvement']),
          t('s6-phy-6', 'UACE Mock — Physics Paper 3', 'Practical paper mock', ['Practical Skills', 'Timed Practical', 'Lab Report']),
        ]),
        subj('s6-chem-t2', 'Chemistry', 'Advanced chemistry', 'principal', 'sciences', 't5', [
          t('s6-chem-4', 'UACE Mock — Chemistry Paper 1', 'Structured questions', ['Timed Mock', 'Mark Scheme', 'Revision']),
          t('s6-chem-5', 'UACE Mock — Chemistry Paper 2', 'Essays and applications', ['Timed Essay Mock', 'Application Questions', 'Review']),
          t('s6-chem-6', 'UACE Mock — Practical Paper', 'Titration and qualitative analysis', ['Titration Practice', 'Qualitative Analysis', 'Timed Practical Mock']),
        ]),
      ],
    },
    {
      id: 's6-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('s6-final', 'Final Revision & UACE', 'Exam preparation', 'compulsory', 'sciences', 't1', [
          t('s6-final-1', 'Intensive Cross-Subject Revision', 'Targeted weak-area drilling', ['Personalised Study Plans', 'Past Paper Marathon', 'Group Sessions']),
          t('s6-final-2', 'UACE Examination Period', 'Final UNEB examinations', ['Exam Timetable', 'Exam Technique', 'Stress Management']),
        ], true),
      ],
    },
  ],
};


/* ══════════════════════ UPPER PRIMARY CLASSES ══════════════════════ */

const primaryFour: UgandaClass = {
  id: 'p4', name: 'Primary 4', level: "Upper Primary",
  description: 'First year of upper primary — transitioning to subject-based learning with a focus on the District',
  price: 0, priceUGX: 0,
  terms: [
    {
      id: 'p4-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('p4-math', 'Mathematics', 'Basic numeracy and operations', 'compulsory', 'sciences', 't1', [
          t('p4-math-1', 'Set Concepts', 'Forming and interpreting sets', ['Types of Sets', 'Venn Diagrams Basics', 'Set Operations']),
          t('p4-math-2', 'Whole Numbers', 'Counting up to 100,000', ['Place Value', 'Reading & Writing Values', 'Rounding Off']),
          t('p4-math-3', 'Addition & Subtraction', 'Operations on whole numbers', ['Addition up to 5 Digits', 'Subtraction up to 5 Digits', 'Word Problems']),
        ]),
        subj('p4-eng', 'English', 'Developing reading and writing skills', 'compulsory', 'languages', 't2', [
          t('p4-eng-1', 'Nouns & Pronouns', 'Identifying objects and people', ['Common Nouns', 'Proper Nouns', 'Personal Pronouns']),
          t('p4-eng-2', 'Verbs & Present Tenses', 'Describing actions', ['Action Words', 'Present Continuous Tense', 'Simple Present Tense']),
        ]),
        subj('p4-scie', 'Integrated Science', 'Understanding our environment', 'compulsory', 'sciences', 't4', [
          t('p4-scie-1', 'Our Environment', 'Living and non-living things', ['Characteristics of Living Things', 'Plants & Animals', 'Caring for Environment']),
          t('p4-scie-2', 'Plant Life', 'Structure of a flowering plant', ['Roots & Stems', 'Types of Roots', 'Functions of Leaves']),
        ]),
        subj('p4-sst', 'Social Studies', 'Our District', 'compulsory', 'humanities', 't6', [
          t('p4-sst-1', 'Location of Our District', 'Mapping and layout', ['Map of Our District', 'Neighbouring Districts', 'Compass Directions']),
          t('p4-sst-2', 'Physical Features', 'Landforms in our district', ['Mountains & Hills', 'Lakes & Rivers', 'Importance of Features']),
        ]),
        subj('p4-re', 'Religious Education', 'Moral values and creation', 'compulsory', 'humanities', 't10', [
          t('p4-re-1', 'The Creation Story', 'God as the creator', ['How God Created the World', 'Our Role in Creation', 'Care of God’s Work']),
          t('p4-re-2', 'God’s Love', 'Understanding divine love', ['Signs of God’s Love', 'Loving Our Neighbors', 'Forgiveness']),
        ]),
      ]
    },
    {
      id: 'p4-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('p4-math-t2', 'Mathematics', 'Basic numeracy and operations', 'compulsory', 'sciences', 't1', [
          t('p4-math-4', 'Multiplication & Division', 'Advanced operations', ['Multiplying Large Numbers', 'Long Division', 'Word Problems']),
          t('p4-math-5', 'Fractions', 'Understanding parts of a whole', ['Proper Fractions', 'Equivalent Fractions', 'Adding Fractions']),
        ]),
        subj('p4-eng-t2', 'English', 'Developing reading and writing skills', 'compulsory', 'languages', 't2', [
          t('p4-eng-3', 'Adjectives & Prepositions', 'Descriptive language', ['Adjectives of Quality', 'Prepositions of Place', 'Comparisons']),
          t('p4-eng-4', 'Past Tenses', 'Talking about the past', ['Simple Past Tense', 'Past Participles', 'Descriptive Writing']),
        ]),
        subj('p4-scie-t2', 'Integrated Science', 'Understanding our environment', 'compulsory', 'sciences', 't4', [
          t('p4-scie-3', 'Personal Hygiene', 'Keeping our bodies clean', ['Types of Dirt', 'Cleaning Materials', 'Importance of Hygiene']),
          t('p4-scie-4', 'The Human Body', 'Teeth and oral hygiene', ['Types of Teeth', 'Functions of Teeth', 'Dental Diseases']),
        ]),
        subj('p4-sst-t2', 'Social Studies', 'Our District', 'compulsory', 'humanities', 't6', [
          t('p4-sst-3', 'People in Our District', 'Origins and settlement', ['Ethnic Groups', 'Migration Patterns', 'Cultural Practices']),
          t('p4-sst-4', 'Leaders & Climate', 'Governance and weather patterns', ['District Leaders', 'Civic Duties', 'Climate of the District']),
        ]),
        subj('p4-re-t2', 'Religious Education', 'Moral values and creation', 'compulsory', 'humanities', 't10', [
          t('p4-re-3', 'Leadership', 'God chooses leaders', ['Biblical/Islamic Leaders', 'Qualities of Good Leaders', 'Respecting Authority']),
        ]),
      ]
    },
    {
      id: 'p4-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('p4-math-t3', 'Mathematics', 'Basic numeracy and operations', 'compulsory', 'sciences', 't1', [
          t('p4-math-6', 'Measurements', 'Length, mass, and capacity', ['Measuring Length', 'Measuring Mass', 'Word Problems']),
          t('p4-math-7', 'Time & Geometry', 'Reading time and basic shapes', ['Telling Time', '2D Shapes', 'Perimeter']),
        ]),
        subj('p4-eng-t3', 'English', 'Developing reading and writing skills', 'compulsory', 'languages', 't2', [
          t('p4-eng-5', 'Letter Writing', 'Writing informal letters', ['Parts of a Letter', 'Friendly Letters', 'Addressing Envelopes']),
          t('p4-eng-6', 'Conjunctions & Comprehension', 'Connecting ideas', ['Using And, But, Because', 'Reading Comprehension', 'Story Sequencing']),
        ]),
        subj('p4-scie-t3', 'Integrated Science', 'Understanding our environment', 'compulsory', 'sciences', 't4', [
          t('p4-scie-5', 'Weather', 'Types of weather and instruments', ['Elements of Weather', 'Weather Instruments', 'Effects of Weather']),
          t('p4-scie-6', 'Simple Machines', 'Levers and pulleys', ['Types of Simple Machines', 'Friction', 'Keeping Poultry']),
        ]),
        subj('p4-sst-t3', 'Social Studies', 'Our District', 'compulsory', 'humanities', 't6', [
          t('p4-sst-5', 'Economic Activities', 'How people earn a living', ['Farming', 'Trading', 'Fishing']),
          t('p4-sst-6', 'Transport & Communication', 'Moving goods and people', ['Types of Transport', 'Communication Methods', 'Road Safety']),
        ]),
        subj('p4-re-t3', 'Religious Education', 'Moral values and creation', 'compulsory', 'humanities', 't10', [
          t('p4-re-4', 'Service to Others', 'Helping those in need', ['Parables of Service', 'Helping the Needy', 'Community Service']),
        ]),
      ]
    }
  ]
};

const primaryFive: UgandaClass = {
  id: 'p5', name: 'Primary 5', level: "Upper Primary",
  description: 'Second year of upper primary — expanding from the District to explore Uganda and its features',
  price: 0, priceUGX: 0,
  terms: [
    {
      id: 'p5-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('p5-math', 'Mathematics', 'Advanced numeracy', 'compulsory', 'sciences', 't1', [
          t('p5-math-1', 'Set Concepts', 'Identifying and forming sets', ['Types of Sets', 'Venn Diagrams', 'Set Operations']),
          t('p5-math-2', 'Number Bases', 'Base 2 and Base 5', ['Grouping in Bases', 'Converting Bases', 'Addition in Bases']),
        ]),
        subj('p5-eng', 'English', 'Advanced grammar and expression', 'compulsory', 'languages', 't2', [
          t('p5-eng-1', 'Vehicle Maintenance', 'Vocabulary and grammar context', ['Common Nouns', 'Present Continuous Tense', 'Safety Rules']),
          t('p5-eng-2', 'Print Media', 'Newspapers and articles', ['Journalistic Terms', 'Past Tense', 'Reading Comprehension']),
        ]),
        subj('p5-scie', 'Integrated Science', 'Science in our lives', 'compulsory', 'sciences', 't4', [
          t('p5-scie-1', 'Keeping Poultry', 'Advanced poultry management', ['Types of Birds', 'Systems of Keeping', 'Poultry Diseases']),
          t('p5-scie-2', 'Keeping Bees', 'Apiculture and products', ['Types of Bees', 'The Hive', 'Honey Harvesting']),
        ]),
        subj('p5-sst', 'Social Studies', 'Uganda as a Nation', 'compulsory', 'humanities', 't6', [
          t('p5-sst-1', 'Location of Uganda', 'Map reading and neighbours', ['Latitudes & Longitudes', 'Neighbouring Countries', 'Coordinates']),
          t('p5-sst-2', 'Physical Features of Uganda', 'Landforms across the country', ['Mountains of Uganda', 'Lakes & Rivers', 'Impact on Climate']),
        ]),
        subj('p5-re', 'Religious Education', 'Faith and Prophets', 'compulsory', 'humanities', 't10', [
          t('p5-re-1', 'Faith', 'Understanding faith', ['What is Faith?', 'Examples of Faith', 'Holy Books']),
        ]),
      ]
    },
    {
      id: 'p5-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('p5-math-t2', 'Mathematics', 'Advanced numeracy', 'compulsory', 'sciences', 't1', [
          t('p5-math-3', 'Fractions & Decimals', 'Converting and calculating', ['Decimals to Fractions', 'Adding Decimals', 'Multiplication']),
          t('p5-math-4', 'Algebra Basics', 'Introduction to unknowns', ['Collecting Like Terms', 'Simple Equations', 'Substitution']),
        ]),
        subj('p5-eng-t2', 'English', 'Advanced grammar and expression', 'compulsory', 'languages', 't2', [
          t('p5-eng-3', 'Travel & Transport', 'Vocabulary and adjectives', ['Adverbs of Time', 'Descriptive Sentences', 'Writing an Article']),
          t('p5-eng-4', 'Banking', 'Vocabulary and forms', ['Financial Terms', 'Conditionals', 'Filling Forms']),
        ]),
        subj('p5-scie-t2', 'Integrated Science', 'Science in our lives', 'compulsory', 'sciences', 't4', [
          t('p5-scie-3', 'Food & Nutrition', 'Balanced diet and deficiency', ['Classes of Food', 'Deficiency Diseases', 'Food Preservation']),
          t('p5-scie-4', 'Primary Health Care (PHC)', 'Elements and principles', ['Elements of PHC', 'Immunization', 'Sanitation']),
        ]),
        subj('p5-sst-t2', 'Social Studies', 'Uganda as a Nation', 'compulsory', 'humanities', 't6', [
          t('p5-sst-3', 'The People of Uganda', 'Ethnic groups and migration', ['Major Ethnic Groups', 'Reasons for Migration', 'Culture']),
          t('p5-sst-4', 'Climate of Uganda', 'Seasons and agriculture', ['Types of Climate', 'Factors influencing Climate', 'Farming Seasons']),
        ]),
        subj('p5-re-t2', 'Religious Education', 'Faith and Prophets', 'compulsory', 'humanities', 't10', [
          t('p5-re-2', 'Suffering & Healing', 'Dealing with pain', ['Causes of Suffering', 'Jesus the Healer', 'Comforting Others']),
        ]),
      ]
    },
    {
      id: 'p5-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('p5-math-t3', 'Mathematics', 'Advanced numeracy', 'compulsory', 'sciences', 't1', [
          t('p5-math-5', 'Geometry', 'Lines, angles and shapes', ['Types of Angles', 'Measuring Angles', 'Properties of Shapes']),
          t('p5-math-6', 'Money & Measurements', 'Profit and loss', ['Time', 'Weight & Capacity', 'Profit & Loss']),
        ]),
        subj('p5-eng-t3', 'English', 'Advanced grammar and expression', 'compulsory', 'languages', 't2', [
          t('p5-eng-5', 'Safety on the Road', 'Direct and indirect speech', ['Traffic Rules', 'Direct Speech', 'Indirect Speech']),
        ]),
        subj('p5-scie-t3', 'Integrated Science', 'Science in our lives', 'compulsory', 'sciences', 't4', [
          t('p5-scie-5', 'Measurement', 'Scientific measurement tools', ['Volume & Mass', 'Density', 'Changes in Matter']),
          t('p5-scie-6', 'Heat & Temperature', 'Thermometers and heat transfer', ['Types of Thermometers', 'Conduction', 'Convection']),
        ]),
        subj('p5-sst-t3', 'Social Studies', 'Uganda as a Nation', 'compulsory', 'humanities', 't6', [
          t('p5-sst-5', 'Vegetation of Uganda', 'Types and conservation', ['Forests & Savannah', 'Importance of Vegetation', 'Deforestation']),
          t('p5-sst-6', 'Foreign Influence', 'Early visitors to Uganda', ['Arab Traders', 'European Explorers', 'Missionaries']),
        ]),
        subj('p5-re-t3', 'Religious Education', 'Faith and Prophets', 'compulsory', 'humanities', 't10', [
          t('p5-re-3', 'Peace & Justice', 'Harmonious living', ['What is Justice?', 'Promoting Peace', 'National Unity']),
        ]),
      ]
    }
  ]
};

const primarySix: UgandaClass = {
  id: 'p6', name: 'Primary 6', level: "Upper Primary",
  description: 'Third year of upper primary — exploring the East African region and complex sciences',
  price: 0, priceUGX: 0,
  terms: [
    {
      id: 'p6-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('p6-math', 'Mathematics', 'Pre-PLE numeracy', 'compulsory', 'sciences', 't1', [
          t('p6-math-1', 'Set Concepts', 'Probability and Venn diagrams', ['Application of Sets', 'Subsets', 'Probability Basics']),
          t('p6-math-2', 'Integers', 'Number lines and operations', ['Positive & Negative Numbers', 'Addition on Number Line', 'Subtraction']),
        ]),
        subj('p6-eng', 'English', 'Pre-PLE literature and grammar', 'compulsory', 'languages', 't2', [
          t('p6-eng-1', 'Debating', 'Argumentative structures', ['Expressing Opinions', 'Agreement & Disagreement', 'Public Speaking']),
          t('p6-eng-2', 'Occupations', 'Vocabulary for jobs', ['Describing Professions', 'If-Clauses', 'Writing Reports']),
        ]),
        subj('p6-scie', 'Integrated Science', 'Pre-PLE Science', 'compulsory', 'sciences', 't4', [
          t('p6-scie-1', 'Sound', 'Production and transmission', ['How Sound Travels', 'Pitch & Volume', 'Musical Instruments']),
          t('p6-scie-2', 'The Circulatory System', 'Heart and blood', ['Structure of the Heart', 'Blood Types', 'Circulation']),
        ]),
        subj('p6-sst', 'Social Studies', 'East Africa as a Region', 'compulsory', 'humanities', 't6', [
          t('p6-sst-1', 'Location of East Africa', 'Coordinates and map work', ['Countries & Capitals', 'Latitudes & Longitudes', 'Map Reading']),
          t('p6-sst-2', 'Physical Features of East Africa', 'Landscapes of the region', ['Mountains like Kilimanjaro', 'The Great Rift Valley', 'Major Lakes']),
        ]),
        subj('p6-re', 'Religious Education', 'Ethics and East African Religions', 'compulsory', 'humanities', 't10', [
          t('p6-re-1', 'Religions in East Africa', 'Christianity and Islam', ['Arrival of Missionaries', 'Spread of Islam', 'Uganda Martyrs']),
        ]),
      ]
    },
    {
      id: 'p6-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('p6-math-t2', 'Mathematics', 'Pre-PLE numeracy', 'compulsory', 'sciences', 't1', [
          t('p6-math-3', 'Fractions & Decimals', 'Operations and percentages', ['Word Problems', 'Finding Percentages', 'Multiplying Decimals']),
          t('p6-math-4', 'Algebra & Currency', 'Advanced equations', ['Solving Equations', 'Currency Conversions', 'Word Problems']),
        ]),
        subj('p6-eng-t2', 'English', 'Pre-PLE literature and grammar', 'compulsory', 'languages', 't2', [
          t('p6-eng-3', 'Family Relationships', 'Extended family vocabulary', ['Relative Pronouns', 'Family Trees', 'Descriptive Essays']),
        ]),
        subj('p6-scie-t2', 'Integrated Science', 'Pre-PLE Science', 'compulsory', 'sciences', 't4', [
          t('p6-scie-3', 'Health & Hygiene', 'Alcohol, smoking, and drugs', ['Effects of Alcohol', 'Dangers of Smoking', 'Drug Abuse']),
          t('p6-scie-4', 'Keeping Cattle', 'Dairy and beef management', ['Dairy & Beef Breeds', 'Tick-Borne Diseases', 'Farm Management']),
        ]),
        subj('p6-sst-t2', 'Social Studies', 'East Africa as a Region', 'compulsory', 'humanities', 't6', [
          t('p6-sst-3', 'History of East Africa', 'Early migrations and settlements', ['Bantu Migration', 'Nilotes', 'Effects of Migration']),
          t('p6-sst-4', 'Colonial Period', 'Scramble for East Africa', ['Reasons for Colonisation', 'Colonial Systems', 'Resistance']),
        ]),
        subj('p6-re-t2', 'Religious Education', 'Ethics and East African Religions', 'compulsory', 'humanities', 't10', [
          t('p6-re-2', 'Social Responsibility', 'Duties of a believer', ['Honesty & Integrity', 'Work Ethics', 'Caring for the Vulnerable']),
        ]),
      ]
    },
    {
      id: 'p6-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('p6-math-t3', 'Mathematics', 'Pre-PLE numeracy', 'compulsory', 'sciences', 't1', [
          t('p6-math-5', 'Coordinates & Data Handling', 'Graphs and charts', ['X & Y Axis Plots', 'Pie Charts', 'Bar Graphs']),
        ]),
        subj('p6-eng-t3', 'English', 'Pre-PLE literature and grammar', 'compulsory', 'languages', 't2', [
          t('p6-eng-4', 'Celebrations', 'Describing events', ['Future Tense', 'Vocabulary of Events', 'Advanced Comprehension']),
        ]),
        subj('p6-scie-t3', 'Integrated Science', 'Pre-PLE Science', 'compulsory', 'sciences', 't4', [
          t('p6-scie-5', 'Light', 'Reflection and refraction', ['Properties of Light', 'Mirrors', 'Lenses']),
          t('p6-scie-6', 'Resources in the Environment', 'Conservation', ['Renewable Resources', 'Non-Renewable Resources', 'Pollution']),
        ]),
        subj('p6-sst-t3', 'Social Studies', 'East Africa as a Region', 'compulsory', 'humanities', 't6', [
          t('p6-sst-5', 'Transport & Communication in E.A.', 'Networks', ['Road & Rail in E.A.', 'Ports & Harbors', 'Modern Communication']),
          t('p6-sst-6', 'The East African Community (EAC)', 'Integration', ['History of the EAC', 'Organs of the EAC', 'Benefits of Integration']),
        ]),
        subj('p6-re-t3', 'Religious Education', 'Ethics and East African Religions', 'compulsory', 'humanities', 't10', [
          t('p6-re-3', 'Morals, Values and Culture', 'Christian/Islamic worldview', ['Cultural Values', 'Evaluating Traditions', 'Marriage & Family']),
        ]),
      ]
    }
  ]
};

const primarySeven: UgandaClass = {
  id: 'p7', name: 'Primary 7', level: "Upper Primary",
  description: 'PLE Candidate Year — intensive revision and Africa regional studies',
  price: 0, priceUGX: 0, isExamYear: true, examType: 'PLE',
  terms: [
    {
      id: 'p7-t1', name: 'Term 1', startDate: '2025-02-03', endDate: '2025-05-02',
      subjects: [
        subj('p7-math', 'Mathematics', 'PLE Preparation', 'compulsory', 'sciences', 't1', [
          t('p7-math-1', 'Set Concepts & Bases', 'Advanced operations', ['Three-set Venn Diagrams', 'Application Word Problems', 'Bases & Integers']),
          t('p7-math-2', 'Fractions, Decimals, Percentages', 'Conversion and calculation', ['BODMAS', 'Recurring Decimals', 'Simple Interest']),
        ]),
        subj('p7-eng', 'English', 'PLE Preparation', 'compulsory', 'languages', 't2', [
          t('p7-eng-1', 'School Events', 'Writing and grammar', ['Report Writing', 'Direct & Indirect Speech', 'Vocabulary']),
          t('p7-eng-2', 'Electronic Media', 'Radio and Television', ['Active & Passive Voice', 'Formal Letters', 'Summary Writing']),
        ]),
        subj('p7-scie', 'Integrated Science', 'PLE Preparation', 'compulsory', 'sciences', 't4', [
          t('p7-scie-1', 'The Human Body', 'Bones and Muscles', ['The Skeleton', 'Joints', 'Muscular System']),
          t('p7-scie-2', 'Electricity', 'Simple circuits', ['Current & Voltage', 'Conductors & Insulators', 'Domestic Wiring']),
        ]),
        subj('p7-sst', 'Social Studies', 'Africa as a Continent', 'compulsory', 'humanities', 't6', [
          t('p7-sst-1', 'Location of Africa', 'Map reading', ['Hemispheres', 'Latitudes & Longitudes', 'Countries of Africa']),
          t('p7-sst-2', 'Physical Features of Africa', 'Relief and drainage', ['Rift Valleys', 'Mountains', 'Rivers & Lakes']),
        ]),
      ]
    },
    {
      id: 'p7-t2', name: 'Term 2', startDate: '2025-05-26', endDate: '2025-08-22',
      subjects: [
        subj('p7-math-t2', 'Mathematics', 'PLE Mock Exams', 'compulsory', 'sciences', 't1', [
          t('p7-math-3', 'Geometry', 'Construction and properties', ['Constructing Angles', 'Polygons', 'Pythagoras Theorem']),
          t('p7-math-4', 'Algebra & Speed', 'Solving equations', ['Forming Equations', 'Speed, Distance, Time', 'Probability']),
        ]),
        subj('p7-eng-t2', 'English', 'PLE Mock Exams', 'compulsory', 'languages', 't2', [
          t('p7-eng-3', 'Mock Paper 1', 'Grammar and comprehension', ['Complex Sentences', 'Timed Exam Practice', 'Answering Techniques']),
          t('p7-eng-4', 'Mock Paper 2', 'Composition', ['Narrative Writing', 'Argumentative Essays', 'Summary Practice']),
        ]),
        subj('p7-scie-t2', 'Integrated Science', 'PLE Mock Exams', 'compulsory', 'sciences', 't4', [
          t('p7-scie-3', 'Excretory System & Energy', 'Kidneys, skin and resources', ['Structure of Kidney', 'Functions of Skin', 'Energy Resources']),
          t('p7-scie-4', 'Mock Exams', 'Science Revision', ['Section A Review', 'Section B Extended']),
        ]),
        subj('p7-sst-t2', 'Social Studies', 'PLE Mock Exams', 'compulsory', 'humanities', 't6', [
          t('p7-sst-3', 'Foreign Influence in Africa', 'Colonialism', ['Scramble & Partition', 'Colonial Administration', 'Effects of Colonial Rule']),
          t('p7-sst-4', 'Independence & Mock Exams', 'Post-colonial Africa', ['OAU / AU', 'Economic Developments', 'Map Interpretation Review']),
        ]),
      ]
    },
    {
      id: 'p7-t3', name: 'Term 3', startDate: '2025-09-15', endDate: '2025-12-05',
      subjects: [
        subj('p7-rev', 'Final Revision & PLE', 'Exam preparation', 'compulsory', 'sciences', 't1', [
          t('p7-rev-1', 'Intensive Cross-Subject Revision', 'Targeted weak-area drilling', ['Personalised Study Plans', 'Past Paper Marathon', 'Group Sessions']),
          t('p7-rev-2', 'PLE Examination Period', 'Final UNEB examinations', ['Exam Timetable', 'Exam Technique', 'Stress Management']),
        ], true),
      ]
    }
  ]
};

/* ══════════════════════ EXPORTED DATA ══════════════════════ */


export const MOCK_CURRICULUM_LEVELS: UgandaLevel[] = [
  {
    id: 'upper_primary',
    name: 'Upper Primary',
    description: 'Primary 4 to Primary 7 (PLE Candidate Year), covering foundational NCDC primary subjects',
    classes: [primaryFour, primaryFive, primarySix, primarySeven],
  },
  {
    id: 'olevel',
    name: "O'level",
    description: 'Ordinary Level — Senior 1 to Senior 4, aligned to the NCDC Lower Secondary Curriculum Framework',
    classes: [seniorOne, seniorTwo, seniorThree, seniorFour],
  },
  {
    id: 'alevel',
    name: "A'level",
    description: 'Advanced Level — Senior 5 to Senior 6, culminating in the UACE examinations',
    classes: [seniorFive, seniorSix],
  },
];

/** Lookup a class by ID from the mock curriculum tree */
export function getMockClassById(classId: string): UgandaClass | null {
  for (const level of MOCK_CURRICULUM_LEVELS) {
    const found = level.classes.find(c => c.id === classId);
    if (found) return found;
  }
  return null;
}

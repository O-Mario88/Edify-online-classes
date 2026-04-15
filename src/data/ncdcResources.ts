// ────────────────────────────────────────────────────────────────
// NCDC Free Resources – scraped from https://ncdc.go.ug/resource/
// All materials are free, published by the National Curriculum
// Development Centre (NCDC), Uganda.
// ────────────────────────────────────────────────────────────────

export interface NCDCResource {
  id: string;
  title: string;
  author: string;
  subject: string;
  category: string;
  file_url: string;
  cover_image: string;
  rating: number;
  price: number;
  pages: number;
  description: string;
  format: 'pdf' | 'video' | 'link';
  is_featured: boolean;
}

const NCDC = 'NCDC Uganda';
const COVER = 'https://ncdc.go.ug/wp-content/uploads';
const DL   = 'https://ncdc.go.ug/wp-content/uploads';

export const NCDC_RESOURCES: NCDCResource[] = [
  // ═══════════════════════ SYLLABI (O-Level / A-Level) ═══════════════════════

  // --- Mathematics ---
  {
    id: 'ncdc-1', title: 'Principal Mathematics Syllabus', author: NCDC, subject: 'Mathematics',
    category: 'Textbook', file_url: `${DL}/2025/03/PRINCIPAL-MATHS.pdf`,
    cover_image: `${COVER}/2025/03/Principle-math.png`, rating: 4.9, price: 0, pages: 80,
    description: 'Official NCDC A-Level Principal Mathematics syllabus covering pure mathematics, applied mathematics, and statistics.',
    format: 'pdf', is_featured: true,
  },
  {
    id: 'ncdc-2', title: 'Subsidiary Mathematics Syllabus', author: NCDC, subject: 'Mathematics',
    category: 'Textbook', file_url: `${DL}/2025/03/SUBSIDIARY-MATHEMATICS.pdf`,
    cover_image: `${COVER}/2025/03/Subsidiary-math.png`, rating: 4.7, price: 0, pages: 60,
    description: 'Official NCDC A-Level Subsidiary Mathematics syllabus for arts-combination students.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-3', title: 'Subsidiary Mathematics Textbook', author: NCDC, subject: 'Mathematics',
    category: 'Textbook', file_url: `${DL}/2025/05/SUB-MATHEMATICS-book.pdf`,
    cover_image: `${COVER}/2025/05/coverpagesubmath.png`, rating: 4.8, price: 0, pages: 120,
    description: 'Complete subsidiary mathematics textbook with worked examples and exercises.',
    format: 'pdf', is_featured: true,
  },

  // --- Physics ---
  {
    id: 'ncdc-4', title: 'Physics Syllabus', author: NCDC, subject: 'Physics',
    category: 'Textbook', file_url: `${DL}/2025/03/Physics.pdf`,
    cover_image: `${COVER}/2025/03/Physics.png`, rating: 4.8, price: 0, pages: 85,
    description: 'Official NCDC A-Level Physics syllabus covering mechanics, waves, electricity, and modern physics.',
    format: 'pdf', is_featured: true,
  },

  // --- Chemistry ---
  {
    id: 'ncdc-5', title: 'Chemistry Syllabus', author: NCDC, subject: 'Chemistry',
    category: 'Textbook', file_url: `${DL}/2025/03/CHEMISTRY.pdf`,
    cover_image: `${COVER}/2025/03/Chemistrycoverpage.png`, rating: 4.8, price: 0, pages: 90,
    description: 'Official NCDC A-Level Chemistry syllabus – inorganic, organic, and physical chemistry.',
    format: 'pdf', is_featured: true,
  },

  // --- Biology ---
  {
    id: 'ncdc-6', title: 'Biology Syllabus', author: NCDC, subject: 'Biology',
    category: 'Textbook', file_url: `${DL}/2025/03/Biology.pdf`,
    cover_image: `${COVER}/2025/03/Biology-cover-page.png`, rating: 4.9, price: 0, pages: 95,
    description: 'Official NCDC A-Level Biology syllabus covering cell biology, genetics, ecology, and human biology.',
    format: 'pdf', is_featured: true,
  },
  {
    id: 'ncdc-7', title: 'Biology Textbook – Senior One', author: NCDC, subject: 'Biology',
    category: 'Textbook', file_url: `${DL}/2024/03/Biology-prototype.pdf`,
    cover_image: `${COVER}/2024/03/Biologytexcover.png`, rating: 4.8, price: 0, pages: 150,
    description: 'NCDC approved S.1 Biology textbook with diagrams, experiments, and review questions.',
    format: 'pdf', is_featured: true,
  },
  {
    id: 'ncdc-8', title: "Biology Teacher's Guide – S.1", author: NCDC, subject: 'Biology',
    category: 'Notes', file_url: `${DL}/2024/03/Biology-Teachers-Guide.pdf`,
    cover_image: `${COVER}/2024/03/coverpage-TG-Biology.png`, rating: 4.7, price: 0, pages: 100,
    description: "Teacher's companion guide for S.1 Biology with lesson plans, assessment tips, and activity guides.",
    format: 'pdf', is_featured: false,
  },

  // --- Geography ---
  {
    id: 'ncdc-9', title: 'Geography Syllabus', author: NCDC, subject: 'Geography',
    category: 'Textbook', file_url: `${DL}/2025/03/Geography.pdf`,
    cover_image: `${COVER}/2025/03/Geo.png`, rating: 4.7, price: 0, pages: 80,
    description: 'Official NCDC A-Level Geography syllabus – physical geography, human geography, and fieldwork.',
    format: 'pdf', is_featured: false,
  },

  // --- History ---
  {
    id: 'ncdc-10', title: 'History Syllabus', author: NCDC, subject: 'History',
    category: 'Textbook', file_url: `${DL}/2025/03/HISTORY.pdf`,
    cover_image: `${COVER}/2025/03/History.png`, rating: 4.7, price: 0, pages: 85,
    description: 'Official NCDC A-Level History syllabus covering East African, African, and world history.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-11', title: "History & Political Education S.4 – Teacher's Guide", author: NCDC, subject: 'History',
    category: 'Notes', file_url: `${DL}/2025/06/HISTORY-AND-POLITICAL-EDUCATION-S.4-TEACHERS-GUIDE-FINAL-07.11.2021_Web-file.pdf`,
    cover_image: `${COVER}/2025/06/cover-page-teachers-guide.png`, rating: 4.8, price: 0, pages: 130,
    description: "Comprehensive S.4 History & Political Education teacher's guide with lesson plans and assessment rubrics.",
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-12', title: "History & Political Education S.4 – Learner's Book", author: NCDC, subject: 'History',
    category: 'Textbook', file_url: `${DL}/2025/06/HISTORY-AND-POLITICAL-EDUCATION-S.4-LEARNERS-BOOK-FINAL-07.11.2021_Web-file.pdf`,
    cover_image: `${COVER}/2025/06/History-and-Political-educ.png`, rating: 4.9, price: 0, pages: 180,
    description: "S.4 History & Political Education learner's textbook covering Uganda's political development and governance.",
    format: 'pdf', is_featured: true,
  },

  // --- Economics ---
  {
    id: 'ncdc-13', title: 'Economics Syllabus', author: NCDC, subject: 'Economics',
    category: 'Textbook', file_url: `${DL}/2025/03/Economics.pdf`,
    cover_image: `${COVER}/2025/03/Economics.png`, rating: 4.7, price: 0, pages: 75,
    description: 'Official NCDC A-Level Economics syllabus – microeconomics, macroeconomics, and development economics.',
    format: 'pdf', is_featured: false,
  },

  // --- Literature in English ---
  {
    id: 'ncdc-14', title: 'Literature in English Syllabus', author: NCDC, subject: 'Literature',
    category: 'Textbook', file_url: `${DL}/2025/03/Literature-in-English.pdf`,
    cover_image: `${COVER}/2025/03/Lit-in-English.png`, rating: 4.8, price: 0, pages: 70,
    description: 'Official NCDC A-Level Literature in English syllabus with prescribed texts and examination format.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-15', title: "Literature in English Set Books – A'Level", author: NCDC, subject: 'Literature',
    category: 'Notes', file_url: `${DL}/2025/03/LIT.IN-ENGLISH-SET-BKS-FOR-ALEVEL.pdf`,
    cover_image: `${COVER}/2025/03/img-1.png`, rating: 4.6, price: 0, pages: 30,
    description: "Official list and analysis of prescribed A-Level Literature in English set books.",
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-16', title: 'O-Level Literature in English Set Books (2025–2027)', author: NCDC, subject: 'Literature',
    category: 'Notes', file_url: `${DL}/2025/02/CIRCULAR-ON-OLEVEL-LITERATURE-IN-ENGLISH-SET-BOOKS-2025-27.pdf`,
    cover_image: '', rating: 4.5, price: 0, pages: 10,
    description: 'Circular on the officially prescribed O-Level Literature in English set books for the 2025-2027 cycle.',
    format: 'pdf', is_featured: false,
  },

  // --- Agriculture ---
  {
    id: 'ncdc-17', title: 'Agriculture Syllabus', author: NCDC, subject: 'Agriculture',
    category: 'Textbook', file_url: `${DL}/2025/03/Agriculture.pdf`,
    cover_image: `${COVER}/2025/03/Agricoverpage.png`, rating: 4.6, price: 0, pages: 80,
    description: 'Official NCDC A-Level Agriculture syllabus covering crop husbandry, animal husbandry, and farm management.',
    format: 'pdf', is_featured: false,
  },

  // --- CRE ---
  {
    id: 'ncdc-18', title: 'CRE Syllabus', author: NCDC, subject: 'CRE',
    category: 'Textbook', file_url: `${DL}/2025/03/CRE-SYLLABUS.pdf`,
    cover_image: `${COVER}/2025/03/CRE-cover-page.png`, rating: 4.7, price: 0, pages: 70,
    description: 'Official NCDC A-Level Christian Religious Education syllabus.',
    format: 'pdf', is_featured: false,
  },

  // --- IRE ---
  {
    id: 'ncdc-19', title: 'IRE Syllabus', author: NCDC, subject: 'IRE',
    category: 'Textbook', file_url: `${DL}/2025/03/IRE-Approved-_Corrected-Updated-03.06.2025-Book_Web-file.pdf`,
    cover_image: `${COVER}/2025/03/IRE.png`, rating: 4.6, price: 0, pages: 65,
    description: 'Official NCDC A-Level Islamic Religious Education syllabus (updated June 2025).',
    format: 'pdf', is_featured: false,
  },

  // --- Art & Design ---
  {
    id: 'ncdc-20', title: 'Art & Design Syllabus', author: NCDC, subject: 'Art & Design',
    category: 'Textbook', file_url: `${DL}/2025/03/Art-Design.pdf`,
    cover_image: `${COVER}/2025/03/Art-Design-coverpage.png`, rating: 4.5, price: 0, pages: 60,
    description: 'Official NCDC A-Level Art & Design syllabus covering practical and theoretical components.',
    format: 'pdf', is_featured: false,
  },

  // --- Entrepreneurship ---
  {
    id: 'ncdc-21', title: 'Entrepreneurship Syllabus', author: NCDC, subject: 'Entrepreneurship',
    category: 'Textbook', file_url: `${DL}/2025/03/Entrepreneurship.pdf`,
    cover_image: `${COVER}/2025/03/entrepreneurship.png`, rating: 4.6, price: 0, pages: 65,
    description: 'Official NCDC A-Level Entrepreneurship Education syllabus with competence-based assessment guidelines.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-22', title: "Entrepreneurship Education – A-Level Teacher's Guide (S.5 & S.6)", author: NCDC,
    subject: 'Entrepreneurship', category: 'Notes',
    file_url: `${DL}/2025/05/Entrepreneurship-Education-A-level-Teachers-Guide-2011.pdf`,
    cover_image: `${COVER}/2025/05/Entrepreneurship-Education-T-G-Cover-2011_page-0001.jpg`,
    rating: 4.5, price: 0, pages: 110,
    description: "Teacher's guide for A-Level Entrepreneurship with lesson activities, projects, and business simulations.",
    format: 'pdf', is_featured: false,
  },

  // --- Music ---
  {
    id: 'ncdc-23', title: 'Music Syllabus', author: NCDC, subject: 'Music',
    category: 'Textbook', file_url: `${DL}/2025/03/MUSIC.pdf`,
    cover_image: `${COVER}/2025/03/Music.png`, rating: 4.5, price: 0, pages: 55,
    description: 'Official NCDC A-Level Music syllabus covering theory, practical performance, and African music.',
    format: 'pdf', is_featured: false,
  },

  // --- Foods & Nutrition ---
  {
    id: 'ncdc-24', title: 'Foods & Nutrition Syllabus', author: NCDC, subject: 'Foods & Nutrition',
    category: 'Textbook', file_url: `${DL}/2025/03/Foods-and-Nutrition.pdf`,
    cover_image: `${COVER}/2025/03/food-Nutrition.png`, rating: 4.5, price: 0, pages: 60,
    description: 'Official NCDC A-Level Foods & Nutrition syllabus with nutrition science and food preparation modules.',
    format: 'pdf', is_featured: false,
  },

  // --- Clothing & Textile ---
  {
    id: 'ncdc-25', title: 'Clothing & Textile Syllabus', author: NCDC, subject: 'Clothing & Textile',
    category: 'Textbook', file_url: `${DL}/2025/03/CLOTHING-AND-TEXTILE.pdf`,
    cover_image: `${COVER}/2025/03/Clothing-Textile-cover.png`, rating: 4.4, price: 0, pages: 55,
    description: 'Official NCDC A-Level Clothing & Textile syllabus.',
    format: 'pdf', is_featured: false,
  },

  // --- Kiswahili ---
  {
    id: 'ncdc-26', title: 'Kiswahili Syllabus', author: NCDC, subject: 'Kiswahili',
    category: 'Textbook', file_url: `${DL}/2025/03/Kiswahili.pdf`,
    cover_image: `${COVER}/2025/03/Kiswahili.png`, rating: 4.6, price: 0, pages: 65,
    description: 'Official NCDC A-Level Kiswahili syllabus covering grammar, literature, and composition.',
    format: 'pdf', is_featured: false,
  },

  // --- ICT ---
  {
    id: 'ncdc-27', title: 'Subsidiary ICT Syllabus', author: NCDC, subject: 'ICT',
    category: 'Textbook', file_url: `${DL}/2025/03/Subsidiary-ICT.pdf`,
    cover_image: `${COVER}/2025/03/Sub-ICT.png`, rating: 4.6, price: 0, pages: 50,
    description: 'Official NCDC A-Level Subsidiary ICT syllabus covering computer fundamentals, networking, and databases.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-28', title: 'ICT Integration in Teaching & Learning', author: NCDC, subject: 'ICT',
    category: 'Notes', file_url: `${DL}/2025/04/ICT-document.pdf`,
    cover_image: `${COVER}/2025/04/cover-ICT-integration.png`, rating: 4.7, price: 0, pages: 40,
    description: 'Guide for integrating ICT tools into classroom instruction across all subjects.',
    format: 'pdf', is_featured: false,
  },

  // --- Technical Subjects ---
  {
    id: 'ncdc-29', title: 'Woodwork Syllabus', author: NCDC, subject: 'Woodwork',
    category: 'Textbook', file_url: `${DL}/2025/03/Woodwork.pdf`,
    cover_image: `${COVER}/2025/03/Wood-work.png`, rating: 4.4, price: 0, pages: 50,
    description: 'Official NCDC A-Level Woodwork syllabus with practical and theory components.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-30', title: 'Technical Drawing Syllabus', author: NCDC, subject: 'Technical Drawing',
    category: 'Textbook', file_url: `${DL}/2025/03/TEchnical-Drawing.pdf`,
    cover_image: `${COVER}/2025/03/Technical-Drawing.png`, rating: 4.5, price: 0, pages: 55,
    description: 'Official NCDC A-Level Technical Drawing syllabus with drafting and design standards.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-31', title: 'Metal Work Syllabus', author: NCDC, subject: 'Metal Work',
    category: 'Textbook', file_url: `${DL}/2025/03/Metal-Work.pdf`,
    cover_image: `${COVER}/2025/03/Metal-work.png`, rating: 4.4, price: 0, pages: 50,
    description: 'Official NCDC A-Level Metal Work syllabus covering fabrication, welding, and machining.',
    format: 'pdf', is_featured: false,
  },

  // --- General Paper ---
  {
    id: 'ncdc-32', title: 'General Paper Syllabus', author: NCDC, subject: 'General Paper',
    category: 'Textbook', file_url: `${DL}/2025/03/General-Paper.pdf`,
    cover_image: `${COVER}/2025/03/General-paper.png`, rating: 4.8, price: 0, pages: 45,
    description: 'Official NCDC A-Level General Paper syllabus – essay writing, comprehension, and critical analysis.',
    format: 'pdf', is_featured: true,
  },

  // --- Foreign Languages ---
  {
    id: 'ncdc-33', title: 'Arabic Syllabus', author: NCDC, subject: 'Arabic',
    category: 'Textbook', file_url: `${DL}/2025/03/Arabic_Syllabus.pdf`,
    cover_image: `${COVER}/2025/03/Arabic.png`, rating: 4.4, price: 0, pages: 50,
    description: 'Official NCDC A-Level Arabic language syllabus.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-34', title: 'German Language Syllabus', author: NCDC, subject: 'German',
    category: 'Textbook', file_url: `${DL}/2025/03/German-Language.pdf`,
    cover_image: `${COVER}/2025/03/German.png`, rating: 4.3, price: 0, pages: 50,
    description: 'Official NCDC A-Level German language syllabus.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-35', title: 'Latin Language Syllabus', author: NCDC, subject: 'Latin',
    category: 'Textbook', file_url: `${DL}/2025/03/Latin-Language.pdf`,
    cover_image: `${COVER}/2025/03/Latine.png`, rating: 4.3, price: 0, pages: 45,
    description: 'Official NCDC A-Level Latin language syllabus.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-36', title: 'Chinese Syllabus', author: NCDC, subject: 'Chinese',
    category: 'Textbook', file_url: `${DL}/2025/03/Chinese.pdf`,
    cover_image: '', rating: 4.3, price: 0, pages: 45,
    description: 'Official NCDC A-Level Chinese language syllabus.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-37', title: 'Local Languages Framework', author: NCDC, subject: 'Languages',
    category: 'Notes', file_url: `${DL}/2025/03/Local-Languages-Framework.pdf`,
    cover_image: `${COVER}/2025/03/Local-Language-framework.png`, rating: 4.5, price: 0, pages: 40,
    description: 'NCDC framework for teaching and assessing Ugandan local languages in secondary schools.',
    format: 'pdf', is_featured: false,
  },

  // ═══════════════════════ COMBINED SUBJECT TRAINING GUIDES ═══════════════════════

  {
    id: 'ncdc-38', title: 'Mathematics, Physics & Subsidiary Maths – Training Guide', author: NCDC,
    subject: 'Mathematics', category: 'Notes',
    file_url: `${DL}/2025/05/MTC-Physics-Subjects.pdf`,
    cover_image: `${COVER}/2025/05/coverpage-1.png`, rating: 4.7, price: 0, pages: 200,
    description: 'Combined NCDC training manual for Mathematics, Physics, and Subsidiary Mathematics subject teachers.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-39', title: 'Biology, Chemistry & Agriculture – Training Guide', author: NCDC,
    subject: 'Biology', category: 'Notes',
    file_url: `${DL}/2025/05/Biol-Chem-Agric-Subjects-Final.pdf`,
    cover_image: `${COVER}/2025/05/Vol-1-Cover_page-0001.jpg`, rating: 4.7, price: 0, pages: 200,
    description: 'Combined NCDC training manual for Biology, Chemistry, and Agriculture subject teachers.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-40', title: 'Economics, Geography & History – Training Guide', author: NCDC,
    subject: 'Economics', category: 'Notes',
    file_url: `${DL}/2025/05/Economics-Geog-Hist_compressed_compressed.pdf`,
    cover_image: `${COVER}/2025/05/coverpage-3.png`, rating: 4.6, price: 0, pages: 180,
    description: 'Combined NCDC training manual for Economics, Geography, and History subject teachers.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-41', title: 'Art, English Literature, Local Languages & GP – Training Guide', author: NCDC,
    subject: 'Literature', category: 'Notes',
    file_url: `${DL}/2025/05/Art-Lit-Local-Lang-GP.pdf`,
    cover_image: `${COVER}/2025/05/coverpage2013.png`, rating: 4.6, price: 0, pages: 170,
    description: 'Combined training guide for Art & Design, Literature in English, Local Languages, and General Paper.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-42', title: 'Kiswahili & Music – Training Guide', author: NCDC,
    subject: 'Kiswahili', category: 'Notes',
    file_url: `${DL}/2025/05/Kiswahili-Music.pdf`,
    cover_image: `${COVER}/2025/05/coverpage-4.png`, rating: 4.5, price: 0, pages: 120,
    description: 'Combined NCDC training manual for Kiswahili and Music subject teachers.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-43', title: 'CRE & IRE – Training Guide', author: NCDC,
    subject: 'CRE', category: 'Notes',
    file_url: `${DL}/2025/05/CRE-IRE_compressed.pdf`,
    cover_image: `${COVER}/2025/05/coverpage-5.png`, rating: 4.5, price: 0, pages: 130,
    description: 'Combined NCDC training manual for CRE and IRE subject teachers.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-44', title: 'Arabic, French, German & Latin – Training Guide', author: NCDC,
    subject: 'Languages', category: 'Notes',
    file_url: `${DL}/2025/05/Foreign-Langs_compressed-compressed.pdf`,
    cover_image: `${COVER}/2025/05/coverpage-2.png`, rating: 4.5, price: 0, pages: 150,
    description: 'Combined NCDC training manual for foreign language teachers (Arabic, French, German, Latin).',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-45', title: 'Clothing & Textile, Foods & Nutrition – Training Guide', author: NCDC,
    subject: 'Foods & Nutrition', category: 'Notes',
    file_url: `${DL}/2025/05/Clothing-FN-Subjects_compressed-compressed.pdf`,
    cover_image: `${COVER}/2025/05/Clothing-FN-Subjects-Cover_page-0001.jpg`, rating: 4.5, price: 0, pages: 140,
    description: 'Combined NCDC training manual for Clothing & Textile and Foods & Nutrition teachers.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-46', title: 'Technical Drawing, Metalwork & Woodwork – Training Guide', author: NCDC,
    subject: 'Technical Drawing', category: 'Notes',
    file_url: `${DL}/2025/05/Metalwk-TD-Woodwk-Subjects_compressed.pdf`,
    cover_image: `${COVER}/2025/05/Pasted-image.png`, rating: 4.5, price: 0, pages: 150,
    description: 'Combined NCDC training manual for Technical Drawing, Metalwork, and Woodwork teachers.',
    format: 'pdf', is_featured: false,
  },

  // ═══════════════════════ CURRICULUM FRAMEWORK & GUIDES ═══════════════════════

  {
    id: 'ncdc-47', title: 'Understanding the Curriculum Materials', author: NCDC, subject: 'General',
    category: 'Notes', file_url: `${DL}/2025/04/Understanding-the-curriculum-materials-2.pdf`,
    cover_image: `${COVER}/2025/04/understanding-curriculum-documents.png`, rating: 4.8, price: 0, pages: 50,
    description: 'Guide for educators on interpreting and using NCDC curriculum documents effectively.',
    format: 'pdf', is_featured: false,
  },
  {
    id: 'ncdc-48', title: 'Sign Language Syllabus', author: NCDC, subject: 'Languages',
    category: 'Textbook', file_url: `${DL}/2024/02/UGANDAN-SIGN-LANGUAGE-SYLLABUS-BOOK.pdf`,
    cover_image: `${COVER}/2024/02/UGANDAN-SIGN-LANGUAGE-SYLLABUS-BOOK-3.jpg`, rating: 4.6, price: 0, pages: 70,
    description: 'Ugandan Sign Language syllabus for secondary schools promoting inclusive education.',
    format: 'pdf', is_featured: false,
  },

  // ═══════════════════════ VIDEOS ═══════════════════════

  {
    id: 'ncdc-49', title: 'ICT in Teaching & Learning', author: NCDC, subject: 'ICT',
    category: 'Video', file_url: 'https://youtu.be/3Iy7-_bzfo4',
    cover_image: `${COVER}/2025/04/Cover_images_downloadable3_optimized_2500.png`, rating: 4.7, price: 0, pages: 0,
    description: 'NCDC video guide on integrating ICT tools into classroom teaching and learning.',
    format: 'video', is_featured: false,
  },
  {
    id: 'ncdc-50', title: 'Linking Real World to Teaching & Learning', author: NCDC, subject: 'General',
    category: 'Video', file_url: 'https://youtu.be/TUiqHmOVemU',
    cover_image: `${COVER}/2025/04/Cover-images-downloadable.png`, rating: 4.6, price: 0, pages: 0,
    description: 'NCDC video on connecting everyday real-world scenarios to curriculum content.',
    format: 'video', is_featured: false,
  },
  {
    id: 'ncdc-51', title: 'Understanding the Curriculum Documents', author: NCDC, subject: 'General',
    category: 'Video', file_url: 'https://youtu.be/e7XcrsX4xOc',
    cover_image: `${COVER}/2025/04/Cover_images_downloadable2_optimized_2500.png`, rating: 4.6, price: 0, pages: 0,
    description: 'NCDC video walkthrough on how to read and use the official curriculum documents.',
    format: 'video', is_featured: false,
  },

  // ═══════════════════════ DIGITAL / E-LEARNING ═══════════════════════

  {
    id: 'ncdc-52', title: 'Digital Content for O-Level Mathematics', author: NCDC, subject: 'Mathematics',
    category: 'Other', file_url: 'https://e-learning.education.go.ug/en/learn/#/topics/t/24f0dc9de70848e68ab8275349485913',
    cover_image: '', rating: 4.8, price: 0, pages: 0,
    description: 'Interactive digital learning content for O-Level Mathematics on the MoES e-learning platform.',
    format: 'link', is_featured: false,
  },
];

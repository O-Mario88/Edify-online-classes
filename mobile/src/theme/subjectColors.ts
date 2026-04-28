/**
 * Subject color identity. Each subject gets a pastel tint + a darker
 * accent that the UI can paint cards/icons with. The mapping is
 * deterministic — same subject name always lands on the same colour
 * so a learner builds visual recognition ("Maths is pink").
 *
 * For known Uganda-curriculum subjects we hand-pick the colour for
 * cultural fit (English green like a notebook, Maths pink like classic
 * primary maths textbooks, Science orange like beakers). Anything we
 * don't recognise hashes into the same palette so unknown subjects
 * still get a stable colour.
 */

export interface SubjectPalette {
  /** Pastel background fill — used for the card surface. */
  bg: string;
  /** Slightly darker border — pairs with bg. */
  border: string;
  /** Accent text color for headlines + icons inside the card. */
  accent: string;
  /** Emoji glyph rendered inside the subject icon disc. */
  glyph: string;
}

const PALETTES: SubjectPalette[] = [
  { bg: 'bg-emerald-100', border: 'border-emerald-200', accent: 'text-emerald-800', glyph: '📖' },
  { bg: 'bg-rose-100',    border: 'border-rose-200',    accent: 'text-rose-800',    glyph: '➗' },
  { bg: 'bg-amber-100',   border: 'border-amber-200',   accent: 'text-amber-800',   glyph: '🧪' },
  { bg: 'bg-purple-100',  border: 'border-purple-200',  accent: 'text-purple-800',  glyph: '📜' },
  { bg: 'bg-blue-100',    border: 'border-blue-200',    accent: 'text-blue-800',    glyph: '🌍' },
  { bg: 'bg-pink-100',    border: 'border-pink-200',    accent: 'text-pink-800',    glyph: '🎨' },
  { bg: 'bg-teal-100',    border: 'border-teal-200',    accent: 'text-teal-800',    glyph: '💻' },
  { bg: 'bg-orange-100',  border: 'border-orange-200',  accent: 'text-orange-800',  glyph: '🎵' },
  { bg: 'bg-indigo-100',  border: 'border-indigo-200',  accent: 'text-indigo-800',  glyph: '✏️' },
  { bg: 'bg-lime-100',    border: 'border-lime-200',    accent: 'text-lime-800',    glyph: '🌱' },
];

const NAMED: Record<string, SubjectPalette> = {
  english:           PALETTES[0],
  reading:           PALETTES[0],
  literature:        PALETTES[0],
  mathematics:       PALETTES[1],
  maths:             PALETTES[1],
  math:              PALETTES[1],
  science:           PALETTES[2],
  biology:           PALETTES[2],
  chemistry:         { ...PALETTES[2], glyph: '⚗️' },
  physics:           { ...PALETTES[2], glyph: '🔭' },
  history:           PALETTES[3],
  geography:         PALETTES[4],
  art:               PALETTES[5],
  ict:               PALETTES[6],
  computer:          PALETTES[6],
  'computer studies': PALETTES[6],
  music:             PALETTES[7],
  social:            PALETTES[3],
  'social studies':  PALETTES[3],
  agriculture:       PALETTES[9],
};

const FALLBACK: SubjectPalette = {
  bg: 'bg-slate-100', border: 'border-slate-200', accent: 'text-slate-700', glyph: '📚',
};

/**
 * Cheap deterministic hash so unknown subject names land on the same
 * palette index every render.
 */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function paletteForSubject(subject: string | null | undefined): SubjectPalette {
  if (!subject) return FALLBACK;
  const key = subject.trim().toLowerCase();
  if (NAMED[key]) return NAMED[key];
  // Try a partial match for compound names ("Senior 4 Mathematics").
  for (const named of Object.keys(NAMED)) {
    if (key.includes(named)) return NAMED[named];
  }
  return PALETTES[hash(key) % PALETTES.length];
}

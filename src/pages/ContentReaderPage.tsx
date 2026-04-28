import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReaderTopBar, ReaderSidebar, ReaderToolbar } from '../components/reader/ReaderShell';
import { ContentBlockRenderer } from '../components/reader/ReaderBlocks';
import { ReadingProgressCard, QuickReferenceCard, RelatedResourcesCard, ReaderComingSoon } from '../components/reader/ReaderRightRail';
import { CONTENT_REGISTRY, DEFAULT_SUBJECT, resolveResource } from '../components/reader/content';

const READING_BG = '#FFFDF9';
const SOFT_BORDER = '#E6EAF2';
const MUTED = '#64748B';

/**
 * Unified Content Reader.
 *
 * One page renders every reading surface in Maple Online School: notes,
 * textbooks, revision notes, study guides, and worked examples. URL
 * params drive which subject / chapter / topic is loaded; everything
 * else (left chapter tree, right utility cards, content blocks) is
 * generated dynamically from the content registry.
 *
 * Routes:
 *   /learn                                   → default subject home
 *   /learn/:subjectSlug                      → first chapter of subject
 *   /learn/:subjectSlug/:chapterSlug         → first topic of chapter
 *   /learn/:subjectSlug/:chapterSlug/:topicSlug
 */
export const ContentReaderPage: React.FC = () => {
  const { subjectSlug, chapterSlug, topicSlug } = useParams<{
    subjectSlug?: string;
    chapterSlug?: string;
    topicSlug?: string;
  }>();
  const navigate = useNavigate();

  const { subject, resource } = useMemo(
    () => resolveResource(subjectSlug, chapterSlug, topicSlug),
    [subjectSlug, chapterSlug, topicSlug],
  );

  const [zoom, setZoom] = useState(100);
  const [focusActive, setFocusActive] = useState(false);

  const onPrev = () => {
    if (!resource) return;
    const flat = flattenTopics(subject.subject, subject.chapters);
    const idx = flat.findIndex((t) => t.chapterId === resource.chapterId && t.topicId === resource.topicId);
    if (idx > 0) {
      const prev = flat[idx - 1];
      navigate(`/learn/${subject.subject}/${prev.chapterId}/${prev.topicId}`);
    }
  };
  const onNext = () => {
    if (!resource) return;
    const flat = flattenTopics(subject.subject, subject.chapters);
    const idx = flat.findIndex((t) => t.chapterId === resource.chapterId && t.topicId === resource.topicId);
    if (idx >= 0 && idx < flat.length - 1) {
      const nxt = flat[idx + 1];
      navigate(`/learn/${subject.subject}/${nxt.chapterId}/${nxt.topicId}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBFCFF' }}>
      <ReaderTopBar />

      <div className="mx-auto max-w-[1500px] px-5 flex gap-6">
        {!focusActive && <ReaderSidebar subject={subject} resource={resource} focusActive={focusActive} />}

        <main className="flex-1 min-w-0 py-5 grid xl:grid-cols-[1fr,300px] gap-6">
          <div className="min-w-0 space-y-4">
            {resource && (
              <>
                <ReaderToolbar
                  resource={resource}
                  onPrev={onPrev}
                  onNext={onNext}
                  zoom={zoom}
                  onZoom={setZoom}
                  focusActive={focusActive}
                  onToggleFocus={() => setFocusActive((v) => !v)}
                />

                <article
                  className="rounded-2xl bg-white border px-7 py-9 sm:px-10 sm:py-12"
                  style={{ borderColor: SOFT_BORDER, backgroundColor: READING_BG, fontSize: `${zoom}%` }}
                >
                  <ContentBlockRenderer blocks={resource.blocks} />
                </article>

                <p className="text-[11px] text-center" style={{ color: MUTED }}>
                  {resource.subjectLabel} • {resource.classLevel} • {resource.chapterTitle}
                </p>
              </>
            )}
            {!resource && (
              <ReaderComingSoon topicTitle={topicSlug || 'This topic'} />
            )}
          </div>

          {!focusActive && resource && (
            <aside className="space-y-5 min-w-0 py-5 xl:py-0">
              <ReadingProgressCard resource={resource} />
              <QuickReferenceCard resource={resource} />
              <RelatedResourcesCard resource={resource} />
            </aside>
          )}
        </main>
      </div>

      {/* Tiny status footer naming the active scope so editors know which slug they're on */}
      <footer className="border-t mt-8" style={{ borderColor: SOFT_BORDER }}>
        <div className="mx-auto max-w-[1500px] px-5 py-4 text-center text-[11px]" style={{ color: MUTED }}>
          Maple Online School Reader · subject <code className="font-mono">{subject.subject}</code>
          {resource && (
            <> · chapter <code className="font-mono">{resource.chapterId}</code> · topic <code className="font-mono">{resource.topicId}</code></>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ContentReaderPage;

/* ────── helpers ────── */
function flattenTopics(_subjectSlug: string, chapters: import('../components/reader/types').ChapterNode[]) {
  const out: { chapterId: string; topicId: string }[] = [];
  for (const c of chapters) {
    for (const t of c.topics ?? []) out.push({ chapterId: c.id, topicId: t.id });
  }
  return out;
}

/* Re-exports for convenient direct linking from elsewhere in the app. */
export { CONTENT_REGISTRY, DEFAULT_SUBJECT };

import { useCallback } from 'react';
import { A, GALLERY, TRENDS } from './data';
import { useStore } from './store';

/** What a picked gallery photo looks like once enhanced (before/after pair). */
export function enhancedPair(src: string) {
  if (src === A.enhance2Before) return { image: A.enhance2After, before: A.enhance2Before };
  if (src === A.enhanceBefore) return { image: A.enhanceSrc, before: A.enhanceBefore };
  if (src.includes('archive_old')) return { image: src.replace('archive_old', 'archive_restored'), before: src };
  return { image: src, before: undefined };
}

/** Multi-step user flows shared by several screens. */
export function useFlows() {
  const s = useStore();
  const { push, pop, replaceTop, runGenerating, track, spendFree } = s;

  /** Quick enhance, exactly as Remini does it: pick, enhance, result. */
  const quickEnhance = useCallback(
    (title = 'Enhance') => {
      const kept = new Set([...s.creationsRef.current.flatMap((c) => c.photos.map((p) => p.original)), ...s.keptRef.current.map((k) => k.replace('archive_restored', 'archive_old').replace('enhance2_after.jpg|me_ref_4.jpg', A.enhance2Before))]);
      push({
        name: 'picker',
        title,
        max: 1,
        preselect: 1,
        // Photos already in a project move to the end, so the next one is ready to pick.
        pool: [...GALLERY.filter((g) => !kept.has(g)), ...GALLERY.filter((g) => kept.has(g))],
        cta: title === 'Retouch' ? 'Retouch' : 'Enhance',
        onDone: (picked) => {
          const src = picked[0] ?? GALLERY[0];
          const pair = enhancedPair(src);
          runGenerating({ steps: ['Uploading', src.includes('archive_old') ? 'Restoring faces' : 'Enhancing details'], duration: 1600, preview: src }, () => {
            spendFree();
            track('enhance_completed');
            replaceTop({ name: 'result', kind: 'enhance', title: src.includes('archive_old') ? 'Restored' : 'Enhanced', ...pair });
          });
        },
      });
    },
    [push, replaceTop, runGenerating, s, spendFree, track],
  );

  /** Today: upload 8–12 selfies every time and wait for a model. */
  const tryTrendToday = useCallback(
    (trendId: string) => {
      const t = TRENDS.find((x) => x.id === trendId) ?? TRENDS[0];
      push({
        name: 'picker',
        title: 'Upload 8–12 selfies',
        max: 12,
        preselect: 8,
        pool: [...[1, 2, 3, 4].map(A.ref), A.enhanceBefore, A.enhance2Before, A.trip(1)],
        cta: 'Continue',
        onDone: () => {
          runGenerating({ steps: ['Uploading 8 selfies', 'Training your model', `Generating ${t.title}`], duration: 2500, preview: t.result }, () => {
            track('trend_generated_today');
            replaceTop({ name: 'result', kind: 'trend', image: t.result, title: t.title, trendId: t.id });
          });
        },
      });
    },
    [push, replaceTop, runGenerating, track],
  );

  /** With Studio: the trend runs on your saved Me, no new selfies. */
  const tryTrendMine = useCallback(
    (trendId: string) => {
      const t = TRENDS.find((x) => x.id === trendId) ?? TRENDS[0];
      s.withMe(() =>
        runGenerating({ steps: ['With your profile, Me', 'No new selfies needed', `Styling ${t.title}`], duration: 2000, preview: t.result }, () => {
          track('trend_on_saved_profile', 'w');
          push({ name: 'result', kind: 'trend', image: t.result, title: t.title, trendId: t.id });
        }),
      );
    },
    [push, runGenerating, s, track],
  );

  return { quickEnhance, tryTrendToday, tryTrendMine, pop };
}

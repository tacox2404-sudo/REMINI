import { useCallback } from 'react';
import { A, CAMERA_ROLL, TRENDS } from './data';
import { useStore } from './store';
import type { ResultKind } from './types';

/** Multi-step user flows shared by several screens. */
export function useFlows() {
  const s = useStore();
  const { push, pop, replaceTop, runGenerating, track, mode } = s;

  const enhancePhoto = useCallback(() => {
    push({
      name: 'picker',
      title: 'Choose a photo to enhance',
      max: 1,
      cta: 'Enhance',
      onDone: (picked) => {
        const src = picked[0] ?? A.enhanceBefore;
        const pair = src === A.enhance2Before ? { image: A.enhance2After, before: A.enhance2Before } : { image: A.enhanceSrc, before: A.enhanceBefore };
        runGenerating({ steps: ['Uploading', 'Enhancing details', 'Restoring faces'], duration: 1800, preview: pair.before }, () => {
          track('enhance_completed');
          replaceTop({ name: 'result', kind: 'enhance', title: 'Enhanced', ...pair });
        });
      },
    });
  }, [push, replaceTop, runGenerating, track]);

  /** With Studio: the saved "Me" is used automatically, no selfie upload. */
  const tryTrendMine = useCallback(
    (trendId: string, replace = false) => {
      const t = TRENDS.find((x) => x.id === trendId) ?? TRENDS[0];
      runGenerating({ steps: ['Using your saved Me', 'No new selfies needed', `Styling ${t.title}`], duration: 2000, preview: t.result }, () => {
        track('trend_tried_with_saved_me', 'w');
        const r = { name: 'result' as const, kind: 'trend' as const, image: t.result, title: t.title, trendId: t.id };
        if (replace) replaceTop(r);
        else push(r);
      });
    },
    [push, replaceTop, runGenerating, track],
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

  const openTrend = useCallback(
    (trendId: string, direct = false) => {
      if (direct && mode === 'studio') return tryTrendMine(trendId);
      push({ name: 'trend', trendId });
    },
    [mode, push, tryTrendMine],
  );

  /** Generic single-photo tool (filters, retouch, videos). */
  const quickTool = useCallback(
    (title: string, kind: ResultKind, image: string, video = false) => {
      push({
        name: 'picker',
        title: `${title}: choose a photo`,
        max: 1,
        pool: CAMERA_ROLL,
        cta: 'Continue',
        onDone: (picked) => {
          const src = picked[0] ?? image;
          runGenerating({ steps: ['Uploading', `Applying ${title}`, 'Almost there'], duration: 1800, preview: src }, () => {
            track(video ? 'video_generated' : 'tool_used');
            if (video) replaceTop({ name: 'animate', src, creationId: '' });
            else replaceTop({ name: 'result', kind, image: kind === 'look' ? image : src, title });
          });
        },
      });
    },
    [push, replaceTop, runGenerating, track],
  );

  return { enhancePhoto, tryTrendMine, tryTrendToday, openTrend, quickTool, pop };
}

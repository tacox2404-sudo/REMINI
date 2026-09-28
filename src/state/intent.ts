import { A, CAMERA_ROLL, INTENTS } from './data';
import type { Store } from './store';
import type { Intent } from './types';

/** "What are you creating?" → "Pick 3 to 5 photos" → short generating → the creation opens. */
export function startIntent(s: Store, intent: Intent) {
  const meta = INTENTS.find((i) => i.id === intent)!;
  s.track(`intent: ${meta.title}`, 't');
  const pool =
    intent === 'family'
      ? [1, 2, 3, 4].map(A.old)
      : intent === 'trip'
        ? CAMERA_ROLL
        : [...[1, 2, 3, 4].map(A.ref), A.enhance2Before, A.trip(1), A.friend];
  s.push({
    name: 'picker',
    title: 'Pick 3 to 5 photos',
    min: 3,
    max: 5,
    preselect: intent === 'trip' ? 5 : 3,
    pool,
    cta: 'Create',
    onDone: (picked) => {
      s.runGenerating(
        { steps: ['Looking at your photos', intent === 'trip' ? 'Finding the rest of the trip' : 'Setting it up with your saved Me', 'Almost ready'], duration: 1900, preview: picked[0] },
        () => {
          const id = s.createFromIntent(intent, picked);
          s.pop();
          s.replaceTop({ name: 'creation', id });
        },
      );
    },
  });
}

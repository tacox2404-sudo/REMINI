import { A, tripAlbum } from './data';
import { startIntent } from './intent';
import type { Store } from './store';
import type { Mode, Route, Tab } from './types';

export interface Beat {
  step: number;
  title: string;
  caption: string;
  target: string | null;
  enter: (s: Store) => void;
}

/** Put the app in a known state so every beat works regardless of what was clicked before. */
function scene(s: Store, mode: Mode, tab: Tab, routes: Route[] = []) {
  s.clearTimers();
  s.clearToast();
  s.closeSheet();
  s.setClosing(false);
  if (s.mode !== mode) s.setMode(mode);
  s.goTab(tab);
  s.resetStack(routes);
}

const y2k: Route = { name: 'result', kind: 'trend', image: A.y2kMe, title: 'Y2K Yearbook', trendId: 'y2k' };
const remix: Route = { name: 'result', kind: 'remix', image: A.remix90s, title: '90s yearbook · your version', styleId: 'st-90s' };

function barcelona(s: Store, enhanced: number) {
  const c = tripAlbum([1, 2, 3, 4, 5].map(A.trip));
  c.photos = c.photos.map((p, i) => ({ ...p, status: i < enhanced ? 'enhanced' : 'original' }));
  s.upsertCreation(c);
  return c.id;
}

export const BEATS: Beat[] = [
  // ---------- Today ----------
  {
    step: 1,
    title: 'Today: “What brings you to Remini?”',
    caption: 'Remini already asks why you came. Today the answer does not change what happens next.',
    target: 'segments',
    enter: (s) => scene(s, 'today', 'enhance', [{ name: 'onboarding', step: 'question' }]),
  },
  {
    step: 1,
    title: 'Today: a paywall before any use',
    caption: 'Whatever you answer, the next screen is the paywall, before you have made anything.',
    target: 'paywall-generic',
    enter: (s) => {
      scene(s, 'today', 'enhance');
      s.answerSegment('profile', 'today');
    },
  },
  {
    step: 1,
    title: 'Today: one trend',
    caption: 'Close the paywall, tap the trend of the week, upload 8–12 selfies and wait for a model to train.',
    target: 'trend-card',
    enter: (s) => scene(s, 'today', 'enhance'),
  },
  {
    step: 1,
    title: 'Today: one image, a generic paywall',
    caption: 'You get one image. Downloading it or seeing the rest leads to the same generic paywall.',
    target: 'paywall-generic',
    enter: (s) => {
      scene(s, 'today', 'enhance', [{ name: 'trend', trendId: 'y2k' }, y2k]);
      s.openSheet({ type: 'paywallGeneric', image: A.y2kMe, reason: 'result' });
    },
  },
  {
    step: 1,
    title: 'Today: gone',
    caption: 'Close it and nothing is kept: no history, no saved face, nothing to continue. The next visit depends on the next trend.',
    target: null,
    enter: (s) => {
      scene(s, 'today', 'enhance');
      s.openSheet({ type: 'profileToday' });
    },
  },
  // ---------- With Studio ----------
  {
    step: 2,
    title: 'With Studio: the same question',
    caption: 'Same onboarding question. The answer is logged as a segment and now shapes what the user gets.',
    target: 'segment-profile',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'onboarding', step: 'question' }]),
  },
  {
    step: 2,
    title: 'The answer creates a starter',
    caption: '“Profile or work photos” creates “LinkedIn set, 0 of 5” in My Creations. There is something to finish from minute one.',
    target: 'welcome-card',
    enter: (s) => {
      scene(s, 'studio', 'studio');
      s.answerSegment('profile', 'studio');
    },
  },
  {
    step: 3,
    title: 'Welcome back',
    caption: 'Three days later. Studio opens on the unfinished work, then Keep going, Trending from Remini and Styles from the community.',
    target: 'welcome-card',
    enter: (s) => {
      s.becomeReturning();
      scene(s, 'studio', 'studio');
    },
  },
  {
    step: 3,
    title: 'Continue the LinkedIn set',
    caption: 'Three done, two empty slots. One tap makes the rest with the saved Me; it saves itself.',
    target: 'make-more',
    enter: (s) => {
      s.becomeReturning();
      scene(s, 'studio', 'studio', [{ name: 'creation', id: 'linkedin' }]);
    },
  },
  {
    step: 4,
    title: 'A trend: “Try mine”',
    caption: 'Trends still drive growth. From “Trending from Remini”, “Try mine” uses the saved Me automatically. No new selfies.',
    target: 'try-mine',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'trend', trendId: 'y2k' }]),
  },
  {
    step: 4,
    title: 'The trend lands in the Studio',
    caption: 'The result offers “Keep this”, “Try another photo” and “Make this with a friend”. Kept results go to My Creations.',
    target: 'keep-this',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'trend', trendId: 'y2k' }, y2k]),
  },
  {
    step: 5,
    title: '“What are you creating?”',
    caption: 'Users say what they are working on. The choice is logged, and this screen doubles as the fake-door test design.',
    target: 'intent-trip',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'create' }]),
  },
  {
    step: 5,
    title: 'Pick 3 to 5 photos',
    caption: 'A few photos are enough; Remini finds the rest of the trip. A short wait and it appears in My Creations.',
    target: 'picker-done',
    enter: (s) => {
      scene(s, 'studio', 'studio', [{ name: 'create' }]);
      startIntent(s, 'trip');
    },
  },
  {
    step: 6,
    title: 'Barcelona trip: “Enhance all”',
    caption: 'Seventeen photos. The free user taps “Enhance all”.',
    target: 'enhance-all',
    enter: (s) => {
      s.setFlags({ isPro: false, freeUsed: 0 });
      const id = barcelona(s, 0);
      scene(s, 'studio', 'studio', [{ name: 'creation', id }]);
    },
  },
  {
    step: 6,
    title: 'Paywall on unfinished work',
    caption: '5 of 17 done for free, then “Finish your Barcelona trip with Pro”: progress bar, the remaining photos blurred. Same trial, much stronger reason.',
    target: 'paywall-unfinished',
    enter: (s) => {
      s.setFlags({ isPro: false, freeUsed: 5 });
      const id = barcelona(s, 5);
      scene(s, 'studio', 'studio', [{ name: 'creation', id }]);
      s.openSheet({ type: 'paywall', creationId: id, stage: 'offer' });
    },
  },
  {
    step: 7,
    title: `A friend's style`,
    caption: 'In Remix, Paola’s “90s yearbook” has 12.4k remixes. “Make your version”.',
    target: 'style-friend',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'section', section: 'remix' }]),
  },
  {
    step: 7,
    title: '“Make your version”',
    caption: '“Applying Paola’s style to you”, with your own saved Me. Keep it, share it, or challenge a friend. Remixes always use your own saved identity.',
    target: 'keep-this',
    enter: (s) => {
      scene(s, 'studio', 'studio', [{ name: 'section', section: 'remix' }]);
      s.remixStyle('st-90s', (r) => s.push(r));
    },
  },
  {
    step: 8,
    title: 'Publish as a style',
    caption: 'Name your own recipe and publish it, like a filter on Instagram.',
    target: 'publish-confirm',
    enter: (s) => {
      scene(s, 'studio', 'studio', [{ name: 'section', section: 'remix' }, remix]);
      s.openSheet({ type: 'publish', image: A.remix90s, from: 'Paola' });
    },
  },
  {
    step: 8,
    title: 'The remix counter ticks up',
    caption: 'Your style appears in “Styles from the community” with your name, and the remix count keeps climbing.',
    target: 'style-mine',
    enter: (s) => {
      scene(s, 'studio', 'studio', [{ name: 'section', section: 'remix' }]);
      s.publishStyle('90s yearbook, my way', A.remix90s);
    },
  },
  {
    step: 9,
    title: 'Challenge a friend',
    caption: 'An invite link with a preview card. The friend makes their version with their own identity: installs come from content, not ads.',
    target: 'invite-preview',
    enter: (s) => {
      scene(s, 'studio', 'studio', [{ name: 'section', section: 'remix' }, remix]);
      s.openSheet({ type: 'withFriend', title: '90s yearbook', image: A.remix90s, link: 'remini.app/r/90s-yearbook', challenge: true });
    },
  },
  {
    step: 10,
    title: 'Why it pays',
    caption: 'The business case behind the design.',
    target: null,
    enter: (s) => {
      scene(s, 'studio', 'studio');
      s.setClosing(true);
    },
  },
];

export const TOTAL_STEPS = Math.max(...BEATS.map((b) => b.step));

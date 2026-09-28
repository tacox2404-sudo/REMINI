import { A, friendsTrip } from './data';
import type { Store } from './store';
import type { Mode, Route } from './types';

export interface Beat {
  step: number;
  title: string;
  caption: string;
  target: string | null;
  enter: (s: Store) => void;
}

/** Put the app in a known state so every beat works regardless of what was clicked before. */
function scene(s: Store, mode: Mode, routes: Route[] = []) {
  s.clearTimers();
  s.clearToast();
  s.closeSheet();
  s.setClosing(false);
  if (s.mode !== mode) s.setMode(mode);
  s.goTab(mode === 'studio' ? 'studio' : 'enhance');
  s.resetStack(routes);
}

const y2k: Route = { name: 'result', kind: 'trend', image: A.y2kMe, title: 'Y2K Yearbook', trendId: 'y2k' };
const remix: Route = { name: 'result', kind: 'remix', image: A.remix90s, title: '90s yearbook · your version', styleId: 'st-90s' };

/** Fresh Friends trip album (5 of 17 enhanced) at the top of the Studio. */
function trip(s: Store) {
  s.upsertCreation(friendsTrip());
  return 'trip';
}

export const BEATS: Beat[] = [
  // ---------- Today: a quick reality check ----------
  {
    step: 1,
    title: 'Remini today',
    caption: 'The app as it is: Retouch, Enhance and viral trends on the home; AI Photos, Filters and Videos in the bottom row; Remini Chat in the corner.',
    target: 'tools',
    enter: (s) => scene(s, 'today'),
  },
  {
    step: 1,
    title: 'A profile with 4 selfies',
    caption: 'AI Photos uses one profile made from 4 selfies. Results are listed by pack.',
    target: null,
    enter: (s) => scene(s, 'today', [{ name: 'today', screen: 'photos' }]),
  },
  {
    step: 1,
    title: 'Remini Chat',
    caption: 'Upload a photo, write what you want, and Remini edits it. Now let’s see what Studio adds.',
    target: 'chat-bubble',
    enter: (s) => scene(s, 'today'),
  },
  // ---------- With Studio ----------
  {
    step: 2,
    title: 'Welcome to Studio',
    caption: 'A new space in Remini to come back to your own photo and video creations: keep going, do it together, create with AI.',
    target: null,
    enter: (s) => scene(s, 'studio', [{ name: 'studioIntro' }]),
  },
  {
    step: 2,
    title: 'Set up around you',
    caption: 'Remini’s usual question now shapes the Studio: the answer puts the matching creation first.',
    target: 'segment-profile',
    enter: (s) => scene(s, 'studio', [{ name: 'onboarding', step: 'question' }]),
  },
  {
    step: 3,
    title: 'Your Studio',
    caption: 'Create with Remini chat at the top, then Keep going, Together, New for you, Styles from the community, and your saved Me.',
    target: 'create-ai',
    enter: (s) => scene(s, 'studio'),
  },
  {
    step: 3,
    title: 'Keep going',
    caption: 'Work in progress saves itself, with progress rings: Family archive 4 of 12 restored, Friends trip 5 of 17 enhanced, LinkedIn set 3 of 5.',
    target: 'keep-going',
    enter: (s) => scene(s, 'studio'),
  },
  {
    step: 4,
    title: 'Together: the Friends trip',
    caption: 'An album from the Philippines with Paola, Luca and Marco. Everyone adds photos, and the album keeps one style for all of them.',
    target: 'album-members',
    enter: (s) => scene(s, 'studio', [{ name: 'creation', id: trip(s) }]),
  },
  {
    step: 4,
    title: 'Change it for everyone',
    caption: 'Pick a new look once and every photo, from every friend, updates together.',
    target: 'restyle-all',
    enter: (s) => {
      const id = trip(s);
      scene(s, 'studio', [{ name: 'creation', id }]);
      s.restyleAll(id, 'Warm 35mm film');
    },
  },
  {
    step: 5,
    title: 'The album chat',
    caption: 'Friends create from the album with Remini: Luca asked for a movie poster of everyone, Paola for a recap video of the trip.',
    target: 'album-chat-thread',
    enter: (s) => {
      const id = trip(s);
      scene(s, 'studio', [{ name: 'creation', id }, { name: 'chat', creationId: id }]);
    },
  },
  {
    step: 5,
    title: 'Your turn',
    caption: 'Ask for something new from the group’s photos. It lands in the album for everyone.',
    target: 'chat-spurs',
    enter: (s) => {
      const id = trip(s);
      scene(s, 'studio', [{ name: 'creation', id }, { name: 'chat', creationId: id }]);
      s.sendChat(id, 'Make a 10-second reel of the boat day');
    },
  },
  {
    step: 6,
    title: 'Finish the album',
    caption: '5 of 17 are done. “Enhance all” finishes the rest with Pro, with the free trial right here.',
    target: 'paywall-unfinished',
    enter: (s) => {
      s.setFlags({ isPro: false, freeUsed: 5 });
      const id = trip(s);
      scene(s, 'studio', [{ name: 'creation', id }]);
      s.openSheet({ type: 'paywall', creationId: id, stage: 'offer' });
    },
  },
  {
    step: 7,
    title: 'New for you',
    caption: 'This week’s trends arrive already applied to your saved Me. Tap to see yourself, no selfies needed.',
    target: 'new-for-you',
    enter: (s) => scene(s, 'studio'),
  },
  {
    step: 7,
    title: 'Keep this',
    caption: 'Keep it and it goes into My Creations. Or try another photo, or make it with a friend.',
    target: 'keep-this',
    enter: (s) => scene(s, 'studio', [{ name: 'trend', trendId: 'y2k' }, y2k]),
  },
  {
    step: 8,
    title: 'Styles from the community',
    caption: 'Paola’s “90s yearbook” has 12.4k remixes. “Make your version” applies her style to you, with your own saved identity.',
    target: 'style-friend',
    enter: (s) => scene(s, 'studio', [{ name: 'section', section: 'remix' }]),
  },
  {
    step: 8,
    title: 'Make your version',
    caption: 'Your version of Paola’s style. Keep it, share it, publish your own recipe, or challenge a friend.',
    target: 'publish',
    enter: (s) => {
      scene(s, 'studio', [{ name: 'section', section: 'remix' }]);
      s.remixStyle('st-90s', (r) => s.push(r));
    },
  },
  {
    step: 8,
    title: 'Publish as a style',
    caption: 'Name your recipe and publish it. It shows up with your name, and the remix count starts climbing.',
    target: 'style-mine',
    enter: (s) => {
      scene(s, 'studio', [{ name: 'section', section: 'remix' }]);
      s.publishStyle('90s yearbook, my way', A.remix90s);
    },
  },
  {
    step: 8,
    title: 'Challenge a friend',
    caption: 'Send a link with a preview. Your friend makes their version with their own identity.',
    target: 'invite-preview',
    enter: (s) => {
      scene(s, 'studio', [{ name: 'section', section: 'remix' }, remix]);
      s.openSheet({ type: 'withFriend', title: '90s yearbook', image: A.remix90s, link: 'remini.app/r/90s-yearbook', challenge: true });
    },
  },
  {
    step: 9,
    title: 'Create with Remini chat',
    caption: 'Describe anything and Remini makes it with your saved Me, no upload. Every result is kept and can be taken further.',
    target: 'chat-spurs',
    enter: (s) => {
      scene(s, 'studio');
      const id = s.createFreestyle();
      s.resetStack([{ name: 'chat', creationId: id }]);
      s.sendChat(id, 'Me as an astronaut on a film set');
    },
  },
  {
    step: 9,
    title: 'Me: saved identities',
    caption: 'Several profiles (Me, Me · Work), saved once and private. Every trend, style and chat uses them.',
    target: 'me-row',
    enter: (s) => scene(s, 'studio'),
  },
  {
    step: 10,
    title: 'Why it pays',
    caption: 'The business case: move the levers and see the NPV.',
    target: null,
    enter: (s) => {
      scene(s, 'studio');
      s.setClosing(true);
    },
  },
];

export const TOTAL_STEPS = Math.max(...BEATS.map((b) => b.step));

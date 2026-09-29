import { A, friendsTrip } from './data';
import type { Stage, Store } from './store';
import type { Mode, Route } from './types';

export interface Beat {
  step: number;
  title: string;
  caption: string;
  target: string | null;
  enter: (s: Store) => void;
}

/** Put the app in a known state (journey stage, screens) so every beat works on its own. */
function scene(s: Store, mode: Mode, stage: Stage, routes: Route[] = []) {
  s.clearTimers();
  s.clearToast();
  s.closeSheet();
  s.setClosing(false);
  s.setStage(stage);
  if (s.mode !== mode) s.setMode(mode);
  s.goTab(mode === 'studio' ? 'studio' : 'enhance');
  s.resetStack(routes);
}

const set: Route = { name: 'result', kind: 'set', image: A.linkedin(1), images: [A.linkedin(1), A.linkedin(2), A.linkedin(3)], title: 'Casual Headshot' };
const remix: Route = { name: 'result', kind: 'remix', image: A.remix90s, title: '80s film · your version', styleId: 'st-90s' };
const together: Route = { name: 'result', kind: 'together', image: A.together90s, title: 'You & Paola' };

export const BEATS: Beat[] = [
  // ---------- Today: a quick reality check ----------
  {
    step: 1,
    title: 'Remini today',
    caption: 'The app as it is: Retouch, Enhance and viral trends on the home; AI Photos, Filters and Videos in the bottom row; Remini Chat in the corner.',
    target: 'tools',
    enter: (s) => scene(s, 'today', 0),
  },
  {
    step: 1,
    title: 'A profile with 4 selfies',
    caption: 'AI Photos already uses a profile made from 4 selfies. Results are listed by pack.',
    target: null,
    enter: (s) => scene(s, 'today', 0, [{ name: 'today', screen: 'photos' }]),
  },
  {
    step: 1,
    title: 'Remini Chat',
    caption: 'Upload a photo, write what you want, and Remini edits it. Now the same app, with Studio.',
    target: 'chat-bubble',
    enter: (s) => scene(s, 'today', 0),
  },
  // ---------- With Studio: normal use first ----------
  {
    step: 2,
    title: 'Why are you here?',
    caption: 'Same Remini, same question. The answer now picks your first creation: “Profile or work photos” here, or “Restore old photos”.',
    target: 'segment-profile',
    enter: (s) => scene(s, 'studio', 0, [{ name: 'onboarding', step: 'question' }]),
  },
  {
    step: 2,
    title: 'Your first creation',
    caption: 'A normal Remini generation, suggested for you: a LinkedIn photo from the Casual Headshot pack. So far, only Remini’s own examples.',
    target: 'add-selfies',
    enter: (s) => scene(s, 'studio', 0, [{ name: 'first', step: 'intro' }]),
  },
  {
    step: 2,
    title: '“Is this you?”',
    caption: 'The profile Remini already has, made special: you confirm it once and lock it in. It starts with a Work version for this set.',
    target: 'lock-in',
    enter: (s) => scene(s, 'studio', 0, [{ name: 'first', step: 'confirm' }]),
  },
  {
    step: 2,
    title: 'Save, share, or keep it',
    caption: 'Your headshots. Save and Share work as always; “Keep this” is new and turns them into a LinkedIn set you can continue.',
    target: 'keep-this',
    enter: (s) => scene(s, 'studio', 1, [set]),
  },
  {
    step: 3,
    title: 'Kept in Studio',
    caption: 'Studio holds only what you made and what you make with others. Trends, filters and effects stay on Remini’s usual pages.',
    target: 'keep-going',
    enter: (s) => scene(s, 'studio', 1, [{ name: 'studio' }]),
  },
  {
    step: 3,
    title: 'Me: locked in, adapted per creation',
    caption: 'One profile, confirmed once and private. It adapts to each creation through versions: Work for the LinkedIn set, more as you create.',
    target: 'me-variants',
    enter: (s) => scene(s, 'studio', 1, [{ name: 'studio' }, { name: 'identity', id: 'me' }]),
  },
  // ---------- On your own: filters, presets, chats ----------
  {
    step: 4,
    title: 'AI Filters, on your profile',
    caption: 'The usual AI Filters page. With your profile locked in, 80s Vibes runs on you directly, no photo to pick.',
    target: 'filter-try',
    enter: (s) => scene(s, 'studio', 1, [{ name: 'today', screen: 'filters' }]),
  },
  {
    step: 4,
    title: 'One style, one creation',
    caption: 'Keep it and it joins “80s film”, a creation with only that style. More results in it stay 80s; nothing gets mixed.',
    target: 'keep-this',
    enter: (s) => scene(s, 'studio', 1, [{ name: 'today', screen: 'filters' }, { name: 'result', kind: 'preset', image: A.remix90s, title: '80s film' }]),
  },
  {
    step: 4,
    title: 'Remini chat: presets',
    caption: 'The chat bubble now knows your profile. Pick a preset (80s film, Y2K Yearbook, Studio headshot) and the result is kept in that style’s creation.',
    target: 'chat-spurs',
    enter: (s) => scene(s, 'studio', 1.5, [{ name: 'chat', creationId: 'chat' }]),
  },
  {
    step: 4,
    title: 'Remix and Chats, kept in Studio',
    caption: 'Your versions of each style live under Remix; every conversation with Remini is under Chats, ready to reopen.',
    target: 'chats',
    enter: (s) => scene(s, 'studio', 1.5, [{ name: 'studio' }]),
  },
  // ---------- One friend ----------
  {
    step: 5,
    title: 'Share outside Remini',
    caption: 'Share works as usual: WhatsApp, Messages, Instagram, TikTok or a link. Friends without Remini get the photo and a link to join; friends already on Remini are listed below.',
    target: 'share-apps',
    enter: (s) => {
      scene(s, 'studio', 1.5, [set]);
      s.openSheet({ type: 'withFriend', title: 'LinkedIn photo', image: A.linkedin(1), link: 'remini.app/s/linkedin-set' });
    },
  },
  {
    step: 5,
    title: 'An invite on WhatsApp',
    caption: 'Paola isn’t on Remini yet. She gets your headshot with “Join me on Remini” and a link.',
    target: 'send-friend',
    enter: (s) => {
      scene(s, 'studio', 1.5, [set]);
      s.openSheet({ type: 'withFriend', title: 'LinkedIn photo', image: A.linkedin(1), link: 'remini.app/s/linkedin-set', via: 'WhatsApp' });
    },
  },
  {
    step: 5,
    title: 'Paola joined Remini',
    caption: 'She installs from the link and is now your Remini friend. From here on you create together inside Remini.',
    target: 'friend-joined',
    enter: (s) => {
      scene(s, 'studio', 1.5, [{ name: 'studio' }]);
      s.shareWithFriend();
    },
  },
  {
    step: 5,
    title: 'Paola shares her style back',
    caption: 'As a Remini friend, Paola shares her 80s film style with you. “Make your version” applies it to you.',
    target: 'make-your-version',
    enter: (s) => {
      scene(s, 'studio', 1.5, [{ name: 'studio' }]);
      s.shareWithFriend();
    },
  },
  {
    step: 5,
    title: 'Your version, same profile',
    caption: 'Paola’s style on you, with your own locked profile (its Everyday version). Now make one photo together.',
    target: 'make-together',
    enter: (s) => {
      scene(s, 'studio', 1.5, [{ name: 'studio' }, remix]);
      s.shareWithFriend();
    },
  },
  {
    step: 5,
    title: 'You and Paola',
    caption: 'One photo, each of you with your own profile. Keep it, or bring the whole group.',
    target: 'start-group',
    enter: (s) => {
      scene(s, 'studio', 1.5, [{ name: 'studio' }, together]);
      s.shareWithFriend();
    },
  },
  // ---------- The whole group ----------
  {
    step: 6,
    title: 'The whole group: Friends trip',
    caption: 'An album from the Philippines with Paola, Luca and Marco. Everyone adds photos, and one style applies to all of them.',
    target: 'album-members',
    enter: (s) => scene(s, 'studio', 3, [{ name: 'studio' }, { name: 'creation', id: 'trip' }]),
  },
  {
    step: 6,
    title: 'Presets for everyone',
    caption: 'The album chat works with presets and filters. Luca set Golden hour; one tap on another look changes every friend’s photos together.',
    target: 'chat-spurs',
    enter: (s) => scene(s, 'studio', 3, [{ name: 'studio' }, { name: 'creation', id: 'trip' }, { name: 'chat', creationId: 'trip' }]),
  },
  // ---------- Free usage ends ----------
  {
    step: 7,
    title: 'Finish it with Pro',
    caption: 'By now you have shared, created with friends and used your free enhancements. “Enhance all” offers the trial on work you care about: 5 of 17 done.',
    target: 'paywall-unfinished',
    enter: (s) => {
      scene(s, 'studio', 3, [{ name: 'studio' }, { name: 'creation', id: 'trip' }]);
      s.setFlags({ isPro: false, freeUsed: 5 });
      s.upsertCreation(friendsTrip(5));
      s.openSheet({ type: 'paywall', creationId: 'trip', stage: 'offer' });
    },
  },
  // ---------- Coming back ----------
  {
    step: 8,
    title: 'Coming back',
    caption: 'Days later a notification brings you back to your own work.',
    target: 'notif-linkedin',
    enter: (s) => scene(s, 'studio', 4, [{ name: 'lock' }]),
  },
  {
    step: 8,
    title: 'Welcome back',
    caption: 'Studio opens on what is waiting: the LinkedIn set at 3 of 5. The album with the group is finished and kept. Continue where you left off.',
    target: 'welcome-card',
    enter: (s) => scene(s, 'studio', 4, [{ name: 'studio' }]),
  },
  {
    step: 9,
    title: 'Why it pays',
    caption: 'The business case: move the levers and see the NPV.',
    target: null,
    enter: (s) => {
      scene(s, 'studio', 4);
      s.setClosing(true);
    },
  },
];

export const TOTAL_STEPS = Math.max(...BEATS.map((b) => b.step));

import { A, FRIEND } from './data';
import { STAGE, type Stage, type Store } from './store';
import type { Lever, Mode, Route } from './types';

export interface Beat {
  step: number;
  title: string;
  caption: string;
  target: string | null;
  /** The business lever this moment moves, shown as a chip next to the caption. */
  lever?: Lever;
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

const first: Route = { name: 'result', kind: 'enhance', title: 'Enhanced', image: A.enhance2After, before: A.enhance2Before };
const second: Route = { name: 'result', kind: 'enhance', title: 'Enhanced', image: A.trip(1) };
const trip: Route[] = [{ name: 'studio' }, { name: 'creation', id: 'trip' }];
const duo: Route = { name: 'result', kind: 'together', image: A.together90s, title: `You & ${FRIEND}`, projectId: 'eighties' };

export const STEP_NAMES = ['Remini today', 'Keep', 'The project', 'The free limit', 'Together', 'Day 6 of the trial', 'Coming back', 'After cancelling', 'Why it pays'];

export const BEATS: Beat[] = [
  {
    step: 1,
    title: 'Remini today',
    caption: 'The app you know: Enhance, Retouch and trends on the home, AI Photos, Filters and Videos below, Remini Chat in the corner.',
    target: 'tools',
    enter: (s) => scene(s, 'today', STAGE.NEW),
  },
  {
    step: 1,
    title: 'One photo, one result',
    caption: 'A quick enhance: one photo, one result, saved to the camera roll. Nothing carries on after it.',
    target: 'save-gallery',
    enter: (s) => scene(s, 'today', STAGE.NEW, [first]),
  },
  {
    step: 2,
    title: 'Keep, next to Save and Share',
    caption: 'The same enhance, with Studio. Save and Share stay as they are. Keep puts the photo in a new project, named after the trip.',
    target: 'keep-new-trip',
    enter: (s) => {
      scene(s, 'studio', STAGE.NEW, [first]);
      s.openSheet({ type: 'keepThis', photo: A.enhance2After, title: 'Enhanced', before: A.enhance2Before });
    },
  },
  {
    step: 2,
    title: 'A second photo, same trip',
    caption: 'Another photo from the trip, another Keep. Now the trip is worth building.',
    target: 'keep-add-trip',
    enter: (s) => {
      scene(s, 'studio', STAGE.KEPT, [second]);
      s.openSheet({ type: 'keepThis', photo: A.trip(1), title: 'Enhanced' });
    },
  },
  {
    step: 3,
    title: 'Building the trip',
    caption: 'You add the rest from your gallery: 17 photos, 2 done. Enhance all does the others in one go.',
    target: 'enhance-all',
    enter: (s) => scene(s, 'studio', STAGE.BUILT, trip),
  },
  {
    step: 3,
    title: 'This is Studio',
    caption: 'What you choose to keep, in projects that keep going. Below: your profiles, and Together, for friends.',
    target: 'projects',
    enter: (s) => scene(s, 'studio', STAGE.BUILT, [{ name: 'studio' }]),
  },
  {
    step: 4,
    title: 'The free limit, inside the trip',
    caption: 'Free limits stay the same. They land on something you care about: 5 of 17 done. Pro finishes the trip and brings your friends in.',
    target: 'paywall-unfinished',
    lever: 't',
    enter: (s) => {
      scene(s, 'studio', STAGE.LIMIT, trip);
      s.openSheet({ type: 'paywall', creationId: 'trip', stage: 'offer' });
    },
  },
  {
    step: 5,
    title: 'Invite the friends who were there',
    caption: 'Trial on: the trip is finished and Together unlocks. Friends get a WhatsApp link straight into the trip. Joining and adding photos is free.',
    target: 'invitee-rules',
    lever: 'I',
    enter: (s) => {
      scene(s, 'studio', STAGE.TRIAL, trip);
      s.openSheet({ type: 'withFriend', title: 'Philippines trip', image: A.trip(1), link: '', projectId: 'trip' });
    },
  },
  {
    step: 5,
    title: 'Paola joins, and shares a look',
    caption: 'Paola joins the trip for free and adds her photos. Separately, she shares an 80s look she made of herself.',
    target: 'shared-style',
    lever: 'c',
    enter: (s) => scene(s, 'studio', STAGE.JOINED, [{ name: 'studio' }]),
  },
  {
    step: 5,
    title: 'Your version, then a duo shoot',
    caption: 'Her style with your face, then a duo shoot of you both. It gets its own project, 80s with Paola, apart from the trip.',
    target: 'keep-in-project',
    lever: 'c',
    enter: (s) => {
      scene(s, 'studio', STAGE.JOINED, [{ name: 'studio' }, duo]);
      s.saveMe();
    },
  },
  {
    step: 6,
    title: 'Your trial ends tomorrow',
    caption: 'Day 6: Paola added 8 more photos and you have made things together. There is a reason to keep going after the first job is done.',
    target: 'trial-ending',
    lever: 'c',
    enter: (s) => scene(s, 'studio', STAGE.DAY6, [{ name: 'studio' }]),
  },
  {
    step: 7,
    title: 'Welcome back',
    caption: 'Two weeks later: Luca joined the trip with 6 photos, and there are new looks to try with your updated Me.',
    target: 'welcome-card',
    lever: 'w',
    enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'studio' }]),
  },
  {
    step: 7,
    title: 'Me, kept and improving',
    caption: 'The profile Remini already makes, now kept: from 4 selfies to 6 photos, each one added by you. New looks are made only when you tap.',
    target: 'me-history',
    lever: 'w',
    enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'studio' }, { name: 'identity', id: 'me' }]),
  },
  {
    step: 8,
    title: 'Nothing is held back',
    caption: 'If you cancel, every project stays to view and download, ready for when you come back.',
    target: 'after-cancel',
    lever: 'w',
    enter: (s) => scene(s, 'studio', STAGE.CANCELLED, [{ name: 'studio' }]),
  },
  {
    step: 9,
    title: 'Why it pays',
    caption: 'The impact model: pick a scenario or move the levers.',
    target: null,
    enter: (s) => {
      scene(s, 'studio', STAGE.CANCELLED);
      s.setClosing(true);
    },
  },
];

export const TOTAL_STEPS = Math.max(...BEATS.map((b) => b.step));

/** After the demo: open paths to explore at your own pace. */
export const EXPLORE: { title: string; sub: string; lever?: Lever; enter: (s: Store) => void }[] = [
  { title: 'A returning free user', sub: 'An earlier install finds Studio and puts past restores in a project', lever: 't', enter: (s) => { scene(s, 'studio', STAGE.NEW); s.startReturningFree(); } },
  { title: 'Onboarding, with Studio', sub: 'The first question, then the onboarding paywall showing Studio', lever: 't', enter: (s) => scene(s, 'studio', STAGE.NEW, [{ name: 'onboarding', step: 'question' }]) },
  { title: 'Remini chat', sub: 'One chat for you, one inside each project', enter: (s) => scene(s, 'studio', STAGE.MADE, [{ name: 'chats' }]) },
  { title: 'The shared trip', sub: 'Members, what friends added, the shared chat', enter: (s) => scene(s, 'studio', STAGE.DAY6, trip) },
  { title: 'Restore old photos', sub: 'The family archive path', enter: (s) => scene(s, 'studio', STAGE.NEW, [{ name: 'first', step: 'intro', path: 'restore' }]) },
  { title: 'Profile photos', sub: 'The creator path: a Casual Headshot set', enter: (s) => scene(s, 'studio', STAGE.NEW, [{ name: 'first', step: 'intro', path: 'profile' }]) },
  { title: 'Notifications', sub: 'The lock screen two weeks later', lever: 'w', enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'lock' }]) },
  { title: 'AI Photos today', sub: 'The profile Remini already makes', enter: (s) => scene(s, 'today', STAGE.NEW, [{ name: 'today', screen: 'photos' }]) },
];

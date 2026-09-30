import { A, FRIEND } from './data';
import { STAGE, type Stage, type Store } from './store';
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

const first: Route = { name: 'result', kind: 'enhance', title: 'Restored', image: A.restored(3), before: A.old(3) };
const second: Route = { name: 'result', kind: 'enhance', title: 'Restored', image: A.restored(1), before: A.old(1) };
const family: Route[] = [{ name: 'studio' }, { name: 'creation', id: 'family' }];
const trip: Route[] = [{ name: 'studio' }, { name: 'creation', id: 'trip' }];
const y2k: Route = { name: 'result', kind: 'trend', image: A.y2kMe, title: 'Y2K Yearbook', trendId: 'y2k' };
const remix: Route = { name: 'result', kind: 'remix', image: A.remix90s, title: '80s film · your version', styleId: 'st-80s', projectId: 'eighties' };
const duo: Route = { name: 'result', kind: 'together', image: A.together90s, title: `You & ${FRIEND}`, projectId: 'eighties' };

/** The chapters follow the idea: what's new, then Projects, Profiles, Together and Remini chat. */
export const CHAPTERS: { name: string; isNew?: boolean }[] = [
  { name: 'Remini today' },
  { name: 'Keep', isNew: true },
  { name: 'Meet Studio', isNew: true },
  { name: 'Projects', isNew: true },
  { name: 'Profiles', isNew: true },
  { name: 'Together', isNew: true },
  { name: 'Remini chat', isNew: true },
  { name: 'Coming back' },
  { name: 'After cancelling' },
];

export const BEATS: Beat[] = [
  // 1. Remini today
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
    caption: 'An old family photo, restored and saved to the camera roll. Great result, and nothing carries on after it.',
    target: 'save-gallery',
    enter: (s) => scene(s, 'today', STAGE.NEW, [first]),
  },
  // 2. Keep
  {
    step: 2,
    title: 'Keep, next to Save and Share',
    caption: 'The same restore, with Studio. Save and Share work exactly as before. One thing is new: Keep in Studio.',
    target: 'keep-this',
    enter: (s) => scene(s, 'studio', STAGE.NEW, [first]),
  },
  // 3. Meet Studio
  {
    step: 3,
    title: 'Welcome to Studio',
    caption: 'The first Keep opens Studio, and one screen explains it: where the photos you keep live and keep going, with projects, profiles and friends.',
    target: null,
    enter: (s) => {
      scene(s, 'studio', STAGE.KEPT, [{ name: 'studioIntro' }]);
      s.setStudioSeen(false);
    },
  },
  {
    step: 3,
    title: 'Your photo, kept',
    caption: 'The photo sits in Kept: no project yet, nothing to organise. Projects, Profiles and Together are ready below.',
    target: 'kept',
    enter: (s) => scene(s, 'studio', STAGE.KEPT, [{ name: 'studio' }]),
  },
  // 4. Projects
  {
    step: 4,
    title: 'A second old photo',
    caption: 'You restore another old photo and keep it. Studio sees they belong together and suggests a project: Family archive.',
    target: 'keep-start-project',
    enter: (s) => {
      scene(s, 'studio', STAGE.KEPT, [second]);
      s.openSheet({ type: 'keepThis', photo: A.restored(1), title: 'Restored' });
    },
  },
  {
    step: 4,
    title: 'A job that keeps going',
    caption: 'Two photos, one project. Add the rest of the album and it becomes a real job: 12 photos, 2 restored. Restore all does the rest.',
    target: 'enhance-all',
    enter: (s) => scene(s, 'studio', STAGE.BUILT, family),
  },
  {
    step: 4,
    title: 'The free limit, inside the project',
    caption: 'Free limits stay the same. They just land on something you care about: 5 of 12 restored. Pro finishes the archive, and adds Together.',
    target: 'paywall-unfinished',
    enter: (s) => {
      scene(s, 'studio', STAGE.LIMIT, family);
      s.openSheet({ type: 'paywall', creationId: 'family', stage: 'offer' });
    },
  },
  // 5. Profiles
  {
    step: 5,
    title: 'A trend, with your face',
    caption: 'On Pro you try the Y2K Yearbook trend. The first time, Remini saves your profile, Me, from 4 selfies, as AI Photos does. Keep starts a Y2K set.',
    target: 'keep-this',
    enter: (s) => {
      scene(s, 'studio', STAGE.TRIAL, [{ name: 'trend', trendId: 'y2k' }, y2k]);
      s.saveMe();
    },
  },
  {
    step: 5,
    title: 'Me, saved once',
    caption: 'Me is the profile Remini already makes, now kept in Studio. Every trend, pack and duo shoot uses it, with no new uploads, and it gets better as you add photos.',
    target: 'me-likeness',
    enter: (s) => scene(s, 'studio', STAGE.ME, [{ name: 'studio' }, { name: 'identity', id: 'me' }]),
  },
  // 6. Together
  {
    step: 6,
    title: 'A trip is made to share',
    caption: 'Your Philippines trip becomes a project too. Unlike the archive, it has other people in it: invite the friends who were there.',
    target: 'invite-card',
    enter: (s) => scene(s, 'studio', STAGE.TRIP, trip),
  },
  {
    step: 6,
    title: 'An invite on WhatsApp',
    caption: 'Friends without Remini get a link straight into the trip. Joining, adding their photos and their own face is free.',
    target: 'invite-preview',
    enter: (s) => {
      scene(s, 'studio', STAGE.TRIP, trip);
      s.openSheet({ type: 'withFriend', title: 'Philippines trip', image: A.trip(1), link: '', projectId: 'trip', via: 'WhatsApp' });
    },
  },
  {
    step: 6,
    title: 'Paola joins the trip',
    caption: 'Paola arrives with everyone’s photos already there, and adds her own.',
    target: 'project-members',
    enter: (s) => scene(s, 'studio', STAGE.JOINED, trip),
  },
  {
    step: 6,
    title: 'Styles from friends',
    caption: 'Friends share looks they made. Paola shares her 80s film, and you can make your own version with your face. Remix, without a public feed.',
    target: 'shared-style',
    enter: (s) => scene(s, 'studio', STAGE.JOINED, [{ name: 'studio' }]),
  },
  {
    step: 6,
    title: 'Her style, your face',
    caption: 'Your version of Paola’s 80s film, made with Me. Keep it, or make a duo shoot of the two of you.',
    target: 'make-duo',
    enter: (s) => scene(s, 'studio', STAGE.JOINED, [{ name: 'studio' }, remix]),
  },
  {
    step: 6,
    title: 'A duo shoot, its own project',
    caption: 'You and Paola, each with your own profile. It becomes a new project, 80s with Paola, apart from the trip.',
    target: 'keep-in-project',
    enter: (s) => {
      scene(s, 'studio', STAGE.JOINED, [{ name: 'studio' }, duo]);
      s.saveMe();
    },
  },
  // 7. Remini chat
  {
    step: 7,
    title: 'Remini chat, per project',
    caption: 'The chat bubble is where it always was. It now opens your chats: one just for you, and one inside each project.',
    target: 'chats-list',
    enter: (s) => scene(s, 'studio', STAGE.MADE, [{ name: 'chats' }]),
  },
  {
    step: 7,
    title: 'Shared with the people in it',
    caption: 'In the trip, everyone can ask Remini, on all the photos. It only offers what Remini already does.',
    target: 'chat-spurs',
    enter: (s) => scene(s, 'studio', STAGE.MADE, [...trip, { name: 'chat', creationId: 'trip' }]),
  },
  // 8. Coming back
  {
    step: 8,
    title: 'Three weeks later',
    caption: 'Still on Pro. The reasons to come back are your own: friends adding to your projects, and new looks to try with your updated Me.',
    target: 'notif-trip',
    enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'lock' }]),
  },
  {
    step: 8,
    title: 'Welcome back',
    caption: 'Studio opens on what changed: Luca joined the trip with 6 photos. New looks are only made if you tap.',
    target: 'welcome-card',
    enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'studio' }]),
  },
  {
    step: 8,
    title: 'Me, better than before',
    caption: 'From 4 selfies to 6 photos, each one added by you. Every project and trend now looks more like you.',
    target: 'me-history',
    enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'studio' }, { name: 'identity', id: 'me' }]),
  },
  // 9. After cancelling
  {
    step: 9,
    title: 'Nothing is held back',
    caption: 'If you ever cancel, every project stays to view and download, ready for when you come back. After the demo, everything stays clickable.',
    target: 'after-cancel',
    enter: (s) => scene(s, 'studio', STAGE.CANCELLED, [{ name: 'studio' }]),
  },
];

export const TOTAL_STEPS = CHAPTERS.length;

/** When the demo finishes, the app stays in a full state to explore on the phone. */
export function afterDemo(s: Store) {
  scene(s, 'studio', STAGE.BACK, [{ name: 'studio' }]);
}

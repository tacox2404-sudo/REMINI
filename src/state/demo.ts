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

const quick: Route = { name: 'result', kind: 'enhance', title: 'Enhanced', image: A.enhance2After, before: A.enhance2Before };
const trip: Route[] = [{ name: 'studio' }, { name: 'creation', id: 'trip' }];
const remix: Route = { name: 'result', kind: 'remix', image: A.remix90s, title: '80s film · your version', styleId: 'st-80s', projectId: 'trip' };
const duo: Route = { name: 'result', kind: 'together', image: A.together90s, title: `You & ${FRIEND}`, projectId: 'trip' };

export const STEP_NAMES = ['Remini today', 'Start as usual', 'What Studio is', 'The free limit', 'Trial week: together', 'Chats and Me', 'Coming back', 'After cancelling', 'Why it pays'];

export const BEATS: Beat[] = [
  // ---------- 1. Remini today ----------
  {
    step: 1,
    title: 'Remini today',
    caption: 'The app you know: Enhance, Retouch and trends on the home, AI Photos, Filters and Videos below, Remini Chat in the corner.',
    target: 'tools',
    enter: (s) => scene(s, 'today', STAGE.NEW),
  },
  {
    step: 1,
    title: 'A face profile already exists',
    caption: 'AI Photos already makes a profile from 4 selfies and lists the results by pack. Studio builds on this.',
    target: null,
    enter: (s) => scene(s, 'today', STAGE.NEW, [{ name: 'today', screen: 'photos' }]),
  },
  {
    step: 1,
    title: 'One photo, one result',
    caption: 'A quick enhance ends where it should: saved to the camera roll. Now the same app, with Studio.',
    target: 'save-gallery',
    enter: (s) => scene(s, 'today', STAGE.NEW, [quick]),
  },
  // ---------- 2. Start as usual ----------
  {
    step: 2,
    title: 'What brings you to Remini?',
    caption: 'Same first question. Most people come to fix their photos, some to create. Either way, the start is a normal Remini result.',
    target: 'segment-lookgreat',
    enter: (s) => scene(s, 'studio', STAGE.NEW, [{ name: 'onboarding', step: 'question' }]),
  },
  {
    step: 2,
    title: 'A quick enhance, as always',
    caption: 'Save and Share work as they do today, so a quick fix stays quick. New: Keep, for a photo that is part of something bigger.',
    target: 'keep-this',
    enter: (s) => scene(s, 'studio', STAGE.NEW, [{ name: 'first', step: 'intro', path: 'enhance' }, quick]),
  },
  {
    step: 2,
    title: 'Keep this in a project?',
    caption: 'Remini spots 16 more photos from the same days. One tap starts a project. You can also add it to another one, or just save it.',
    target: 'keep-new-trip',
    enter: (s) => {
      scene(s, 'studio', STAGE.NEW, [{ name: 'first', step: 'intro', path: 'enhance' }, quick]);
      s.openSheet({ type: 'keepThis', photo: A.enhance2After, title: 'Enhanced', before: A.enhance2Before });
    },
  },
  // ---------- 3. What Studio is ----------
  {
    step: 3,
    title: 'A project',
    caption: 'The whole trip in one place, with progress: 1 of 17 done. Enhance all does the rest in one go.',
    target: 'enhance-all',
    enter: (s) => scene(s, 'studio', STAGE.KEPT, trip),
  },
  {
    step: 3,
    title: 'This is Studio',
    caption: 'What you choose to keep, in projects that keep going. Below them: your profiles, and Together, for making things with friends.',
    target: 'projects',
    enter: (s) => scene(s, 'studio', STAGE.KEPT, [{ name: 'studio' }]),
  },
  // ---------- 4. The free limit ----------
  {
    step: 4,
    title: 'The free limit, inside the trip',
    caption: 'Free limits stay the same. They just land on something you care about: 5 of 17 done. Pro finishes the trip and brings your friends in.',
    target: 'paywall-unfinished',
    enter: (s) => {
      scene(s, 'studio', STAGE.LIMIT, trip);
      s.openSheet({ type: 'paywall', creationId: 'trip', stage: 'offer' });
    },
  },
  // ---------- 5. Trial week: together ----------
  {
    step: 5,
    title: 'Together is on',
    caption: 'Trial started: the trip is finished and Together unlocks. The friends who were there are one invite away.',
    target: 'invite-card',
    enter: (s) => scene(s, 'studio', STAGE.TRIAL, trip),
  },
  {
    step: 5,
    title: 'An invite, through any app',
    caption: 'Friends without Remini get a WhatsApp message with a link straight into the trip.',
    target: 'send-invite',
    enter: (s) => {
      scene(s, 'studio', STAGE.TRIAL, trip);
      s.openSheet({ type: 'withFriend', title: 'Philippines trip', image: A.trip(1), link: '', projectId: 'trip', via: 'WhatsApp' });
    },
  },
  {
    step: 5,
    title: 'Paola joins the trip',
    caption: 'Paola lands in the project with everyone’s photos already there. She adds her own, and her own face if she wants to.',
    target: 'project-members',
    enter: (s) => scene(s, 'studio', STAGE.JOINED, trip),
  },
  {
    step: 5,
    title: 'Paola shares her style',
    caption: 'Paola made an 80s look of herself and shares it in the trip. You can use it with your own face, or skip it: everyone makes what they like.',
    target: 'shared-style',
    enter: (s) => scene(s, 'studio', STAGE.SHARED, trip),
  },
  {
    step: 5,
    title: 'Her style, your face',
    caption: 'The first time you use your face, Remini saves your profile from 4 selfies, as AI Photos does. Keep the result in the trip, or make a duo shoot.',
    target: 'make-duo',
    enter: (s) => {
      scene(s, 'studio', STAGE.SHARED, [...trip, remix]);
      s.saveMe();
    },
  },
  {
    step: 5,
    title: 'A duo shoot',
    caption: 'You and Paola, each with your own profile. It stays in the trip, next to everyone’s photos.',
    target: 'keep-in-trip',
    enter: (s) => {
      scene(s, 'studio', STAGE.SHARED, [...trip, duo]);
      s.saveMe();
    },
  },
  {
    step: 5,
    title: 'One chat per project, shared',
    caption: 'Everyone in the trip can ask Remini: enhance all the photos, Paola’s style on me, a duo shoot. Only things Remini already does.',
    target: 'chat-spurs',
    enter: (s) => scene(s, 'studio', STAGE.MADE, [...trip, { name: 'chat', creationId: 'trip' }]),
  },
  // ---------- 6. Chats and Me ----------
  {
    step: 6,
    title: 'Remini chat, where it always was',
    caption: 'The bubble opens your chats: one just for you, and one inside each project, shared with the people in it.',
    target: 'chat-trip',
    enter: (s) => scene(s, 'studio', STAGE.MADE, [{ name: 'chats' }]),
  },
  {
    step: 6,
    title: 'Me, kept and improving',
    caption: 'Me is the profile Remini already makes. Now it stays with you: add the photos of you from the trip, and everything you create next looks more like you.',
    target: 'add-to-me',
    enter: (s) => scene(s, 'studio', STAGE.MADE, [{ name: 'studio' }, { name: 'identity', id: 'me' }]),
  },
  // ---------- 7. Coming back ----------
  {
    step: 7,
    title: 'Reasons to come back',
    caption: 'A week later: Paola added photos, Luca joined, and there are new looks made with your updated Me.',
    target: 'notif-trip',
    enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'lock' }]),
  },
  {
    step: 7,
    title: 'Welcome back',
    caption: 'Studio opens on what changed: 8 new photos waiting in the trip, and headshots made with your updated Me, yours to keep or skip.',
    target: 'welcome-card',
    enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'studio' }]),
  },
  {
    step: 7,
    title: 'Me, a month on',
    caption: 'From 4 selfies to 9 photos, each one added by you. Better likeness and no new uploads.',
    target: 'me-history',
    enter: (s) => scene(s, 'studio', STAGE.BACK, [{ name: 'studio' }, { name: 'identity', id: 'me' }]),
  },
  // ---------- 8. After cancelling ----------
  {
    step: 8,
    title: 'Nothing is held back',
    caption: 'If you cancel, every project stays to view and download. It’s all there when you want to continue.',
    target: 'after-cancel',
    enter: (s) => scene(s, 'studio', STAGE.CANCELLED, [{ name: 'studio' }]),
  },
  // ---------- 9. Why it pays ----------
  {
    step: 9,
    title: 'Why it pays',
    caption: 'The business case, with the numbers from the impact model.',
    target: null,
    enter: (s) => {
      scene(s, 'studio', STAGE.CANCELLED);
      s.setClosing(true);
    },
  },
];

export const TOTAL_STEPS = Math.max(...BEATS.map((b) => b.step));

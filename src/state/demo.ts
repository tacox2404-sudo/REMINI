import { A } from './data';
import type { Store } from './store';
import type { Lever, Mode, Route, Tab } from './types';

export interface Beat {
  step: number;
  title: string;
  caption: string;
  target: string | null;
  lever?: Lever;
  enter: (s: Store) => void;
}

/** Put the app in a known state so every beat works regardless of what was clicked before. */
function scene(s: Store, mode: Mode, tab: Tab, routes: Route[] = []) {
  s.clearTimers();
  s.closeSheet();
  if (s.mode !== mode) s.setMode(mode);
  s.goTab(tab);
  s.resetStack(routes);
}

const y2kResult: Route = { name: 'result', kind: 'trend', image: A.y2kMe, title: 'Y2K Yearbook', trendId: 'y2k' };
const enhanceResult: Route = { name: 'result', kind: 'enhance', image: A.enhanceSrc, title: 'Enhanced' };

export const BEATS: Beat[] = [
  {
    step: 1,
    title: 'Today: a trend is a one-shot',
    caption: 'Trends are how Remini brings people in. You tap a pack, upload 8–12 selfies and wait for a model to train.',
    target: 'trend-card',
    enter: (s) => scene(s, 'today', 'enhance'),
  },
  {
    step: 1,
    title: 'Today: one exit, Save to Gallery',
    caption: 'The result has a single action. The face model it just trained is used once and then forgotten.',
    target: 'save-gallery',
    enter: (s) => scene(s, 'today', 'enhance', [{ name: 'trend', trendId: 'y2k' }, y2kResult]),
  },
  {
    step: 1,
    title: 'Today: nothing to come back to',
    caption: 'Back in the app nothing persists: no space, no history, no projects. The model sits buried in AI Photos, and the next visit depends on the next trend.',
    target: 'buried-models',
    enter: (s) => {
      scene(s, 'today', 'aiphotos');
      s.showToast('Saved to Gallery');
    },
  },
  {
    step: 2,
    title: 'With Studio: a place to come back to',
    caption: 'Same app, same technology. A new first tab, Studio, keeps everything you make and gives you something to continue.',
    target: 'studio-intro',
    enter: (s) => {
      scene(s, 'studio', 'studio');
      s.openSheet({ type: 'studioIntro' });
    },
  },
  {
    step: 2,
    title: 'One clear home for your work',
    caption: 'Studio reads top to bottom: ask Remini for anything, your identities, what is new this week, your projects, shared albums, and a library of looks and saved setups.',
    target: 'studio-ask',
    enter: (s) => scene(s, 'studio', 'studio'),
  },
  {
    step: 3,
    title: 'Identities, brought to the front',
    caption: 'The identity technology already exists; Studio brings it to the front. Train "Me" once and reuse it in every tool, trend and project.',
    target: 'identities',
    enter: (s) => scene(s, 'studio', 'studio'),
  },
  {
    step: 3,
    title: 'Identity page',
    caption: 'Reference photos, a tip that improves likeness, every look ever made with Me, and clear privacy controls.',
    target: 'identity-refs',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'identity', id: 'me' }]),
  },
  {
    step: 4,
    title: 'Save to a Project?',
    caption: 'The key entry point sits in the flow most people already use: after any enhancement, Remini offers to start a project.',
    target: 'sheet-new-project',
    enter: (s) => {
      scene(s, 'studio', 'enhance', [enhanceResult]);
      s.setFlags({ isPro: false, freeUsed: 5 });
      s.openSheet({ type: 'saveToProject', photo: A.enhanceSrc, title: 'Enhanced' });
    },
  },
  {
    step: 4,
    title: 'Create "LinkedIn refresh"',
    caption: 'Pick a template, keep the identity, and Studio suggests your best candidate photos from Recents. One tap and the project exists.',
    target: 'create-project',
    enter: (s) => scene(s, 'studio', 'enhance', [enhanceResult, { name: 'newProject', fromPhoto: A.enhanceSrc, template: 'profile' }]),
  },
  {
    step: 5,
    title: 'The free-limit moment',
    caption: 'A free user wants the whole project done and taps "Enhance all".',
    target: 'enhance-all',
    enter: (s) => {
      const id = s.ensureLinkedIn(true);
      s.setFlags({ isPro: false, freeUsed: 5 });
      scene(s, 'studio', 'studio', [{ name: 'project', id }]);
    },
  },
  {
    step: 5,
    title: 'A trial framed around the project',
    caption: '"Finish your project": unlimited enhancements and your Studio, 7 days free, on the same trial-then-weekly plan. The reason to start is a job the user already cares about.',
    target: 'start-trial',
    enter: (s) => {
      const id = s.ensureLinkedIn(true);
      s.setFlags({ isPro: false, freeUsed: 5 });
      scene(s, 'studio', 'studio', [{ name: 'project', id }]);
      s.openSheet({ type: 'paywall', projectId: id, stage: 'offer' });
    },
  },
  {
    step: 5,
    title: 'Straight back into the project',
    caption: 'Trial started, and the user lands back where they were while every photo processes. No dead end, no "now what?".',
    target: 'project-progress',
    enter: (s) => {
      const id = s.ensureLinkedIn(true);
      s.setFlags({ isPro: true, freeUsed: 5 });
      scene(s, 'studio', 'studio', [{ name: 'project', id }]);
      s.processProject(id);
    },
  },
  {
    step: 6,
    title: 'A saved setup you can re-run',
    caption: 'The recipe is kept: style, background, outfit, prompt. Re-run it on a new photo or generate more looks at any time.',
    target: 'rerun-setup',
    enter: (s) => {
      const id = s.ensureLinkedIn();
      s.setFlags({ isPro: true });
      s.completeProject(id);
      const p = s.projectsRef.current.find((x) => x.id === id);
      if (p && !p.looks.length) s.generateLooks(id, true);
      scene(s, 'studio', 'studio', [{ name: 'project', id, tab: 'setup' }]);
    },
  },
  {
    step: 6,
    title: 'Improve it with a chat instruction',
    caption: 'Every project has Remini chat. Type what you want ("make it more approachable") or tap a suggestion, and the results land in the project.',
    target: 'chat-spurs',
    enter: (s) => {
      const id = s.ensureLinkedIn();
      s.setFlags({ isPro: true });
      scene(s, 'studio', 'studio', [{ name: 'project', id }, { name: 'chat', projectId: id }]);
      s.sendChat(id, 'Make it more approachable');
    },
  },
  {
    step: 7,
    title: 'A trend drops: "Try with Me"',
    caption: 'Next week a new trend lands on the Home feed. The button now says "Try with Me": no re-upload, seconds instead of minutes.',
    target: 'trend-cta',
    enter: (s) => scene(s, 'studio', 'enhance'),
  },
  {
    step: 7,
    title: 'The result lands in the Studio',
    caption: 'Save to Studio, add to a project, or share. The trend still brings people in, and now it also feeds the space they return to.',
    target: 'save-studio',
    enter: (s) => scene(s, 'studio', 'enhance', [y2kResult]),
  },
  {
    step: 7,
    title: 'Every trend lands in the Studio',
    caption: 'The new look appears in the Looks library, made with Me, next to projects and saved setups.',
    target: 'new-look',
    enter: (s) => {
      scene(s, 'studio', 'studio');
      s.saveLookToStudio(A.y2kMe, 'Y2K Yearbook', 'trend');
    },
  },
  {
    step: 8,
    title: 'Reasons to come back',
    caption: 'Because work persists, Remini can send honest notifications: a finished set, a friend’s new photos, a trend already rendered on you. Each one opens the right screen.',
    target: 'notif-linkedin',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'lock' }]),
  },
  {
    step: 9,
    title: 'Shared albums',
    caption: 'One link, collaborators and a contributions feed. Friends add their photos and everyone gets the same look.',
    target: 'share-link',
    enter: (s) => {
      scene(s, 'studio', 'studio', [{ name: 'project', id: 'summer' }]);
      s.openSheet({ type: 'share', projectId: 'summer' });
    },
  },
  {
    step: 9,
    title: 'Creating together in the album chat',
    caption: 'Friends ask Remini for group ideas in the shared album: a movie poster of everyone, two friends on the same beach. The content is made by the group, with the group’s faces.',
    target: 'chat-spurs',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'project', id: 'summer' }, { name: 'chat', projectId: 'summer' }]),
  },
  {
    step: 9,
    title: 'A friend joins, on the web',
    caption: '"Marta invited you to Summer ’26": join and add your photos in any browser. The app is suggested after the friend has seen themselves in the album.',
    target: 'join',
    enter: (s) => scene(s, 'studio', 'studio', [{ name: 'project', id: 'summer' }, { name: 'recipient' }]),
  },
  {
    step: 10,
    title: 'Freestyle with Remini chat',
    caption: 'Not every idea fits a template. From the top of Studio you can just describe something, and Remini makes it with your identity and keeps it as a project to continue.',
    target: 'chat-spurs',
    enter: (s) => {
      scene(s, 'studio', 'studio');
      const id = s.createFreestyle();
      s.resetStack([{ name: 'chat', projectId: id }]);
      s.sendChat(id, 'Me as an astronaut on a film set');
    },
  },
];

export const TOTAL_STEPS = Math.max(...BEATS.map((b) => b.step));

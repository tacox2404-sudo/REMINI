import type { Identity, Look, Project, ProjectPhoto, SavedLook, Trend } from './types';

/**
 * Image references are file names inside `public/assets/`. A reference can list
 * fallbacks separated by "|": the first file that loads wins, otherwise a
 * gradient placeholder is drawn.
 */
export const A = {
  ref: (n: number) => `me_ref_${n}.jpg`,
  look: (n: number) => `me_look_${n}.jpg`,
  linkedin: (n: number) => `linkedin_${n}.jpg`,
  old: (n: number) => `archive_old_${n}.jpg`,
  restored: (n: number) => `archive_restored_${n}.jpg`,
  trip: (n: number) => `trip_${n}.jpg`,
  /** Creative results used by the AI chat; fall back to regular looks. */
  creative: (n: number) => `creative_${n}.jpg|me_look_${((n - 1) % 6) + 1}.jpg`,
  y2kMe: 'trend_y2k_me.jpg',
  marta: 'friend_marta.jpg',
  enhanceBefore: 'enhance_before.jpg',
  enhanceSrc: 'enhance_after.jpg|me_ref_1.jpg',
};

export const FRIEND = 'Marta';

export const TRENDS: Trend[] = [
  { id: 'y2k', title: 'Y2K Yearbook', tagline: 'Glossy 2000s portrait day', cover: 'pack_y2k.jpg|trend_y2k_me.jpg', result: A.y2kMe, hot: true },
  { id: 'oldmoney', title: 'Old Money', tagline: 'Quiet luxury, linen and sun', cover: `pack_oldmoney.jpg|${A.look(1)}`, result: A.look(1) },
  { id: 'film90s', title: '90s Film', tagline: 'Grain, flash, disposable', cover: `pack_film90s.jpg|${A.look(5)}`, result: A.look(5) },
  { id: 'neon', title: 'Neon Nights', tagline: 'Tokyo after midnight', cover: `pack_neon.jpg|${A.look(2)}`, result: A.look(2) },
  { id: 'renaissance', title: 'Renaissance', tagline: 'Oil on canvas, 1504', cover: `pack_renaissance.jpg|${A.look(4)}`, result: A.look(4) },
  { id: 'chalet', title: 'Ski Chalet', tagline: 'Snow, knitwear, fire', cover: `pack_chalet.jpg|${A.look(6)}`, result: A.look(6) },
];

export const IDENTITIES: Identity[] = [
  { id: 'me', name: 'Me', subtitle: 'Default · 4 photos', cover: A.ref(1), refs: [1, 2, 3, 4].map(A.ref) },
  { id: 'me-pro', name: 'Me · Professional', subtitle: 'Studio light · 4 photos', cover: `${A.linkedin(1)}|${A.ref(2)}`, refs: [2, 1, 4, 3].map(A.ref) },
];

export const LOOKS: Look[] = [
  { id: 'l1', src: A.look(1), title: 'Old Money', category: 'trend', identityId: 'me', when: '3 weeks ago' },
  { id: 'l2', src: A.look(2), title: 'Neon Nights', category: 'trend', identityId: 'me', when: '2 weeks ago' },
  { id: 'l3', src: A.look(3), title: 'Golden hour', category: 'casual', identityId: 'me', when: '2 days ago' },
  { id: 'l4', src: A.look(4), title: 'Renaissance', category: 'trend', identityId: 'me', when: '1 month ago' },
  { id: 'l5', src: A.look(5), title: '90s Film', category: 'trend', identityId: 'me', when: '1 week ago' },
  { id: 'l6', src: A.look(6), title: 'Ski Chalet', category: 'casual', identityId: 'me', when: '1 month ago' },
  { id: 'l7', src: A.linkedin(3), title: 'Headshot · grey', category: 'professional', identityId: 'me-pro', when: '1 week ago' },
  { id: 'l8', src: A.linkedin(4), title: 'Headshot · window', category: 'professional', identityId: 'me-pro', when: '1 week ago' },
];

export const SAVED_LOOKS: SavedLook[] = [
  { id: 's1', title: 'Studio light · navy blazer', cover: A.linkedin(2), identityId: 'me-pro' },
  { id: 's2', title: 'Golden hour', cover: A.look(3), identityId: 'me' },
  { id: 's3', title: 'Film grain · 35mm', cover: A.look(5), identityId: 'me' },
];

export const CAMERA_ROLL: string[] = [
  ...[1, 2, 3, 4].map(A.ref),
  A.enhanceBefore,
  ...[1, 2, 3, 4, 5, 6].map(A.trip),
  ...[1, 2, 3, 4].map(A.old),
  A.marta,
];

export type TemplateMeta = { id: 'profile' | 'archive' | 'trip' | 'couple' | 'freestyle'; title: string; sub: string; cover: string; emoji: string };
export const TEMPLATES: TemplateMeta[] = [
  { id: 'freestyle', title: 'Freestyle', sub: 'Start from an idea and shape it by chatting with Remini', cover: A.creative(1), emoji: '✨' },
  { id: 'profile', title: 'Profile refresh', sub: 'LinkedIn · dating · socials', cover: A.linkedin(1), emoji: '💼' },
  { id: 'archive', title: 'Family archive', sub: 'Restore and animate old photos', cover: `${A.restored(1)}|${A.old(1)}`, emoji: '🎞️' },
  { id: 'trip', title: 'Trip or event', sub: 'One consistent look for a set', cover: A.trip(2), emoji: '✈️' },
  { id: 'couple', title: 'Friends shoot', sub: 'You and friends, one scene', cover: `${A.marta}|${A.trip(4)}`, emoji: '👯' },
];

let pid = 0;
export const photo = (original: string, status: ProjectPhoto['status'], enhanced?: string): ProjectPhoto => ({
  id: `ph${++pid}`,
  original,
  enhanced,
  status,
});

const cycle = <T,>(arr: T[], n: number) => Array.from({ length: n }, (_, i) => arr[i % arr.length]);

export const LINKEDIN_SETUP = {
  name: 'Studio light · navy blazer',
  style: 'Studio headshot, soft key light',
  background: 'Warm grey seamless',
  outfit: 'Navy blazer, white shirt',
  prompt: 'Professional headshot of {identity}, shoulders up, relaxed smile, 85mm, shallow depth of field',
};

export function seedProjects(): Project[] {
  const tripPhotos = cycle([1, 2, 3, 4, 5, 6].map(A.trip), 12).map((src, i) => photo(src, i < 9 ? 'enhanced' : 'original'));
  const archivePhotos = [1, 2, 3, 4].map((n, i) => photo(A.old(n), i < 2 ? 'enhanced' : 'original', A.restored(n)));
  const summerPhotos = [A.trip(5), A.trip(6), A.marta, A.trip(3), A.trip(4), A.trip(2)].map((src) => photo(src, 'enhanced'));
  return [
    {
      id: 'rome',
      title: 'Weekend away',
      template: 'trip',
      identityId: 'me',
      cover: A.trip(1),
      photos: tripPhotos,
      looks: [{ id: 'rl1', src: A.look(3), title: 'Golden hour', category: 'casual', identityId: 'me', when: '2 days ago' }],
      setup: {
        name: 'Golden hour',
        style: 'Warm film, late sun',
        background: 'Keep original',
        outfit: 'Keep original',
        prompt: 'Golden hour light, warm tones, soft grain, consistent across the set',
      },
      lastEdit: '2 days ago',
      nextStep: 'Enhance the last few photos to finish the set',
    },
    {
      id: 'nonna',
      title: 'Family archive',
      template: 'archive',
      identityId: 'me',
      cover: `${A.restored(1)}|${A.old(1)}`,
      photos: archivePhotos,
      looks: [],
      setup: {
        name: 'Faithful restore',
        style: 'Restore, keep period look',
        background: 'Keep original',
        outfit: 'Keep original',
        prompt: 'Repair scratches and fading, sharpen faces, subtle colorization',
      },
      lastEdit: '5 days ago',
      nextStep: 'Animate a memory from the album',
    },
    {
      id: 'summer',
      title: "Summer '26",
      template: 'trip',
      identityId: 'me',
      cover: A.trip(5),
      photos: summerPhotos,
      looks: [],
      setup: null,
      lastEdit: '1 hour ago',
      nextStep: 'Add your photos, or ask Remini to make a group look',
      shared: {
        owner: FRIEND,
        collaborators: [FRIEND, 'Luca', 'Sofia', 'Ben'],
        link: 'remini.app/p/summer26',
        feed: [
          { who: FRIEND, text: 'added new photos', when: '1h' },
          { who: 'Luca', text: 'asked Remini for "a movie poster of all of us"', when: '3h' },
          { who: 'Sofia', text: 'applied "Golden hour" to the album', when: 'Yesterday' },
          { who: 'Ben', text: 'joined from the web link', when: '2d' },
        ],
      },
    },
  ];
}

/** Photos Studio suggests from Recents for a template (faces matched to the identity). */
export function suggestFor(template: TemplateMeta['id']): string[] {
  if (template === 'profile') return [A.ref(2), A.ref(3), A.ref(4), A.enhanceBefore, A.trip(1), A.trip(3), A.ref(1)];
  if (template === 'archive') return [1, 2, 3, 4].map(A.old);
  if (template === 'trip') return [1, 2, 3, 4, 5, 6].map(A.trip);
  if (template === 'couple') return [A.marta, A.ref(2), A.trip(4), A.trip(6)];
  return [A.ref(1), A.ref(3)];
}

export function linkedInPhotos(first: string): ProjectPhoto[] {
  return [photo(first, 'enhanced'), ...suggestFor('profile').map((s) => photo(s, 'original'))];
}

import type { CommunityStyle, Creation, Identity, Intent, Look, ProjectPhoto, Segment, Trend } from './types';

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
  creative: (n: number) => `creative_${n}.jpg|me_look_${((n + 1) % 8) + 1}.jpg`,
  y2kMe: 'trend_y2k_me.jpg',
  y2kMe2: 'trend_y2k_me_2.jpg|me_look_6.jpg',
  friend: 'friend_marta.jpg',
  friend90s: 'friend_marta_90s.jpg|friend_marta.jpg',
  remix90s: 'remix_me_90s.jpg|me_look_5.jpg',
  enhanceBefore: 'enhance_before.jpg',
  enhanceSrc: 'enhance_after.jpg|me_ref_1.jpg',
  enhance2Before: 'enhance2_before.jpg',
  enhance2After: 'enhance2_after.jpg|me_ref_4.jpg',
};

/** The friend in the demo. Asset files keep their original names. */
export const FRIEND = 'Paola';

export const TRENDS: Trend[] = [
  { id: 'y2k', title: 'Y2K Yearbook', tagline: 'Glossy 2000s, neon and chrome', cover: 'pack_y2k.jpg|trend_y2k_me.jpg', result: A.y2kMe, result2: A.y2kMe2, hot: true },
  { id: 'oldmoney', title: 'Old Money', tagline: 'Quiet luxury, linen and sun', cover: `pack_oldmoney.jpg|${A.look(2)}`, result: A.look(2) },
  { id: 'redcarpet', title: 'Red Carpet', tagline: 'Flashbulbs and black tie', cover: `pack_redcarpet.jpg|${A.look(4)}`, result: A.look(4) },
  { id: 'academia', title: 'Dark Academia', tagline: 'Wood panels, wool, window light', cover: `pack_academia.jpg|${A.look(3)}`, result: A.look(3) },
  { id: 'bluehour', title: 'Blue Hour', tagline: 'Night club editorial', cover: `pack_bluehour.jpg|${A.look(6)}`, result: A.look(6) },
  { id: 'fashion', title: 'Fashion Week', tagline: 'Studio colour, chrome chair', cover: `pack_fashion.jpg|${A.look(8)}`, result: A.look(8) },
];

export const IDENTITIES: Identity[] = [
  { id: 'me', name: 'Me', subtitle: 'Saved from 4 photos', cover: A.ref(1), refs: [1, 2, 3, 4].map(A.ref) },
  { id: 'me-pro', name: 'Me · Work', subtitle: 'Suit and tie version', cover: `${A.linkedin(1)}|${A.ref(3)}`, refs: [3, 1, 2, 4].map(A.ref) },
];

export const LOOK_TITLES = ['Soft studio', 'Old Money', 'Dark academia', 'Red carpet', '90s hip-hop', 'Blue hour', 'Fisheye editorial', 'Fashion week'];

let lid = 0;
export const look = (src: string, title: string, isNew = false): Look => ({ id: `lk${++lid}`, src, title, isNew });

export function seedStyles(): CommunityStyle[] {
  return [
    { id: 'st-90s', title: '90s yearbook', creator: FRIEND, cover: A.friend90s, result: A.remix90s, remixes: 12400, friend: true },
    { id: 'st-oldmoney', title: 'Old money summer', creator: 'luca.v', cover: 'style_oldmoney.jpg|me_look_2.jpg', result: A.look(2), remixes: 8100 },
    { id: 'st-redcarpet', title: 'Premiere night', creator: 'sofi.ph', cover: 'style_redcarpet.jpg|me_look_4.jpg', result: A.look(4), remixes: 5300 },
    { id: 'st-fisheye', title: 'Fisheye street', creator: 'benji', cover: 'style_fisheye.jpg|me_look_7.jpg', result: A.look(7), remixes: 3200 },
    { id: 'st-academia', title: 'Library portrait', creator: 'giulia.r', cover: 'style_academia.jpg|me_look_3.jpg', result: A.look(3), remixes: 2700 },
  ];
}

export const CAMERA_ROLL: string[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map(A.trip),
  ...[1, 2, 3, 4].map(A.ref),
  A.enhanceBefore,
  A.enhance2Before,
  ...[1, 2, 3, 4].map(A.old),
  A.friend,
];

let pid = 0;
export const photo = (original: string, status: ProjectPhoto['status'], enhanced?: string): ProjectPhoto => ({
  id: `ph${++pid}`,
  original,
  enhanced,
  status,
});

const cycle = <T,>(arr: T[], n: number) => Array.from({ length: n }, (_, i) => arr[i % arr.length]);

export const INTENTS: { id: Intent; title: string; sub: string; cover: string; emoji: string }[] = [
  { id: 'profile', title: 'Professional profile', sub: 'LinkedIn, CV, work profiles', cover: A.linkedin(2), emoji: '💼' },
  { id: 'trip', title: 'Trip album', sub: 'Every photo from one trip, at its best', cover: A.trip(2), emoji: '✈️' },
  { id: 'family', title: 'Family memories', sub: 'Restore and bring old photos back', cover: A.restored(3), emoji: '🎞️' },
  { id: 'social', title: 'Social content', sub: 'Posts, stories and profile pictures', cover: A.look(6), emoji: '📱' },
  { id: 'looks', title: 'My AI looks', sub: 'You, in styles and places', cover: A.look(4), emoji: '✨' },
  { id: 'other', title: 'Something else', sub: 'Tell us, we will learn from it', cover: A.look(1), emoji: '💡' },
];

export const SEGMENTS: { id: Segment; label: string; emoji: string }[] = [
  { id: 'restore', label: 'Restore old photos', emoji: '🎞️' },
  { id: 'lookgreat', label: 'Look great in my photos', emoji: '✨' },
  { id: 'profile', label: 'Profile or work photos', emoji: '💼' },
  { id: 'social', label: 'Content for social media', emoji: '📱' },
  { id: 'trends', label: 'Try the AI trends', emoji: '🔥' },
  { id: 'exploring', label: 'Just exploring', emoji: '👀' },
];

/** The starter creation each onboarding answer creates in My Creations. */
export function starterFor(seg: Segment): Creation {
  const base = { id: `starter-${seg}`, photos: [] as ProjectPhoto[], looks: [] as Look[], lastEdit: 'Just now' };
  switch (seg) {
    case 'restore':
      return { ...base, title: 'Family archive', intent: 'family', cover: A.old(1), goal: 3 };
    case 'profile':
      return { ...base, id: 'linkedin', title: 'LinkedIn set', intent: 'profile', cover: A.ref(3), goal: 5 };
    case 'lookgreat':
      return { ...base, title: 'My best photos', intent: 'looks', cover: A.ref(1), goal: 5 };
    case 'social':
      return { ...base, title: 'Social content', intent: 'social', cover: A.look(6), goal: 6 };
    case 'trends':
      return { ...base, title: 'My AI looks', intent: 'looks', cover: A.look(4), goal: 4 };
    default:
      return { ...base, title: 'My first creation', intent: 'other', cover: A.ref(2), goal: 3 };
  }
}

/** State of a returning free user a few days after onboarding. */
export function returningCreations(): Creation[] {
  return [
    {
      id: 'linkedin',
      title: 'LinkedIn set',
      intent: 'profile',
      cover: A.linkedin(1),
      photos: [],
      looks: [1, 2, 3].map((n) => look(A.linkedin(n), ['Grey backdrop', 'City walk', 'Office lobby'][n - 1])),
      goal: 5,
      lastEdit: '3 days ago',
    },
    {
      id: 'family',
      title: 'Family archive',
      intent: 'family',
      cover: `${A.restored(3)}|${A.old(3)}`,
      photos: [1, 2, 3].map((n, i) => photo(A.old(n), i < 1 ? 'enhanced' : 'original', A.restored(n))),
      looks: [],
      goal: 3,
      lastEdit: '5 days ago',
    },
    {
      id: 'ailooks',
      title: 'My AI looks',
      intent: 'looks',
      cover: A.look(4),
      photos: [],
      looks: [4, 2, 3, 8].map((n) => look(A.look(n), LOOK_TITLES[n - 1])),
      goal: 6,
      lastEdit: '1 week ago',
    },
  ];
}

/** The trip album: the photos you pick plus the rest of the trip Remini finds for you (17 in total). */
export function tripAlbum(picked: string[]): Creation {
  const rest = cycle([1, 2, 3, 4, 5, 6, 7, 8].map(A.trip), 17);
  const all = [...picked, ...rest.filter((s) => !picked.includes(s))].slice(0, 8);
  const photos = [...all, ...cycle(all, 17 - all.length)].map((src) => photo(src, 'original'));
  return { id: 'barcelona', title: 'Barcelona trip', intent: 'trip', cover: all[0] ?? A.trip(1), photos, looks: [], goal: 17, lastEdit: 'Just now' };
}

export function progressOf(c: Creation) {
  if (c.intent === 'trip' || c.intent === 'family') {
    const done = c.photos.filter((p) => p.status === 'enhanced').length;
    const total = Math.max(c.goal, c.photos.length);
    return { done, total, label: `${done} of ${total} ${c.intent === 'family' ? 'restored' : 'done'}` };
  }
  const done = c.looks.length;
  return { done: Math.min(done, c.goal), total: c.goal, label: `${Math.min(done, c.goal)} of ${c.goal} done` };
}

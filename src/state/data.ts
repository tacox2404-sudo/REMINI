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
  /** Generic sample imagery from the current app (no personal photos). */
  generic: (n: number) => `generic_${n}.jpg`,
  y2kMe: 'trend_y2k_me.jpg',
  y2kMe2: 'trend_y2k_me_2.jpg|me_look_6.jpg',
  friend: 'friend_marta.jpg',
  friend90s: 'friend_marta_90s.jpg|friend_marta.jpg',
  remix90s: 'remix_me_90s.jpg|me_look_5.jpg',
  together90s: 'together_90s.jpg|friend_marta_90s.jpg',
  enhanceBefore: 'enhance_before.jpg',
  enhanceSrc: 'enhance_after.jpg|me_ref_1.jpg',
  enhance2Before: 'enhance2_before.jpg',
  enhance2After: 'enhance2_after.jpg|me_ref_4.jpg',
};

/** The friend in the demo. Asset files keep their original names. */
export const FRIEND = 'Paola';
export const FRIENDS = ['Paola', 'Luca', 'Marco'];
export const TRIPS = [1, 2, 3, 4, 5, 6].map((n) => `trip_${n}.jpg`);

export const TRENDS: Trend[] = [
  { id: 'y2k', title: 'Y2K Yearbook', tagline: 'Glossy 2000s, neon and chrome', cover: A.generic(10), result: A.y2kMe, result2: A.y2kMe2, hot: true },
];

/** The profile, as locked in during the first creation: Work first, Everyday added later. */
export const ME: Identity = {
  id: 'me',
  name: 'Me',
  subtitle: 'Locked in from 4 selfies',
  cover: A.ref(1),
  refs: [1, 2, 3, 4].map(A.ref),
  variants: [{ name: 'Work', cover: A.linkedin(1), usedFor: 'LinkedIn set' }],
};
export const EVERYDAY = { name: 'Everyday', cover: A.remix90s, usedFor: 'Styles from friends' };

let lid = 0;
export const look = (src: string, title: string, isNew = false): Look => ({ id: `lk${++lid}`, src, title, isNew });

export function seedStyles(): CommunityStyle[] {
  return [{ id: 'st-90s', title: '90s film', creator: FRIEND, cover: A.friend90s, result: A.remix90s, remixes: 12400, friend: true }];
}

export const CAMERA_ROLL: string[] = [...[1, 2, 3, 4, 5, 6].map(A.trip), ...[1, 2, 3, 4].map(A.ref), A.enhanceBefore, A.enhance2Before, ...[1, 2, 3, 4].map(A.old), A.friend];

let pid = 0;
export const photo = (original: string, status: ProjectPhoto['status'], enhanced?: string): ProjectPhoto => ({
  id: `ph${++pid}`,
  original,
  enhanced,
  status,
});

const cycle = <T,>(arr: T[], n: number) => Array.from({ length: n }, (_, i) => arr[i % arr.length]);

export const INTENTS: { id: Intent; title: string; sub: string; cover: string; emoji: string }[] = [
  { id: 'profile', title: 'Professional profile', sub: 'LinkedIn, CV, work profiles', cover: A.generic(20), emoji: '💼' },
  { id: 'trip', title: 'Trip album', sub: 'Everyone’s photos, one style', cover: A.trip(2), emoji: '✈️' },
  { id: 'family', title: 'Family memories', sub: 'Restore and bring old photos back', cover: A.old(3), emoji: '🎞️' },
  { id: 'social', title: 'Social content', sub: 'Posts, stories and profile pictures', cover: A.generic(52), emoji: '📱' },
  { id: 'looks', title: 'My AI looks', sub: 'You, in styles and places', cover: A.generic(26), emoji: '✨' },
  { id: 'other', title: 'Something else', sub: 'Tell us, we will learn from it', cover: A.generic(40), emoji: '💡' },
];

export const SEGMENTS: { id: Segment; label: string; emoji: string }[] = [
  { id: 'restore', label: 'Restore old photos', emoji: '🎞️' },
  { id: 'lookgreat', label: 'Look great in my photos', emoji: '✨' },
  { id: 'profile', label: 'Profile or work photos', emoji: '💼' },
  { id: 'social', label: 'Content for social media', emoji: '📱' },
  { id: 'trends', label: 'Try the AI trends', emoji: '🔥' },
  { id: 'exploring', label: 'Share with friends', emoji: '👯' },
];

/** The first creation: kept from the LinkedIn headshots (3 of 5). */
export function linkedinSet(n = 3): Creation {
  return {
    id: 'linkedin',
    title: 'LinkedIn set',
    intent: 'profile',
    cover: A.linkedin(1),
    photos: [],
    looks: Array.from({ length: n }, (_, i) => look(A.linkedin(i + 1), ['Grey backdrop', 'City walk', 'Office lobby', 'Window light', 'Studio grey'][i])),
    goal: 5,
    lastEdit: 'Just now',
    style: 'Casual Headshot · Me (Work)',
  };
}

/** Made with one friend: your version of Paola's style and a photo of you both. */
export function withPaola(): Creation {
  return {
    id: 'paola',
    title: 'With Paola',
    intent: 'social',
    cover: A.together90s,
    photos: [],
    looks: [look(A.together90s, 'You & Paola · 90s film', true), look(A.remix90s, 'Your 90s film')],
    goal: 2,
    lastEdit: 'Just now',
    style: '90s film',
    shared: { members: ['You', FRIEND], style: '90s film', feed: [{ who: FRIEND, text: 'joined from your link', when: 'now' }] },
  };
}

/** The group album: everyone's photos from the Philippines, one style, one chat of presets. */
export function friendsTrip(enhanced = 5): Creation {
  const photos = cycle(TRIPS, 17).map((src, i) => photo(src, i < enhanced ? 'enhanced' : 'original'));
  return {
    id: 'trip',
    title: 'Friends trip',
    intent: 'trip',
    cover: A.trip(1),
    photos,
    looks: [],
    goal: 17,
    lastEdit: '1 hour ago',
    style: 'Golden hour',
    shared: {
      members: ['You', ...FRIENDS],
      style: 'Golden hour',
      feed: [
        { who: 'Luca', text: 'added 6 photos from the boat day', when: '3h' },
        { who: 'Marco', text: 'joined from Paola’s link', when: 'Yesterday' },
      ],
    },
    chat: [
      { id: 'tc1', from: 'Luca', text: 'Golden hour on everyone’s photos' },
      { id: 'tc2', from: 'remini', text: 'Done: every photo in the album, from all of you, now uses “Golden hour”.', action: 'restyled' },
    ],
  };
}

export function progressOf(c: Creation) {
  if (c.intent === 'trip' || c.intent === 'family') {
    const done = c.photos.filter((p) => p.status === 'enhanced').length;
    const total = Math.max(c.goal, c.photos.length);
    return { done, total, label: `${done} of ${total} ${c.intent === 'family' ? 'restored' : 'enhanced'}` };
  }
  const done = Math.min(c.looks.length, c.goal);
  return { done, total: c.goal, label: `${done} of ${c.goal} done` };
}

/** "What are you creating?": the album you start from a few picked photos. */
export function tripAlbum(picked: string[]): Creation {
  const all = [...picked, ...TRIPS.filter((s) => !picked.includes(s))].slice(0, 6);
  const photos = cycle(all, 17).map((src) => photo(src, 'original'));
  return { id: `trip-${Date.now().toString(36)}`, title: 'New trip album', intent: 'trip', cover: all[0] ?? A.trip(1), photos, looks: [], goal: 17, lastEdit: 'Just now', style: 'Golden hour' };
}

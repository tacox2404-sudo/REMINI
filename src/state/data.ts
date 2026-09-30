import type { ChatMsg, CommunityStyle, Creation, Identity, Intent, Look, ProjectPhoto, Segment, Trend } from './types';

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
export const OTHERS = ['Luca', 'Marco'];
export const TRIPS = [1, 2, 3, 4, 5, 6].map((n) => `trip_${n}.jpg`);

export const TRENDS: Trend[] = [
  { id: 'y2k', title: 'Y2K Yearbook', tagline: 'Glossy 2000s, neon and chrome', cover: A.generic(10), result: A.y2kMe, result2: A.y2kMe2, hot: true },
];

/**
 * One clean timeline: the trip was 12–18 Sep, "today" in the demo is Sunday
 * 20 Sep, the trial's last day is 26 Sep, and coming back is 10 Oct.
 */
export const DATES = { today: '20 Sep', trialEnds: '27 Sep', back: 'Saturday 10 October' };

/** The two photos of you in the trip: offered to Me, never added without asking. */
export const TRIP_PHOTOS_OF_ME = [A.enhance2After, A.trip(1)];
/** The 4 selfies Me starts from, as AI Photos asks today. */
export const SELFIES = [A.ref(1), A.ref(2), A.ref(3), A.enhanceSrc];

/** Me: saved once from 4 selfies, then updated only by you. */
export function meProfile(grown = false): Identity {
  const history = [{ when: DATES.today, text: 'Saved from 4 selfies, as AI Photos does' }];
  if (grown) history.push({ when: '21 Sep', text: 'You added 2 photos of you from Philippines trip' });
  return {
    id: 'me',
    name: 'Me',
    owner: 'me',
    subtitle: grown ? 'Updated 21 Sep' : `Saved ${DATES.today}`,
    cover: A.ref(1),
    refs: grown ? [...SELFIES, ...TRIP_PHOTOS_OF_ME] : SELFIES,
    history,
  };
}

/** Paola's profile: it exists only because she added her own face, and she can remove it. */
export function paolaProfile(): Identity {
  return {
    id: 'paola',
    name: FRIEND,
    owner: FRIEND,
    subtitle: 'Added by Paola · she can remove it anytime',
    cover: A.friend,
    refs: [A.friend],
    history: [{ when: DATES.today, text: 'Paola added her own face for duo shoots' }],
  };
}

let lid = 0;
export const look = (src: string, title: string, isNew = false): Look => ({ id: `lk${++lid}`, src, title, isNew });

/** Paola's own 80s creation, made with her free allowance. It only exists in your app after she shares it. */
export const PAOLA_STYLE: CommunityStyle = { id: 'st-80s', title: '80s film', creator: FRIEND, cover: A.friend90s, result: A.remix90s, projectId: 'eighties' };

export const CAMERA_ROLL: string[] = [...[1, 2, 3, 4, 5, 6].map(A.trip), ...[1, 2, 3, 4].map(A.ref), A.enhanceBefore, A.enhance2Before, ...[1, 2, 3, 4].map(A.old), A.friend];
/** The gallery as Enhance shows it: the trip first. */
export const GALLERY = [A.enhance2Before, A.trip(1), A.trip(3), A.old(2), A.trip(4), A.enhanceBefore, A.old(4), A.trip(6), A.old(1)];

let pid = 0;
export const photo = (original: string, status: ProjectPhoto['status'], enhanced?: string): ProjectPhoto => ({
  id: `ph${++pid}`,
  original,
  enhanced,
  status,
});

const cycle = <T,>(arr: T[], n: number) => Array.from({ length: n }, (_, i) => arr[i % arr.length]);

export const INTENTS: { id: Intent; title: string; sub: string; cover: string; emoji: string }[] = [
  { id: 'trip', title: 'A trip', sub: 'All the photos, with the friends who were there', cover: A.trip(2), emoji: '✈️' },
  { id: 'family', title: 'Family archive', sub: 'Restore and bring old photos back', cover: A.old(3), emoji: '🎞️' },
  { id: 'profile', title: 'Profile photos', sub: 'LinkedIn, CV, work profiles', cover: A.generic(20), emoji: '💼' },
  { id: 'looks', title: 'A set of looks', sub: 'You, in one style', cover: A.generic(26), emoji: '✨' },
];

export const SEGMENTS: { id: Segment; label: string; emoji: string }[] = [
  { id: 'lookgreat', label: 'Look great in my photos', emoji: '✨' },
  { id: 'restore', label: 'Restore old photos', emoji: '🎞️' },
  { id: 'profile', label: 'Profile or work photos', emoji: '💼' },
  { id: 'social', label: 'Content for social media', emoji: '📱' },
  { id: 'trends', label: 'Try the AI trends', emoji: '🔥' },
  { id: 'exploring', label: 'Share with friends', emoji: '👯' },
];

/**
 * A set of looks holds one style, and "make more" adds from the same set, so a
 * set never looks mixed or random.
 */
export const STYLE_SETS: Record<string, { id: string; title: string; srcs: string[] }> = {
  headshot: { id: 'linkedin', title: 'LinkedIn set', srcs: [1, 2, 3, 4, 5].map((n) => `linkedin_${n}.jpg`) },
  y2k: { id: 'style-y2k', title: 'Y2K Yearbook', srcs: [A.y2kMe, A.y2kMe2] },
};
export const styleOf = (src: string) => Object.entries(STYLE_SETS).find(([, v]) => v.srcs.includes(src))?.[0];

export function styleCreation(key: string, srcs: string[]): Creation {
  const set = STYLE_SETS[key];
  if (key === 'headshot') return { ...linkedinSet(0), looks: srcs.map((s) => look(s, 'Casual Headshot', true)) };
  return { id: set.id, title: set.title, intent: 'looks', cover: srcs[0], photos: [], looks: srcs.map((s) => look(s, set.title, true)), goal: set.srcs.length, lastEdit: 'Just now', style: set.title };
}

/** The family archive from the restore path: the photos you picked, restored, plus the rest of the album waiting. */
export function familyArchive(restored = 4): Creation {
  const photos = [
    ...[1, 2, 3, 4].map((n, i) => photo(A.old(n), i < restored ? 'enhanced' : 'original', A.restored(n))),
    ...cycle([1, 2, 3, 4], 8).map((n) => photo(A.old(n), 'original', A.restored(n))),
  ];
  return {
    id: 'family',
    title: 'Family archive',
    intent: 'family',
    cover: `${A.restored(3)}|${A.old(3)}`,
    photos,
    looks: [],
    goal: 12,
    lastEdit: 'Just now',
    chat: [{ id: 'fc0', from: 'remini', text: 'Ask for anything Remini does, on the whole archive.' }],
  };
}

/** A set of profile photos in the Casual Headshot style, n of 5. */
export function linkedinSet(n = 3): Creation {
  return {
    id: 'linkedin',
    title: 'LinkedIn set',
    intent: 'profile',
    cover: A.linkedin(1),
    photos: [],
    looks: Array.from({ length: n }, (_, i) => look(A.linkedin(i + 1), 'Casual Headshot')),
    goal: 5,
    lastEdit: 'Just now',
    style: 'Casual Headshot',
    chat: [{ id: 'lc0', from: 'remini', text: 'Ask for more of this set. It stays in the Casual Headshot style.' }],
  };
}

export interface TripState {
  /** How many of your own trip photos are in the project: the first kept, the second, or the whole trip. */
  own: 1 | 2 | 17;
  /** Your photos enhanced so far. */
  done: number;
  /** Friends invited who haven't joined yet. */
  invited?: string[];
  /** Paola joined (free) and added 4 photos. */
  paola?: boolean;
  /** 8 more photos Paola added during the trial: waiting, or enhanced. */
  paolaMore?: 'waiting' | 'done';
  /** Luca joined later and added 6 photos, waiting. */
  luca?: boolean;
}

/** The Philippines trip: a project that starts from one kept photo. */
export function tripProject(s: TripState): Creation {
  const mine = [photo(A.enhance2Before, s.done > 0 ? 'enhanced' : 'original', A.enhance2After)];
  if (s.own >= 2) mine.push(photo(A.trip(1), s.done > 1 ? 'enhanced' : 'original'));
  if (s.own === 17) mine.push(...cycle([2, 3, 4, 5, 6, 1], 15).map((n, i) => photo(A.trip(n), i + 2 < s.done ? 'enhanced' : 'original')));
  const theirs = s.paola ? [2, 3, 4, 5].map((n) => photo(A.trip(n), 'enhanced')) : [];
  const more = s.paolaMore ? cycle([5, 6, 2, 3], 8).map((n) => photo(A.trip(n), s.paolaMore === 'done' ? 'enhanced' : 'original')) : [];
  const luca = s.luca ? cycle([4, 2, 6], 6).map((n) => photo(A.trip(n), 'original')) : [];
  const joined = [...(s.paola ? [FRIEND] : []), ...(s.luca ? ['Luca'] : [])];
  const feed: { who: string; text: string; when: string }[] = [];
  if (s.luca) feed.push({ who: 'Luca', text: 'joined free · added 6 photos', when: '9 Oct' });
  if (s.paolaMore) feed.push({ who: FRIEND, text: 'added 8 photos from the last night', when: '25 Sep' });
  if (s.paola) feed.push({ who: FRIEND, text: 'joined free · added 4 photos and her face', when: DATES.today });
  const photos = [...mine, ...theirs, ...more, ...luca];
  return {
    id: 'trip',
    title: 'Philippines trip',
    place: 'El Nido · 12–18 Sep',
    intent: 'trip',
    cover: s.own >= 2 ? A.trip(1) : A.enhance2After,
    photos,
    looks: [],
    goal: photos.length,
    lastEdit: s.luca ? '9 Oct' : 'Just now',
    shared: joined.length || (s.invited ?? []).length ? { members: ['You', ...joined], invited: s.invited ?? [], feed } : undefined,
    chat: [
      { id: 'tc0', from: 'remini', text: joined.length ? 'This chat is shared with everyone in the trip. Ask Remini for anything it does, on all the photos.' : 'Ask Remini for anything it does, on all the photos of the trip.' },
      ...(s.paola
        ? [
            { id: 'tc1', from: FRIEND, text: 'Enhance all the photos' },
            { id: 'tc2', from: 'remini', text: 'Done: every photo in the trip, from both of you, is enhanced.', action: 'enhanced' as const },
          ]
        : []),
    ],
  };
}

/** Made with Paola, separate from the trip: her 80s style, your version, a duo shoot. */
export function eightiesProject(looks: Look[]): Creation {
  return {
    id: 'eighties',
    title: '80s with Paola',
    intent: 'looks',
    cover: looks[looks.length - 1]?.src ?? A.friend90s,
    photos: [],
    looks,
    goal: looks.length,
    lastEdit: 'Just now',
    style: '80s film',
    shared: { members: ['You', FRIEND], invited: [], feed: [{ who: FRIEND, text: 'shared her 80s film style', when: DATES.today }] },
    chat: [{ id: 'ec0', from: 'remini', text: 'This chat is shared with Paola. Ask for more in the 80s film style.' }],
  };
}

export function progressOf(c: Creation) {
  if (c.id === 'eighties') return { done: c.looks.length, total: Math.max(1, c.looks.length), label: `${c.looks.length} made together` };
  if (c.intent === 'trip' || c.intent === 'family') {
    const done = c.photos.filter((p) => p.status === 'enhanced').length;
    const total = Math.max(c.goal, c.photos.length);
    return { done, total, label: `${done} of ${total} ${c.intent === 'family' ? 'restored' : 'enhanced'}` };
  }
  const done = Math.min(c.looks.length, c.goal);
  return { done, total: c.goal, label: `${done} of ${c.goal} done` };
}

/** "New project": a trip started from a few picked photos. */
export function tripAlbum(picked: string[]): Creation {
  const all = [...picked, ...TRIPS.filter((s) => !picked.includes(s))].slice(0, 6);
  const photos = cycle(all, 12).map((src) => photo(src, 'original'));
  return { id: `trip-${Date.now().toString(36)}`, title: 'New trip', intent: 'trip', cover: all[0] ?? A.trip(1), photos, looks: [], goal: 12, lastEdit: 'Just now', chat: [{ id: 'nc0', from: 'remini', text: 'Ask for anything Remini does, on the whole trip.' }] };
}

/** Your one personal Remini chat (projects each have their own). */
export function personalChat(msgs: ChatMsg[] = []): Creation {
  return {
    id: 'chat',
    title: 'Remini',
    intent: 'other',
    chatOnly: true,
    cover: A.ref(1),
    photos: [],
    looks: [],
    goal: 0,
    lastEdit: 'Just now',
    chat: [{ id: 'ch0', from: 'remini', text: 'Hi! Ask for anything Remini does: a pack on your profile, a trend, an enhance. Keep what you like in a project.' }, ...msgs],
  };
}

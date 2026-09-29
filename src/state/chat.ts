import { A } from './data';
import type { ChatMsg, Creation } from './types';

/**
 * Remini chat, preset and filter oriented. Every preset maps to a result the
 * prototype really has: a style applied to all photos (a filter), an enhance, or
 * a prepared image made with the locked profile. Free text is matched to the
 * closest preset; anything else gets the preset list back, never a random image.
 */
export interface Preset {
  label: string;
  restyle?: string;
  enhance?: boolean;
  image?: string;
  title?: string;
}

const ALBUM: Preset[] = [
  { label: 'Golden hour for everyone', restyle: 'Golden hour' },
  { label: 'Warm film for everyone', restyle: 'Warm film' },
  { label: 'Black and white for everyone', restyle: 'Black and white' },
  { label: 'Fix the light on every photo', enhance: true },
];
const PROFILE: Preset[] = [
  { label: 'Studio grey backdrop', image: A.linkedin(4), title: 'Studio grey' },
  { label: 'Warmer light', image: A.linkedin(5), title: 'Warmer light' },
  { label: 'Office background', image: A.linkedin(6), title: 'Office' },
];
const LOOKS: Preset[] = [
  { label: '80s film', image: A.remix90s, title: '80s film' },
  { label: 'Y2K Yearbook', image: A.y2kMe, title: 'Y2K Yearbook' },
  { label: 'Studio headshot', image: A.linkedin(4), title: 'Studio headshot' },
];

export function presetsFor(c: Creation): Preset[] {
  if (c.shared && c.photos.length) return ALBUM;
  if (c.intent === 'profile') return PROFILE;
  if (c.intent === 'trip' || c.intent === 'family') return ALBUM;
  return LOOKS;
}

/** Keep the old name used by the chat screen. */
export const spurs = (c: Creation) => presetsFor(c).map((p) => p.label);

const KEYWORDS: [RegExp, string][] = [
  [/golden/, 'Golden hour'],
  [/warm|film look|vintage/, 'Warm film'],
  [/black|white|b&w|mono/, 'Black and white'],
  [/fix|light|enhance|sharp|blur/, 'Fix the light'],
  [/grey|gray|backdrop|studio/, 'Studio'],
  [/office|background/, 'Office'],
  [/80|retro|90/, '80s'],
  [/y2k|2000|yearbook/, 'Y2K'],
];

export interface ChatReply {
  text: string;
  preset?: Preset;
}

export function chatReply(text: string, c: Creation): ChatReply {
  const list = presetsFor(c);
  const t = text.toLowerCase();
  const exact = list.find((p) => p.label.toLowerCase() === t);
  const byWord = KEYWORDS.find(([re]) => re.test(t));
  const preset = exact ?? (byWord ? list.find((p) => p.label.toLowerCase().includes(byWord[1].toLowerCase())) : undefined);
  if (!preset) return { text: `I work with presets and filters here. Try one of these: ${list.map((p) => `“${p.label}”`).join(', ')}.` };
  if (preset.restyle) return { preset, text: c.shared ? `Done: every photo in the album, from all of you, now uses “${preset.restyle}”.` : `Applied “${preset.restyle}” to every photo.` };
  if (preset.enhance) return { preset, text: `Improving every photo in “${c.title}”.` };
  return { preset, text: `Here is “${preset.title}”, made with your locked profile.` };
}

export type { ChatMsg };

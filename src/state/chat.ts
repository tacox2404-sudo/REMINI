import { A, FRIEND } from './data';
import type { ChatMsg, Creation } from './types';

/**
 * Remini chat: one personal chat, plus one inside each project (shared with its
 * members). It only offers what Remini already does and this prototype can show:
 * enhance and restore on the whole project, packs and trends on your profile,
 * a friend's shared style with your face, a duo shoot. Free text is matched to
 * the closest of these; anything else gets the list back, never a made-up edit.
 */
export interface Preset {
  label: string;
  /** Batch enhance or restore every photo still waiting. */
  batch?: boolean;
  /** Make more of the same set (look-based projects). */
  more?: boolean;
  images?: string[];
  title?: string;
  /** Needs your saved profile. */
  needsMe?: boolean;
}

export interface ChatCtx {
  hasMe: boolean;
  paolaJoined: boolean;
  styleShared: boolean;
}

export function presetsFor(c: Creation, ctx: ChatCtx): Preset[] {
  if (c.chatOnly)
    return [
      { label: 'Casual Headshot on me', images: [A.linkedin(1), A.linkedin(2), A.linkedin(3)], title: 'Casual Headshot', needsMe: true },
      { label: 'Y2K Yearbook on me', images: [A.y2kMe], title: 'Y2K Yearbook', needsMe: true },
    ];
  if (c.intent === 'family') return [{ label: 'Restore and colour all of these', batch: true }];
  if (c.intent === 'trip') {
    const list: Preset[] = [{ label: 'Enhance all the photos', batch: true }];
    if (ctx.styleShared) list.push({ label: `${FRIEND}’s 80s film on me`, images: [A.remix90s], title: '80s film · your version', needsMe: true });
    if (ctx.paolaJoined) list.push({ label: `Duo shoot with ${FRIEND}`, images: [A.together90s], title: `You & ${FRIEND}`, needsMe: true });
    return list;
  }
  return [{ label: 'Make more, same style', more: true }];
}

const KEYWORDS: [RegExp, (p: Preset) => boolean][] = [
  [/enhanc|fix|sharp|blur|light|all the photos/, (p) => !!p.batch],
  [/restor|colou?r|old|scratch/, (p) => !!p.batch],
  [/more|another|again/, (p) => !!p.more],
  [/linkedin|headshot|work|cv|profile photo/, (p) => p.title === 'Casual Headshot'],
  [/y2k|2000|yearbook/, (p) => p.title === 'Y2K Yearbook'],
  [/80|retro|film|style/, (p) => !!p.title?.startsWith('80s')],
  [/duo|together|both|with paola/, (p) => !!p.title?.startsWith('You &')],
];

export interface ChatReply {
  text: string;
  preset?: Preset;
}

export function chatReply(text: string, c: Creation, ctx: ChatCtx): ChatReply {
  const list = presetsFor(c, ctx);
  const t = text.toLowerCase();
  const preset = list.find((p) => p.label.toLowerCase() === t) ?? list.find((p) => KEYWORDS.some(([re, is]) => re.test(t) && is(p)));
  if (!preset) return { text: `Here I can do: ${list.map((p) => `“${p.label}”`).join(', ')}.` };
  if (preset.needsMe && !ctx.hasMe) return { text: 'That uses your profile, Me. Save it once from 4 selfies (Studio → Profiles) and ask again.' };
  if (preset.batch) return { preset, text: c.intent === 'family' ? `Restoring every photo still waiting in “${c.title}”.` : `Enhancing every photo still waiting in “${c.title}”, from everyone.` };
  if (preset.more) return { preset, text: `More of “${c.title}”, same style.` };
  return { preset, text: `Here is “${preset.title}”, made with your profile. Keep it if you like it.` };
}

export type { ChatMsg };

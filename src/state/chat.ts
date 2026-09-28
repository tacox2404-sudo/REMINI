import { A, FRIEND, TRIPS } from './data';
import type { ChatMsg, Creation } from './types';

/**
 * Simulated Remini chat. Keyword rules map a free-text prompt to a reply and a
 * prepared result: images, a short video made from the album, a poster, or a new
 * style applied to every photo. A stand-in for a real model, good enough to demo.
 */
export interface ChatReply {
  text: string;
  title: string;
  images?: string[];
  video?: string[];
  poster?: { src: string; title: string };
  restyle?: string;
  action?: ChatMsg['action'];
}

const albumPhotos = (c: Creation) => {
  const uniq = [...new Set(c.photos.map((p) => p.enhanced ?? p.original))];
  return uniq.length ? uniq.slice(0, 6) : TRIPS;
};

const rules: { test: RegExp; reply: (c: Creation) => ChatReply }[] = [
  {
    test: /\b(astronaut|space|moon|beach|paris|snow|city|jungle|scene|red carpet|premiere)\b/,
    reply: () => ({ text: 'New scene, same you. Want a wider shot or a closer portrait?', images: [A.look(4), A.look(7)], title: 'New scene' }),
  },
  {
    test: /\b(video|recap|reel|clip|montage|trailer)\b/,
    reply: (c) => ({ text: `Your ${c.photos.length ? 'recap' : 'clip'}, made from ${c.photos.length ? 'the photos in this album' : 'your looks'}, in the “${c.style ?? 'album'}” style. Tap to play.`, video: c.photos.length ? albumPhotos(c) : [A.look(4), A.look(6), A.look(8), A.look(2)], title: 'Recap video' }),
  },
  {
    test: /\b(poster|movie|cinema|cover|magazine)\b/,
    reply: (c) => ({ text: 'Here is your poster.', poster: { src: c.photos.length ? A.trip(2) : A.look(4), title: c.photos.length ? c.title.toUpperCase() : 'STARRING ME' }, title: 'Poster' }),
  },
  {
    test: /\b(style|everyone|all (the )?photos|every photo|same look|golden hour|film look|vintage|warm|black and white|b&w)\b/,
    reply: (c) => {
      const style = 'Warm 35mm film';
      return { text: c.shared ? `Done: every photo in the album, from everyone, now uses “${style}”. It updates for all of you.` : `Applied “${style}” to every photo.`, restyle: style, title: style };
    },
  },
  {
    test: /\b(fix|improve|enhance|sharpen|blurry|blur|quality|restore|colori[sz]e)\b/,
    reply: (c) => ({ text: `Improving every photo in “${c.title}”.`, action: 'enhanced', title: 'Enhance all' }),
  },
  {
    test: /\b(animate|alive|move|moving)\b/,
    reply: () => ({ text: 'Here it is, moving. Tap to play.', images: [`${A.restored(1)}|${A.trip(2)}`], action: 'animate', title: 'Animation' }),
  },
  {
    test: /\b(linkedin|professional|headshot|cv|work|office|approachable|dating|profile)\b/,
    reply: () => ({ text: 'Two new takes with your saved Me · Work: one warmer, one more formal.', images: [A.linkedin(5), A.linkedin(6)], title: 'Headshot' }),
  },
  {
    test: /\b(y2k|yearbook|2000s|90s|80s|retro)\b/,
    reply: () => ({ text: 'Glossy, loud, very 2000s.', images: [A.y2kMe, 'trend_y2k_me_2.jpg|me_look_6.jpg'], title: 'Yearbook' }),
  },
  {
    test: /\b(together|group|all of us|friends|with me|us)\b/,
    reply: () => ({ text: `You and ${FRIEND} in the same shot, each with your own saved identity.`, images: [A.creative(3)], title: 'Group shot' }),
  },
];

let n = 0;
export function chatReply(text: string, c: Creation): ChatReply {
  const t = text.toLowerCase();
  const rule = rules.find((r) => r.test.test(t));
  if (rule) return rule.reply(c);
  n += 1;
  return { text: 'Love that idea. Here is a first take; tell me what to push further.', images: [A.creative((n % 4) + 1)], title: 'Freestyle' };
}

/** Prompt ideas that fit the creation. */
export function spurs(c: Creation): string[] {
  if (c.shared) return ['Make a recap video of the trip', 'Put all of us on a movie poster', 'Same film look on everyone’s photos', 'Put Paola and me on the beach'];
  if (c.intent === 'profile') return ['Make it more approachable', 'A version for my dating profile', 'Magazine cover of me', 'Make a short intro video'];
  if (c.intent === 'family') return ['Restore and colorize everything', 'Animate the first photo', 'Make a family video for grandma', 'Vintage poster of the family'];
  if (c.intent === 'trip') return ['Make a recap video', 'Movie poster of the trip', 'Warm film look on every photo', 'Fix the light on every photo'];
  return ['Me as an astronaut on a film set', 'Me on a red carpet premiere', 'A 90s album cover of me', 'Surprise me'];
}

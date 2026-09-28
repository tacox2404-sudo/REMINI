import { A, FRIEND } from './data';
import type { ChatMsg, Creation } from './types';

/**
 * Simulated Remini chat. Keyword rules map a free-text instruction to a reply,
 * prepared result images and an optional action. It is a prototype stand-in for
 * a real model: good enough to demo the interaction, not a claim about quality.
 */
export interface ChatReply {
  text: string;
  images?: string[];
  action?: ChatMsg['action'];
  title: string;
}

const rules: { test: RegExp; reply: (p: Creation) => ChatReply }[] = [
  {
    test: /\b(fix|improve|enhance|sharpen|lighting|blurry|blur|quality|restore|colori[sz]e)\b/,
    reply: (p) => ({
      text: `On it: fixing light and sharpening faces on every photo in "${p.title}".`,
      action: 'enhanced',
      title: 'Enhance all',
    }),
  },
  {
    test: /\b(animate|video|move|moving|alive|clip)\b/,
    reply: () => ({ text: 'Here is a 5-second animation. Tap it to play.', images: [A.restored(1) + '|' + A.trip(2)], action: 'animate', title: 'Animation' }),
  },
  {
    test: /\b(poster|movie|cinema|netflix)\b/,
    reply: () => ({
      text: 'Your movie poster, lit like a thriller.',
      images: [A.creative(1)],
      title: 'Movie poster',
    }),
  },
  {
    test: /\b(y2k|yearbook|2000s|90s|80s|retro|vintage)\b/,
    reply: () => ({ text: 'Y2K yearbook, glossy and a bit too much. As it should be.', images: [A.y2kMe, A.creative(2)], title: 'Yearbook' }),
  },
  {
    test: /\b(linkedin|professional|headshot|cv|work|office|approachable|dating|profile)\b/,
    reply: () => ({ text: 'Two new takes with your saved setup: one warmer and more approachable, one more formal.', images: [A.linkedin(3), A.linkedin(4)], title: 'Headshot' }),
  },
  {
    test: /\b(together|group|all of us|friends|everyone|add me|with me|us)\b/,
    reply: () => ({ text: `Put you and ${FRIEND} in the same shot, same light, same film look.`, images: [A.creative(3)], title: 'Group shot' }),
  },
  {
    test: /\b(background|beach|paris|rome|snow|city|space|astronaut|moon|jungle|scene|outdoor|outdoors)\b/,
    reply: () => ({ text: 'New scene, same you. Want a wider shot or a closer portrait?', images: [A.creative(4)], title: 'New scene' }),
  },
  {
    test: /\b(anime|cartoon|painting|renaissance|sketch|oil|comic|pixar|3d)\b/,
    reply: () => ({ text: 'Painted version. I can keep going in this style for the whole album.', images: [A.look(4)], title: 'Painted' }),
  },
];

let n = 0;
export function chatReply(text: string, p: Creation): ChatReply {
  const t = text.toLowerCase();
  const rule = rules.find((r) => r.test.test(t));
  if (rule) return rule.reply(p);
  n += 1;
  return {
    text: 'Love that idea. Here is a first take. Tell me what to push further: mood, outfit, place, or who is in it.',
    images: [A.creative((n % 4) + 1)],
    title: 'Freestyle',
  };
}

/** Creativity spurs: suggested prompts that fit the creation. */
export function spurs(p: Creation): string[] {
  if (p.intent === 'profile') return ['Make it more approachable', 'A version for my dating profile', 'Same look, outdoor light', 'A 90s album cover of me'];
  if (p.intent === 'family') return ['Animate the first photo', 'Restore and colorize everything', 'Make a family poster', 'Put me next to grandma'];
  if (p.intent === 'trip') return ['Make a movie poster of the trip', 'Golden hour on every photo', 'Turn it into a 5-second video', 'Put me on the beach at sunset'];
  return ['Me as an astronaut on a film set', 'A 90s album cover of me', 'Renaissance portrait, oil on canvas', 'Surprise me'];
}

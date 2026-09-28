export type Mode = 'today' | 'studio';
export type Lever = 't' | 'c' | 'w' | 'I';
export type Tab = 'studio' | 'enhance' | 'aiphotos' | 'filters' | 'videos' | 'retouch';

/** What a creation is for; drives its starter, progress wording and suggestions. */
export type Intent = 'profile' | 'trip' | 'family' | 'social' | 'looks' | 'other';

export type Segment = 'restore' | 'lookgreat' | 'profile' | 'social' | 'trends' | 'exploring';

export interface Identity {
  id: string;
  name: string;
  subtitle: string;
  cover: string;
  refs: string[];
}

export interface Look {
  id: string;
  src: string;
  title: string;
  isNew?: boolean;
}

export interface ProjectPhoto {
  id: string;
  original: string;
  /** Separate restored/enhanced file. When absent, "before" is the original rendered degraded. */
  enhanced?: string;
  status: 'original' | 'processing' | 'enhanced';
}

export interface ChatMsg {
  id: string;
  /** 'me', 'remini', or a friend's name. */
  from: string;
  text: string;
  images?: string[];
  /** A short video made from several photos (rendered as an animated slideshow). */
  video?: string[];
  /** A poster made from one photo and a title. */
  poster?: { src: string; title: string };
  action?: 'paywall' | 'animate' | 'enhanced' | 'restyled';
}

/** A "creation": ongoing work in My Creations. Persistence is automatic. */
export interface Creation {
  id: string;
  title: string;
  intent: Intent;
  cover: string;
  /** Photo-based creations (trip, family) progress by enhanced photos; the rest by looks. */
  photos: ProjectPhoto[];
  looks: Look[];
  /** Target: looks for look-based creations ("LinkedIn set 3 of 5"), slots for family. */
  goal: number;
  lastEdit: string;
  chat?: ChatMsg[];
  /** Albums made together: every member's photos share one style and change together. */
  shared?: { members: string[]; style: string; feed: { who: string; text: string; when: string }[] };
  /** One look applied across the whole creation. */
  style?: string;
}

export interface CommunityStyle {
  id: string;
  title: string;
  creator: string;
  /** The creator's own result. */
  cover: string;
  /** What it looks like on you (remix result). */
  result: string;
  remixes: number;
  mine?: boolean;
  friend?: boolean;
}

export interface Trend {
  id: string;
  title: string;
  tagline: string;
  cover: string;
  result: string;
  result2?: string;
  hot?: boolean;
}

export type ResultKind = 'trend' | 'enhance' | 'look' | 'remix';

export type Route =
  | { name: 'onboarding'; step?: 'question' }
  | { name: 'studioIntro' }
  | { name: 'today'; screen: 'photos' | 'filters' | 'videos' | 'chat' | 'profile' }
  | { name: 'video'; srcs: string[]; title: string }
  | { name: 'trend'; trendId: string }
  | { name: 'result'; kind: ResultKind; image: string; title: string; trendId?: string; styleId?: string; before?: string }
  | { name: 'picker'; title: string; min?: number; max: number; preselect?: number; pool?: string[]; cta: string; onDone: (picked: string[]) => void }
  | { name: 'identity'; id: string }
  | { name: 'create' }
  | { name: 'creation'; id: string }
  | { name: 'photo'; creationId: string; photoId: string }
  | { name: 'chat'; creationId: string }
  | { name: 'section'; section: 'me' | 'creations' | 'remix' }
  | { name: 'comingNext' }
  | { name: 'lock' }
  | { name: 'about' }
  | { name: 'animate'; src: string; creationId: string }
  | { name: 'grid'; title: string; items: { src: string; title?: string }[] };

export type Sheet =
  | { type: 'keepThis'; photo: string; title: string }
  | { type: 'paywall'; creationId: string; stage: 'offer' | 'success' }
  | { type: 'paywallGeneric'; image?: string; reason: 'onboarding' | 'result' }
  | { type: 'withFriend'; title: string; image: string; link: string; challenge?: boolean }
  | { type: 'publish'; image: string; from: string }
  | { type: 'privacy' }
  | { type: 'rememberMe' }
  | { type: 'profileToday' };

export interface Generating {
  steps: string[];
  duration: number;
  preview?: string;
}

export interface LogEvent {
  id: number;
  name: string;
  lever?: Lever;
  at: string;
}

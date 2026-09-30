export type Mode = 'today' | 'studio';
export type Lever = 't' | 'c' | 'w' | 'I';
export type Tab = 'studio' | 'enhance' | 'aiphotos' | 'filters' | 'videos' | 'retouch';

/** What a creation is for; drives its starter, progress wording and suggestions. */
export type Intent = 'profile' | 'trip' | 'family' | 'social' | 'looks' | 'other';

export type Segment = 'restore' | 'lookgreat' | 'profile' | 'social' | 'trends' | 'exploring';

/** One step in how a profile grew: every addition is chosen by its owner. */
export interface ProfileUpdate {
  when: string;
  text: string;
}

/**
 * A saved face profile. Remini already builds these for AI Photos; in Studio it
 * is kept, updated over time and used across projects. Friends' profiles only
 * exist when the friend adds their own face.
 */
export interface Identity {
  id: string;
  name: string;
  subtitle: string;
  cover: string;
  refs: string[];
  history: ProfileUpdate[];
  /** Whose face it is: 'me' or a friend's name. Only they can add or remove it. */
  owner: string;
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
  action?: 'enhanced' | 'restored';
  /** Results stay in the chat until you choose to keep them. */
  kept?: boolean;
}

/** A project: a job that keeps going in Studio (a trip, a family archive, a set of looks). */
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
  /** Projects made together: members add their own photos and make their own things, in any style. */
  shared?: { members: string[]; invited: string[]; feed: { who: string; text: string; when: string }[] };
  /** Style a set of looks is made in (look-based projects only). */
  style?: string;
  /** Where the photos are from, shown under the title. */
  place?: string;
  /** The personal Remini chat: one per user, not a project. */
  chatOnly?: boolean;
}

export interface CommunityStyle {
  id: string;
  title: string;
  creator: string;
  /** The creator's own result. */
  cover: string;
  /** What it looks like with your face. */
  result: string;
  /** The project it was shared into. */
  projectId: string;
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

export type ResultKind = 'trend' | 'enhance' | 'look' | 'remix' | 'set' | 'together' | 'preset' | 'restore';

export type Route =
  | { name: 'onboarding'; step?: 'question' }
  | { name: 'today'; screen: 'photos' | 'filters' | 'videos' | 'chat' | 'profile' }
  | { name: 'first'; step: 'intro' | 'confirm'; path?: 'profile' | 'restore' | 'enhance' }
  | { name: 'studio' }
  | { name: 'trend'; trendId: string }
  | { name: 'result'; kind: ResultKind; image: string; title: string; trendId?: string; styleId?: string; before?: string; images?: string[]; projectId?: string }
  | { name: 'picker'; title: string; min?: number; max: number; preselect?: number; pool?: string[]; cta: string; onDone: (picked: string[]) => void }
  | { name: 'identity'; id: string }
  | { name: 'create' }
  | { name: 'creation'; id: string }
  | { name: 'photo'; creationId: string; photoId: string }
  | { name: 'chat'; creationId: string }
  | { name: 'chats' }
  | { name: 'lock' }
  | { name: 'about' }
  | { name: 'animate'; src: string; creationId: string }
  | { name: 'grid'; title: string; items: { src: string; title?: string }[] };

export type Sheet =
  | { type: 'keepThis'; photo: string; title: string; before?: string }
  | { type: 'paywall'; creationId: string; stage: 'offer' | 'success' }
  | { type: 'together' }
  | { type: 'cancelled' }
  | { type: 'paywallGeneric'; image?: string; reason: 'onboarding' | 'result' }
  | { type: 'withFriend'; title: string; image: string; link: string; via?: string; projectId?: string }
  | { type: 'privacy' }
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

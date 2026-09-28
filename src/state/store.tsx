import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { chatReply } from './chat';
import { A, FRIEND, IDENTITIES, INTENTS, LOOK_TITLES, SEGMENTS, look, photo, returningCreations, seedStyles, starterFor, tripAlbum } from './data';
import type { ChatMsg, CommunityStyle, Creation, Generating, Identity, Intent, Lever, LogEvent, Mode, Route, Segment, Sheet, Tab } from './types';

export const FREE_LIMIT = 5;

/** A value mirrored into React state, so actions can read the latest value synchronously. */
function useSyncState<T>(initial: T | (() => T)) {
  const [state, setState] = useState<T>(initial);
  const ref = useRef(state);
  const set = useCallback((next: T | ((prev: T) => T)) => {
    const value = typeof next === 'function' ? (next as (p: T) => T)(ref.current) : next;
    ref.current = value;
    setState(value);
  }, []);
  return [state, set, ref] as const;
}

let chatSeq = 0;

function useStoreValue() {
  const [mode, setModeState] = useState<Mode>('today');
  const [tab, setTab] = useState<Tab>('enhance');
  const [stack, setStack, stackRef] = useSyncState<Route[]>([]);
  const [navDir, setNavDir] = useState<1 | -1>(1);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [generating, setGenerating] = useState<Generating | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showLevers, setShowLevers] = useState(false);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [identities, setIdentities] = useSyncState<Identity[]>(IDENTITIES);
  const [creations, setCreations, creationsRef] = useSyncState<Creation[]>(returningCreations);
  const [styles, setStyles] = useSyncState<CommunityStyle[]>(seedStyles);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [onboarded, setOnboarded] = useState<Record<Mode, boolean>>({ today: false, studio: false });
  const [chatTyping, setChatTyping] = useState<string | null>(null);
  const [lastDemoDone, setLastDemoDone] = useState(false);
  const [closing, setClosing] = useState(false);
  const [freeUsed, setFreeUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [demo, setDemo] = useState<number | null>(null);
  const [splash, setSplash] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const timers = useRef<number[]>([]);
  const genDone = useRef<(() => void) | null>(null);
  const toastTimer = useRef<number>();
  const startedAt = useRef(Date.now());
  const evSeq = useRef(0);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    genDone.current = null;
    setGenerating(null);
    setProcessing(null);
    setChatTyping(null);
  }, []);

  // ---------- analytics ----------
  const track = useCallback((name: string, lever?: Lever) => {
    const s = Math.floor((Date.now() - startedAt.current) / 1000);
    const at = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    setEvents((ev) => [{ id: ++evSeq.current, name, lever, at }, ...ev].slice(0, 80));
  }, []);

  // ---------- navigation ----------
  const push = useCallback((r: Route) => {
    setNavDir(1);
    setStack((s) => [...s, r]);
  }, [setStack]);

  const pop = useCallback(() => {
    setNavDir(-1);
    setStack((s) => s.slice(0, -1));
  }, [setStack]);

  const replaceTop = useCallback((r: Route) => {
    setNavDir(1);
    setStack((s) => [...s.slice(0, -1), r]);
  }, [setStack]);

  const resetStack = useCallback((routes: Route[] = [], dir: 1 | -1 = 1) => {
    setNavDir(dir);
    setStack(routes);
  }, [setStack]);

  const goTab = useCallback((t: Tab) => {
    setNavDir(1);
    setTab(t);
    setStack([]);
    setSheet(null);
  }, [setStack]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    setSheet(null);
    setGenerating(null);
    genDone.current = null;
    setStack([]);
    setTab(m === 'studio' ? 'studio' : 'enhance');
    track(m === 'studio' ? 'mode_with_studio' : 'mode_today');
  }, [setStack, track]);

  // ---------- overlays ----------
  const openSheet = useCallback((s: Sheet) => setSheet(s), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const runGenerating = useCallback((g: Generating, onDone: () => void) => {
    setGenerating(g);
    genDone.current = onDone;
    later(() => {
      const fn = genDone.current;
      genDone.current = null;
      setGenerating(null);
      fn?.();
    }, g.duration);
  }, [later]);

  // ---------- creations ----------
  const updateCreation = useCallback((id: string, fn: (c: Creation) => Creation) => {
    setCreations((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  }, [setCreations]);

  const upsertCreation = useCallback((c: Creation) => {
    setCreations((cs) => [c, ...cs.filter((x) => x.id !== c.id)]);
  }, [setCreations]);

  /** Onboarding answer: log the segment; With Studio it starts a creation, Today it goes to the paywall. */
  const answerSegment = useCallback((seg: Segment, forMode?: Mode) => {
    const m = forMode ?? mode;
    const label = SEGMENTS.find((s) => s.id === seg)?.label ?? seg;
    setSegment(seg);
    track(`segment: ${label}`, 't');
    setOnboarded((o) => ({ ...o, [m]: true }));
    if (m === 'studio') {
      const starter = starterFor(seg);
      const existing = creationsRef.current.find((c) => c.intent === starter.intent);
      if (existing) setCreations((cs) => [existing, ...cs.filter((x) => x.id !== existing.id)]);
      else setCreations((cs) => [starter, ...cs]);
      track('starter_created', 'c');
      setNavDir(1);
      setTab('studio');
      setStack([]);
      showToast(existing ? `“${existing.title}” is first in Keep going` : `We started “${starter.title}” for you`);
    } else {
      setStack([]);
      setTab('enhance');
      track('paywall_before_use');
      setSheet({ type: 'paywallGeneric', reason: 'onboarding' });
    }
  }, [creationsRef, mode, setCreations, setStack, showToast, track]);

  /** Jump a few days ahead: the state of a returning free user. */
  const becomeReturning = useCallback(() => {
    setCreations(returningCreations());
    setOnboarded({ today: true, studio: true });
    setIsPro(false);
    setFreeUsed(0);
  }, [setCreations]);

  /** Continue a look-based creation up to its goal. */
  const continueCreation = useCallback((id: string) => {
    const c = creationsRef.current.find((x) => x.id === id);
    if (!c) return;
    const missing = Math.max(0, c.goal - c.looks.length);
    if (!missing) return showToast('This one is complete');
    track('creation_continued', 'w');
    runGenerating({ steps: ['Using your saved Me', `Making ${missing} more`, 'Matching the set'], duration: 2000, preview: c.cover }, () => {
      const start = c.looks.length;
      const add = Array.from({ length: missing }, (_, i) => {
        const n = start + i + 1;
        return c.intent === 'profile'
          ? look(A.linkedin(((n - 1) % 6) + 1), ['Window light', 'Library', 'Studio grey'][i % 3], true)
          : look(A.look(((n + 2) % 8) + 1), LOOK_TITLES[(n + 2) % 8], true);
      });
      updateCreation(id, (x) => ({ ...x, looks: [...x.looks, ...add], lastEdit: 'Just now', cover: x.intent === 'profile' ? A.linkedin(1) : x.cover }));
      track('creation_completed', 'c');
      showToast(`${c.title}: ${c.goal} of ${c.goal} done`);
    });
  }, [creationsRef, runGenerating, showToast, track, updateCreation]);

  /** "Keep this": results land in My Creations automatically. */
  const keepLook = useCallback((src: string, title: string, into?: string) => {
    let id = into;
    if (!id) {
      const existing = creationsRef.current.find((c) => c.id === 'ailooks');
      if (existing) id = existing.id;
      else {
        id = 'ailooks';
        upsertCreation({ id, title: 'My AI looks', intent: 'looks', cover: src, photos: [], looks: [], goal: 6, lastEdit: 'Just now' });
      }
    }
    const target = id;
    setCreations((cs) => {
      const c = cs.find((x) => x.id === target);
      if (!c) return cs;
      const updated = { ...c, cover: src, lastEdit: 'Just now', looks: c.looks.some((l) => l.src === src) ? c.looks : [look(src, title, true), ...c.looks] };
      return [updated, ...cs.filter((x) => x.id !== target)];
    });
    track('kept_in_my_creations', 'w');
    return target;
  }, [creationsRef, setCreations, track, upsertCreation]);

  /** "What are you creating?": log the intent (fake-door design) and create it from the picked photos. */
  const createFromIntent = useCallback((intent: Intent, picked: string[]) => {
    const meta = INTENTS.find((i) => i.id === intent)!;
    let c: Creation;
    if (intent === 'trip') c = tripAlbum(picked);
    else if (intent === 'family')
      c = { id: `c${Date.now().toString(36)}`, title: 'Family memories', intent, cover: picked[0], goal: picked.length, lastEdit: 'Just now', looks: [], photos: picked.map((s) => { const m = s.match(/archive_old_(\d+)/); return photo(s, 'original', m ? A.restored(Number(m[1])) : undefined); }) };
    else
      c = { id: `c${Date.now().toString(36)}`, title: meta.title, intent, cover: picked[0], goal: picked.length + 2, lastEdit: 'Just now', photos: [], looks: picked.map((s) => look(s, 'Enhanced', true)) };
    upsertCreation(c);
    track('creation_started', 't');
    return c.id;
  }, [track, upsertCreation]);

  const processPhotos = useCallback((id: string, ids: string[], onDone?: () => void) => {
    if (!ids.length) return onDone?.();
    setProcessing(id);
    updateCreation(id, (c) => ({ ...c, photos: c.photos.map((p) => (ids.includes(p.id) ? { ...p, status: 'processing' } : p)) }));
    ids.forEach((pid, i) => {
      later(() => {
        updateCreation(id, (c) => ({ ...c, lastEdit: 'Just now', photos: c.photos.map((p) => (p.id === pid ? { ...p, status: 'enhanced' } : p)) }));
        if (i === ids.length - 1) {
          setProcessing(null);
          onDone?.();
        }
      }, 450 + i * 160);
    });
  }, [later, updateCreation]);

  /** Free users get the free enhancements, then the paywall on the unfinished work. */
  const enhanceAll = useCallback((id: string) => {
    const c = creationsRef.current.find((x) => x.id === id);
    if (!c) return;
    const todo = c.photos.filter((p) => p.status === 'original').map((p) => p.id);
    if (!todo.length) return showToast('Everything here is done');
    track('enhance_all_tapped', 't');
    if (isPro) {
      processPhotos(id, todo, () => {
        track('batch_enhance_completed', 'c');
        showToast('All photos done');
      });
      return;
    }
    const free = Math.max(0, FREE_LIMIT - freeUsed);
    processPhotos(id, todo.slice(0, free), () => {
      setFreeUsed(FREE_LIMIT);
      track('paywall_unfinished_work', 't');
      later(() => setSheet({ type: 'paywall', creationId: id, stage: 'offer' }), 350);
    });
  }, [creationsRef, freeUsed, isPro, later, processPhotos, showToast, track]);

  const startTrial = useCallback((id: string) => {
    setIsPro(true);
    track('trial_started', 't');
    setSheet({ type: 'paywall', creationId: id, stage: 'success' });
  }, [track]);

  const finishAfterTrial = useCallback((id: string) => {
    setSheet(null);
    const c = creationsRef.current.find((x) => x.id === id);
    if (!c) return;
    processPhotos(id, c.photos.filter((p) => p.status === 'original').map((p) => p.id), () => {
      track('batch_enhance_completed', 'c');
      showToast(`${c.title} is finished`);
    });
  }, [creationsRef, processPhotos, showToast, track]);

  // ---------- remix ----------
  const remixStyle = useCallback((styleId: string, onResult: (r: Route) => void) => {
    const st = styles.find((s) => s.id === styleId);
    if (!st) return;
    runGenerating({ steps: [`Applying ${st.creator}'s style to you`, 'Using your saved Me', 'Final touches'], duration: 2100, preview: st.result }, () => {
      setStyles((ss) => ss.map((s) => (s.id === styleId ? { ...s, remixes: s.remixes + 1 } : s)));
      track('remix_made', 'w');
      onResult({ name: 'result', kind: 'remix', image: st.result, title: `${st.title} · your version`, styleId });
    });
  }, [runGenerating, setStyles, styles, track]);

  const publishStyle = useCallback((title: string, image: string) => {
    const id = `st-mine-${Date.now().toString(36)}`;
    setStyles((ss) => [{ id, title: title || 'My style', creator: 'You', cover: image, result: image, remixes: 0, mine: true }, ...ss.filter((s) => !s.mine)]);
    track('style_published', 'I');
    return id;
  }, [setStyles, track]);

  // The published style's counter ticks up like a filter going around.
  const hasMine = styles.some((s) => s.mine);
  useEffect(() => {
    if (!hasMine) return;
    const t = window.setInterval(() => {
      setStyles((ss) => ss.map((s) => (s.mine && s.remixes < 480 ? { ...s, remixes: s.remixes + 1 + Math.floor(Math.random() * 6) } : s)));
    }, 700);
    return () => clearInterval(t);
  }, [hasMine, setStyles]);

  // ---------- Remini chat ----------
  const restyleAll = useCallback((id: string, style: string) => {
    const c = creationsRef.current.find((x) => x.id === id);
    if (!c) return;
    updateCreation(id, (x) => ({ ...x, style, shared: x.shared && { ...x.shared, style, feed: [{ who: 'You', text: `changed the style to “${style}” for everyone`, when: 'now' }, ...x.shared.feed] } }));
    const done = c.photos.filter((p) => p.status === 'enhanced').map((p) => p.id);
    // Re-render the finished photos in the new look; unfinished ones pick it up when enhanced.
    processPhotos(id, done);
    track('style_changed_for_everyone', 'w');
  }, [creationsRef, processPhotos, track, updateCreation]);

  const sendChat = useCallback((creationId: string, text: string) => {
    const c = creationsRef.current.find((x) => x.id === creationId);
    if (!c || !text.trim()) return;
    const mine: ChatMsg = { id: `m${++chatSeq}`, from: 'me', text: text.trim() };
    updateCreation(creationId, (x) => ({ ...x, chat: [...(x.chat ?? []), mine], lastEdit: 'Just now' }));
    track(c.shared ? 'album_chat_prompt' : 'chat_prompt_sent', 'w');
    setChatTyping(creationId);
    const r = chatReply(text, c);
    later(() => {
      setChatTyping(null);
      const msg: ChatMsg = { id: `m${++chatSeq}`, from: 'remini', text: r.text, images: r.images, video: r.video, poster: r.poster, action: r.restyle ? 'restyled' : r.action };
      updateCreation(creationId, (x) => ({
        ...x,
        chat: [...(x.chat ?? []), msg],
        looks: r.images && r.action !== 'animate' ? [...r.images.map((src) => look(src, r.title, true)), ...x.looks] : x.looks,
        shared: x.shared && { ...x.shared, feed: [{ who: 'You', text: `asked Remini: “${text.trim()}”`, when: 'now' }, ...x.shared.feed] },
      }));
      if (r.restyle) restyleAll(creationId, r.restyle);
      if (r.action === 'enhanced') {
        const todo = creationsRef.current.find((x) => x.id === creationId)?.photos.filter((p) => p.status === 'original').map((p) => p.id) ?? [];
        if (isPro) processPhotos(creationId, todo);
        else later(() => setSheet({ type: 'paywall', creationId, stage: 'offer' }), 600);
      }
      track('chat_result_kept', 'c');
    }, 2000);
  }, [creationsRef, isPro, later, processPhotos, restyleAll, track, updateCreation]);

  /** Studio chat: a fresh freestyle creation made with the saved Me. */
  const createFreestyle = useCallback(() => {
    const empty = creationsRef.current.find((x) => x.intent === 'other' && (x.chat ?? []).every((m) => m.from === 'remini'));
    if (empty) return empty.id;
    const id = `f${Date.now().toString(36)}`;
    upsertCreation({
      id,
      title: 'Freestyle',
      intent: 'other',
      cover: A.look(4),
      photos: [],
      looks: [],
      goal: 4,
      lastEdit: 'Just now',
      chat: [{ id: `m${++chatSeq}`, from: 'remini', text: 'Hi! I know what you look like from your saved Me, so no upload needed. Describe anything: I’ll make it, and we can keep going from there.' }],
    });
    setCreations((cs) => [...cs.filter((x) => x.id !== id), cs.find((x) => x.id === id)!]);
    track('studio_chat_started', 'w');
    return id;
  }, [creationsRef, setCreations, track, upsertCreation]);

  // ---------- identities ----------
  const improveIdentity = useCallback((id: string, picked: string[]) => {
    setIdentities((is) => is.map((i) => (i.id === id ? { ...i, refs: [...i.refs, ...picked].slice(0, 8) } : i)));
    track('identity_improved', 'c');
  }, [setIdentities, track]);

  const rememberMe = useCallback((name: string, refs: string[]) => {
    setIdentities((is) => [...is, { id: `id${Date.now().toString(36)}`, name, subtitle: `Saved from ${refs.length} photos`, cover: refs[0], refs }]);
    track('identity_saved', 'c');
  }, [setIdentities, track]);

  const setFlags = useCallback((f: { isPro?: boolean; freeUsed?: number }) => {
    if (f.isPro !== undefined) setIsPro(f.isPro);
    if (f.freeUsed !== undefined) setFreeUsed(f.freeUsed);
  }, []);

  const resetAll = useCallback(() => {
    clearTimers();
    setModeState('today');
    setTab('enhance');
    setStack([]);
    setSheet(null);
    setToast(null);
    setEvents([]);
    setIdentities(IDENTITIES);
    setCreations(returningCreations());
    setStyles(seedStyles());
    setSegment(null);
    setOnboarded({ today: false, studio: false });
    setFreeUsed(0);
    setIsPro(false);
    setLastDemoDone(false);
    setClosing(false);
    startedAt.current = Date.now();
  }, [clearTimers, setCreations, setIdentities, setStack, setStyles]);

  return {
    mode, setMode, tab, goTab, stack, stackRef, navDir, push, pop, replaceTop, resetStack,
    sheet, openSheet, closeSheet, generating, runGenerating, toast, showToast, clearToast: useCallback(() => setToast(null), []),
    showLevers, setShowLevers, events, track, clearEvents: useCallback(() => setEvents([]), []),
    identities, creations, creationsRef, styles, segment, onboarded, setOnboarded, freeUsed, isPro, processing,
    demo, setDemo, splash, setSplash, lastDemoDone, setLastDemoDone, closing, setClosing, chatTyping,
    answerSegment, becomeReturning, continueCreation, keepLook, createFromIntent, enhanceAll, startTrial, finishAfterTrial,
    processPhotos, remixStyle, publishStyle, sendChat, createFreestyle, restyleAll, improveIdentity, rememberMe, updateCreation, upsertCreation,
    setFlags, resetAll, clearTimers, friend: FRIEND,
  };
}

export type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

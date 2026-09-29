import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { chatReply } from './chat';
import { A, EVERYDAY, FRIEND, INTENTS, ME, SEGMENTS, friendsTrip, linkedinSet, look, photo, seedStyles, tripAlbum, withPaola } from './data';
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

/**
 * Where a user is in the journey. Each stage includes everything before it:
 * 0 new · 1 first creation kept · 2 made something with one friend · 3 group album · 4 came back.
 */
export type Stage = 0 | 1 | 2 | 3 | 4;

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
  const [identities, setIdentities, identitiesRef] = useSyncState<Identity[]>([]);
  const [creations, setCreations, creationsRef] = useSyncState<Creation[]>([]);
  const [styles, setStyles] = useSyncState<CommunityStyle[]>(seedStyles);
  const [unlocked, setUnlocked] = useState({ friend: false, group: false });
  const [returning, setReturning] = useState(false);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [onboarded, setOnboarded] = useState<Record<Mode, boolean>>({ today: true, studio: false });
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

  /** Build the state of a stage directly (used by the guided demo). */
  const setStage = useCallback((st: Stage) => {
    setIdentities(st >= 1 ? [{ ...ME, variants: st >= 2 ? [...ME.variants, EVERYDAY] : ME.variants }] : []);
    const cs: Creation[] = [];
    if (st >= 1) cs.push(linkedinSet(3));
    if (st >= 2) cs.unshift(withPaola());
    if (st >= 3) cs.unshift(friendsTrip(st >= 4 ? 17 : 5));
    if (st >= 4) cs.forEach((c) => (c.lastEdit = c.id === 'trip' ? '2 days ago' : '4 days ago'));
    setCreations(cs);
    setUnlocked({ friend: st >= 2, group: st >= 3 });
    setReturning(st >= 4);
    setOnboarded({ today: true, studio: st >= 1 });
    setStyles(seedStyles());
  }, [setCreations, setIdentities, setStyles]);

  /** Onboarding answer: logged as a segment; With Studio it suggests the first creation. */
  const answerSegment = useCallback((seg: Segment) => {
    const label = SEGMENTS.find((s) => s.id === seg)?.label ?? seg;
    setSegment(seg);
    track(`segment: ${label}`, 't');
    setOnboarded((o) => ({ ...o, studio: true }));
    setNavDir(1);
    setStack([{ name: 'first', step: 'intro' }]);
  }, [setStack, track]);

  /** "Is this you?": the profile is locked in once, with a Work version for this creation. */
  const lockIdentity = useCallback((refs: string[]) => {
    setIdentities([{ ...ME, refs: refs.length ? refs : ME.refs }]);
    track('profile_locked_in', 'c');
  }, [setIdentities, track]);

  /** "Keep this": the result becomes a creation in Studio. */
  const keepSet = useCallback(() => {
    upsertCreation(linkedinSet(3));
    track('kept_in_studio', 'w');
    return 'linkedin';
  }, [track, upsertCreation]);

  const keepLook = useCallback((src: string, title: string, into?: string) => {
    let id = into ?? (src === A.remix90s || src === A.together90s ? 'paola' : 'looks');
    if (!creationsRef.current.some((c) => c.id === id)) {
      if (id === 'paola') upsertCreation({ ...withPaola(), looks: [] });
      else upsertCreation({ id, title: 'My looks', intent: 'looks', cover: src, photos: [], looks: [], goal: 6, lastEdit: 'Just now' });
    }
    setCreations((cs) => {
      const c = cs.find((x) => x.id === id);
      if (!c) return cs;
      const updated = { ...c, cover: src, lastEdit: 'Just now', looks: c.looks.some((l) => l.src === src) ? c.looks : [look(src, title, true), ...c.looks] };
      return [updated, ...cs.filter((x) => x.id !== id)];
    });
    track('kept_in_studio', 'w');
    return id;
  }, [creationsRef, setCreations, track, upsertCreation]);

  /** Sharing with one friend: they join from the link (an install) and their style comes back. */
  const shareWithFriend = useCallback(() => {
    track('shared_with_friend', 'I');
    setUnlocked((u) => ({ ...u, friend: true }));
  }, [track]);

  /** Your version of the friend's style: the same locked profile adapts into an Everyday version. */
  const remixStyle = useCallback((styleId: string, onResult: (r: Route) => void) => {
    const st = styles.find((s) => s.id === styleId);
    if (!st) return;
    runGenerating({ steps: [`Applying ${st.creator}'s style to you`, 'Using your locked profile · Everyday', 'Final touches'], duration: 2100, preview: st.cover }, () => {
      setStyles((ss) => ss.map((s) => (s.id === styleId ? { ...s, remixes: s.remixes + 1 } : s)));
      setIdentities((is) => is.map((i) => (i.variants.some((v) => v.name === EVERYDAY.name) ? i : { ...i, variants: [...i.variants, EVERYDAY] })));
      track('friend_style_remixed', 'w');
      onResult({ name: 'result', kind: 'remix', image: st.result, title: `${st.title} · your version`, styleId });
    });
  }, [runGenerating, setIdentities, setStyles, styles, track]);

  const makeTogether = useCallback((onResult: (r: Route) => void) => {
    runGenerating({ steps: [`You and ${FRIEND}, each with your own profile`, 'Same 90s film style', 'Final touches'], duration: 2000, preview: A.together90s }, () => {
      track('made_together', 'I');
      onResult({ name: 'result', kind: 'together', image: A.together90s, title: `You & ${FRIEND}` });
    });
  }, [runGenerating, track]);

  /** From one friend to the whole group: the shared album. */
  const startGroup = useCallback(() => {
    upsertCreation(friendsTrip(5));
    setUnlocked((u) => ({ ...u, group: true }));
    track('group_album_started', 'I');
    return 'trip';
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
      }, 400 + i * 150);
    });
  }, [later, updateCreation]);

  const restyleAll = useCallback((id: string, style: string) => {
    const c = creationsRef.current.find((x) => x.id === id);
    if (!c) return;
    updateCreation(id, (x) => ({ ...x, style, shared: x.shared && { ...x.shared, style, feed: [{ who: 'You', text: `set “${style}” for everyone`, when: 'now' }, ...x.shared.feed] } }));
    processPhotos(id, c.photos.filter((p) => p.status === 'enhanced').map((p) => p.id));
    track('style_changed_for_everyone', 'w');
  }, [creationsRef, processPhotos, track, updateCreation]);

  /** Free users use their free enhancements, then meet the paywall on the unfinished work. */
  const enhanceAll = useCallback((id: string) => {
    const c = creationsRef.current.find((x) => x.id === id);
    if (!c) return;
    const todo = c.photos.filter((p) => p.status === 'original').map((p) => p.id);
    if (!todo.length) return showToast('Everything here is done');
    track('enhance_all_tapped', 't');
    if (isPro) return processPhotos(id, todo, () => showToast('All photos done'));
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

  /** Continue a look-based creation (LinkedIn set) up to its goal. */
  const continueCreation = useCallback((id: string) => {
    const c = creationsRef.current.find((x) => x.id === id);
    if (!c) return;
    const missing = Math.max(0, c.goal - c.looks.length);
    if (!missing) return showToast('This one is complete');
    track('creation_continued', 'w');
    runGenerating({ steps: ['Using your locked profile · Work', `Making ${missing} more`, 'Matching the set'], duration: 1900, preview: A.linkedin(4) }, () => {
      updateCreation(id, (x) => ({ ...x, lastEdit: 'Just now', looks: [...x.looks, ...Array.from({ length: missing }, (_, i) => look(A.linkedin(x.looks.length + i + 1), ['Window light', 'Studio grey'][i % 2], true))] }));
      track('creation_completed', 'c');
      showToast(`${c.title}: ${c.goal} of ${c.goal} done`);
    });
  }, [creationsRef, runGenerating, showToast, track, updateCreation]);

  /** "What are you creating?" (the fake-door screen). */
  const createFromIntent = useCallback((intent: Intent, picked: string[]) => {
    const meta = INTENTS.find((i) => i.id === intent)!;
    const c: Creation =
      intent === 'trip'
        ? tripAlbum(picked)
        : { id: `c${Date.now().toString(36)}`, title: meta.title, intent, cover: picked[0], goal: picked.length, lastEdit: 'Just now', looks: [], photos: picked.map((s) => photo(s, 'original', s.includes('archive_old') ? s.replace('archive_old', 'archive_restored') : undefined)) };
    upsertCreation(c);
    track('creation_started', 't');
    return c.id;
  }, [track, upsertCreation]);

  // ---------- Remini chat: presets and filters ----------
  const sendChat = useCallback((creationId: string, text: string) => {
    const c = creationsRef.current.find((x) => x.id === creationId);
    if (!c || !text.trim()) return;
    const mine: ChatMsg = { id: `m${++chatSeq}`, from: 'me', text: text.trim() };
    updateCreation(creationId, (x) => ({ ...x, chat: [...(x.chat ?? []), mine], lastEdit: 'Just now' }));
    track(c.shared ? 'album_chat_preset' : 'chat_preset', 'w');
    setChatTyping(creationId);
    const r = chatReply(text, c);
    later(() => {
      setChatTyping(null);
      const p = r.preset;
      const msg: ChatMsg = { id: `m${++chatSeq}`, from: 'remini', text: r.text, images: p?.image ? [p.image] : undefined, action: p?.restyle ? 'restyled' : p?.enhance ? 'enhanced' : undefined };
      updateCreation(creationId, (x) => ({ ...x, chat: [...(x.chat ?? []), msg], looks: p?.image && !x.photos.length ? [look(p.image, p.title ?? 'Preset', true), ...x.looks.filter((l) => l.src !== p.image)] : x.looks }));
      if (p?.restyle) restyleAll(creationId, p.restyle);
      if (p?.enhance) {
        const todo = creationsRef.current.find((x) => x.id === creationId)?.photos.filter((ph) => ph.status === 'original').map((ph) => ph.id) ?? [];
        if (isPro) processPhotos(creationId, todo);
        else if (todo.length) later(() => setSheet({ type: 'paywall', creationId, stage: 'offer' }), 600);
      }
    }, 1700);
  }, [creationsRef, isPro, later, processPhotos, restyleAll, track, updateCreation]);

  // The friend's style keeps travelling: its remix counter ticks up while you watch.
  useEffect(() => {
    if (!unlocked.friend) return;
    const t = window.setInterval(() => setStyles((ss) => ss.map((s) => ({ ...s, remixes: s.remixes + (Math.random() < 0.5 ? 1 : 0) }))), 1200);
    return () => clearInterval(t);
  }, [setStyles, unlocked.friend]);

  const publishStyle = useCallback((title: string, image: string) => {
    const id = `st-mine-${Date.now().toString(36)}`;
    setStyles((ss) => [...ss.filter((s) => !s.mine), { id, title: title || 'My style', creator: 'You', cover: image, result: image, remixes: 0, mine: true }]);
    track('style_published', 'I');
    return id;
  }, [setStyles, track]);

  const improveIdentity = useCallback((id: string, picked: string[]) => {
    setIdentities((is) => is.map((i) => (i.id === id ? { ...i, refs: [...i.refs, ...picked].slice(0, 8) } : i)));
    track('profile_improved', 'c');
  }, [setIdentities, track]);

  const rememberMe = useCallback((name: string, refs: string[]) => {
    setIdentities((is) => [...is, { id: `id${Date.now().toString(36)}`, name, subtitle: `Locked in from ${refs.length} photos`, cover: refs[0], refs, variants: [] }]);
    track('profile_locked_in', 'c');
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
    setIdentities([]);
    setCreations([]);
    setStyles(seedStyles());
    setUnlocked({ friend: false, group: false });
    setReturning(false);
    setSegment(null);
    setOnboarded({ today: true, studio: false });
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
    identities, identitiesRef, creations, creationsRef, styles, unlocked, returning, segment, onboarded, setOnboarded,
    freeUsed, isPro, processing, demo, setDemo, splash, setSplash, lastDemoDone, setLastDemoDone, closing, setClosing, chatTyping,
    setStage, answerSegment, lockIdentity, keepSet, keepLook, shareWithFriend, remixStyle, makeTogether, startGroup,
    processPhotos, restyleAll, enhanceAll, startTrial, finishAfterTrial, continueCreation, createFromIntent, sendChat,
    publishStyle, improveIdentity, rememberMe, updateCreation, upsertCreation, setFlags, resetAll, clearTimers, friend: FRIEND,
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

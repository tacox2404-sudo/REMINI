import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { chatReply, type ChatCtx } from './chat';
import { A, FRIEND, OTHERS, SEGMENTS, STYLE_SETS, TRIP_PHOTOS_OF_ME, familyArchive, look, meProfile, paolaProfile, personalChat, photo, styleCreation, styleOf, tripAlbum, tripProject, INTENTS } from './data';
import type { ChatMsg, Creation, Generating, Identity, Intent, Lever, LogEvent, Mode, Route, Segment, Sheet, Tab } from './types';

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
 * Where a user is in the journey (the moments of the strategy). Each stage
 * includes everything before it. The guided demo jumps straight to a stage.
 */
export const STAGE = { NEW: 0, KEPT: 1, LIMIT: 2, TRIAL: 3, JOINED: 4, SHARED: 5, MADE: 6, BACK: 7, CANCELLED: 8 } as const;
export type Stage = (typeof STAGE)[keyof typeof STAGE];

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
  const [creations, setCreations, creationsRef] = useSyncState<Creation[]>([personalChat()]);
  const [paolaJoined, setPaolaJoined, paolaJoinedRef] = useSyncState(false);
  const [styleShared, setStyleShared, styleSharedRef] = useSyncState(false);
  const [newLooks, setNewLooks] = useState(false);
  const [returning, setReturning] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [onboarded, setOnboarded] = useState<Record<Mode, boolean>>({ today: true, studio: false });
  const [chatTyping, setChatTyping] = useState<string | null>(null);
  const [lastDemoDone, setLastDemoDone] = useState(false);
  const [closing, setClosing] = useState(false);
  const [freeUsed, setFreeUsed, freeUsedRef] = useSyncState(0);
  const [isPro, setIsPro, isProRef] = useSyncState(false);
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

  // ---------- projects ----------
  const updateCreation = useCallback((id: string, fn: (c: Creation) => Creation) => {
    setCreations((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  }, [setCreations]);
  const upsertCreation = useCallback((c: Creation) => {
    setCreations((cs) => [c, ...cs.filter((x) => x.id !== c.id)]);
  }, [setCreations]);
  const findCreation = useCallback((id: string) => creationsRef.current.find((c) => c.id === id), [creationsRef]);

  /** Build the state of a journey stage directly (used by the guided demo). */
  const setStage = useCallback((st: Stage) => {
    const madeLooks = st >= STAGE.MADE ? [look(A.remix90s, '80s film · your version'), look(A.together90s, `You & ${FRIEND}`)] : [];
    const trip =
      st >= STAGE.BACK
        ? tripProject({ done: 17, joined: [FRIEND, 'Luca'], invited: ['Marco'], paola: true, paolaMore: true, looks: madeLooks })
        : st >= STAGE.JOINED
          ? tripProject({ done: 17, joined: [FRIEND], invited: OTHERS, paola: true, looks: madeLooks })
          : st >= STAGE.TRIAL
            ? tripProject({ done: 17 })
            : st >= STAGE.LIMIT
              ? tripProject({ done: 5 })
              : tripProject({ done: 1 });
    const cs: Creation[] = [personalChat()];
    if (st >= STAGE.KEPT) cs.unshift(trip);
    setCreations(cs);
    const ids: Identity[] = [];
    if (st >= STAGE.MADE) ids.push(meProfile(st >= STAGE.BACK));
    if (st >= STAGE.JOINED) ids.push(paolaProfile());
    setIdentities(ids);
    setPaolaJoined(st >= STAGE.JOINED);
    setStyleShared(st >= STAGE.SHARED);
    setNewLooks(st >= STAGE.BACK);
    setReturning(st === STAGE.BACK);
    setCancelled(st === STAGE.CANCELLED);
    setIsPro(st >= STAGE.TRIAL && st < STAGE.CANCELLED);
    setFreeUsed(st >= STAGE.LIMIT ? FREE_LIMIT : st >= STAGE.KEPT ? 1 : 0);
    setOnboarded({ today: true, studio: st >= STAGE.KEPT });
  }, [setCreations, setIdentities, setPaolaJoined, setStyleShared, setIsPro, setFreeUsed]);

  /** Onboarding answer: logged as a segment; it suggests the first thing to do. */
  const answerSegment = useCallback((seg: Segment) => {
    const label = SEGMENTS.find((s) => s.id === seg)?.label ?? seg;
    setSegment(seg);
    track(`segment: ${label}`, 't');
    setOnboarded((o) => ({ ...o, studio: true }));
    setNavDir(1);
    setStack([{ name: 'first', step: 'intro', path: seg === 'restore' ? 'restore' : seg === 'profile' ? 'profile' : 'enhance' }]);
  }, [setStack, track]);

  /** Any single enhance uses one free action. */
  const spendFree = useCallback(() => setFreeUsed((n) => Math.min(FREE_LIMIT, n + 1)), [setFreeUsed]);

  /** Keep a quick enhance: the trip project starts, with the rest of the trip found in the gallery. */
  const startTrip = useCallback(() => {
    if (!findCreation('trip')) upsertCreation(tripProject({ done: 1 }));
    track('project_started_from_result', 't');
    return 'trip';
  }, [findCreation, track, upsertCreation]);

  /** Keep a set of looks (profile path, personal chat): one project per style. */
  const keepLook = useCallback((src: string, title: string, into?: string) => {
    const key = styleOf(src);
    const id = into ?? (key ? STYLE_SETS[key].id : 'looks');
    const existing = findCreation(id);
    if (!existing) upsertCreation(key ? styleCreation(key, [src]) : { id, title: 'My looks', intent: 'looks', cover: src, photos: [], looks: [look(src, title, true)], goal: 1, lastEdit: 'Just now' });
    else
      setCreations((cs) => {
        const c = cs.find((x) => x.id === id)!;
        const updated = { ...c, lastEdit: 'Just now', looks: c.looks.some((l) => l.src === src) ? c.looks : [...c.looks, look(src, title, true)] };
        return [updated, ...cs.filter((x) => x.id !== id)];
      });
    track('kept_in_project', 'w');
    return id;
  }, [findCreation, setCreations, track, upsertCreation]);

  const keepSet = useCallback((srcs: string[]) => {
    let id = 'linkedin';
    srcs.forEach((s) => (id = keepLook(s, 'Casual Headshot')));
    return id;
  }, [keepLook]);

  /** Restore path: the restored photos become the Family archive. */
  const keepRestore = useCallback(() => {
    upsertCreation(familyArchive(4));
    track('project_started_from_result', 't');
    return 'family';
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

  /** Free limits stay as they are: the last free enhancements run, then the limit lands inside the project. */
  const enhanceAll = useCallback((id: string) => {
    const c = findCreation(id);
    if (!c) return;
    const todo = c.photos.filter((p) => p.status === 'original').map((p) => p.id);
    if (!todo.length) return showToast('Everything here is done');
    track('enhance_all_tapped', 't');
    if (isProRef.current) return processPhotos(id, todo, () => showToast(`${c.title}: all done`));
    const free = Math.max(0, FREE_LIMIT - freeUsedRef.current);
    processPhotos(id, todo.slice(0, free), () => {
      setFreeUsed(FREE_LIMIT);
      track('free_limit_inside_project', 't');
      later(() => setSheet({ type: 'paywall', creationId: id, stage: 'offer' }), 350);
    });
  }, [findCreation, freeUsedRef, isProRef, later, processPhotos, setFreeUsed, showToast, track]);

  const startTrial = useCallback((id: string) => {
    setIsPro(true);
    setCancelled(false);
    track('trial_started', 't');
    setSheet({ type: 'paywall', creationId: id, stage: 'success' });
  }, [setIsPro, track]);

  const finishAfterTrial = useCallback((id: string) => {
    setSheet(null);
    const c = findCreation(id);
    if (!c) return;
    processPhotos(id, c.photos.filter((p) => p.status === 'original').map((p) => p.id), () => {
      track('project_finished_in_trial', 'c');
      showToast(`${c.title} is finished`);
    });
  }, [findCreation, processPhotos, showToast, track]);

  const cancelPro = useCallback(() => {
    setIsPro(false);
    setCancelled(true);
    setReturning(false);
    track('subscription_cancelled');
  }, [setIsPro, track]);

  // ---------- together (a trial feature) ----------
  /** Invites go out through any app; friends without Remini get a link into the project. */
  const inviteFriends = useCallback((id: string, via: string) => {
    track(`invite_sent_${via.toLowerCase()}`, 'I');
    updateCreation(id, (c) => {
      const members = c.shared?.members ?? ['You'];
      const invited = [FRIEND, ...OTHERS].filter((f) => !members.includes(f));
      return { ...c, shared: { members, invited, feed: c.shared?.feed ?? [] } };
    });
  }, [track, updateCreation]);

  /** Paola's own 80s creation arrives in the trip. Until now it didn't exist in your app. */
  const shareStyle = useCallback(() => {
    if (styleSharedRef.current) return;
    setStyleShared(true);
    updateCreation('trip', (c) => (c.shared ? { ...c, shared: { ...c.shared, feed: [{ who: FRIEND, text: 'shared her 80s film style', when: 'now' }, ...c.shared.feed] } } : c));
    track('friend_shared_style', 'c');
  }, [setStyleShared, styleSharedRef, track, updateCreation]);

  /** Paola joins from the link: into the trip, with everyone's photos already there. */
  const friendJoins = useCallback((thenShare = true) => {
    if (paolaJoinedRef.current) return;
    setPaolaJoined(true);
    track('invited_friend_installed', 'I');
    const c = findCreation('trip');
    if (c) {
      const next = tripProject({ done: 17, joined: [FRIEND], invited: OTHERS, paola: true, looks: c.looks });
      // Keep your own progress as it is; add Paola's photos.
      upsertCreation({ ...next, photos: [...c.photos, ...next.photos.slice(17)], goal: c.photos.length + 4 });
    }
    setIdentities((is) => (is.some((i) => i.id === 'paola') ? is : [...is, paolaProfile()]));
    if (thenShare) later(shareStyle, 2600);
  }, [findCreation, later, paolaJoinedRef, setIdentities, setPaolaJoined, shareStyle, track, upsertCreation]);

  /** Anything that uses your face needs Me. The first time, it's saved from 4 selfies, as AI Photos does. */
  const withMe = useCallback((then: () => void) => {
    if (identitiesRef.current.some((i) => i.id === 'me')) return then();
    push({
      name: 'picker',
      title: 'Your profile: pick 4 selfies',
      min: 4,
      max: 4,
      preselect: 4,
      pool: [...[1, 2, 3, 4].map(A.ref), A.enhance2Before, A.enhanceBefore],
      cta: 'Save as Me',
      onDone: () => {
        pop();
        setIdentities((is) => [meProfile(false), ...is.filter((i) => i.id !== 'me')]);
        track('profile_saved', 'c');
        then();
      },
    });
  }, [identitiesRef, pop, push, setIdentities, track]);

  const saveMe = useCallback(() => {
    if (!identitiesRef.current.some((i) => i.id === 'me')) setIdentities((is) => [meProfile(false), ...is]);
    track('profile_saved', 'c');
  }, [identitiesRef, setIdentities, track]);

  /** A friend's shared style, with your own face. */
  const applyFriendStyle = useCallback((onResult: (r: Route) => void) => {
    withMe(() =>
      runGenerating({ steps: [`${FRIEND}’s 80s film`, 'With your profile, Me', 'Final touches'], duration: 2000, preview: A.friend90s }, () => {
        track('friend_style_used', 'c');
        onResult({ name: 'result', kind: 'remix', image: A.remix90s, title: '80s film · your version', styleId: 'st-80s', projectId: 'trip' });
      }),
    );
  }, [runGenerating, track, withMe]);

  /** Duo photoshoot: each of you with your own profile. */
  const makeDuo = useCallback((onResult: (r: Route) => void) => {
    withMe(() =>
      runGenerating({ steps: [`You and ${FRIEND}, each with your own profile`, 'Duo photoshoot', 'Final touches'], duration: 2000, preview: A.together90s }, () => {
        track('duo_shoot_made', 'c');
        onResult({ name: 'result', kind: 'together', image: A.together90s, title: `You & ${FRIEND}`, projectId: 'trip' });
      }),
    );
  }, [runGenerating, track, withMe]);

  /** Keep a result inside the project it was made in. */
  const keepInProject = useCallback((id: string, src: string, title: string) => {
    updateCreation(id, (c) => ({ ...c, lastEdit: 'Just now', looks: c.looks.some((l) => l.src === src) ? c.looks : [...c.looks, look(src, title, true)] }));
    track('kept_in_project', 'w');
    return id;
  }, [track, updateCreation]);

  // ---------- Me: kept and updated over time ----------
  const improveMe = useCallback(() => {
    setIdentities((is) =>
      is.map((i) =>
        i.id === 'me' && !i.refs.includes(TRIP_PHOTOS_OF_ME[0])
          ? { ...i, subtitle: 'Updated just now', refs: [...i.refs, ...TRIP_PHOTOS_OF_ME], history: [...i.history, { when: 'Just now', text: 'You added 3 photos of you from Philippines trip' }] }
          : i,
      ),
    );
    track('profile_updated', 'w');
  }, [setIdentities, track]);

  const removeProfile = useCallback((id: string) => {
    setIdentities((is) => is.filter((i) => i.id !== id));
    track('profile_removed');
  }, [setIdentities, track]);

  /** New looks made on your updated profile: kept only if you want them. */
  const keepNewLooks = useCallback(() => {
    setNewLooks(false);
    const id = keepSet([A.linkedin(1), A.linkedin(2), A.linkedin(3)]);
    track('new_looks_kept', 'w');
    return id;
  }, [keepSet, track]);

  /** Continue a set of looks with more of the same style; stop when the set is complete. */
  const continueCreation = useCallback((id: string) => {
    const c = findCreation(id);
    if (!c) return;
    const set = Object.values(STYLE_SETS).find((v) => v.id === id);
    const have = new Set(c.looks.map((l) => l.src));
    const next = (set?.srcs ?? []).filter((s) => !have.has(s)).slice(0, Math.max(0, c.goal - c.looks.length));
    if (!next.length) return showToast('That’s the whole set in this style');
    track('project_continued', 'w');
    runGenerating({ steps: [`Same style: ${c.style ?? c.title}`, 'With your profile, Me', `Making ${next.length} more`], duration: 1900, preview: next[0] }, () => {
      updateCreation(id, (x) => ({ ...x, lastEdit: 'Just now', looks: [...x.looks, ...next.map((s) => look(s, x.style ?? x.title, true))] }));
      showToast(`${c.title}: ${Math.min(c.goal, c.looks.length + next.length)} of ${c.goal} done`);
    });
  }, [findCreation, runGenerating, showToast, track, updateCreation]);

  /** "New project" from Studio. */
  const createFromIntent = useCallback((intent: Intent, picked: string[]) => {
    const meta = INTENTS.find((i) => i.id === intent)!;
    const c: Creation =
      intent === 'trip'
        ? tripAlbum(picked)
        : intent === 'family'
          ? { ...familyArchive(0), id: `fam-${Date.now().toString(36)}`, title: 'New archive' }
          : { id: `c${Date.now().toString(36)}`, title: meta.title, intent, cover: picked[0], goal: picked.length, lastEdit: 'Just now', looks: [], photos: picked.map((s) => photo(s, 'original')) };
    upsertCreation(c);
    track('project_started', 't');
    return c.id;
  }, [track, upsertCreation]);

  // ---------- Remini chat: one personal, one per project ----------
  const chatCtx = useCallback((): ChatCtx => ({ hasMe: identitiesRef.current.some((i) => i.id === 'me'), paolaJoined: paolaJoinedRef.current, styleShared: styleSharedRef.current }), [identitiesRef, paolaJoinedRef, styleSharedRef]);

  const sendChat = useCallback((creationId: string, text: string) => {
    const c = findCreation(creationId);
    if (!c || !text.trim()) return;
    const mine: ChatMsg = { id: `m${++chatSeq}`, from: 'me', text: text.trim() };
    updateCreation(creationId, (x) => ({ ...x, chat: [...(x.chat ?? []), mine], lastEdit: 'Just now' }));
    track(c.shared ? 'shared_project_chat' : 'chat_request', 'c');
    setChatTyping(creationId);
    const r = chatReply(text, c, chatCtx());
    later(() => {
      setChatTyping(null);
      const p = r.preset;
      const msg: ChatMsg = { id: `m${++chatSeq}`, from: 'remini', text: r.text, images: p?.images, action: p?.batch ? (c.intent === 'family' ? 'restored' : 'enhanced') : undefined };
      updateCreation(creationId, (x) => ({ ...x, chat: [...(x.chat ?? []), msg] }));
      if (p?.batch) enhanceAll(creationId);
      if (p?.more) continueCreation(creationId);
    }, 1500);
  }, [chatCtx, continueCreation, enhanceAll, findCreation, later, track, updateCreation]);

  /** Keep a chat result: into the project (project chats) or into its own set (personal chat). */
  const keepFromChat = useCallback((creationId: string, msgId: string) => {
    const c = findCreation(creationId);
    const m = c?.chat?.find((x) => x.id === msgId);
    if (!c || !m?.images) return;
    updateCreation(creationId, (x) => ({ ...x, chat: x.chat?.map((y) => (y.id === msgId ? { ...y, kept: true } : y)) }));
    const id = c.chatOnly ? (m.images.length > 1 ? keepSet(m.images) : keepLook(m.images[0], 'Y2K Yearbook')) : keepInProject(creationId, m.images[0], m.images[0] === A.remix90s ? '80s film · your version' : `You & ${FRIEND}`);
    showToast(`Kept in ${findCreation(id)?.title ?? 'your project'}`);
  }, [findCreation, keepInProject, keepLook, keepSet, showToast, updateCreation]);

  const setFlags = useCallback((f: { isPro?: boolean; freeUsed?: number }) => {
    if (f.isPro !== undefined) setIsPro(f.isPro);
    if (f.freeUsed !== undefined) setFreeUsed(f.freeUsed);
  }, [setFreeUsed, setIsPro]);

  const resetAll = useCallback(() => {
    clearTimers();
    setModeState('today');
    setTab('enhance');
    setStack([]);
    setSheet(null);
    setToast(null);
    setEvents([]);
    setIdentities([]);
    setCreations([personalChat()]);
    setPaolaJoined(false);
    setStyleShared(false);
    setNewLooks(false);
    setReturning(false);
    setCancelled(false);
    setSegment(null);
    setOnboarded({ today: true, studio: false });
    setFreeUsed(0);
    setIsPro(false);
    setLastDemoDone(false);
    setClosing(false);
    startedAt.current = Date.now();
  }, [clearTimers, setCreations, setFreeUsed, setIdentities, setIsPro, setPaolaJoined, setStack, setStyleShared]);

  return {
    mode, setMode, tab, goTab, stack, stackRef, navDir, push, pop, replaceTop, resetStack,
    sheet, openSheet, closeSheet, generating, runGenerating, toast, showToast, clearToast: useCallback(() => setToast(null), []),
    showLevers, setShowLevers, events, track, clearEvents: useCallback(() => setEvents([]), []),
    identities, identitiesRef, creations, creationsRef, paolaJoined, styleShared, newLooks, returning, cancelled, segment, onboarded, setOnboarded,
    freeUsed, isPro, processing, demo, setDemo, splash, setSplash, lastDemoDone, setLastDemoDone, closing, setClosing, chatTyping,
    setStage, answerSegment, spendFree, startTrip, keepLook, keepSet, keepRestore, keepInProject, processPhotos, enhanceAll, startTrial, finishAfterTrial, cancelPro,
    inviteFriends, friendJoins, shareStyle, withMe, saveMe, applyFriendStyle, makeDuo, improveMe, removeProfile, keepNewLooks, continueCreation, createFromIntent,
    sendChat, keepFromChat, chatCtx, updateCreation, upsertCreation, setFlags, resetAll, clearTimers, friend: FRIEND,
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

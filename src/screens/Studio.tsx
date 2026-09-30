import { motion } from 'framer-motion';
import { A, DATES, FRIEND, OTHERS, PAOLA_STYLE, progressOf } from '../state/data';
import { useStore } from '../state/store';
import type { Creation, Identity } from '../state/types';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { Avatar, HScroll, LeverTag, NavHeader, NewBadge, PillWhite, ProBadge, SectionHeader } from '../components/ui';

export function ProgressRing({ value, size = 34, stroke = 3.5, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.18)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ring)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - Math.min(1, value)) }} transition={{ duration: 0.5 }} />
        <defs>
          <linearGradient id="ring" x1="0" x2="1">
            <stop offset="0" stopColor="#FF5A4E" />
            <stop offset="1" stopColor="#FF2E7E" />
          </linearGradient>
        </defs>
      </svg>
      {label && <span className="absolute text-[10px] font-bold">{label}</span>}
    </span>
  );
}

export function CreationCard({ c, wide }: { c: Creation; wide?: boolean }) {
  const { push } = useStore();
  const pr = progressOf(c);
  return (
    <button data-demo={`creation-${c.id}`} onClick={() => push({ name: 'creation', id: c.id })} className={`shrink-0 overflow-hidden rounded-[20px] bg-card text-left active:scale-[0.98] ${wide ? 'w-full' : 'w-[168px]'}`}>
      <div className="relative h-[150px]">
        <Img src={c.cover} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {c.lastEdit === 'Just now' && <NewBadge className="absolute left-2.5 top-2.5" />}
        {c.shared && (
          <div className="absolute bottom-2 left-2 flex -space-x-1.5">
            {c.shared.members.map((m) => (
              <Avatar key={m} name={m} size={20} />
            ))}
          </div>
        )}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/50 p-0.5 backdrop-blur">
          <ProgressRing value={pr.done / pr.total} label={`${pr.done}/${pr.total}`} size={38} />
        </span>
      </div>
      <div className="p-3">
        <div className="truncate text-[15px] font-bold">{c.title}</div>
        <div className="mt-0.5 truncate text-[12px] text-mute">{pr.label}</div>
      </div>
    </button>
  );
}

/** A saved profile: Me grows over time; a friend's exists only because they added it. */
export function ProfileCard({ p }: { p: Identity }) {
  const { push, creations } = useStore();
  const mine = p.owner === 'me';
  const used = creations.filter((c) => !c.chatOnly && (c.looks.length > 0 || c.intent === 'profile')).length;
  return (
    <button data-demo={mine ? 'me-card' : `profile-${p.id}`} onClick={() => push({ name: 'identity', id: p.id })} className="relative block w-full rounded-[22px] bg-card p-3.5 text-left">
      {mine && <LeverTag l="w" />}
      <div className="flex items-center gap-3">
        <span className={`rounded-full p-[2px] ${mine ? 'bg-brand' : 'bg-white/20'}`}>
          <Img src={p.cover} className="h-12 w-12 rounded-full ring-2 ring-card" label={false} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold">{p.name}</div>
          <div className="truncate text-[12.5px] text-mute">{mine ? `${p.subtitle} · ${p.refs.length} photos${used ? ` · in ${used} project${used > 1 ? 's' : ''}` : ''}` : p.subtitle}</div>
        </div>
        <I.Chevron size={18} className="text-mute" />
      </div>
      {mine && (
        <div className="mt-2.5 flex gap-1">
          {p.refs.slice(0, 7).map((r, i) => (
            <Img key={r + i} src={r} className="h-9 w-9 rounded-lg" label={false} />
          ))}
        </div>
      )}
    </button>
  );
}

/** Studio: a personal space for what you choose to keep, alone or with friends. */
export function StudioScreen() {
  const { creations, identities, isPro, cancelled, returning, trialEnding, newLooks, paolaJoined, styleShared, push, pop, openSheet, applyFriendStyle, tryNewLooks, showToast, track } = useStore();
  const eighties = creations.find((c) => c.id === 'eighties');
  const projects = creations.filter((c) => !c.chatOnly);
  const trip = projects.find((c) => c.id === 'trip');
  const me = identities.find((i) => i.id === 'me');
  const others = identities.filter((i) => i.id !== 'me');
  const waiting = trip ? trip.photos.filter((p) => p.status === 'original').length : 0;

  return (
    <div>
      <NavHeader title="" onBack={pop} />
      <div className="px-4 pb-1">
        <div className="flex items-center gap-2">
          <h1 className="text-[30px] font-bold leading-none tracking-tight">Studio</h1>
          <span className="rounded-md bg-brand px-1.5 py-[1px] text-[10px] font-extrabold">NEW</span>
        </div>
        <p className="mt-1.5 text-[14px] leading-snug text-white/65">What you choose to keep, in projects that keep going. On your own and with friends.</p>
      </div>

      {cancelled && (
        <div data-demo="after-cancel" className="relative mx-4 mt-3 rounded-[20px] bg-card p-3.5 ring-1 ring-white/10">
          <LeverTag l="w" />
          <div className="text-[14px] font-bold">You’re on Free. Nothing is held back.</div>
          <div className="mt-0.5 text-[12.5px] text-mute">Every project stays here to view and download. Restart Pro whenever you want to continue.</div>
        </div>
      )}

      {trialEnding && (
        <div data-demo="trial-ending" className="relative mx-4 mt-3 rounded-[22px] bg-gradient-to-br from-[#2a1320] to-card p-4 ring-1 ring-[#FF2E7E]/25">
          <LeverTag l="c" />
          <div className="text-[13px] font-semibold text-[#FFB020]">Day 6 of 7 · your trial ends tomorrow, {DATES.trialEnds}</div>
          <div className="mt-2 space-y-2">
            {trip && (
              <button onClick={() => push({ name: 'creation', id: 'trip' })} className="flex w-full items-center gap-3 text-left">
                <Img src={A.trip(5)} className="h-11 w-11 rounded-xl" label={false} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold leading-tight">{FRIEND} added 8 photos to {trip.title}</span>
                  <span className="block text-[12px] text-mute">{waiting} waiting · the trip keeps going</span>
                </span>
              </button>
            )}
            {eighties && (
              <button onClick={() => push({ name: 'creation', id: 'eighties' })} className="flex w-full items-center gap-3 text-left">
                <Img src={eighties.cover} className="h-11 w-11 rounded-xl" label={false} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold leading-tight">{eighties.title}</span>
                  <span className="block text-[12px] text-mute">{eighties.looks.length} made together</span>
                </span>
              </button>
            )}
          </div>
          <PillWhite className="mt-3 !h-11" onClick={() => { track('trial_kept', 'c'); showToast('Pro continues · see you next week'); }}>
            Keep Pro
          </PillWhite>
          <p className="mt-2 text-center text-[11.5px] text-mute">If you stop, everything here stays yours to view and download.</p>
        </div>
      )}

      {returning && (
        <div data-demo="welcome-card" className="relative mx-4 mt-3 rounded-[22px] bg-gradient-to-br from-[#2a1320] to-card p-4 ring-1 ring-[#FF2E7E]/25">
          <LeverTag l="w" />
          <div className="text-[13px] font-semibold text-white/60">Welcome back · since you were here</div>
          <div className="mt-2 space-y-2">
            {trip && waiting > 0 && (
              <button onClick={() => push({ name: 'creation', id: 'trip' })} className="flex w-full items-center gap-3 text-left">
                <Img src={A.trip(4)} className="h-11 w-11 rounded-xl" label={false} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold leading-tight">Luca joined {trip.title} and added 6 photos</span>
                  <span className="block text-[12px] text-mute">{waiting} waiting to be enhanced</span>
                </span>
                <I.Chevron size={16} className="text-mute" />
              </button>
            )}
            {newLooks && me && (
              <button data-demo="try-new-looks" onClick={() => tryNewLooks((r) => push(r))} className="flex w-full items-center gap-3 text-left">
                <Img src={A.generic(21)} className="h-11 w-11 rounded-xl" label={false} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold leading-tight">Try new looks with your updated Me</span>
                  <span className="block text-[12px] text-mute">Casual Headshot · made only if you tap</span>
                </span>
                <I.Chevron size={16} className="text-mute" />
              </button>
            )}
          </div>
          {trip && waiting > 0 && (
            <PillWhite className="mt-3 !h-11" onClick={() => push({ name: 'creation', id: 'trip' })}>
              Continue {trip.title}
            </PillWhite>
          )}
        </div>
      )}

      <SectionHeader demo="projects" title={<span className="relative">Projects<LeverTag l="t" className="-right-5 -top-1" /></span>} sub="Jobs that keep going, with progress. They save themselves." />
      <HScroll>
        {projects.map((c) => (
          <CreationCard key={c.id} c={c} />
        ))}
        <button data-demo="new-project" onClick={() => push({ name: 'create' })} className="relative flex w-[150px] shrink-0 flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/20 p-3 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-black">
            <I.Plus />
          </span>
          <span className="text-[14px] font-semibold leading-tight">New project</span>
          <span className="text-[11.5px] leading-snug text-mute">Or tap Keep on any result</span>
        </button>
      </HScroll>

      <SectionHeader demo="profiles" title="Profiles" sub="Saved faces for everything you create. Yours gets better as you go." />
      <div className="space-y-2 px-4">
        {me ? (
          <ProfileCard p={me} />
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/15 p-3.5 text-[13px] leading-snug text-mute">
            <b className="text-white/80">Me</b> is saved the first time you create with your face, from 4 selfies as AI Photos does. Then it stays and improves.
          </div>
        )}
        {others.map((p) => (
          <ProfileCard key={p.id} p={p} />
        ))}
      </div>

      <SectionHeader demo="together" title={<span className="relative">Together<LeverTag l="I" className="-right-5 -top-1" /></span>} sub="Projects with the people in them." right={!isPro ? <ProBadge /> : undefined} />
      <div className="space-y-2.5 px-4">
        {!isPro ? (
          <button data-demo="together-locked" onClick={() => openSheet({ type: 'together' })} className="relative block w-full overflow-hidden rounded-[22px] bg-card text-left">
            <LeverTag l="t" />
            <div className="grid grid-cols-3 gap-1 p-1">
              {[A.trip(1), A.trip(2), A.trip(5)].map((s) => (
                <Img key={s} src={s} className="aspect-[4/3] rounded-[14px]" label={false} />
              ))}
            </div>
            <div className="p-3.5 pt-2.5">
              <div className="text-[15px] font-bold">Invite friends into a project</div>
              <div className="mt-0.5 text-[12.5px] leading-snug text-mute">They add their photos and, if they want, their own face. Duo shoots, friends’ styles with your face, one Remini chat for all.</div>
              <div className="mt-2.5 text-[13px] font-semibold text-[#FF6A8E]">{cancelled ? 'Restart Pro to create together' : 'Try it free with Pro →'}</div>
            </div>
          </button>
        ) : !paolaJoined ? (
          <button data-demo="together-invite" onClick={() => trip && openSheet({ type: 'withFriend', title: trip.title, image: trip.cover, link: '', projectId: 'trip' })} className="flex w-full items-center gap-3 rounded-[20px] bg-card p-3.5 text-left">
            <div className="flex -space-x-2">
              {[FRIEND, ...OTHERS].map((m) => (
                <Avatar key={m} name={m} size={30} />
              ))}
            </div>
            <span className="flex-1 text-[14px] font-semibold">Invite the friends from {trip?.title ?? 'your trip'}</span>
            <I.Chevron size={16} className="text-mute" />
          </button>
        ) : (
          <>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-mute">In your projects</div>
            <button data-demo="friend-joined" onClick={() => push({ name: 'creation', id: 'trip' })} className="flex w-full items-center gap-3 rounded-[18px] bg-card p-3 text-left">
              <Img src={A.friend} className="h-11 w-11 rounded-full" label={false} />
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-semibold">{FRIEND} joined {trip?.title ?? 'your trip'}</div>
                <div className="text-[12px] text-mute">Free, from your link · added 4 photos and her face</div>
              </div>
              <I.Chevron size={16} className="text-mute" />
            </button>
            {styleShared && (
              <>
                <div className="pt-2 text-[12px] font-semibold uppercase tracking-wider text-mute">Shared with you</div>
                <div data-demo="shared-style" className="relative flex overflow-hidden rounded-[18px] bg-card">
                  <Img src={PAOLA_STYLE.cover} className="h-[128px] w-[96px] shrink-0" label={false} />
                  <div className="flex flex-1 flex-col p-3">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white/60">
                      <Avatar name={FRIEND} size={18} /> {FRIEND}’s own look
                    </div>
                    <div className="mt-1 text-[17px] font-bold leading-tight">{PAOLA_STYLE.title}</div>
                    <div className="text-[11.5px] text-mute">{eighties ? `In ${eighties.title}` : 'Made with her free creations'}</div>
                    {eighties ? (
                      <button onClick={() => push({ name: 'creation', id: 'eighties' })} className="mt-auto flex h-9 items-center justify-center rounded-full bg-white/10 text-[13.5px] font-semibold">Open {eighties.title}</button>
                    ) : (
                      <button data-demo="make-your-version" onClick={() => applyFriendStyle((r) => push(r))} className="relative mt-auto flex h-9 items-center justify-center rounded-full bg-white text-[13.5px] font-semibold text-black active:scale-95">
                        Make your version
                        <LeverTag l="c" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="h-16" />
    </div>
  );
}

/** An earlier install, still free: Studio is new, and their recent restores can become a project. */
export function ReturningCard() {
  const { keepPastWork, resetStack, showToast } = useStore();
  return (
    <div data-demo="returning-card" className="relative mx-4 mt-2 rounded-[20px] bg-card p-3.5 ring-1 ring-[#FF2E7E]/30">
      <LeverTag l="t" />
      <div className="text-[12px] font-semibold text-[#FF6A8E]">New in Remini · Studio</div>
      <div className="mt-0.5 text-[15px] font-bold">Your last restores could be a family archive</div>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <Img key={n} src={A.restored(n)} className="h-14 w-14 rounded-xl" label={false} />
        ))}
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-white/[0.06] text-[12px] text-mute">+9 old</span>
      </div>
      <button
        onClick={() => {
          const id = keepPastWork();
          showToast('Family archive started');
          resetStack([{ name: 'studio' }, { name: 'creation', id }]);
        }}
        className="mt-3 flex h-10 w-full items-center justify-center rounded-full bg-white text-[14px] font-semibold text-black"
      >
        Keep them in a project
      </button>
    </div>
  );
}

/** Entry on Remini's home once something is kept. */
export function StudioEntryCard() {
  const { creations: all, push } = useStore();
  const creations = all.filter((c) => !c.chatOnly);
  if (!creations.length) return null;
  const c = creations.find((x) => progressOf(x).done < progressOf(x).total) ?? creations[0];
  const pr = progressOf(c);
  return (
    <button data-demo="studio-entry" onClick={() => push({ name: 'studio' })} className="relative mx-4 mt-2 flex w-[calc(100%-2rem)] items-center gap-3 rounded-[20px] bg-card p-3 text-left ring-1 ring-[#FF2E7E]/30">
      <LeverTag l="w" />
      <Img src={c.cover} className="h-14 w-14 shrink-0 rounded-xl" label={false} />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold text-[#FF6A8E]">Your Studio · {creations.length} project{creations.length > 1 ? 's' : ''}</span>
        <span className="block truncate text-[15px] font-bold">{c.title}</span>
        <span className="block text-[12px] text-mute">{pr.label}</span>
      </span>
      <ProgressRing value={pr.done / pr.total} size={40} label={`${pr.done}/${pr.total}`} />
    </button>
  );
}

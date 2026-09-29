import { motion } from 'framer-motion';
import { progressOf } from '../state/data';
import { useStore } from '../state/store';
import type { CommunityStyle, Creation } from '../state/types';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { Avatar, HScroll, LeverTag, NavHeader, NewBadge, PillWhite, SectionHeader } from '../components/ui';

export const fmtRemixes = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k remixes` : `${n} remix${n === 1 ? '' : 'es'}`);

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
        <div className="mt-0.5 text-[12px] text-mute">
          {pr.label} · {c.lastEdit}
        </div>
      </div>
    </button>
  );
}

export function StyleCard({ st }: { st: CommunityStyle }) {
  const { remixStyle, push } = useStore();
  return (
    <div data-demo="style-friend" className="relative overflow-hidden rounded-[22px] bg-card">
      <div className="flex">
        <Img src={st.cover} className="h-[170px] w-[128px] shrink-0" label={false} />
        <div className="flex flex-1 flex-col p-3.5">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white/60">
            <Avatar name={st.creator} size={18} /> {st.creator} shared her style
          </div>
          <div className="mt-1.5 text-[18px] font-bold leading-tight">{st.title}</div>
          <motion.div key={st.remixes} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="mt-0.5 text-[12px] font-semibold text-[#FF8FB0]">
            {fmtRemixes(st.remixes)}
          </motion.div>
          <button data-demo="make-your-version" onClick={() => remixStyle(st.id, (r) => push(r))} className="relative mt-auto flex h-10 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-black active:scale-95">
            Make your version
            <LeverTag l="w" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** The profile: locked in once, adapted per creation through versions. */
export function MeCard() {
  const { identities, creations, push } = useStore();
  const me = identities[0];
  if (!me) return null;
  return (
    <button data-demo="me-card" onClick={() => push({ name: 'identity', id: me.id })} className="relative mx-4 block w-[calc(100%-2rem)] rounded-[22px] bg-card p-4 text-left">
      <LeverTag l="c" />
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-brand p-[2px]">
          <Img src={me.cover} className="h-14 w-14 rounded-full ring-2 ring-card" label={false} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-[17px] font-bold">
            {me.name} <I.Lock size={14} className="text-[#2ED47A]" />
          </div>
          <div className="text-[12.5px] text-mute">{me.subtitle} · used in {creations.filter((c) => !c.chatOnly).length} creations</div>
        </div>
        <I.Chevron size={18} className="text-mute" />
      </div>
      <div className="mt-3 flex gap-2">
        {me.variants.map((v) => (
          <span key={v.name} className="flex items-center gap-2 rounded-full bg-white/[0.07] py-1 pl-1 pr-3 text-[12.5px]">
            <Img src={v.cover} className="h-7 w-7 rounded-full" label={false} />
            <span>
              <b>{v.name}</b> <span className="text-white/55">· {v.usedFor}</span>
            </span>
          </span>
        ))}
      </div>
    </button>
  );
}

/** Studio: only your own and shared work. Everything else stays on Remini's usual pages. */
export function StudioScreen() {
  const { creations, styles, unlocked, returning, push, pop, identities } = useStore();
  const works = creations.filter((c) => !c.chatOnly);
  const open = works.filter((c) => progressOf(c).done < progressOf(c).total);
  const friendStyle = styles.find((s) => s.friend);
  // Remix: your versions of styles (one creation per style), and styles friends shared.
  const remixes = works.filter((c) => c.id.startsWith('style-'));
  // Chats: every conversation with Remini, reopenable.
  const chats = creations.filter((c) => (c.chat ?? []).some((m) => m.from !== 'remini') || c.chatOnly);
  const album = creations.find((c) => c.id === 'trip');
  const paola = creations.find((c) => c.id === 'paola');

  return (
    <div>
      <NavHeader title="" onBack={pop} />
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-[30px] font-bold leading-none tracking-tight">Studio</h1>
          <span className="rounded-md bg-brand px-1.5 py-[1px] text-[10px] font-extrabold">NEW</span>
        </div>
        <p className="mt-1.5 text-[14px] leading-snug text-white/65">What you make with Remini, kept and ready to continue. On your own and with friends.</p>
      </div>

      {returning && open.length > 0 && (
        <div data-demo="welcome-card" className="relative mx-4 mt-3 rounded-[22px] bg-gradient-to-br from-[#2a1320] to-card p-4 ring-1 ring-[#FF2E7E]/25">
          <LeverTag l="w" />
          <div className="text-[13px] font-semibold text-white/60">Welcome back</div>
          <div className="mt-1 text-[19px] font-bold leading-tight">
            {open.map((c) => `${c.title} is ${progressOf(c).done} of ${progressOf(c).total}`).join(' · ')}. Continue?
          </div>
          <PillWhite className="mt-3 !h-11" onClick={() => push({ name: 'creation', id: open[0].id })}>
            Continue
          </PillWhite>
        </div>
      )}

      <SectionHeader demo="keep-going" title={<span className="relative">Keep going<LeverTag l="w" className="-right-5 -top-1" /></span>} sub="Everything you kept saves itself" />
      {works.length ? (
        <HScroll>
          {works.filter((c) => !c.id.startsWith('style-')).map((c) => (
            <CreationCard key={c.id} c={c} />
          ))}
          <button data-demo="what-creating" onClick={() => push({ name: 'create' })} className="relative flex w-[150px] shrink-0 flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/20 p-3 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-black">
              <I.Plus />
            </span>
            <span className="text-[14px] font-semibold leading-tight">What are you creating?</span>
            <LeverTag l="t" />
          </button>
        </HScroll>
      ) : (
        <div className="mx-4 rounded-[20px] border border-dashed border-white/15 p-5 text-center text-[13px] text-mute">Nothing kept yet. Create anything in Remini and tap “Keep this”.</div>
      )}

      <SectionHeader demo="remix" title={<span className="relative">Remix<LeverTag l="w" className="-right-5 -top-1" /></span>} sub="Styles and filters on your profile, one creation per style" />
      {remixes.length ? (
        <HScroll>
          {remixes.map((c) => (
            <CreationCard key={c.id} c={c} />
          ))}
        </HScroll>
      ) : (
        <div className="mx-4 rounded-[20px] border border-dashed border-white/15 p-4 text-[13px] text-mute">Try a filter like 80s Vibes, or a preset in Remini chat, on your profile. Each style is kept here.</div>
      )}

      <SectionHeader demo="chats" title="Chats" sub="Your conversations with Remini, kept to reopen" />
      <div className="space-y-2 px-4">
        {chats.length ? (
          chats.map((c) => {
            const last = [...(c.chat ?? [])].reverse()[0];
            return (
              <button key={c.id} data-demo={`chat-${c.id}`} onClick={() => push({ name: 'chat', creationId: c.id })} className="flex w-full items-center gap-3 rounded-[18px] bg-card p-3 text-left">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand"><I.Enhance size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold">{c.chatOnly ? 'Remini chat' : `${c.title} · chat`}</span>
                  <span className="block truncate text-[12.5px] text-mute">{last ? `${last.from === 'me' ? 'You' : last.from === 'remini' ? 'Remini' : last.from}: ${last.text}` : 'No messages yet'}</span>
                </span>
                <I.Chevron size={16} className="text-mute" />
              </button>
            );
          })
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/15 p-4 text-[13px] text-mute">Open Remini chat from the bubble on the home. Every chat is kept here.</div>
        )}
      </div>

      <SectionHeader title={<span className="relative">Together<LeverTag l="I" className="-right-5 -top-1" /></span>} sub="Made with friends, then with the whole group" />
      <div className="space-y-2.5 px-4">
        {unlocked.friend && friendStyle && !paola && <StyleCard st={friendStyle} />}
        {paola && <CreationCard c={paola} wide />}
        {album && <CreationCard c={album} wide />}
        {!unlocked.friend && <div className="rounded-[20px] border border-dashed border-white/15 p-4 text-[13px] text-mute">Share something you made and create with a friend. Then bring the whole group.</div>}
      </div>

      {identities.length > 0 && (
        <>
          <SectionHeader title="Me" sub="Your profile, locked in once, adapted to each creation" />
          <MeCard />
        </>
      )}
      <div className="h-16" />
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
        <span className="block text-[12px] font-semibold text-[#FF6A8E]">Your Studio · {creations.length} kept</span>
        <span className="block truncate text-[15px] font-bold">Keep going: {c.title}</span>
        <span className="block text-[12px] text-mute">{pr.label}</span>
      </span>
      <ProgressRing value={pr.done / pr.total} size={40} label={`${pr.done}/${pr.total}`} />
    </button>
  );
}

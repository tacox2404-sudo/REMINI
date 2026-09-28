import { motion } from 'framer-motion';
import { TRENDS, progressOf } from '../state/data';
import { useFlows } from '../state/flows';
import { useStore } from '../state/store';
import type { CommunityStyle, Creation } from '../state/types';
import { TopBar } from '../components/Chrome';
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
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, value)) }}
          transition={{ duration: 0.5 }}
        />
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
      <div className={`relative ${wide ? 'h-[150px]' : 'h-[150px]'}`}>
        <Img src={c.cover} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {c.lastEdit === 'Just now' && <NewBadge className="absolute left-2.5 top-2.5" />}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/50 p-0.5 backdrop-blur">
          <ProgressRing value={pr.done / pr.total} label={`${pr.done}/${pr.total}`} size={38} />
        </span>
      </div>
      <div className="p-3">
        <div className="truncate text-[15px] font-bold">{c.title}</div>
        <div className="mt-0.5 text-[12px] text-mute">{pr.label} · {c.lastEdit}</div>
      </div>
    </button>
  );
}

export function StyleCard({ st, wide }: { st: CommunityStyle; wide?: boolean }) {
  const { remixStyle, push } = useStore();
  return (
    <div data-demo={st.friend ? 'style-friend' : st.mine ? 'style-mine' : undefined} className={`relative shrink-0 overflow-hidden rounded-[20px] bg-card ${wide ? 'w-full' : 'w-[168px]'}`}>
      <div className="relative h-[200px]">
        <Img src={st.cover} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        {st.friend && <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-black">Friend</span>}
        {st.mine && <span className="absolute left-2.5 top-2.5 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold">Yours</span>}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="text-[15px] font-bold leading-tight">{st.title}</div>
          <div className="mt-0.5 text-[12px] text-white/70">by {st.creator}</div>
          <motion.div key={st.remixes} initial={{ opacity: 0.4, y: 2 }} animate={{ opacity: 1, y: 0 }} className="mt-0.5 text-[12px] font-semibold text-[#FF8FB0]" data-demo={st.mine ? 'remix-counter' : undefined}>
            {fmtRemixes(st.remixes)}
          </motion.div>
        </div>
      </div>
      {!st.mine && (
        <div className="p-2.5">
          <button
            data-demo={st.friend ? 'make-your-version' : undefined}
            onClick={() => remixStyle(st.id, (r) => push(r))}
            className="relative flex h-9 w-full items-center justify-center rounded-full bg-white text-[13px] font-semibold text-black active:scale-95"
          >
            Make your version
            <LeverTag l="w" />
          </button>
        </div>
      )}
    </div>
  );
}

function Overline({ children }: { children: string }) {
  return <div className="px-4 pt-8 text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF6A8E]">{children}</div>;
}

/** Gen AI front and centre: chat with Remini using your saved Me or your albums. */
function CreateWithAI() {
  const { push, createFreestyle, sendChat } = useStore();
  const go = (prompt?: string) => {
    const id = createFreestyle();
    push({ name: 'chat', creationId: id });
    if (prompt) sendChat(id, prompt);
  };
  return (
    <div data-demo="create-ai" className="relative mx-4 rounded-[24px] p-[2px]" style={{ background: 'linear-gradient(135deg,#FF7A45,#FFB020,#FF2E7E,#B57CFF)' }}>
      <LeverTag l="w" />
      <div className="rounded-[22px] bg-[#141419] p-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-white/70">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-white"><I.Enhance size={13} /></span>
          Create with Remini chat
        </div>
        <button onClick={() => go()} className="mt-2 block w-full text-left text-[19px] font-bold leading-snug">
          Describe it. Remini makes it with your saved Me, no upload.
        </button>
        <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1">
          {['Me as an astronaut on a film set', 'Me on a red carpet premiere', 'A 90s album cover of me'].map((p) => (
            <button key={p} onClick={() => go(p)} className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-[12.5px] font-medium text-white/85 active:bg-white/10">
              ✨ {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TogetherCard() {
  const { creations, push } = useStore();
  const albums = creations.filter((c) => c.shared);
  return (
    <div className="space-y-2.5 px-4">
      {albums.map((c) => {
        const last = [...(c.chat ?? [])].reverse().find((m) => m.from !== 'remini' && m.from !== 'me');
        return (
          <button key={c.id} data-demo="together-trip" onClick={() => push({ name: 'creation', id: c.id })} className="block w-full overflow-hidden rounded-[22px] bg-card text-left">
            <div className="relative h-[130px]">
              <div className="absolute inset-0 grid grid-cols-3 gap-0.5">
                {[...new Set(c.photos.map((p) => p.original))].slice(0, 3).map((src) => (
                  <Img key={src} src={src} className="h-full" label={false} />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                <div>
                  <div className="text-[17px] font-bold">{c.title} · Philippines</div>
                  <div className="text-[12px] text-white/70">{c.photos.length} photos from {c.shared!.members.length} people · “{c.shared!.style}”</div>
                </div>
                <div className="flex -space-x-2">
                  {c.shared!.members.map((m) => (
                    <Avatar key={m} name={m} size={24} />
                  ))}
                </div>
              </div>
            </div>
            {last && (
              <div className="flex items-center gap-2 px-3 py-2.5 text-[13px]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand"><I.Enhance size={12} /></span>
                <span className="flex-1 truncate text-white/80"><b className="text-white">{last.from}</b> asked Remini: “{last.text}”</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StudioHome() {
  const { identities, creations, styles, push, openSheet } = useStore();
  const { tryTrendMine } = useFlows();
  const open = creations.filter((c) => progressOf(c).done < progressOf(c).total);

  return (
    <div>
      <TopBar />
      <div className="px-4 pb-4 pt-1">
        <h1 className="text-[30px] font-bold leading-none tracking-tight">Studio</h1>
        <p className="mt-1.5 text-[14px] leading-snug text-white/65">Your photos and videos, kept and ready to continue. Alone, with friends, with AI.</p>
      </div>

      <CreateWithAI />

      <Overline>My Creations</Overline>
      <SectionHeader demo="keep-going" title={<span className="relative">Keep going<LeverTag l="w" className="-right-5 -top-1" /></span>} sub="Work in progress saves itself" onSeeAll={() => push({ name: 'section', section: 'creations' })} />
      <HScroll>
        {open.map((c) => (
          <CreationCard key={c.id} c={c} />
        ))}
        <button data-demo="what-creating" onClick={() => push({ name: 'create' })} className="relative flex w-[150px] shrink-0 flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/20 p-3 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-black"><I.Plus /></span>
          <span className="text-[14px] font-semibold leading-tight">What are you creating?</span>
          <LeverTag l="t" />
        </button>
      </HScroll>

      <SectionHeader title={<span className="relative">Together<LeverTag l="I" className="-right-5 -top-1" /></span>} sub="Albums with friends: one style for everyone, and a shared chat with Remini" />
      <TogetherCard />

      <Overline>Remix</Overline>
      <SectionHeader demo="new-for-you" title="New for you" sub="This week’s trends, already applied to your saved Me" />
      <HScroll>
        {TRENDS.slice(0, 4).map((t, i) => (
          <button key={t.id} data-demo={`trend-${t.id}`} onClick={() => (i === 0 ? push({ name: 'trend', trendId: t.id }) : tryTrendMine(t.id))} className="relative h-[210px] w-[150px] shrink-0 overflow-hidden rounded-[18px] text-left">
            <Img src={t.result} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
            {t.hot && <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold">🔥 This week</span>}
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <div className="text-[14px] font-bold leading-tight">{t.title}</div>
              <div className="mt-0.5 text-[11px] text-white/70">Tap to see yourself</div>
            </div>
          </button>
        ))}
      </HScroll>

      <SectionHeader demo="community" title={<span className="relative">Styles from the community<LeverTag l="I" className="-right-5 -top-1" /></span>} sub="Made by people, ready to try on your saved Me" onSeeAll={() => push({ name: 'section', section: 'remix' })} />
      <HScroll>
        {styles.map((st) => (
          <StyleCard key={st.id} st={st} />
        ))}
      </HScroll>

      <Overline>Me</Overline>
      <SectionHeader title="Saved identities" sub="Several profiles, one tap. Private to you." />
      <div data-demo="me-row" className="no-scrollbar flex items-center gap-3 overflow-x-auto px-4">
        {identities.map((idn, i) => (
          <button key={idn.id} data-demo={`identity-${idn.id}`} onClick={() => push({ name: 'identity', id: idn.id })} className="flex shrink-0 items-center gap-2 rounded-full bg-white/[0.06] py-1 pl-1 pr-3.5">
            <span className={`rounded-full p-[2px] ${i === 0 ? 'bg-brand' : 'bg-white/15'}`}>
              <Img src={idn.cover} className="h-9 w-9 rounded-full ring-2 ring-ink" label={false} />
            </span>
            <span className="text-[13px] font-semibold">{idn.name}</span>
          </button>
        ))}
        <button onClick={() => openSheet({ type: 'rememberMe' })} className="relative flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-white/20 px-3.5 py-2.5 text-[13px] font-semibold text-white/75">
          <I.Plus size={15} /> Remember me
          <LeverTag l="c" />
        </button>
      </div>
      <div className="h-44" />
    </div>
  );
}

export function SectionScreen({ section }: { section: 'me' | 'creations' | 'remix' }) {
  const { identities, creations, styles, pop, push, openSheet } = useStore();
  const title = section === 'me' ? 'Me' : section === 'creations' ? 'My Creations' : 'Remix';
  return (
    <div>
      <NavHeader title={title} onBack={pop} />
      {section === 'me' && (
        <div className="px-4">
          <p className="text-[14px] text-mute">Saved versions of you. Every trend, remix and creation uses them, so you never upload selfies again.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {identities.map((i) => (
              <button key={i.id} onClick={() => push({ name: 'identity', id: i.id })} className="overflow-hidden rounded-[20px] bg-card text-left">
                <Img src={i.cover} className="aspect-square" label={false} />
                <div className="p-3">
                  <div className="text-[15px] font-bold">{i.name}</div>
                  <div className="text-[12px] text-mute">{i.subtitle}</div>
                </div>
              </button>
            ))}
            <button onClick={() => openSheet({ type: 'rememberMe' })} className="grid min-h-[200px] place-items-center rounded-[20px] border border-dashed border-white/20 text-center text-[14px] font-semibold text-white/75">
              <span className="flex flex-col items-center gap-2"><I.Plus /> Remember me</span>
            </button>
          </div>
        </div>
      )}
      {section === 'creations' && (
        <div className="space-y-3 px-4">
          <p className="text-[14px] text-mute">Everything you are working on. It saves itself; just come back and continue.</p>
          {creations.map((c) => (
            <CreationCard key={c.id} c={c} wide />
          ))}
          <PillWhite onClick={() => push({ name: 'create' })}>What are you creating?</PillWhite>
        </div>
      )}
      {section === 'remix' && (
        <div className="px-4">
          <p className="text-[14px] text-mute">Styles made by people, ready to try on your saved Me.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {styles.map((st) => (
              <StyleCard key={st.id} st={st} wide />
            ))}
          </div>
          <p className="pt-3 text-[12px] text-mute">Remixes always use your own saved identity.</p>
          <button data-demo="coming-next" onClick={() => push({ name: 'comingNext' })} className="mt-5 flex w-full items-center gap-3 rounded-[20px] bg-card p-4 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><I.Users /></span>
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">Make it together</span>
              <span className="block text-[12px] text-mute">Shared creations with friends · coming next</span>
            </span>
            <I.Chevron size={18} className="text-mute" />
          </button>
        </div>
      )}
      <div className="h-12" />
    </div>
  );
}

export function ComingNextScreen() {
  const { pop, track } = useStore();
  return (
    <div className="flex h-full flex-col">
      <NavHeader title="" onBack={pop} />
      <div className="flex flex-1 flex-col items-center px-8 pt-6 text-center">
        <span className="rounded-full border border-white/20 px-3 py-1 text-[12px] font-semibold text-white/70">Coming next</span>
        <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight">Make it together</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-mute">
          Shared creations: one trip album or one yearbook for the whole group. Everyone adds photos from their phone, everyone appears with their own saved identity, and the creation keeps growing.
        </p>
        <div className="mt-6 grid w-full grid-cols-3 gap-1.5">
          {[1, 2, 5].map((n) => (
            <Img key={n} src={`trip_${n}.jpg`} className="aspect-[3/4] rounded-xl" label={false} />
          ))}
        </div>
      </div>
      <div className="px-4 pb-8">
        <PillWhite
          onClick={() => {
            track('shared_creations_interest', 'I');
            pop();
          }}
        >
          Tell me when it is ready
          <LeverTag l="I" />
        </PillWhite>
      </div>
    </div>
  );
}

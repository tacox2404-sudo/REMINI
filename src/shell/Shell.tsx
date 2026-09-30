import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LEVER_META } from '../components/ui';
import { BEATS, STEP_NAMES, TOTAL_STEPS } from '../state/demo';
import { SCENARIOS, npv, type Levers } from '../state/npv';
import { useStore } from '../state/store';
import type { Lever } from '../state/types';

function LeverPill({ l }: { l: Lever }) {
  return (
    <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-bold text-black" style={{ background: LEVER_META[l].color }}>
      {l}
    </span>
  );
}

const LEVER_DETAIL: Record<Lever, { why: string; where: string }> = {
  t: {
    why: 'The easiest lever to move: 95% of installs never try. Projects turn one edit into a job bigger than the free allowance, so the limit lands inside something people care about ("5 of 17 done"). Together is showcased to free users as a reason to try. Returning free users find their past work and the limit inside a project.',
    where: 'Keep in a project, the project suggestion, Enhance all, the free limit in the project, the Together showcase.',
  },
  c: {
    why: 'During the 7-day trial Together unlocks: friends join the project, share styles, make duo shoots and use the shared chat. The project fills up with other people\'s work, which gives a reason to keep paying once the first job is done.',
    where: 'Trial success, friends\' shared styles, duo shoots, the shared project chat, saving Me.',
  },
  w: {
    why: 'The hardest lever: people need reasons to come back. Unfinished projects, new looks on a profile that keeps improving, and friends\' additions are those reasons. After cancelling, projects stay viewable and downloadable, a reason to come back later.',
    where: 'Keep in the trip, Me updates, Welcome back, notifications, after cancelling.',
  },
  I: {
    why: 'A cost-effective source of installs, not the goal: invited friends arrive into a project with their friends\' work already waiting and a reason to add their own face, so they should start trials more often than a typical install.',
    where: 'Invite into a project, the WhatsApp link, friends joining.',
  },
};

export function Controls({ compact = false }: { compact?: boolean }) {
  const s = useStore();
  const { mode, setMode, demo, setDemo, resetAll, resetStack, goTab } = s;
  return (
    <div className="space-y-4">
      {!compact && (
        <div>
          <div className="text-[18px] font-extrabold tracking-tight">
            Remini <span className="bg-brand bg-clip-text text-transparent">Studio</span>
          </div>
          <div className="text-[12px] text-white/45">Concept prototype · not the real app</div>
        </div>
      )}
      {!compact && (
        <div className="rounded-xl bg-white/[0.04] p-3.5 text-[12.5px] leading-relaxed text-white/60">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">The idea</div>
          <b className="text-white/85">Studio</b> is a personal space inside Remini where people create, keep and grow their work, alone or with friends.
          <ul className="mt-2 space-y-1">
            <li><b className="text-white/85">Projects</b>: a job that keeps going, with progress and Enhance all</li>
            <li><b className="text-white/85">Profiles</b>: Me, kept and improving over time, and friends who add their own face</li>
            <li><b className="text-white/85">Together</b>: invite friends into a project, duo shoots, friends’ styles with your face</li>
            <li><b className="text-white/85">Remini chat</b>: one for you, one inside each project, shared with its members</li>
          </ul>
          <p className="mt-2">Free limits stay as they are. People choose what to keep. Studio is private, not a feed.</p>
        </div>
      )}
      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">Experience</div>
        <div className="grid grid-cols-2 rounded-xl bg-white/[0.06] p-1">
          {(['today', 'studio'] as const).map((m) => (
            <button
              key={m}
              data-ctl={`mode-${m}`}
              onClick={() => mode !== m && setMode(m)}
              className={`h-8 rounded-lg text-[13px] font-semibold transition ${mode === m ? (m === 'studio' ? 'bg-brand text-white' : 'bg-white text-black') : 'text-white/60'}`}
            >
              {m === 'today' ? 'Today' : 'With Studio'}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {demo === null ? (
          <button
            data-ctl="start-demo"
            onClick={() => {
              resetAll();
              setDemo(0);
            }}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-[14px] font-semibold text-black active:scale-[0.98]"
          >
            ▶ Start demo
          </button>
        ) : (
          <button onClick={() => setDemo(null)} className="flex h-10 w-full items-center justify-center rounded-xl bg-white/10 text-[14px] font-semibold">
            Exit demo
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (mode !== 'studio') setMode('studio');
              goTab('studio');
              resetStack([{ name: 'lock' }]);
            }}
            className="h-9 rounded-xl bg-white/[0.06] text-[12px] font-semibold text-white/80"
          >
            Lock screen
          </button>
          <button
            onClick={() => {
              resetAll();
              setDemo(null);
            }}
            className="h-9 rounded-xl bg-white/[0.06] text-[12px] font-semibold text-white/80"
          >
            Reset
          </button>
        </div>
      </div>
      {!compact && <p className="text-[11px] leading-relaxed text-white/35">Demo keys: → next · ← back · Esc exit</p>}
    </div>
  );
}

/** Separate "Why it matters" module: explains the levers and toggles the tags + event log. */
export function LeversPanel({ inline = false }: { inline?: boolean }) {
  const { showLevers, setShowLevers, demo, setClosing } = useStore();
  const [open, setOpen] = useState(false);
  // Keep the demo caption visible: fold the explanation away when the demo moves on.
  useEffect(() => {
    if (demo !== null) setOpen(false);
  }, [demo]);
  const toggle = () => {
    const next = !showLevers;
    setShowLevers(next);
    setOpen(next);
  };
  return (
    <div className={inline ? '' : 'levers-corner'}>
      <AnimatePresence>
        {showLevers && open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111116]/95 p-4 backdrop-blur-xl ${inline ? 'mb-3' : 'mb-3 max-h-[calc(100vh-110px)] w-[360px] overflow-y-auto no-scrollbar shadow-2xl'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[15px] font-bold">Why it matters</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">
                  The coloured tags mark what each part is meant to trigger. The subscription formula multiplies its terms, so 1% on any lever is worth the same ($700 a day); the choice is about room to grow and ease. They are hypotheses for the random test, not measured results.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-[12px] font-semibold text-white/40 hover:text-white/80">
                Hide
              </button>
            </div>
            {(Object.keys(LEVER_META) as Lever[]).map((l) => (
              <div key={l} className="rounded-xl bg-white/[0.04] p-3">
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <LeverPill l={l} /> {LEVER_META[l].name}
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/65">{LEVER_DETAIL[l].why}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/40">Tagged on: {LEVER_DETAIL[l].where}</p>
              </div>
            ))}
            <button data-ctl="open-model" onClick={() => setClosing(true)} className="h-10 rounded-xl bg-white text-[13px] font-semibold text-black">
              Open the business model (NPV sliders)
            </button>
            <div className="flex h-56 flex-col">
              <EventLog />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111116]/95 px-4 py-3 backdrop-blur-xl ${inline ? '' : 'w-[360px] shadow-2xl'}`}>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">Why it matters</div>
          <div className="text-[11.5px] text-white/45">{demo !== null ? 'Best after the demo' : showLevers ? 'Business levers shown on screens' : 'Show the business levers behind the design'}</div>
        </div>
        {showLevers && !open && (
          <button onClick={() => setOpen(true)} className="text-[12px] font-semibold text-white/60 hover:text-white">
            Explain
          </button>
        )}
        <button data-ctl="levers-toggle" onClick={toggle} aria-label="Show levers" className={`relative h-[24px] w-[42px] shrink-0 rounded-full transition ${showLevers ? 'bg-[#34C759]' : 'bg-white/15'}`}>
          <span className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white transition-all ${showLevers ? 'left-[20px]' : 'left-[2px]'}`} />
        </button>
      </div>
    </div>
  );
}

export function EventLog() {
  const { events, clearEvents } = useStore();
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white/[0.04] p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Event log</span>
        <button onClick={clearEvents} className="text-[11px] text-white/40 hover:text-white/70">
          Clear
        </button>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto font-mono text-[12px]">
        {!events.length && <div className="text-white/30">Click around: events appear here.</div>}
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <span className="text-white/30">{e.at}</span>
              <span className="flex-1 truncate text-white/85">{e.name}</span>
              {e.lever ? (
                <span className="flex items-center gap-1 text-white/40">
                  → <LeverPill l={e.lever} />
                </span>
              ) : (
                <span className="text-white/25">·</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DemoCaption({ compact = false }: { compact?: boolean }) {
  const { demo, setDemo } = useStore();
  if (demo === null) return null;
  const b = BEATS[demo];
  const last = demo === BEATS.length - 1;
  return (
    <motion.div key={demo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl bg-white text-black shadow-2xl ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-black/45">
        <span>
          Step {b.step} of {TOTAL_STEPS} · {STEP_NAMES[b.step - 1]}
        </span>
      </div>
      <div data-ctl={compact ? undefined : 'demo-title'} className={`mt-1 font-bold leading-tight ${compact ? 'text-[15px]' : 'text-[18px]'}`}>{b.title}</div>
      {!compact && <p className="mt-1.5 text-[14px] leading-snug text-black/70">{b.caption}</p>}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i + 1 <= b.step ? 'bg-[#FF2E7E]' : 'bg-black/10'}`} />
          ))}
        </div>
        <button disabled={demo === 0} onClick={() => setDemo(demo - 1)} className="h-8 rounded-full bg-black/[0.06] px-3 text-[13px] font-semibold disabled:opacity-30">
          ←
        </button>
        <button data-ctl={compact ? undefined : 'demo-next'} onClick={() => setDemo(last ? null : demo + 1)} className="h-8 rounded-full bg-black px-3.5 text-[13px] font-semibold text-white">
          {last ? 'Finish' : 'Next →'}
        </button>
      </div>
    </motion.div>
  );
}

function useDemoDriver() {
  const s = useStore();
  const { demo, setDemo, setLastDemoDone, setOnboarded, setClosing } = s;
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (demo === null && prev.current === BEATS.length - 1) setLastDemoDone(true);
    prev.current = demo;
    if (demo === null) {
      setClosing(false);
      return;
    }
    // The demo walks through onboarding itself; don't start it again afterwards.
    setOnboarded({ today: true, studio: true });
    BEATS[demo]?.enter(s);
    // Only re-run when the beat changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (demo === null) return;
      if (e.key === 'ArrowRight') setDemo(demo >= BEATS.length - 1 ? null : demo + 1);
      else if (e.key === 'ArrowLeft') setDemo(Math.max(0, demo - 1));
      else if (e.key === 'Escape') setDemo(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [demo, setDemo]);
}

const fmtM = (x: number) => `${x < 0 ? '−' : ''}$${Math.abs(x) < 1e5 ? `${Math.round(Math.abs(x) / 1e3)}k` : `${Math.abs(x / 1e6).toFixed(1)}M`}`;
const pct = (x: number, d = 1) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(d)}%`;

const SLIDERS: { k: 't' | 'c' | 'w' | 'inv'; l: Lever; name: string; min: number; max: number; step: number; unit: '%' | '#' }[] = [
  { k: 't', l: 't', name: 'Trial start', min: -10, max: 30, step: 1, unit: '%' },
  { k: 'c', l: 'c', name: 'Trial → paid', min: -10, max: 10, step: 1, unit: '%' },
  { k: 'w', l: 'w', name: 'Paid weeks', min: -5, max: 20, step: 1, unit: '%' },
  { k: 'inv', l: 'I', name: 'Invites → installs', min: 0, max: 12, step: 1, unit: '#' },
];

/** Interactive business case: the impact model's formulas, scenarios and ranges. */
function ClosingCard() {
  const { closing, setClosing, setDemo } = useStore();
  const [scen, setScen] = useState('balanced');
  const [v, setV] = useState<Levers>(SCENARIOS[1].v);
  const r = npv(v);
  const gap = r.total - r.target;
  const base = SCENARIOS.find((s) => s.id === scen);
  const custom = base && (['t', 'c', 'w', 'inv'] as const).some((k) => Math.abs(base.v[k] - v[k]) > 1e-9);
  const parts: [string, number][] = [
    ['Subscriptions from new installs', r.parts.newInstalls],
    ['Returning users starting a trial', r.parts.returning],
    ['Invited friends', r.parts.invites],
    ['Ads', r.parts.ads],
    ['Extra AI usage (lower margin)', r.parts.aiCost],
  ];
  const maxAbs = Math.max(...parts.map(([, x]) => Math.abs(x)));
  const MAXN = 8e6;
  const pos = (x: number) => `${Math.max(0, Math.min(100, (x / MAXN) * 100))}%`;
  return (
    <AnimatePresence>
      {closing && (
        <motion.div className="fixed inset-0 z-[300] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div data-ctl="closing-card" initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} className="my-4 w-full max-w-[760px] rounded-[28px] border border-white/10 bg-[#111116] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#FF6A8E]">Remini Studio · impact model</div>
                <h2 className="mt-1 text-[30px] font-extrabold tracking-tight">Why it pays</h2>
              </div>
              <button onClick={() => setClosing(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10" aria-label="Close">✕</button>
            </div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/70">
              The target is <b className="text-white">$5M NPV over 2 years</b>, about 10% of the $51M new users bring in. The levers multiply, so each 1% is worth the same and several moderate moves beat one large one. Pushing one lever without a real change in behaviour can pull the others down.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  data-ctl={`scenario-${s.id}`}
                  onClick={() => {
                    setScen(s.id);
                    setV(s.v);
                  }}
                  className={`rounded-xl p-2.5 text-left transition ${scen === s.id ? 'bg-white text-black' : 'bg-white/[0.06] text-white/80 hover:bg-white/10'}`}
                >
                  <div className="flex items-baseline justify-between text-[13.5px] font-bold">
                    <span>{s.name}{s.id === 'balanced' ? ' (base)' : ''}</span>
                    <span className="tabular-nums">{fmtM(npv(s.v).total)}</span>
                  </div>
                  <div className={`mt-0.5 text-[11px] leading-snug ${scen === s.id ? 'text-black/60' : 'text-white/45'}`}>{s.what}</div>
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2.5">
              {SLIDERS.map((sl) => {
                const val = sl.unit === '%' ? v[sl.k] * 100 : v[sl.k];
                return (
                  <div key={sl.k} className="grid grid-cols-[160px_1fr_78px] items-center gap-4">
                    <span className="flex items-center gap-2 text-[13.5px] font-semibold text-white/85">
                      <LeverPill l={sl.l} /> {sl.name}
                    </span>
                    <input
                      type="range"
                      min={sl.min}
                      max={sl.max}
                      step={sl.step}
                      value={val}
                      data-ctl={`slider-${sl.k}`}
                      onChange={(e) => setV((cur) => ({ ...cur, [sl.k]: sl.unit === '%' ? +e.target.value / 100 : +e.target.value }))}
                      className="lever-range w-full"
                      style={{ ['--fill' as string]: `${((val - sl.min) / (sl.max - sl.min)) * 100}%` }}
                      aria-label={sl.name}
                    />
                    <span className="text-right text-[15px] font-bold tabular-nums">{sl.unit === '%' ? pct(v[sl.k], 0) : `${v[sl.k]} /100`}</span>
                  </div>
                );
              })}
              <p className="text-[11px] text-white/40">Invites: new installs per 100 trial users. AI usage grows as in the {base?.name ?? 'selected'} scenario (enhancements +{Math.round(v.enh * 100)}%, AI creations +{Math.round(v.ai * 100)}%).{custom ? ' Levers edited.' : ''}</p>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_1.5fr] gap-3">
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/[0.05] p-3.5">
                  <div className="text-[12.5px] font-semibold text-white/70">Revenue per install</div>
                  <div className="mt-1 text-[28px] font-extrabold leading-none tabular-nums">{pct(r.delivered)}</div>
                  <div className={`mt-1.5 text-[12px] ${r.delivered >= r.bar ? 'text-[#2ED47A]' : 'text-[#FFB020]'}`}>bar for $5M: {pct(r.bar)}</div>
                </div>
                <div className="rounded-2xl bg-white/[0.05] p-3.5">
                  <div className="text-[12.5px] font-semibold text-white/70">Margin after AI cost</div>
                  <div className="mt-1 text-[22px] font-extrabold leading-none tabular-nums">{(r.m0 * 100).toFixed(0)}% → {(r.m1 * 100).toFixed(1)}%</div>
                  <div className="mt-1.5 text-[11.5px] text-white/45">AI creation costs about 25x an enhancement</div>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#2a1320] to-white/[0.04] p-4 ring-1 ring-[#FF2E7E]/30">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-white/70">NPV over 2 years</span>
                  <span className={`text-[12.5px] font-semibold ${gap >= 0 ? 'text-[#2ED47A]' : 'text-[#FFB020]'}`}>
                    {gap >= 0 ? `✓ ${(r.total / r.target).toFixed(2)}x the target` : `${fmtM(-gap)} below target`}
                  </span>
                </div>
                <div data-ctl="npv" className="mt-1 text-[40px] font-extrabold leading-none tabular-nums">{fmtM(r.total)}</div>
                <div className="relative mb-4 mt-7 h-2 rounded-full bg-white/10">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all" style={{ width: pos(r.total) }} />
                  {[...SCENARIOS.map((s) => [s.name, npv(s.v).total] as const), ['Target', r.target] as const].map(([k, x]) => (
                    <div key={k} className={`absolute flex -translate-x-1/2 items-center ${k === 'Target' ? 'bottom-[-3px] flex-col-reverse' : 'top-[-3px] flex-col'}`} style={{ left: pos(x) }}>
                      <span className={`h-3.5 w-[2px] ${k === 'Target' ? 'bg-white' : 'bg-white/45'}`} />
                      <span className={`whitespace-nowrap text-[10px] ${k === 'Target' ? 'mb-1 font-bold text-white' : 'mt-1 text-white/55'}`}>
                        {k === 'Target' ? 'Target $5M' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {parts.map(([k, x]) => (
                    <div key={k} className="grid grid-cols-[1fr_70px_56px] items-center gap-2 text-[11.5px]">
                      <span className="truncate text-white/65">{k}</span>
                      <span className="h-1.5 rounded-full bg-white/10">
                        <span className={`block h-full rounded-full ${x >= 0 ? 'bg-[#2ED47A]' : 'bg-[#FF6A6A]'}`} style={{ width: `${(Math.abs(x) / maxAbs) * 100}%` }} />
                      </span>
                      <span className="text-right font-semibold tabular-nums">{fmtM(x)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ul className="mt-4 space-y-1 text-[12px] leading-relaxed text-white/60">
              <li>• <b className="text-white/85">Conversion is the pivot, not trial volume.</b> Trial rush doubles the trial lift of Balanced yet earns less per install, because the extra trials convert worse and paid weeks do not grow.</li>
              <li>• <b className="text-white/85">The real cost is margin.</b> Group shoots and remixes are the costly line; free limits and the 7-day trial keep usage bounded.</li>
              <li>• <b className="text-white/85">Returning users are the cheapest upside.</b> 1 in 20,000 a day starting a trial adds about $0.8M, even as that base shrinks.</li>
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-white/35">
              Same formulas as the impact model: 2 months to build, a test month on 10% of new installs, a rollout month at 50%, then everyone; 9% discount rate; AI compute and storage at public list prices. Fictitious case data. The random test settles it within weeks.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                data-ctl="closing-done"
                onClick={() => {
                  setClosing(false);
                  setDemo(null);
                }}
                className="h-11 flex-1 rounded-xl bg-white text-[14px] font-semibold text-black"
              >
                Finish
              </button>
              <button onClick={() => setClosing(false)} className="h-11 rounded-xl bg-white/10 px-4 text-[14px] font-semibold">
                Back to the app
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Shell({ phone }: { phone: ReactNode }) {
  const { demo, lastDemoDone } = useStore();
  const [panel, setPanel] = useState(false);
  useDemoDriver();

  return (
    <div className="shell">
      <aside className="side side-left">
        <Controls />
      </aside>

      {phone}

      <aside className="side side-right">
        <AnimatePresence mode="wait">{demo !== null && <DemoCaption key="cap" />}</AnimatePresence>
        {demo === null && (
          <div className="rounded-2xl border border-white/[0.06] p-4 text-[13px] leading-relaxed text-white/45">
            {lastDemoDone ? (
              <>
                <b className="text-white/85">Demo complete.</b>
                <br />
                Now switch on <b className="text-white/70">Why it matters</b> (bottom right) to see which business lever each part of the design is meant to move, then click around freely.
              </>
            ) : (
              <>
                <b className="text-white/80">How to explore</b>
                <br />
                Press <b className="text-white/70">Start demo</b> for the guided tour: Today first, then With Studio. Afterwards, switch on <b className="text-white/70">Why it matters</b> in the bottom-right corner to see the business levers behind the design.
              </>
            )}
          </div>
        )}
      </aside>

      <ClosingCard />

      <div className="levers-desktop">
        <LeversPanel />
      </div>

      {/* Small screens: floating control */}
      <div className="mobile-ctl">
        <AnimatePresence>{demo !== null && <div className="pointer-events-auto mb-2 w-[300px]"><DemoCaption compact /></div>}</AnimatePresence>
        <button onClick={() => setPanel(!panel)} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-white text-[18px] font-bold text-black shadow-2xl">
          {panel ? '×' : '⚑'}
        </button>
      </div>
      <AnimatePresence>
        {panel && (
          <motion.div
            className="fixed inset-x-3 bottom-20 z-[200] flex max-h-[75vh] flex-col gap-3 overflow-y-auto rounded-3xl border border-white/10 bg-[#111116]/95 p-4 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Controls compact />
            <div className="border-t border-white/10 pt-3">
              <LeversPanel inline />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

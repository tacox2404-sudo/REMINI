import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LEVER_META } from '../components/ui';
import { BEATS, CHAPTERS, TOTAL_STEPS, afterDemo } from '../state/demo';
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

const LEVER_DETAIL: Record<Lever, { what: string; where: string }> = {
  t: { what: 'More people start the free trial.', where: 'Keep in a project, the free limit inside the trip, the Together showcase, onboarding.' },
  c: { what: 'More trials turn into paid subscriptions.', where: 'Friends joining and sharing, duo shoots, the trial’s last day.' },
  w: { what: 'Subscribers stay longer.', where: 'Unfinished projects, Me improving, Welcome back, after cancelling.' },
  I: { what: 'New users arrive from invites.', where: 'Inviting friends into a project.' },
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
                <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">The coloured tags on the screens show which lever each element is meant to move.</p>
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
                <p className="mt-1 text-[12px] leading-relaxed text-white/65">{LEVER_DETAIL[l].what}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-white/40">{LEVER_DETAIL[l].where}</p>
              </div>
            ))}
            <button data-ctl="open-model" onClick={() => setClosing(true)} className="h-10 rounded-xl bg-white text-[13px] font-semibold text-black">
              Why it pays (NPV model)
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
    <motion.div key={demo} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className={`rounded-2xl bg-white text-black shadow-2xl ${compact ? 'p-3' : 'p-4'}`}>
      {CHAPTERS[b.step - 1].card ? (
        // Projects, Profiles and Together: the three pillars get a big, coloured section title.
        <div className="flex h-[28px] items-center gap-2">
          <span className="bg-gradient-to-r from-[#FF5A4E] to-[#FF2E7E] bg-clip-text text-[26px] font-extrabold leading-none tracking-tight text-transparent">{CHAPTERS[b.step - 1].name}</span>
          <span className="rounded bg-[#FF2E7E] px-1.5 py-[1px] text-[9.5px] font-extrabold tracking-wider text-white">NEW</span>
        </div>
      ) : (
        <div className="flex h-[28px] items-center justify-between text-[11px] font-bold uppercase tracking-wider text-black/45">
          <span className="flex items-center gap-1.5">
            {CHAPTERS[b.step - 1].name}
            {CHAPTERS[b.step - 1].isNew && <span className="rounded bg-[#FF2E7E] px-1.5 py-[1px] text-[9.5px] font-extrabold tracking-wider text-white">NEW</span>}
          </span>
        </div>
      )}
      <div data-ctl={compact ? undefined : 'demo-title'} className={`mt-1 font-bold leading-tight ${compact ? 'text-[15px]' : 'text-[18px]'}`}>{b.title}</div>
      {!compact && <p className="mt-1.5 min-h-[132px] text-[14px] leading-snug text-black/70">{b.caption}</p>}
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
    if (demo === null && prev.current === BEATS.length - 1) {
      setLastDemoDone(true);
      afterDemo(s);
    }
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

const SLIDERS: { k: 't' | 'c' | 'w' | 'inv'; l: Lever; name: string; min: number; max: number; unit: '%' | '#' }[] = [
  { k: 't', l: 't', name: 'Trial start', min: -10, max: 30, unit: '%' },
  { k: 'c', l: 'c', name: 'Conversion', min: -10, max: 10, unit: '%' },
  { k: 'w', l: 'w', name: 'Paid weeks', min: -5, max: 20, unit: '%' },
  { k: 'inv', l: 'I', name: 'Invites per 100 trials', min: 0, max: 12, unit: '#' },
];
const SHORT: Record<string, string> = {
  rush: 'Many more trials, weaker conversion',
  balanced: 'Trials +10%, paid weeks +6%',
  engaged: 'Deeper use, more AI cost',
};

/** Interactive business case: the impact model's formulas and scenarios, on one page. */
function ClosingCard() {
  const { closing, setClosing, setDemo } = useStore();
  const [tab, setTab] = useState<'model' | 'sources'>('model');
  const [scen, setScen] = useState('balanced');
  const [v, setV] = useState<Levers>(SCENARIOS[1].v);
  const r = npv(v);
  const gap = r.total - r.target;
  const parts: [string, number][] = [
    ['Subscriptions from new installs', r.parts.newInstalls],
    ['Returning users starting a trial', r.parts.returning],
    ['Invited friends', r.parts.invites],
    ['Ads', r.parts.ads],
    ['Extra AI usage', r.parts.aiCost],
  ];
  const maxAbs = Math.max(...parts.map(([, x]) => Math.abs(x)));
  const MAXN = 8e6;
  const pos = (x: number) => `${Math.max(0, Math.min(100, (x / MAXN) * 100))}%`;
  return (
    <AnimatePresence>
      {closing && (
        <motion.div className="fixed inset-0 z-[300] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div data-ctl="closing-card" initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-[860px] rounded-[28px] border border-white/10 bg-[#111116] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#FF6A8E]">Remini Studio · impact model</div>
                <h2 className="mt-0.5 text-[28px] font-extrabold tracking-tight">Why it pays</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-white/[0.06] p-1">
                  {([['model', 'Scenarios'], ['sources', 'Where it comes from']] as const).map(([k, l]) => (
                    <button key={k} data-ctl={`tab-${k}`} onClick={() => setTab(k)} className={`h-8 rounded-lg px-3 text-[13px] font-semibold ${tab === k ? 'bg-white text-black' : 'text-white/60'}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <button onClick={() => setClosing(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10" aria-label="Close">✕</button>
              </div>
            </div>

            {tab === 'model' ? (
              <div className="mt-5 grid grid-cols-[230px_1fr] gap-4">
                <div className="space-y-2">
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-white/40">Scenarios</div>
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      data-ctl={`scenario-${s.id}`}
                      onClick={() => {
                        setScen(s.id);
                        setV(s.v);
                      }}
                      className={`block w-full rounded-2xl p-3 text-left transition ${scen === s.id ? 'bg-white text-black' : 'bg-white/[0.06] text-white/85 hover:bg-white/10'}`}
                    >
                      <div className="flex items-baseline justify-between text-[14px] font-bold">
                        <span>{s.name}</span>
                        <span className="tabular-nums">{fmtM(npv(s.v).total)}</span>
                      </div>
                      <div className={`mt-0.5 text-[12px] ${scen === s.id ? 'text-black/55' : 'text-white/45'}`}>{SHORT[s.id]}</div>
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl bg-gradient-to-br from-[#2a1320] to-white/[0.04] p-4 ring-1 ring-[#FF2E7E]/30">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] font-semibold text-white/70">NPV over 2 years · target $5M</span>
                      <span className={`text-[13px] font-semibold ${gap >= 0 ? 'text-[#2ED47A]' : 'text-[#FFB020]'}`}>
                        {gap >= 0 ? `✓ ${(r.total / r.target).toFixed(2)}x the target` : `${fmtM(-gap)} short`}
                      </span>
                    </div>
                    <div data-ctl="npv" className="mt-1 text-[44px] font-extrabold leading-none tabular-nums">{fmtM(r.total)}</div>
                    <div className="relative mb-1 mt-6 h-2 rounded-full bg-white/10">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all" style={{ width: pos(r.total) }} />
                      <div className="absolute bottom-[-3px] flex -translate-x-1/2 flex-col-reverse items-center" style={{ left: pos(r.target) }}>
                        <span className="h-3.5 w-[2px] bg-white" />
                        <span className="mb-1 whitespace-nowrap text-[10.5px] font-bold">$5M</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-5 gap-y-3 rounded-2xl bg-white/[0.04] p-4">
                    {SLIDERS.map((sl) => {
                      const val = sl.unit === '%' ? v[sl.k] * 100 : v[sl.k];
                      return (
                        <div key={sl.k}>
                          <div className="flex items-center justify-between text-[13px] font-semibold text-white/85">
                            <span className="flex items-center gap-2"><LeverPill l={sl.l} /> {sl.name}</span>
                            <span className="tabular-nums">{sl.unit === '%' ? pct(v[sl.k], 0) : v[sl.k]}</span>
                          </div>
                          <input
                            type="range"
                            min={sl.min}
                            max={sl.max}
                            step={1}
                            value={val}
                            data-ctl={`slider-${sl.k}`}
                            onChange={(e) => setV((cur) => ({ ...cur, [sl.k]: sl.unit === '%' ? +e.target.value / 100 : +e.target.value }))}
                            className="lever-range mt-1.5 w-full"
                            style={{ ['--fill' as string]: `${((val - sl.min) / (sl.max - sl.min)) * 100}%` }}
                            aria-label={sl.name}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-[13px]">
                    <span className="text-white/70">Revenue per install</span>
                    <span className="font-bold tabular-nums">
                      {pct(r.delivered)} <span className={`ml-2 font-semibold ${r.delivered >= r.bar ? 'text-[#2ED47A]' : 'text-[#FFB020]'}`}>needs {pct(r.bar)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <div className="text-[13px] font-bold">Where the NPV comes from</div>
                  <div className="mt-0.5 text-[11.5px] text-white/45">{SCENARIOS.find((s) => s.id === scen)?.name ?? 'Custom'} · {fmtM(r.total)}</div>
                  <div className="mt-3 space-y-2">
                    {parts.map(([k, x]) => (
                      <div key={k}>
                        <div className="flex justify-between text-[12px]">
                          <span className="text-white/70">{k}</span>
                          <span className="font-semibold tabular-nums">{fmtM(x)}</span>
                        </div>
                        <span className="mt-1 block h-1.5 rounded-full bg-white/10">
                          <span className={`block h-full rounded-full ${x >= 0 ? 'bg-[#2ED47A]' : 'bg-[#FF6A6A]'}`} style={{ width: `${(Math.abs(x) / maxAbs) * 100}%` }} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <div className="text-[13px] font-bold">The real cost is margin</div>
                  <div className="mt-3 text-[30px] font-extrabold leading-none tabular-nums">{(r.m0 * 100).toFixed(0)}% → {(r.m1 * 100).toFixed(1)}%</div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-white/65">Margin after AI compute and storage. Duo shoots and new looks are the costly part; free limits and the 7-day trial keep usage bounded.</p>
                </div>
                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <div className="text-[13px] font-bold">Why several levers</div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-white/65">The levers multiply, so each 1% counts the same. Trial rush has twice the trial lift of Balanced but earns less, because the extra trials convert worse. Studio has to change behaviour, not only add trials.</p>
                </div>
                <p className="col-span-3 text-[11px] leading-relaxed text-white/35">Same formulas as the impact model: 2 months to build, a test month on 10% of new installs, a rollout month at 50%, then everyone; 9% discount rate; AI costs at public list prices. Fictitious case data.</p>
              </div>
            )}

            <div className="mt-5 flex gap-2">
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
  const { demo } = useStore();
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
          <div className="rounded-2xl border border-white/[0.06] p-4 text-[13px] leading-relaxed text-white/50">
            <b className="text-white/80">How to explore</b>
            <br />
            Press <b className="text-white/70">Start demo</b> for the guided tour, or use the phone freely. After the demo the app stays in a full state: open the projects, the chats from the bubble, Me, and How Studio works.
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

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LEVER_META } from '../components/ui';
import { BEATS, TOTAL_STEPS } from '../state/demo';
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
    why: 'The trial is offered on unfinished work the user already cares about ("Finish your Barcelona trip with Pro"), after they have seen free results, instead of a generic paywall before any use. Onboarding answers and "What are you creating?" tell us the job to be done.',
    where: 'Onboarding question, What are you creating?, Enhance all, the unfinished-work paywall, Trending from Remini.',
  },
  c: {
    why: 'During the 7 days, value builds up in the Studio: a remembered identity, creations that are half done, results that are kept. Cancelling means walking away from work in progress, not from one image.',
    where: 'Starter creation, Remember me, Improve likeness, the unfinished-work paywall.',
  },
  w: {
    why: 'Reasons to open the app every week: a creation waiting at "3 of 5", trends that run on your saved Me in seconds, community styles to remix, results that are kept automatically.',
    where: 'Welcome back card, Keep going, Try mine, Keep this, Make your version, notifications.',
  },
  I: {
    why: 'Every remix, challenge and published style is an invitation. A friend gets a link to make their own version with their own identity, and published styles travel like Instagram filters.',
    where: 'Styles from the community, Challenge a friend, Publish as a style, Make this with a friend.',
  },
};

export function Controls({ compact = false }: { compact?: boolean }) {
  const s = useStore();
  const { mode, setMode, demo, setDemo, resetAll, resetStack, goTab, becomeReturning } = s;
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
          Remini today is a one-shot tool: a trend, one image, a paywall, gone. <b className="text-white/85">Studio</b> keeps what people make: <b className="text-white/85">Me</b> (saved identities), <b className="text-white/85">My Creations</b> (ongoing work that saves itself) and <b className="text-white/85">Remix</b> (styles from the community). Trends keep bringing people in, and now every trend lands in the Studio.
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
        <button
          onClick={() => {
            becomeReturning();
            if (mode !== 'studio') setMode('studio');
            goTab('studio');
          }}
          className="h-9 w-full rounded-xl bg-white/[0.06] text-[12px] font-semibold text-white/80"
        >
          ⏩ 3 days later (returning user)
        </button>
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
  const { showLevers, setShowLevers, demo } = useStore();
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
                  The coloured tags on the screens mark the elements designed to stimulate four business levers. They are hypotheses to test with experiments, not measured results.
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
          Step {b.step} of {TOTAL_STEPS}
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

/** End of the guided demo: the business case, with the figures from the model. */
function ClosingCard() {
  const { closing, setClosing, setDemo } = useStore();
  const levers: [Lever, string][] = [
    ['t', 'Trial start'],
    ['c', 'Trial → paid'],
    ['w', 'Paid weeks'],
  ];
  const pos = (v: number) => `${((v - 2) / (12 - 2)) * 100}%`;
  return (
    <AnimatePresence>
      {closing && (
        <motion.div className="fixed inset-0 z-[300] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div data-ctl="closing-card" initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-[640px] rounded-[28px] border border-white/10 bg-[#111116] p-7 shadow-2xl">
            <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#FF6A8E]">Remini Studio</div>
            <h2 className="mt-1 text-[34px] font-extrabold tracking-tight">Why it pays</h2>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {levers.map(([l, name]) => (
                <div key={l} className="rounded-2xl bg-white/[0.05] p-4">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-white/75">
                    <LeverPill l={l} /> {name}
                  </div>
                  <div className="mt-2 text-[30px] font-extrabold leading-none">≈ +5.6%</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-white/55">Each lever needs about +5.6% to reach $5M NPV.</p>

            <div className="mt-5 grid grid-cols-[1fr_1.3fr] gap-2.5">
              <div className="rounded-2xl bg-white/[0.05] p-4">
                <div className="text-[13px] font-semibold text-white/75">One extra paid week per subscriber</div>
                <div className="mt-2 text-[30px] font-extrabold leading-none">≈ $7.1M</div>
                <div className="mt-1 text-[12px] text-white/50">on its own</div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#2a1320] to-white/[0.04] p-4 ring-1 ring-[#FF2E7E]/30">
                <div className="text-[13px] font-semibold text-white/75">NPV, base case</div>
                <div className="mt-2 text-[38px] font-extrabold leading-none">$5.9M</div>
                <div className="relative mt-4 h-2 rounded-full bg-white/10">
                  <div className="absolute inset-y-0 rounded-full bg-brand" style={{ left: pos(2.6), right: `calc(100% - ${pos(11.2)})` }} />
                  <div className="absolute -top-1 h-4 w-1 rounded-full bg-white" style={{ left: pos(5.9) }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[12px] text-white/55">
                  <span>Low $2.6M</span>
                  <span>High $11.2M</span>
                </div>
              </div>
            </div>

            <p className="mt-5 text-[11.5px] text-white/40">Figures from the business case model, fictitious case data.</p>
            <div className="mt-5 flex gap-2">
              <button
                data-ctl="closing-done"
                onClick={() => {
                  setClosing(false);
                  setDemo(null);
                }}
                className="h-11 flex-1 rounded-xl bg-white text-[14px] font-semibold text-black"
              >
                Finish demo
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

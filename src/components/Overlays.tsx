import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';
import { useStore } from '../state/store';
import { Img } from './Img';

export function SheetFrame({ onClose, children, tall }: { onClose: () => void; children: ReactNode; tall?: boolean }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-40 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className={`absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[28px] border-t border-white/10 bg-[#141419] ${tall ? 'max-h-[94%]' : 'max-h-[86%]'}`}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
      >
        <div className="flex justify-center pb-1 pt-2.5">
          <span className="h-1 w-10 rounded-full bg-white/25" />
        </div>
        <div className="no-scrollbar overflow-y-auto pb-[max(env(safe-area-inset-bottom),24px)]">{children}</div>
      </motion.div>
    </>
  );
}

export function GeneratingOverlay() {
  const { generating } = useStore();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!generating) return;
    setI(0);
    const step = generating.duration / generating.steps.length;
    const t = window.setInterval(() => setI((n) => Math.min(n + 1, generating.steps.length - 1)), step);
    return () => clearInterval(t);
  }, [generating]);

  return (
    <AnimatePresence>
      {generating && (
        <motion.div
          key="gen"
          className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-ink/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative h-56 w-44 overflow-hidden rounded-[22px] bg-card2">
            {generating.preview && <Img src={generating.preview} className="absolute inset-0 opacity-70" degrade label={false} />}
            <div className="shimmer absolute inset-0" />
            <motion.div
              className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-[#FF2E7E]/40 to-transparent"
              animate={{ top: ['-20%', '100%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="mt-8 flex h-6 items-center gap-2 text-[16px] font-semibold">
            <span className="spinner" />
            <AnimatePresence mode="wait">
              <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                {generating.steps[i]}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full bg-brand" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: generating.duration / 1000, ease: 'easeInOut' }} />
          </div>
          <p className="mt-4 text-[13px] text-mute">Simulated AI · concept prototype</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast() {
  const { toast } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast}
          className="pointer-events-none absolute inset-x-0 top-14 z-[70] flex justify-center px-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-semibold text-black shadow-2xl">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[11px] text-white">✓</span>
            {toast}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Pulsing ring around the element marked `data-demo=<target>`, used by the guided demo.
 * It waits for the screen to settle (layers fading in, sheets sliding up) before it
 * appears, then only follows real movement, so it never flies across the phone.
 */
export function Spotlight({ target, root }: { target: string | null; root: RefObject<HTMLDivElement> }) {
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    setRect(null);
    if (!target) return;
    let scrolled = false;
    let last: { x: number; y: number; w: number; h: number } | null = null;
    const measure = () => {
      const r = root.current;
      // Only elements on the visible screen (hidden stack layers keep theirs mounted).
      const all = Array.from(r?.querySelectorAll<HTMLElement>(`[data-demo="${target}"]`) ?? []).filter((e) => e.getClientRects().length > 0);
      const el = all.length ? all[all.length - 1] : null;
      if (!r || !el) return;
      if (!scrolled) {
        scrolled = true;
        // Scroll only the app's own scroll containers, never the phone frame.
        const v = el.closest<HTMLElement>('.overflow-y-auto');
        if (v) {
          const d = el.getBoundingClientRect().top - v.getBoundingClientRect().top;
          v.scrollTop += d - v.clientHeight / 2 + el.offsetHeight / 2;
        }
        const h = el.closest<HTMLElement>('.overflow-x-auto');
        if (h) {
          const d = el.getBoundingClientRect().left - h.getBoundingClientRect().left;
          if (d < 0 || d + el.offsetWidth > h.clientWidth) h.scrollLeft += d - 16;
        }
        return; // measure after the scroll has applied
      }
      const a = r.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const scale = a.width / r.offsetWidth || 1;
      const next = { x: (b.left - a.left) / scale, y: (b.top - a.top) / scale, w: b.width / scale, h: b.height / scale };
      if (last && Math.abs(last.x - next.x) < 2 && Math.abs(last.y - next.y) < 2 && Math.abs(last.w - next.w) < 2 && Math.abs(last.h - next.h) < 2) return;
      last = next;
      setRect(next);
    };
    // Scroll to the element right away, while the screen is still fading in; show the ring once it has settled.
    const early = [0, 60, 160].map((ms) => window.setTimeout(() => !scrolled && measure(), ms));
    let t = 0;
    const start = window.setTimeout(() => {
      measure();
      measure();
      t = window.setInterval(measure, 200);
    }, 520);
    return () => {
      early.forEach(clearTimeout);
      clearTimeout(start);
      clearInterval(t);
    };
  }, [target, root]);

  return (
    <AnimatePresence>
      {rect && target && (
        <motion.div
          key={target}
          className="pointer-events-none absolute z-[80] rounded-[20px]"
          style={{ left: rect.x - 6, top: rect.y - 6, width: rect.w + 12, height: rect.h + 12 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={{ duration: 0.25 }}
        >
          <div className="spot-ring absolute inset-0 rounded-[20px]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

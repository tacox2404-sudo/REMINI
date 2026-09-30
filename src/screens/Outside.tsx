import { motion } from 'framer-motion';
import { A, FRIEND } from '../state/data';
import { useStore } from '../state/store';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { LeverTag } from '../components/ui';
import type { Lever } from '../state/types';

function AppGlyph() {
  // Neutral stand-in app icon (not the real Remini logo).
  return (
    <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-[#0B0B0F] text-[15px] font-extrabold tracking-tight text-white ring-1 ring-white/10">
      <span className="bg-brand bg-clip-text text-transparent">R</span>
    </span>
  );
}

/** Coming back: every reason is the user's own work and friends. */
export function LockScreen() {
  const { track, resetStack, setMode, mode, goTab, creationsRef } = useStore();

  const open = (k: string) => {
    track(`notification_opened_${k}`, 'w');
    if (mode !== 'studio') setMode('studio');
    goTab('studio');
    const hasTrip = creationsRef.current.some((c) => c.id === 'trip');
    resetStack(k === 'looks' || !hasTrip ? [{ name: 'studio' }] : [{ name: 'studio' }, { name: 'creation', id: 'trip' }]);
  };

  const notes: { k: string; title: string; body: string; when: string; img: string; l: Lever }[] = [
    { k: 'trip', title: `${FRIEND} added 8 photos to Philippines trip`, body: 'From the last night. They’re waiting in your project.', when: 'now', img: A.trip(5), l: 'w' },
    { k: 'looks', title: 'New looks with your updated Me', body: 'Casual Headshot, made with your latest photos', when: '1h ago', img: A.linkedin(2), l: 'w' },
    { k: 'luca', title: 'Luca joined Philippines trip', body: 'From your link. He’s adding his photos.', when: 'Yesterday', img: A.trip(1), l: 'I' },
  ];

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0">
        <Img src={A.trip(3)} className="absolute inset-0 scale-110 blur-[2px]" label={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b1030]/70 via-[#0b0b0f]/40 to-[#0b0b0f]/80" />
      </div>
      <div className="relative flex h-full flex-col items-center pt-[64px]">
        <I.Lock size={18} className="text-white/80" />
        <div className="mt-2 text-[17px] font-semibold text-white/85">Saturday 3 October</div>
        <div className="text-[92px] font-bold leading-[1] tracking-tight" style={{ fontFeatureSettings: '"tnum"' }}>
          9:41
        </div>
        <div className="mt-8 w-full space-y-2 px-3">
          {notes.map((n, i) => (
            <motion.button
              key={n.k}
              data-demo={`notif-${n.k}`}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.25, type: 'spring', stiffness: 300, damping: 26 }}
              onClick={() => open(n.k)}
              className="relative flex w-full items-center gap-3 rounded-[22px] bg-white/[0.16] p-3 text-left backdrop-blur-2xl active:bg-white/25"
            >
              <AppGlyph />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[12px] text-white/60">
                  <span className="font-semibold uppercase tracking-wide">Remini</span>
                  <span>{n.when}</span>
                </div>
                <div className="truncate text-[14px] font-semibold">{n.title}</div>
                <div className="truncate text-[13px] text-white/75">{n.body}</div>
              </div>
              <Img src={n.img} className="h-10 w-10 shrink-0 rounded-lg" label={false} />
              <LeverTag l={n.l} />
            </motion.button>
          ))}
        </div>
        <button onClick={() => resetStack([], -1)} className="mb-7 mt-auto flex flex-col items-center gap-2 text-[13px] text-white/60">
          Tap to unlock
          <span className="h-[5px] w-[134px] rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
}

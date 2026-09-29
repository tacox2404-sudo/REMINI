import { motion } from 'framer-motion';
import { A, FRIEND, friendsTrip, linkedinSet } from '../state/data';
import { useStore } from '../state/store';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { LeverTag } from '../components/ui';

function AppGlyph() {
  // Neutral stand-in app icon (not the real Remini logo).
  return (
    <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-[#0B0B0F] text-[15px] font-extrabold tracking-tight text-white ring-1 ring-white/10">
      <span className="bg-brand bg-clip-text text-transparent">R</span>
    </span>
  );
}

export function LockScreen() {
  const s = useStore();
  const { track, resetStack, setMode, mode, goTab, creationsRef, upsertCreation, friend } = s;

  const open = (which: 'linkedin' | 'friend' | 'trip') => {
    track(`notification_opened_${which}`, 'w');
    if (mode !== 'studio') setMode('studio');
    goTab('studio');
    if (which === 'linkedin' && !creationsRef.current.some((c) => c.id === 'linkedin')) upsertCreation(linkedinSet(3));
    if (which === 'trip' && !creationsRef.current.some((c) => c.id === 'trip')) upsertCreation(friendsTrip(17));
    resetStack(which === 'friend' ? [{ name: 'studio' }] : [{ name: 'studio' }, { name: 'creation', id: which }]);
  };
  void friend;

  const notes = [
    { k: 'linkedin' as const, title: 'Your LinkedIn set is 3 of 5 done', body: 'Two more and it is ready. Continue?', when: 'now', img: A.linkedin(2) },
    { k: 'trip' as const, title: 'Luca added 6 photos to Friends trip', body: 'They already have the album’s Golden hour style', when: '1h ago', img: A.trip(3) },
    { k: 'friend' as const, title: `${FRIEND}’s 90s film style passed 12k remixes`, body: 'Your version is one of them', when: '9:00', img: A.together90s },
  ];

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0">
        <Img src={A.trip(3)} className="absolute inset-0 scale-110 blur-[2px]" label={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b1030]/70 via-[#0b0b0f]/40 to-[#0b0b0f]/80" />
      </div>
      <div className="relative flex h-full flex-col items-center pt-[64px]">
        <I.Lock size={18} className="text-white/80" />
        <div className="mt-2 text-[17px] font-semibold text-white/85">Tuesday 29 September</div>
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
              <LeverTag l={n.k === 'friend' ? 'I' : 'w'} />
            </motion.button>
          ))}
        </div>
        <button onClick={() => resetStack([], -1)} className="mt-auto mb-7 flex flex-col items-center gap-2 text-[13px] text-white/60">
          Tap to unlock
          <span className="h-[5px] w-[134px] rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
}


import { motion } from 'framer-motion';
import { useState } from 'react';
import { A, SEGMENTS } from '../state/data';
import { useStore } from '../state/store';
import { Wordmark } from '../components/Chrome';
import { Img } from '../components/Img';
import { LeverTag, PillWhite } from '../components/ui';

/** Entry paths built in the prototype. */
const OPEN = ['profile', 'restore'];

/** Photo permission, then Remini's "What brings you to Remini?" question. */
export function OnboardingScreen({ start }: { start?: 'question' }) {
  const { answerSegment, track, mode, showToast } = useStore();
  const [step, setStep] = useState<'permission' | 'question'>(start ?? 'permission');

  if (step === 'permission')
    return (
      <div className="relative flex h-full flex-col">
        <div className="grid flex-1 grid-cols-3 gap-1 p-1 opacity-60">
          {[A.look(4), A.trip(2), A.linkedin(2), A.restored(3), A.look(6), A.trip(1), A.look(2), A.restored(2), A.look(8)].map((s, i) => (
            <Img key={i} src={s} className="rounded-lg" label={false} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-10 text-center">
          <Wordmark className="text-[40px]" />
          <p className="mt-2 text-[15px] text-white/70">Your photos, at their best.</p>
          <div className="mt-6 w-[270px] overflow-hidden rounded-[14px] bg-[#2c2c2e]/95 text-center backdrop-blur-xl">
            <div className="px-4 pb-3 pt-4">
              <div className="text-[15px] font-semibold">“Remini” Would Like to Access Your Photos</div>
              <div className="mt-1 text-[12.5px] leading-snug text-white/70">To enhance and create with the photos you choose.</div>
            </div>
            <div className="grid grid-cols-2 border-t border-white/15 text-[16px]">
              <button className="border-r border-white/15 py-2.5 text-[#0A84FF]" onClick={() => setStep('question')}>Limit Access</button>
              <button
                data-demo="allow-photos"
                className="py-2.5 font-semibold text-[#0A84FF]"
                onClick={() => {
                  track('photo_permission_granted');
                  setStep('question');
                }}
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex h-full flex-col px-5 pt-6">
      <Wordmark className="text-[22px]" />
      <h1 className="mt-6 text-[28px] font-bold leading-tight tracking-tight">What brings you to Remini?</h1>
      <p className="mt-1.5 text-[14px] text-mute">{mode === 'studio' ? 'We’ll suggest your first creation around it.' : 'We will tailor your experience.'}</p>
      <div data-demo="segments" className="relative mt-5 space-y-2">
        <LeverTag l="t" className="-right-1 -top-2" />
        {SEGMENTS.map((s, i) => (
          <motion.button
            key={s.id}
            data-demo={`segment-${s.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => (mode === 'studio' && !OPEN.includes(s.id) ? showToast(s.id === 'exploring' ? 'Sharing comes right after your first creation' : 'In this prototype: Profile or work photos, or Restore old photos') : answerSegment(s.id))}
            className={`flex h-[54px] w-full items-center gap-3 rounded-2xl bg-card px-4 text-left text-[15px] font-semibold active:bg-card2 ${mode === 'studio' && !OPEN.includes(s.id) ? 'opacity-45' : ''}`}
          >
            <span className="text-[20px]">{s.emoji}</span> {s.label}
          </motion.button>
        ))}
      </div>
      <div className="mt-auto pb-8 pt-4">
        {mode !== 'studio' && <PillWhite className="!bg-transparent !text-white/50" onClick={() => answerSegment('exploring')}>Skip</PillWhite>}
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { A, FRIENDS } from '../state/data';
import { useStore } from '../state/store';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { NavHeader, PillWhite } from '../components/ui';

/** A short video made from photos: crossfading Ken Burns slideshow. */
export function VideoTile({ srcs, className = '', big = false, onClick }: { srcs: string[]; className?: string; big?: boolean; onClick?: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % srcs.length), big ? 1500 : 1100);
    return () => clearInterval(t);
  }, [srcs.length, big]);
  return (
    <button onClick={onClick} className={`relative block overflow-hidden bg-black ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1.02 }} exit={{ opacity: 0 }} transition={{ duration: big ? 1.4 : 0.9 }}>
          <Img src={srcs[i]} className="absolute inset-0" label={false} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      {!big && (
        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black">
          <I.Play size={18} />
        </span>
      )}
      <span className="absolute bottom-2 left-2.5 flex items-center gap-1.5 text-[11px] font-semibold">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2E7E]" /> 0:10 · {srcs.length} photos
      </span>
      <div className="absolute inset-x-2 bottom-1 h-[3px] overflow-hidden rounded-full bg-white/20">
        <div className="h-full bg-white transition-all duration-700" style={{ width: `${((i + 1) / srcs.length) * 100}%` }} />
      </div>
    </button>
  );
}

/** A movie-style poster made from one photo and a title. */
export function Poster({ src, title, className = '', onClick }: { src: string; title: string; className?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`relative block overflow-hidden bg-black text-center ${className}`}>
      <Img src={src} className="absolute inset-0" label={false} style={{ filter: 'contrast(1.1) saturate(1.2)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
      <div className="absolute inset-x-0 top-3 text-[9px] font-bold tracking-[0.3em] text-white/80">A REMINI STUDIO ORIGINAL</div>
      <div className="absolute inset-x-0 bottom-9 px-2 font-black leading-[0.9] tracking-tight" style={{ fontSize: title.length > 12 ? 24 : 30 }}>
        {title}
      </div>
      <div className="absolute inset-x-0 bottom-3 text-[8.5px] font-semibold tracking-[0.2em] text-white/75">{['YOU', ...FRIENDS].join(' · ').toUpperCase()}</div>
    </button>
  );
}

export function VideoScreen({ srcs, title }: { srcs: string[]; title: string }) {
  const { pop, showToast, track } = useStore();
  return (
    <div className="flex h-full flex-col">
      <NavHeader title={title} onBack={pop} />
      <div className="min-h-0 flex-1 px-4">
        <VideoTile srcs={srcs} big className="h-full w-full rounded-[24px]" />
      </div>
      <div className="flex gap-2.5 px-4 pb-6 pt-4">
        <PillWhite onClick={() => { track('video_shared', 'I'); showToast('Shared with the album'); }}>
          <I.Share size={18} /> Share
        </PillWhite>
        <PillWhite className="!bg-white/10 !text-white" onClick={() => showToast('Saved to Gallery')}>
          <I.Download size={18} /> Save
        </PillWhite>
      </div>
    </div>
  );
}

/** First time in Studio: the value proposition, before any screen of work. */
export function StudioIntro() {
  const { replaceTop, resetStack, setOnboarded, track } = useStore();
  const pillars: [JSX.Element, string, string][] = [
    [<I.Studio key="k" />, 'Keep going', 'Your projects keep one style and save themselves: a LinkedIn set, a family archive, a trip. Come back and continue.'],
    [<I.Photos key="m" />, 'Me, remembered', 'Save your identity once, even several profiles. Trends and styles use it, with no new selfies.'],
    [<I.Users key="t" />, 'Together', 'Albums with friends: everyone adds photos, one style updates for all, and you create from them together.'],
    [<I.Enhance key="c" />, 'Create with AI', 'Chat with Remini to turn your photos and albums into new images, posters and short videos.'],
  ];
  return (
    <div data-demo="studio-intro" className="min-h-full pb-8">
      <div className="relative h-[250px] overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1.5 p-1.5 opacity-90">
          <Img src={A.linkedin(2)} className="row-span-2 rounded-2xl" label={false} />
          <Img src={A.trip(2)} className="rounded-2xl" label={false} />
          <Img src={A.restored(3)} className="rounded-2xl" label={false} />
          <Img src={A.y2kMe} className="rounded-2xl" label={false} />
          <Img src={A.trip(1)} className="rounded-2xl" label={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      </div>
      <div className="-mt-12 px-5">
        <span className="relative rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold">NEW IN REMINI</span>
        <h1 className="relative mt-3 text-[34px] font-extrabold leading-none tracking-tight">Studio</h1>
        <p className="mt-2.5 text-[16px] leading-snug text-white/80">
          Your own photo and video creations, in one place. Come back to them, make them with friends, and take them further with AI.
        </p>
        <div className="mt-5 space-y-3">
          {pillars.map(([icon, t, d], i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="flex gap-3 rounded-2xl bg-white/[0.05] p-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/20 text-[#FF6A8E]">{icon}</span>
              <div>
                <div className="text-[15px] font-bold">{t}</div>
                <div className="mt-0.5 text-[13px] leading-snug text-white/65">{d}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <PillWhite
          demo="intro-cta"
          className="mt-6"
          onClick={() => {
            track('studio_intro_continue');
            replaceTop({ name: 'onboarding', step: 'question' });
          }}
        >
          Set up my Studio
        </PillWhite>
        <button
          onClick={() => {
            setOnboarded((o) => ({ ...o, studio: true }));
            resetStack([], -1);
          }}
          className="mt-1 h-11 w-full text-[14px] font-semibold text-white/50"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useState } from 'react';
import { A, CAMERA_ROLL, TRENDS } from '../state/data';
import { useFlows } from '../state/flows';
import { useStore } from '../state/store';
import type { ResultKind } from '../state/types';
import { BeforeAfter } from '../components/BeforeAfter';
import { Wordmark } from '../components/Chrome';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { LeverTag, NavHeader, PillGhost, PillWhite } from '../components/ui';

export function ResultScreen({ kind, image, title, trendId, styleId, before }: { kind: ResultKind; image: string; title: string; trendId?: string; styleId?: string; before?: string }) {
  const { mode, pop, showToast, track, resetStack, openSheet, keepLook, goTab, runGenerating, replaceTop, styles } = useStore();
  const studio = mode === 'studio';
  const [saved, setSaved] = useState(false);
  const trend = TRENDS.find((t) => t.id === trendId);
  const style = styles.find((s) => s.id === styleId);

  const keep = () => {
    const id = keepLook(image, title);
    showToast('Kept in My Creations');
    window.setTimeout(() => {
      goTab('studio');
      resetStack([{ name: 'creation', id }]);
    }, 650);
  };

  return (
    <div className="flex h-full flex-col">
      <NavHeader title={title} onBack={pop} />
      <div className="relative min-h-0 flex-1 px-4">
        {kind === 'enhance' ? (
          <BeforeAfter after={image} before={before} className="h-full min-h-[380px] rounded-[24px]" />
        ) : (
          <motion.div initial={{ scale: 1.04, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="relative h-full min-h-[380px] overflow-hidden rounded-[24px]">
            <Img src={image} className="absolute inset-0" />
            {studio && (
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 py-1 pl-1 pr-2.5 text-[12px] font-semibold backdrop-blur">
                <Img src={A.ref(1)} className="h-5 w-5 rounded-full" label={false} /> Made with your saved Me
              </span>
            )}
          </motion.div>
        )}
      </div>
      <div className="space-y-2.5 px-4 pb-6 pt-4">
        {!studio && kind === 'trend' && (
          <>
            <PillWhite
              demo="today-download"
              onClick={() => {
                track('paywall_after_result');
                openSheet({ type: 'paywallGeneric', image, reason: 'result' });
              }}
            >
              <I.Download size={18} /> Download HD
            </PillWhite>
            <p className="text-center text-[12px] text-mute">1 of 20 photos. The rest are locked.</p>
          </>
        )}
        {!studio && kind !== 'trend' && (
          <>
            <PillWhite
              demo="save-gallery"
              disabled={saved}
              onClick={() => {
                track('saved_to_gallery');
                setSaved(true);
                showToast('Saved to Gallery');
                window.setTimeout(() => resetStack([], -1), 1000);
              }}
            >
              <I.Download size={18} /> {saved ? 'Saved' : 'Save to Gallery'}
            </PillWhite>
            <p className="text-center text-[12px] text-mute">Result goes to your camera roll. Nothing is kept in the app.</p>
          </>
        )}
        {studio && kind === 'trend' && (
          <>
            <PillWhite demo="keep-this" onClick={keep}>
              <I.Studio size={18} /> Keep this
              <LeverTag l="w" />
            </PillWhite>
            <div className="flex gap-2.5">
              <PillGhost
                demo="try-another"
                onClick={() =>
                  runGenerating({ steps: ['Same trend, another photo of you', 'Using your saved Me'], duration: 1600, preview: trend?.result2 ?? image }, () => {
                    track('trend_try_another', 'w');
                    replaceTop({ name: 'result', kind: 'trend', image: image === trend?.result ? trend?.result2 ?? image : trend?.result ?? image, title, trendId });
                  })
                }
              >
                <I.Refresh size={17} /> Try another photo
              </PillGhost>
              <PillGhost demo="with-friend" onClick={() => openSheet({ type: 'withFriend', title, image, link: `remini.app/t/${trendId ?? 'trend'}` })}>
                <I.Users size={17} /> With a friend
                <LeverTag l="I" />
              </PillGhost>
            </div>
          </>
        )}
        {studio && kind === 'remix' && (
          <>
            <div className="flex gap-2.5">
              <PillWhite demo="keep-this" onClick={() => { keepLook(image, title); showToast('Kept in My Creations'); }}>
                <I.Studio size={18} /> Keep this
                <LeverTag l="w" />
              </PillWhite>
              <PillGhost className="!h-[52px] !w-[120px] shrink-0" onClick={() => { track('remix_shared', 'I'); showToast('Shared'); }}>
                <I.Share size={17} /> Share
              </PillGhost>
            </div>
            <div className="flex gap-2.5">
              <PillGhost demo="challenge" onClick={() => openSheet({ type: 'withFriend', title: style?.title ?? title, image, link: `remini.app/r/${(style?.title ?? 'style').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, challenge: true })}>
                <I.Users size={17} /> Challenge a friend
                <LeverTag l="I" />
              </PillGhost>
              <PillGhost demo="publish" onClick={() => openSheet({ type: 'publish', image, from: style?.creator ?? '' })}>
                <I.Enhance size={17} /> Publish as a style
                <LeverTag l="I" />
              </PillGhost>
            </div>
            <p className="text-center text-[12px] text-mute">Remixes always use your own saved identity.</p>
          </>
        )}
        {studio && (kind === 'look' || kind === 'enhance') && (
          <>
            <PillWhite demo="keep-this" onClick={() => (kind === 'enhance' ? openSheet({ type: 'keepThis', photo: image, title }) : keep())}>
              <I.Studio size={18} /> Keep this
              <LeverTag l="w" />
            </PillWhite>
            <PillGhost onClick={() => { track('saved_to_gallery'); showToast('Saved to Gallery'); }}>
              <I.Download size={17} /> Save to Gallery
            </PillGhost>
          </>
        )}
      </div>
    </div>
  );
}

export function TrendScreen({ trendId }: { trendId: string }) {
  const { mode, pop } = useStore();
  const { tryTrendToday, tryTrendMine } = useFlows();
  const t = TRENDS.find((x) => x.id === trendId) ?? TRENDS[0];
  const studio = mode === 'studio';
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[430px] shrink-0">
        <Img src={t.cover} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-black/30" />
        <div className="absolute inset-x-0 top-0">
          <NavHeader onBack={pop} transparent />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4">
          {t.hot && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold">🔥 Trending from Remini</span>}
          <h1 className="mt-2 text-[32px] font-bold leading-none tracking-tight">{t.title}</h1>
          <p className="mt-2 text-[14px] text-white/70">{t.tagline}.</p>
        </div>
      </div>
      <div className="mt-auto space-y-3 px-4 pb-6 pt-5">
        {studio ? (
          <>
            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.06] p-2.5 text-[13px]">
              <Img src={A.ref(1)} className="h-8 w-8 rounded-full" label={false} />
              <span className="flex-1 text-white/80">Uses your saved <b className="text-white">Me</b>. No new selfies.</span>
            </div>
            <PillWhite demo="try-mine" onClick={() => tryTrendMine(t.id)}>
              Try mine
              <LeverTag l="w" />
            </PillWhite>
          </>
        ) : (
          <>
            <PillWhite demo="upload-selfies" onClick={() => tryTrendToday(t.id)}>
              <I.Camera size={18} /> Upload 8–12 selfies
            </PillWhite>
            <p className="text-center text-[12px] text-mute">We train a model for this pack. Takes a few minutes.</p>
          </>
        )}
      </div>
    </div>
  );
}

export function PickerScreen({ title, min = 1, max, preselect, pool, cta, onDone }: { title: string; min?: number; max: number; preselect?: number; pool?: string[]; cta: string; onDone: (p: string[]) => void }) {
  const { pop } = useStore();
  const items = pool ?? CAMERA_ROLL;
  const [sel, setSel] = useState<string[]>(preselect ? items.slice(0, Math.min(preselect, max)) : []);
  const toggle = (src: string) =>
    setSel((s) => (s.includes(src) ? s.filter((x) => x !== src) : max === 1 ? [src] : s.length < max ? [...s, src] : s));
  return (
    <div className="flex h-full flex-col">
      <NavHeader title={title} onBack={pop} />
      <div className="flex items-center gap-2 px-4 pb-3 text-[13px] text-mute">
        <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white">Recents</span>
        <span className="px-1">Selfies</span>
        <span className="px-1">Favourites</span>
        <span className="ml-auto">{min > 1 ? `${sel.length} of ${min}–${max}` : ''}</span>
      </div>
      <div className="no-scrollbar grid flex-1 auto-rows-min grid-cols-3 gap-[2px] overflow-y-auto">
        {items.map((src, i) => {
          const idx = sel.indexOf(src);
          return (
            <button key={src + i} onClick={() => toggle(src)} className="relative aspect-square">
              <Img src={src} className={`absolute inset-0 transition ${idx >= 0 ? 'scale-[0.92] rounded-lg' : ''}`} label={false} />
              <span className={`absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full border-[1.5px] text-[10px] font-bold ${idx >= 0 ? 'border-white bg-[#FF2E7E]' : 'border-white/80 bg-black/20'}`}>
                {idx >= 0 ? (max === 1 ? '✓' : idx + 1) : ''}
              </span>
            </button>
          );
        })}
      </div>
      <div className="border-t border-white/[0.06] px-4 pb-6 pt-3">
        <PillWhite demo="picker-done" disabled={sel.length < min} onClick={() => onDone(sel)}>
          {cta}
          {max > 1 && sel.length > 0 && <span className="text-black/50">· {sel.length}</span>}
        </PillWhite>
      </div>
    </div>
  );
}

export function AnimateScreen({ src, creationId }: { src: string; creationId: string }) {
  const { pop, showToast, creations, track } = useStore();
  const p = creations.find((x) => x.id === creationId);
  return (
    <div className="flex h-full flex-col">
      <NavHeader title="Animated memory" onBack={pop} />
      <div className="relative mx-4 flex-1 overflow-hidden rounded-[24px]">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1.02, 1.12, 1.02], x: [0, -10, 0], y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Img src={src} className="absolute inset-0" />
        </motion.div>
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          animate={{ left: ['-40%', '120%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-semibold backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF2E7E]" /> 0:05 · Animate (existing capability)
        </div>
      </div>
      <div className="space-y-2.5 px-4 pb-6 pt-4">
        <PillWhite onClick={() => showToast('Video saved to Gallery')}>
          <I.Download size={18} /> Save video
        </PillWhite>
        {p && (
          <PillGhost
            onClick={() => {
              track('animation_kept', 'w');
              showToast(`Added to ${p.title}`);
              pop();
            }}
          >
            <I.Studio size={18} /> Keep in {p.title}
          </PillGhost>
        )}
      </div>
    </div>
  );
}

export function GridScreen({ title, items }: { title: string; items: { src: string; title?: string }[] }) {
  const { pop } = useStore();
  const { openTrend } = useFlows();
  return (
    <div>
      <NavHeader title={title} onBack={pop} />
      <div className="grid grid-cols-2 gap-3 px-4 pt-2">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => {
              const t = TRENDS.find((x) => x.title === it.title);
              if (t) openTrend(t.id);
            }}
            className="relative h-[210px] overflow-hidden rounded-[18px] text-left"
          >
            <Img src={it.src} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            {it.title && <span className="absolute bottom-3 left-3 text-[15px] font-bold">{it.title}</span>}
          </button>
        ))}
      </div>
      <div className="h-10" />
    </div>
  );
}

export function AboutScreen() {
  const { pop, resetAll } = useStore();
  return (
    <div className="flex h-full flex-col">
      <NavHeader title="Settings" onBack={pop} />
      <div className="flex flex-1 flex-col items-center px-8 pt-16 text-center">
        <Wordmark className="text-[44px]" />
        <span className="mt-3 rounded-full border border-white/20 px-3 py-1 text-[12px] font-semibold text-white/70">Concept prototype</span>
        <p className="mt-6 text-[14px] leading-relaxed text-mute">
          Remini Studio is a design concept: Me (saved identities), My Creations (ongoing work that saves itself) and Remix (styles from the community). It is not the real app. Photos are the presenter's own, AI steps are simulated with prepared images.
        </p>
      </div>
      <div className="px-4 pb-8">
        <PillGhost
          onClick={() => {
            resetAll();
          }}
        >
          Reset prototype
        </PillGhost>
      </div>
    </div>
  );
}

export function Splash() {
  return (
    <motion.div className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-ink" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
        <Wordmark className="text-[52px]" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 text-[15px] font-semibold">
        <span className="bg-brand bg-clip-text text-transparent">Studio</span>
      </motion.div>
      <span className="absolute bottom-12 rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-white/50">Concept prototype</span>
    </motion.div>
  );
}

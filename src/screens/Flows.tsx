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
import { LeverTag, NavHeader, PillBrand, PillGhost, PillWhite } from '../components/ui';

export function ResultScreen({ kind, image, images, title, trendId, before, projectId }: { kind: ResultKind; image: string; images?: string[]; title: string; trendId?: string; styleId?: string; before?: string; projectId?: string }) {
  const { mode, pop, showToast, track, resetStack, openSheet, keepLook, keepSet, keepRestore, keepInProject, runGenerating, replaceTop, makeDuo, friend, creations } = useStore();
  const studio = mode === 'studio';
  const [saved, setSaved] = useState(false);
  const trend = TRENDS.find((t) => t.id === trendId);
  const project = creations.find((c) => c.id === projectId);

  const toProject = (id: string) => {
    showToast(`Kept in ${creations.find((c) => c.id === id)?.title ?? 'your project'}`);
    window.setTimeout(() => resetStack([{ name: 'studio' }, { name: 'creation', id }]), 600);
  };
  const saveToGallery = () => {
    track('saved_to_gallery');
    setSaved(true);
    showToast('Saved to Gallery');
  };
  const share = () => openSheet({ type: 'withFriend', title, image, link: 'remini.app/s/photo' });
  const SaveShare = () => (
    <div className="flex gap-2.5">
      <PillGhost demo="save" onClick={saveToGallery}><I.Download size={17} /> {saved ? 'Saved' : 'Save'}</PillGhost>
      <PillGhost demo="share" onClick={share}><I.Share size={17} /> Share</PillGhost>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <NavHeader title={title} onBack={pop} />
      <div className="relative min-h-0 flex-1 px-4">
        {kind === 'enhance' ? (
          <BeforeAfter after={image} before={before} className="h-full min-h-[380px] rounded-[24px]" />
        ) : images && images.length > 1 ? (
          <div className="grid h-full min-h-[380px] grid-cols-2 grid-rows-2 gap-1.5">
            {images.map((src, i) => (
              <motion.div key={src} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }} className={`relative overflow-hidden rounded-[20px] ${i === 0 ? 'row-span-2' : ''}`}>
                <Img src={src} className="absolute inset-0" />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ scale: 1.04, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="relative h-full min-h-[380px] overflow-hidden rounded-[24px]">
            <Img src={image} className="absolute inset-0" />
          </motion.div>
        )}
        {studio && (kind === 'remix' || kind === 'together' || kind === 'set' || kind === 'trend' || kind === 'look') && (
          <span className="absolute left-7 top-3 flex items-center gap-1.5 rounded-full bg-black/55 py-1 pl-1 pr-2.5 text-[12px] font-semibold backdrop-blur">
            <Img src={A.ref(1)} className="h-5 w-5 rounded-full" label={false} />
            {kind === 'together' ? `Me + ${friend}` : kind === 'remix' ? `${friend}’s style · Me` : 'With Me'}
          </span>
        )}
      </div>

      <div className="space-y-2.5 px-4 pb-6 pt-4">
        {/* Today: the usual exits only. */}
        {!studio && (
          <>
            <PillWhite demo="save-gallery" disabled={saved} onClick={() => { saveToGallery(); window.setTimeout(() => resetStack([], -1), 1000); }}>
              <I.Download size={18} /> {saved ? 'Saved' : 'Save to Gallery'}
            </PillWhite>
            <p className="text-center text-[12px] text-mute">Saved to your camera roll.</p>
          </>
        )}

        {/* A quick enhance stays quick: Save and Share as always. Keep is for photos that belong to something bigger. */}
        {studio && kind === 'enhance' && (
          <>
            <SaveShare />
            <PillBrand demo="keep-this" onClick={() => openSheet({ type: 'keepThis', photo: image, title, before })}>
              <I.Studio size={18} /> Keep in a project
              <LeverTag l="t" />
            </PillBrand>
          </>
        )}

        {studio && (kind === 'restore' || kind === 'set' || kind === 'trend' || kind === 'look' || kind === 'preset') && (
          <>
            <SaveShare />
            <PillBrand
              demo="keep-this"
              onClick={() => toProject(kind === 'restore' ? keepRestore() : kind === 'set' ? keepSet(images ?? [image]) : keepLook(image, title))}
            >
              <I.Studio size={18} /> {kind === 'restore' ? 'Keep · start a Family archive' : kind === 'set' ? 'Keep · start a LinkedIn set' : 'Keep in a project'}
              <LeverTag l="t" />
            </PillBrand>
            {kind === 'trend' && trend?.result2 && (
              <button
                onClick={() => runGenerating({ steps: ['Same trend, another photo of you'], duration: 1400, preview: trend.result2 }, () => replaceTop({ name: 'result', kind: 'trend', image: image === trend.result ? trend.result2! : trend.result, title, trendId }))}
                className="h-10 w-full text-[13px] font-semibold text-white/60"
              >
                Try another in this style
              </button>
            )}
          </>
        )}

        {/* A friend's style with your face, made inside a shared project. */}
        {studio && kind === 'remix' && (
          <>
            <PillWhite demo="keep-in-trip" onClick={() => toProject(keepInProject(projectId ?? 'trip', image, title))}>
              <I.Studio size={18} /> Keep in {project?.title ?? 'the trip'}
              <LeverTag l="w" />
            </PillWhite>
            <PillGhost demo="make-duo" onClick={() => makeDuo((r) => replaceTop(r))}>
              <I.Users size={17} /> Duo shoot with {friend}
              <LeverTag l="c" />
            </PillGhost>
          </>
        )}

        {studio && kind === 'together' && (
          <>
            <PillWhite demo="keep-in-trip" onClick={() => { keepInProject(projectId ?? 'trip', A.remix90s, '80s film · your version'); toProject(keepInProject(projectId ?? 'trip', image, title)); }}>
              <I.Studio size={18} /> Keep in {project?.title ?? 'the trip'}
              <LeverTag l="w" />
            </PillWhite>
            <SaveShare />
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
  const { pop, push } = useStore();
  return (
    <div>
      <NavHeader title={title} onBack={pop} />
      <div className="grid grid-cols-2 gap-3 px-4 pt-2">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => {
              const t = TRENDS.find((x) => x.title === it.title);
              if (t) push({ name: 'trend', trendId: t.id });
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
  const { pop, resetAll, isPro, cancelPro, showToast } = useStore();
  return (
    <div className="flex h-full flex-col">
      <NavHeader title="Settings" onBack={pop} />
      <div className="flex flex-1 flex-col items-center px-8 pt-16 text-center">
        <Wordmark className="text-[44px]" />
        <span className="mt-3 rounded-full border border-white/20 px-3 py-1 text-[12px] font-semibold text-white/70">Concept prototype</span>
        <p className="mt-6 text-[14px] leading-relaxed text-mute">
          Remini Studio is a design concept: a personal space inside Remini where you create, keep and grow your work, alone or with friends. It is not the real app. Photos are the presenter's own, AI steps are simulated with prepared images.
        </p>
      </div>
      <div className="space-y-2 px-4 pb-8">
        {isPro && (
          <PillGhost onClick={() => { cancelPro(); showToast('Pro cancelled · your projects stay'); pop(); }}>
            Cancel Pro
          </PillGhost>
        )}
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

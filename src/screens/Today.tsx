import { useState } from 'react';
import { A } from '../state/data';
import { useStore } from '../state/store';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { NavHeader, PillWhite } from '../components/ui';

/** Generic, face-free stand-ins for Remini's own sample imagery (placeholders unless provided). */
const G = (n: number) => `generic_${n}.jpg`;
/** Photos in the phone's gallery, as Enhance shows them. */
const GALLERY = [A.trip(3), A.old(2), A.trip(4), A.old(4), A.trip(6), A.old(1)];

function Tile({ src, label, className = '' }: { src: string; label?: string; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-[22px] bg-card ${className}`}>
      <Img src={src} className="absolute inset-0" label={false} />
      {label && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <span className="absolute bottom-3 left-0 right-0 text-center text-[13px] font-bold tracking-wide">{label}</span>
        </>
      )}
    </div>
  );
}

function Head({ title, emoji, right }: { title: string; emoji: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 pt-7">
      <h2 className="text-[21px] font-bold tracking-tight">
        {title} <span className="text-[19px]">{emoji}</span>
      </h2>
      {right}
    </div>
  );
}

export function useTodayActions() {
  const { push, runGenerating, replaceTop, track } = useStore();
  /** Enhance and Retouch open the gallery straight away. */
  const openGallery = (title: string) =>
    push({
      name: 'picker',
      title,
      max: 1,
      pool: GALLERY,
      cta: title === 'Retouch' ? 'Retouch' : 'Enhance',
      onDone: (picked) => {
        const src = picked[0] ?? GALLERY[0];
        const old = src.includes('archive_old');
        runGenerating({ steps: ['Uploading', old ? 'Restoring faces' : 'Enhancing details'], duration: 1600, preview: src }, () => {
          track('enhance_completed');
          replaceTop({ name: 'result', kind: 'enhance', title: 'Enhanced', image: old ? src.replace('archive_old', 'archive_restored') : src, before: old ? src : undefined });
        });
      },
    });
  return { openGallery };
}

export function TodayHome() {
  const { push, showToast } = useStore();
  const { openGallery } = useTodayActions();
  const [tab, setTab] = useState<'photos' | 'videos'>('photos');
  return (
    <div data-demo="today-home">
      <Head
        title="Retouch photos"
        emoji="⭐"
        right={<button onClick={() => openGallery('Retouch')} className="h-9 rounded-full border border-white/25 px-4 text-[14px] font-semibold">See all</button>}
      />
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        {([['FACE SCULPT', 1], ['HAIR CHANGE', 2], ['ADD MUSCLES', 3], ['NEW LOOK', 51]] as const).map(([l, n]) => (
          <button key={l} onClick={() => openGallery('Retouch')}>
            <Tile src={G(n)} label={l} className="h-[176px] w-[128px]" />
          </button>
        ))}
      </div>

      <Head title="Enhance" emoji="✨" />
      <div className="flex items-center gap-2 px-4">
        {(['photos', 'videos'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`h-11 rounded-full px-5 text-[15px] font-semibold capitalize ${tab === t ? 'bg-white text-black' : 'bg-white/[0.08]'}`}>
            {t}
          </button>
        ))}
        <button onClick={() => openGallery('Enhance')} className="ml-auto grid h-11 w-14 place-items-center rounded-full border border-white/25" aria-label="Gallery">
          <I.Grid size={20} />
        </button>
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
        {GALLERY.map((src) => (
          <button key={src} onClick={() => openGallery('Enhance')}>
            <Tile src={src} className="h-[124px] w-[124px] !rounded-[16px]" />
          </button>
        ))}
      </div>

      <Head title="Latest viral trends" emoji="💫" />
      <div className="grid grid-cols-2 gap-3 px-4">
        {['Headphones portrait', 'Racing fan-cam'].map((t, i) => (
          <button key={t} onClick={() => showToast('Opens the trend with your profile')} className="relative h-[150px] overflow-hidden rounded-[22px] text-left">
            <Img src={G(10 + i)} className="absolute inset-0" label={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute bottom-3 left-3 text-[16px] font-bold">{t}</span>
          </button>
        ))}
      </div>
      <button onClick={() => push({ name: 'today', screen: 'videos' })} className="sr-only">AI Video Gallery</button>
      <div className="h-48" />
    </div>
  );
}

/** Remini's bottom tool row. With Studio adds a Studio button first. */
export function ToolBar() {
  const { mode, push } = useStore();
  const { openGallery } = useTodayActions();
  const studio = mode === 'studio';
  const tools: { key: string; label: string; icon: keyof typeof I; onClick: () => void; badge?: boolean; active?: boolean }[] = [
    ...(studio ? [{ key: 'studio', label: 'Studio', icon: 'Studio' as const, onClick: () => push({ name: 'studio' }), badge: true }] : []),
    { key: 'enhance', label: 'Enhance', icon: 'Enhance', onClick: () => openGallery('Enhance') },
    { key: 'photos', label: 'AI Photos', icon: 'Photos', onClick: () => push({ name: 'today', screen: 'photos' }) },
    { key: 'filters', label: 'AI Filters', icon: 'Filters', onClick: () => push({ name: 'today', screen: 'filters' }) },
    { key: 'videos', label: 'AI Videos', icon: 'Videos', onClick: () => push({ name: 'today', screen: 'videos' }) },
    ...(!studio ? [{ key: 'retouch', label: 'Retouch', icon: 'Retouch' as const, onClick: () => openGallery('Retouch'), badge: true }] : []),
  ];
  return (
    <nav data-demo="tools" className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-ink via-ink/95 to-transparent px-2 pb-[max(env(safe-area-inset-bottom),16px)] pt-5">
      <div className="flex justify-around">
        {tools.map((t) => {
          const Icon = I[t.icon];
          return (
            <button key={t.key} data-demo={`tool-${t.key}`} onClick={t.onClick} className="relative flex w-[60px] flex-col items-center gap-1.5">
              <span className={`grid h-[54px] w-[54px] place-items-center rounded-[16px] ${t.badge ? 'bg-brand' : 'bg-white/[0.09]'} ${t.active ? 'ring-2 ring-white' : ''}`}>
                <Icon size={24} />
              </span>
              {t.badge && <span className="absolute -top-2 rounded-md bg-white px-1.5 text-[9px] font-extrabold text-[#FF2E7E]">NEW</span>}
              <span className="text-[11px] font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** The floating chat bubble (bottom right), as in Remini. */
export function ChatBubble() {
  const { mode, push, identities, creationsRef, upsertCreation } = useStore();
  /** With a locked profile, Remini Chat works on "My looks" with presets and filters. */
  const openChat = () => {
    if (mode !== 'studio' || !identities.length) return push({ name: 'today', screen: 'chat' });
    if (!creationsRef.current.some((c) => c.id === 'looks'))
      upsertCreation({ id: 'looks', title: 'My looks', intent: 'looks', cover: identities[0].cover, photos: [], looks: [], goal: 6, lastEdit: 'Just now', chat: [{ id: 'hello', from: 'remini', text: 'Hi! Pick a preset or filter and I’ll apply it to your locked profile. Results are kept in “My looks”.' }] });
    push({ name: 'chat', creationId: 'looks' });
  };
  return (
    <button
      data-demo="chat-bubble"
      onClick={openChat}
      className="absolute bottom-[112px] right-4 z-30 grid h-[62px] w-[62px] place-items-center rounded-full bg-ink p-[3px] shadow-2xl"
      style={{ background: 'conic-gradient(from 200deg, #FF5A4E, #FF2E7E, #B57CFF, #FFB020, #FF5A4E)' }}
      aria-label="Remini Chat"
    >
      <span className="grid h-full w-full place-items-center rounded-full bg-ink">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 11.5a7.5 7.5 0 01-10.8 6.7L4 20l1.6-4.6A7.5 7.5 0 1120 11.5z" />
          <path d="M14.5 8.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}

export function TodayScreen({ screen }: { screen: 'photos' | 'filters' | 'videos' | 'chat' | 'profile' }) {
  const { pop, push, runGenerating, showToast, track } = useStore();
  const [chatPhoto, setChatPhoto] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  if (screen === 'photos')
    return (
      <div data-demo="today-photos">
        <div className="flex items-center justify-between px-3 pt-1">
          <button onClick={pop} className="grid h-10 w-10 place-items-center" aria-label="Back"><I.Down /></button>
          <div className="flex gap-6 text-[17px] font-semibold">
            <span className="border-b-2 border-white pb-1">All</span>
            <span className="text-white/45">Photos</span>
            <span className="text-white/45">Videos</span>
          </div>
          <button onClick={() => push({ name: 'today', screen: 'profile' })} className="grid h-10 w-10 place-items-center rounded-full border border-white/20" aria-label="Profile"><I.Photos size={18} /></button>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20"><I.Photos size={18} /></span>
          <span className="flex h-10 shrink-0 items-center rounded-full bg-white/[0.09] px-4 text-[14px] font-semibold">Casual Headshot 👔</span>
          <span className="flex h-10 shrink-0 items-center px-3 text-[14px] font-semibold">Century of Fashion 🧥</span>
        </div>
        {([['Casual Headshot 👔', 15, [20, 21, 22, 23, 24, 25]], ['Century of Fashion 🧥', 12, [26, 27, 28]]] as const).map(([t, n, imgs]) => (
          <div key={t} className="mx-3 mt-4 rounded-[26px] bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[20px] font-bold">{t}</div>
                <span className="mt-1.5 inline-block rounded-lg bg-white/[0.07] px-2 py-1 text-[11px] font-bold tracking-wide">{n} PHOTOS</span>
              </div>
              <button onClick={() => showToast('Redo needs new selfies')} className="flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-semibold text-black">Redo <I.Refresh size={15} /></button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {imgs.map((g) => (
                <Img key={g} src={G(g)} className="aspect-[3/4] rounded-xl" label={false} />
              ))}
            </div>
          </div>
        ))}
        <div className="h-10" />
      </div>
    );

  if (screen === 'filters')
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-3 pt-1">
          <button onClick={pop} className="grid h-10 w-10 place-items-center" aria-label="Back"><I.Close /></button>
          <span className="text-[17px] font-bold">AI Filters</span>
          <span className="grid h-10 w-10 place-items-center"><I.Gear size={20} /></span>
        </div>
        <div className="flex flex-col items-center px-8 pt-8 text-center">
          <div className="relative h-[130px] w-[190px]">
            <Img src={G(40)} className="absolute left-0 top-2 h-[118px] w-[92px] -rotate-6 rounded-2xl" label={false} />
            <span className="absolute right-0 top-2 h-[118px] w-[92px] rotate-6 rounded-2xl bg-card2" />
          </div>
          <p className="mt-6 text-[16px] leading-snug">Pick a photo and turn it into a work of art 🎨</p>
          <PillWhite className="mt-5 !w-[240px]" onClick={() => showToast('Opens your gallery')}>Pick a Photo <I.Plus size={18} /></PillWhite>
        </div>
        <div className="mt-auto rounded-t-[26px] bg-card px-4 pb-6 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="mb-3 text-[15px] font-semibold text-white/70">Variations</div>
          <div className="grid grid-cols-4 gap-2">
            {['80s Vibes', '80s Glam', 'Viral Flash', 'Reality Glitch', 'Memory lane', 'Muscle', 'Clumsy sketch', 'Starter Pack'].map((v, i) => (
              <div key={v} className={`overflow-hidden rounded-xl bg-card2 ${i === 0 ? 'ring-2 ring-white' : ''}`}>
                <Img src={G(50 + i)} className="aspect-[5/4]" label={false} />
                <div className="truncate px-1 py-1 text-center text-[10.5px] font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (screen === 'videos')
    return (
      <div data-demo="today-videos">
        <div className="relative flex items-center justify-center px-3 pt-1">
          <button onClick={pop} className="absolute left-3 grid h-10 w-10 place-items-center" aria-label="Back"><I.Down /></button>
          <span className="py-2 text-[17px] font-bold">AI Video Gallery</span>
        </div>
        <div className="relative px-4 pt-3">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-2xl bg-white px-4 py-2.5 text-center text-[13px] text-black shadow-xl">
            <b>Tap on the cards</b> to see yourself within them ✨
          </div>
          {[['LIVE PHOTOS', 'Make your photos live'], ['AI HUG', 'Two photos, one moment']].map(([k, t], i) => (
            <div key={k} className="relative mt-8 h-[300px] overflow-hidden rounded-[22px]">
              {/* The source screenshot was dimmed behind a tooltip; lift it back up. */}
              <Img src={G(60 + i)} className="absolute inset-0" label={false} style={{ filter: 'brightness(1.9) contrast(1.05)' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <div className="text-[11px] font-bold tracking-wider text-white/60">{k}</div>
                <div className="text-[19px] font-semibold">{t}</div>
              </div>
              <button onClick={() => showToast('Opens the gallery to pick a photo')} className="absolute bottom-4 right-4 rounded-full bg-white/80 px-4 py-2 text-[14px] font-semibold text-black">Try Now</button>
            </div>
          ))}
        </div>
        <div className="h-10" />
      </div>
    );

  if (screen === 'profile')
    return (
      <div>
        <NavHeader title="Your profile" onBack={pop} />
        <div className="px-4">
          <p className="text-[14px] text-mute">Used for AI Photos and trends.</p>
          <div className="mt-4 text-[13px] font-semibold text-mute">I am a</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <span className="grid h-12 place-items-center rounded-2xl bg-white text-[15px] font-semibold text-black">Man</span>
            <span className="grid h-12 place-items-center rounded-2xl bg-white/[0.07] text-[15px] font-semibold">Woman</span>
          </div>
          <div className="mt-5 text-[13px] font-semibold text-mute">Selfies · 4</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[70, 71, 72, 73].map((n) => (
              <Img key={n} src={G(n)} className="aspect-square rounded-xl" label={false} />
            ))}
          </div>
        </div>
      </div>
    );

  // Remini Chat
  return (
    <div data-demo="today-chat" className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pt-1">
        <button onClick={pop} className="grid h-10 w-10 place-items-center" aria-label="Back"><I.Back /></button>
        <span className="text-[17px] font-bold">Remini Chat</span>
        <span className="grid h-10 w-10 place-items-center text-white/60"><I.Plus size={20} /></span>
      </div>
      <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pt-3">
        <div className="max-w-[78%] rounded-[22px] bg-card2 px-4 py-3 text-[15px] leading-snug">Hi! I'm Remini AI agent. Upload an image and enter your prompt. I'll do the rest!</div>
        <button
          onClick={() => push({ name: 'picker', title: 'Upload a photo', max: 1, pool: GALLERY, cta: 'Upload', onDone: (p) => { setChatPhoto(p[0]); pop(); } })}
          className="relative grid h-[230px] w-full place-items-center overflow-hidden rounded-[26px] bg-card2 p-[2px]"
          style={{ background: 'linear-gradient(135deg,#FF7A45,#FFB020,#FF2E7E,#B57CFF)' }}
        >
          <span className="grid h-full w-full place-items-center overflow-hidden rounded-[24px] bg-card2">
            {chatPhoto ? <Img src={chatPhoto} className="h-full w-full" label={false} /> : <span className="flex flex-col items-center gap-2 text-[16px] font-semibold"><I.Camera size={30} /> Upload a photo</span>}
          </span>
        </button>
        {reply && (
          <div className="ml-auto w-[70%] overflow-hidden rounded-[22px]">
            <Img src={reply} className="aspect-[4/5]" label={false} />
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!chatPhoto) return showToast('Upload a photo first');
          runGenerating({ steps: ['Reading your prompt', 'Editing the photo'], duration: 1600, preview: chatPhoto }, () => {
            track('today_chat_edit');
            setReply(chatPhoto);
            setPrompt('');
          });
        }}
        className="mx-4 mb-6 flex items-center gap-2 rounded-full border border-white/20 py-1.5 pl-5 pr-1.5"
      >
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Add a cute puppy" className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-white/40" />
        <button type="submit" className="grid h-11 w-11 place-items-center rounded-full bg-white/10" aria-label="Send">↑</button>
      </form>
    </div>
  );
}

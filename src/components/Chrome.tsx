import { useStore } from '../state/store';
import { I } from './Icons';
import { Img } from './Img';

export function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`fake-status pointer-events-none flex h-[50px] shrink-0 items-end justify-between px-8 pb-2 text-[16px] font-semibold ${dark ? 'text-black' : 'text-white'}`}>
      <span className="w-14 text-center">9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.3 10.3 0 008 .4 10.3 10.3 0 00.8 3.3L2 4.6a8.5 8.5 0 016-2.4zm0 3.6c1.3 0 2.6.5 3.5 1.4l1.3-1.3A6.7 6.7 0 008 4a6.7 6.7 0 00-4.8 1.9l1.3 1.3c.9-.9 2.2-1.4 3.5-1.4zm0 3.6c.5 0 .9.2 1.2.5L8 11.3 6.8 9.9c.3-.3.7-.5 1.2-.5z" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="19" height="9" rx="2" fill="currentColor" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`font-extrabold tracking-[-0.04em] ${className}`}>Remini</span>;
}

export function TopBar() {
  const { push, mode, isPro, identities } = useStore();
  return (
    <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between bg-ink/95 px-4 backdrop-blur-xl">
      <Wordmark className="text-[30px]" />
      <div className="flex items-center gap-3">
        {isPro && (
          <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-white/10 px-2 text-[11px] font-extrabold tracking-wide">
            <span className="bg-brand bg-clip-text text-transparent">PRO</span> ✓
          </span>
        )}
        <button aria-label="Settings" onClick={() => push({ name: 'about' })} className="text-white/90 active:text-white">
          <I.Gear size={24} />
        </button>
        <button
          aria-label="Profile"
          data-demo="avatar"
          onClick={() => (mode === 'studio' && identities.length ? push({ name: 'identity', id: identities[0].id }) : push({ name: 'today', screen: 'profile' }))}
          className="relative h-10 w-10 rounded-full ring-1 ring-white/20"
        >
          {mode === 'studio' && identities.length ? <Img src={identities[0].cover} className="h-full w-full rounded-full" label={false} /> : <span className="grid h-full w-full place-items-center rounded-full bg-white/10"><I.Photos size={18} /></span>}
          <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-white text-black"><I.Retouch size={10} /></span>
        </button>
      </div>
    </div>
  );
}


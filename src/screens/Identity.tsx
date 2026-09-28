import { useState } from 'react';
import { A, INTENTS } from '../state/data';
import { startIntent } from '../state/intent';
import { useStore } from '../state/store';
import type { Intent } from '../state/types';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { LeverTag, NavHeader, PillWhite } from '../components/ui';

export function IdentityScreen({ id }: { id: string }) {
  const { identities, creations, pop, push, openSheet, improveIdentity, showToast } = useStore();
  const idn = identities.find((i) => i.id === id) ?? identities[0];
  const made = creations.flatMap((c) => c.looks).slice(0, 9);
  const strong = idn.refs.length >= 6;

  return (
    <div className="relative min-h-full pb-10">
      <NavHeader title="" onBack={pop} right={<button onClick={() => openSheet({ type: 'privacy' })} className="grid h-10 w-10 place-items-center"><I.Shield size={20} /></button>} />
      <div className="flex flex-col items-center px-4">
        <span className="rounded-full bg-brand p-[3px]">
          <Img src={idn.cover} className="h-24 w-24 rounded-full ring-4 ring-ink" label={false} />
        </span>
        <h1 className="mt-3 text-[26px] font-bold tracking-tight">{idn.name}</h1>
        <div className="mt-1 text-[13px] text-mute">
          Remembered from {idn.refs.length} photos · <span className={strong ? 'text-[#2ED47A]' : 'text-[#FFB020]'}>{strong ? 'great likeness' : 'good likeness'}</span>
        </div>
      </div>

      <div data-demo="identity-refs" className="px-4 pt-6">
        <div className="grid grid-cols-4 gap-2">
          {idn.refs.slice(0, 8).map((r, i) => (
            <Img key={r + i} src={r} className="aspect-square rounded-xl" label={false} />
          ))}
        </div>
        <p className="mt-2 text-[12px] text-mute">Every trend, remix and creation uses these. You never upload selfies again.</p>
        {!strong && (
          <button
            onClick={() =>
              push({
                name: 'picker',
                title: 'Add 2 more photos',
                min: 2,
                max: 2,
                pool: [A.ref(1), A.ref(2), A.ref(3), A.ref(4), A.enhance2Before, A.trip(7), A.trip(8)],
                cta: 'Remember these too',
                onDone: (picked) => {
                  pop();
                  improveIdentity(idn.id, picked);
                  showToast('Likeness improved');
                },
              })
            }
            className="relative mt-3 flex w-full items-center gap-3 rounded-2xl bg-[#FFB020]/10 p-3 text-left ring-1 ring-[#FFB020]/25"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#FFB020]/20 text-[#FFB020]"><I.Bolt size={16} /></span>
            <span className="flex-1 text-[13px] leading-snug"><b>Improve likeness:</b> add 2 more photos with different light</span>
            <I.Chevron size={18} className="text-mute" />
            <LeverTag l="c" />
          </button>
        )}
      </div>

      {made.length > 0 && (
        <div className="px-4 pt-6">
          <h2 className="text-[17px] font-bold">Made with {idn.name}</h2>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {made.map((l) => (
              <button key={l.id} onClick={() => push({ name: 'result', kind: 'look', image: l.src, title: l.title })} className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Img src={l.src} className="absolute inset-0" label={false} />
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => openSheet({ type: 'privacy' })} className="mx-4 mt-6 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-card p-3.5 text-left">
        <I.Lock size={18} className="text-mute" />
        <span className="flex-1 text-[13px] leading-snug text-white/80"><b className="text-white">Private to you.</b> Friends see results, never your face data. Delete anytime.</span>
      </button>
    </div>
  );
}

/** "What are you creating?": intent first, then 3 to 5 photos. Also the fake-door test design. */
export function CreateScreen() {
  const store = useStore();
  const { pop } = store;
  const [intent, setIntent] = useState<Intent | null>(null);

  return (
    <div>
      <NavHeader title="" onBack={pop} />
      <div className="px-4">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">What are you creating?</h1>
        <p className="mt-1 text-[14px] text-mute">Pick one. We will keep it going for you.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {INTENTS.map((it) => (
            <button
              key={it.id}
              data-demo={`intent-${it.id}`}
              onClick={() => {
                setIntent(it.id);
                startIntent(store, it.id);
              }}
              className={`relative h-[170px] overflow-hidden rounded-[20px] text-left active:scale-[0.98] ${intent === it.id ? 'ring-2 ring-white' : ''}`}
            >
              <Img src={it.cover} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <span className="absolute left-3 top-3 text-[20px]">{it.emoji}</span>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-[15px] font-bold leading-tight">{it.title}</div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-white/70">{it.sub}</div>
              </div>
              <LeverTag l="t" className="right-2 top-2" />
            </button>
          ))}
        </div>
        <PillWhite className="mt-5 !bg-white/10 !text-white" onClick={pop}>Not now</PillWhite>
      </div>
      <div className="h-10" />
    </div>
  );
}

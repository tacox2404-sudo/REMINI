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
  if (!idn) return <NavHeader title="Me" onBack={pop} />;
  const strong = idn.refs.length >= 6;
  const forVariant = (v: string) => creations.filter((c) => (v === 'Work' ? c.intent === 'profile' : c.id === 'paola' || c.intent === 'looks'));

  return (
    <div className="relative min-h-full pb-10">
      <NavHeader title="" onBack={pop} right={<button onClick={() => openSheet({ type: 'privacy' })} className="grid h-10 w-10 place-items-center"><I.Shield size={20} /></button>} />
      <div className="flex flex-col items-center px-4">
        <span className="rounded-full bg-brand p-[3px]">
          <Img src={idn.cover} className="h-24 w-24 rounded-full ring-4 ring-ink" label={false} />
        </span>
        <h1 className="mt-3 flex items-center gap-2 text-[26px] font-bold tracking-tight">
          {idn.name} <I.Lock size={18} className="text-[#2ED47A]" />
        </h1>
        <div className="mt-1 text-center text-[13px] text-mute">
          Locked in from {idn.refs.length} photos · <span className={strong ? 'text-[#2ED47A]' : 'text-[#FFB020]'}>{strong ? 'great likeness' : 'good likeness'}</span>
        </div>
      </div>

      <div className="px-4 pt-5">
        <div className="rounded-2xl bg-white/[0.05] p-3.5 text-[13px] leading-relaxed text-white/75">
          Your Remini profile, made special: confirmed once (“Is this you?”), kept private, and <b className="text-white">adapted to each creation</b> through versions, so a LinkedIn set and a 90s photo with a friend both look like you without new selfies.
        </div>
      </div>

      <div data-demo="me-variants" className="space-y-2.5 px-4 pt-5">
        <h2 className="text-[17px] font-bold">Versions</h2>
        {idn.variants.map((v) => (
          <div key={v.name} className="flex items-center gap-3 rounded-2xl bg-card p-3">
            <Img src={v.cover} className="h-16 w-14 shrink-0 rounded-xl" label={false} />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold">{v.name}</div>
              <div className="text-[12.5px] text-mute">For {v.usedFor}</div>
              <div className="mt-1.5 flex gap-1.5">
                {forVariant(v.name).map((c) => (
                  <button key={c.id} onClick={() => push({ name: 'creation', id: c.id })} className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[11.5px] font-semibold">
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {idn.variants.length < 2 && <div className="rounded-2xl border border-dashed border-white/15 p-3 text-[12.5px] text-mute">More versions appear as you create: an Everyday version comes with your first style from a friend.</div>}
      </div>

      <div data-demo="identity-refs" className="px-4 pt-6">
        <h2 className="text-[17px] font-bold">Locked-in photos</h2>
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {idn.refs.slice(0, 8).map((r, i) => (
            <Img key={r + i} src={r} className="aspect-square rounded-xl" label={false} />
          ))}
        </div>
        {!strong && (
          <button
            onClick={() =>
              push({
                name: 'picker',
                title: 'Add 2 more photos',
                min: 2,
                max: 2,
                pool: [A.ref(1), A.ref(2), A.ref(3), A.ref(4), A.enhance2Before],
                cta: 'Add to my profile',
                onDone: (picked) => {
                  pop();
                  improveIdentity(idn.id, picked);
                  showToast('Likeness improved for every version');
                },
              })
            }
            className="relative mt-3 flex w-full items-center gap-3 rounded-2xl bg-[#FFB020]/10 p-3 text-left ring-1 ring-[#FFB020]/25"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#FFB020]/20 text-[#FFB020]"><I.Bolt size={16} /></span>
            <span className="flex-1 text-[13px] leading-snug"><b>Improve likeness:</b> add 2 photos with different light. Every version gets better.</span>
            <LeverTag l="c" />
          </button>
        )}
      </div>

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

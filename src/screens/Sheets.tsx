import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { A, progressOf } from '../state/data';
import { FREE_LIMIT, useStore } from '../state/store';
import type { Sheet } from '../state/types';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { SheetFrame } from '../components/Overlays';
import { LeverTag, PillBrand, PillWhite, ProgressBar } from '../components/ui';
import { fmtRemixes } from './Studio';

export function SheetHost() {
  const { sheet, closeSheet } = useStore();
  return (
    <AnimatePresence>
      {sheet && (
        <SheetFrame key={sheet.type} onClose={closeSheet} tall={sheet.type === 'paywall' || sheet.type === 'paywallGeneric'}>
          <SheetBody sheet={sheet} />
        </SheetFrame>
      )}
    </AnimatePresence>
  );
}

function SheetBody({ sheet }: { sheet: Sheet }) {
  switch (sheet.type) {
    case 'keepThis':
      return <KeepThis photo={sheet.photo} title={sheet.title} />;
    case 'paywall':
      return <PaywallUnfinished creationId={sheet.creationId} stage={sheet.stage} />;
    case 'paywallGeneric':
      return <PaywallGeneric image={sheet.image} reason={sheet.reason} />;
    case 'withFriend':
      return <WithFriend title={sheet.title} image={sheet.image} link={sheet.link} challenge={sheet.challenge} />;
    case 'publish':
      return <Publish image={sheet.image} from={sheet.from} />;
    case 'privacy':
      return <Privacy />;
    case 'rememberMe':
      return <RememberMe />;
    case 'profileToday':
      return <ProfileToday />;
  }
}

function PlanBlock({ trial, setTrial }: { trial: boolean; setTrial: (v: boolean) => void }) {
  return (
    <>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
        <span className="text-[15px] font-semibold">Free trial enabled</span>
        <button onClick={() => setTrial(!trial)} className={`relative h-[31px] w-[51px] rounded-full transition ${trial ? 'bg-[#34C759]' : 'bg-white/20'}`}>
          <span className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-all ${trial ? 'left-[22px]' : 'left-[2px]'}`} />
        </button>
      </div>
      <div className="mt-2.5 rounded-2xl p-4 ring-2 ring-[#FF2E7E]">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold">{trial ? '7-day free trial' : 'Weekly'}</span>
          {trial && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold">FREE</span>}
        </div>
        <div className="mt-0.5 text-[13px] text-mute">{trial ? 'Then billed weekly' : 'Billed weekly'}</div>
      </div>
    </>
  );
}

function KeepThis({ photo, title }: { photo: string; title: string }) {
  const { creations, closeSheet, push, keepLook, showToast, resetStack, goTab } = useStore();
  return (
    <div className="px-5 pt-2">
      <div className="flex items-center gap-3">
        <Img src={photo} className="h-14 w-14 rounded-xl" label={false} />
        <div>
          <h3 className="text-[20px] font-bold leading-tight">Keep this</h3>
          <p className="text-[13px] text-mute">It goes into one of your creations. Nothing to organise.</p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {creations.slice(0, 4).map((c) => (
          <button
            key={c.id}
            onClick={() => {
              closeSheet();
              keepLook(photo, title, c.id);
              showToast(`Kept in ${c.title}`);
              goTab('studio');
              resetStack([{ name: 'creation', id: c.id }]);
            }}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.05] p-2.5 text-left active:bg-white/10"
          >
            <Img src={c.cover} className="h-11 w-11 rounded-xl" label={false} />
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">{c.title}</span>
              <span className="block text-[12px] text-mute">{progressOf(c).label}</span>
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          closeSheet();
          push({ name: 'create' });
        }}
        className="relative mt-3 flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left text-black"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white"><I.Plus /></span>
        <span className="flex-1 text-[15px] font-bold">Something new: what are you creating?</span>
        <LeverTag l="t" />
      </button>
    </div>
  );
}

function PaywallUnfinished({ creationId, stage }: { creationId: string; stage: 'offer' | 'success' }) {
  const { creations, startTrial, finishAfterTrial, closeSheet } = useStore();
  const [trial, setTrial] = useState(true);
  const c = creations.find((x) => x.id === creationId);
  if (!c) return null;
  const pr = progressOf(c);

  if (stage === 'success')
    return (
      <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="grid h-20 w-20 place-items-center rounded-full bg-brand">
          <I.Check size={40} strokeWidth={2.6} />
        </motion.span>
        <h3 className="mt-5 text-[24px] font-bold">Your trial has started</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-mute">Finishing {c.title} now. We will remind you before the trial ends.</p>
        <PillWhite demo="finish-now" className="mt-7" onClick={() => finishAfterTrial(creationId)}>Finish {c.title}</PillWhite>
      </div>
    );

  const done = c.photos.filter((p) => p.status === 'enhanced');
  const rest = c.photos.filter((p) => p.status !== 'enhanced');
  return (
    <div data-demo="paywall-unfinished" className="relative px-5">
      <LeverTag l="t" className="right-5 top-0" />
      <LeverTag l="c" className="right-12 top-0" />
      <div className="text-center text-[12px] font-bold uppercase tracking-wider text-[#FFB020]">{done.length} of {pr.total} done free</div>
      <h3 className="mt-1.5 text-center text-[25px] font-bold leading-tight tracking-tight">Finish your {c.title} with Pro</h3>
      <ProgressBar value={done.length / pr.total} className="mt-4" />
      <div className="mt-3 grid grid-cols-6 gap-1">
        {c.photos.slice(0, 12).map((p) => (
          <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg">
            <Img src={p.enhanced ?? p.original} className="absolute inset-0" style={p.status === 'enhanced' ? undefined : { filter: 'blur(5px) brightness(.7)' }} label={false} />
            {p.status === 'enhanced' ? (
              <span className="absolute bottom-0.5 right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-white text-[8px] text-black">✓</span>
            ) : (
              <span className="absolute inset-0 grid place-items-center"><I.Lock size={12} /></span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[12px] text-mute">{rest.length} photos waiting · unlimited enhancements and your Studio, 7 days free</p>
      <PlanBlock trial={trial} setTrial={setTrial} />
      <PillBrand demo="start-trial" className="mt-4" onClick={() => startTrial(creationId)}>
        {trial ? 'Start free trial' : 'Continue'}
        <LeverTag l="t" />
      </PillBrand>
      <button onClick={closeSheet} className="mt-1 h-10 w-full text-[13px] font-semibold text-white/50">Keep my {done.length} for now</button>
    </div>
  );
}

function PaywallGeneric({ image, reason }: { image?: string; reason: 'onboarding' | 'result' }) {
  const { closeSheet, resetStack, track } = useStore();
  const [trial, setTrial] = useState(true);
  const close = () => {
    closeSheet();
    if (reason === 'result') {
      track('left_after_one_image');
      resetStack([], -1);
    }
  };
  return (
    <div data-demo="paywall-generic" className="px-5">
      <div className="relative -mx-5 -mt-1 h-[190px] overflow-hidden">
        {image ? (
          <Img src={image} className="absolute inset-0" />
        ) : (
          <div className="grid h-full grid-cols-3 gap-1 px-5">
            {[A.look(4), A.linkedin(2), A.restored(3)].map((s) => (
              <Img key={s} src={s} className="rounded-xl" label={false} />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-[#141419]/20 to-transparent" />
        <button onClick={close} aria-label="Close" className="absolute right-4 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white/80"><I.Close size={16} /></button>
      </div>
      <h3 className="relative mt-2 text-center text-[26px] font-bold leading-tight tracking-tight">Unlock Remini Pro</h3>
      <p className="mt-1.5 text-center text-[14px] text-white/70">Unlimited enhancements, all AI features, HD downloads</p>
      <PlanBlock trial={trial} setTrial={setTrial} />
      <PillBrand className="mt-4" onClick={close}>{trial ? 'Start free trial' : 'Continue'}</PillBrand>
      <button onClick={close} className="mt-1 h-10 w-full text-[13px] font-semibold text-white/50">Not now</button>
    </div>
  );
}

function WithFriend({ title, image, link, challenge }: { title: string; image: string; link: string; challenge?: boolean }) {
  const { closeSheet, track, showToast, friend } = useStore();
  const send = () => {
    track(challenge ? 'challenge_sent' : 'invite_sent', 'I');
    showToast(`Sent to ${friend}`);
    closeSheet();
  };
  return (
    <div className="px-5 pt-1">
      <h3 className="text-[20px] font-bold">{challenge ? 'Challenge a friend' : 'Make this with a friend'}</h3>
      <p className="mt-1 text-[13px] text-mute">{challenge ? 'They make their version with their own saved identity. Best one wins.' : 'They join with their own saved identity; you both appear in it.'}</p>
      {/* Message preview, as it appears in the chat app */}
      <div data-demo="invite-preview" className="mt-4 rounded-[22px] bg-[#1c1c1e] p-3">
        <div className="text-center text-[11px] text-white/40">iMessage · to {friend}</div>
        <div className="ml-auto mt-2 w-[240px] overflow-hidden rounded-[18px] bg-[#2c2c2e]">
          <Img src={image} className="h-[150px] w-full" label={false} />
          <div className="p-2.5">
            <div className="text-[13px] font-semibold leading-snug">{challenge ? `I did “${title}”. Your turn 👀` : `Make “${title}” with me`}</div>
            <div className="mt-0.5 text-[11px] text-white/50">{link}</div>
          </div>
        </div>
        <div className="ml-auto mt-1.5 w-fit rounded-[16px] bg-[#0A84FF] px-3 py-1.5 text-[13px]">{challenge ? 'bet you can’t beat this' : 'join me?'}</div>
      </div>
      <PillBrand className="mt-4" onClick={send}>
        Send to {friend}
        <LeverTag l="I" />
      </PillBrand>
      <button onClick={() => { track('invite_link_copied', 'I'); showToast('Link copied'); }} className="mt-1 h-10 w-full text-[13px] font-semibold text-white/60">Copy link</button>
    </div>
  );
}

function Publish({ image, from }: { image: string; from: string }) {
  const { publishStyle, closeSheet, goTab, resetStack, showToast } = useStore();
  const [name, setName] = useState('90s yearbook, my way');
  return (
    <div className="px-5 pt-1">
      <h3 className="text-[20px] font-bold">Publish as a style</h3>
      <p className="mt-1 text-[13px] text-mute">Name your recipe. Anyone can try it on their own saved identity, like a filter.{from ? ` Credits ${from} as the original.` : ''}</p>
      <div className="mt-4 flex gap-3">
        <Img src={image} className="h-[120px] w-[90px] shrink-0 rounded-xl" label={false} />
        <div className="flex-1">
          <label className="text-[12px] font-semibold text-mute">Style name</label>
          <input data-demo="style-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl bg-card2 px-3 text-[15px] font-semibold outline-none ring-1 ring-white/10 focus:ring-white/40" />
          <div className="mt-2 text-[12px] text-mute">by You · {fmtRemixes(0)}</div>
        </div>
      </div>
      <PillBrand
        demo="publish-confirm"
        className="mt-5"
        onClick={() => {
          publishStyle(name.trim(), image);
          closeSheet();
          showToast('Published to Styles from the community');
          goTab('studio');
          resetStack([{ name: 'section', section: 'remix' }]);
        }}
      >
        Publish
        <LeverTag l="I" />
      </PillBrand>
    </div>
  );
}

function Privacy() {
  const { closeSheet } = useStore();
  return (
    <div className="px-5 pt-1">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2ED47A]/15 text-[#2ED47A]"><I.Shield /></span>
      <h3 className="mt-3 text-[20px] font-bold">Your face data is private</h3>
      <ul className="mt-3 space-y-2.5 text-[14px] leading-snug text-white/80">
        <li>• Your saved Me is only used when you tap to create, try or remix.</li>
        <li>• Friends and the community see results, never your face data.</li>
        <li>• Remixes always use your own saved identity, never someone else's.</li>
        <li>• Delete it anytime, instantly.</li>
      </ul>
      <PillWhite className="mt-6" onClick={closeSheet}>Got it</PillWhite>
    </div>
  );
}

function RememberMe() {
  const { closeSheet, push, pop, runGenerating, rememberMe, showToast } = useStore();
  return (
    <div className="px-5 pt-1">
      <h3 className="text-[20px] font-bold">Remember me</h3>
      <p className="mt-1 text-[14px] text-mute">Save another version of you (new haircut, work look) so every tool can use it without new selfies.</p>
      <PillWhite
        className="mt-5"
        onClick={() => {
          closeSheet();
          push({
            name: 'picker',
            title: 'Pick 4 photos of you',
            min: 4,
            max: 4,
            preselect: 4,
            pool: [A.ref(3), A.ref(2), A.ref(1), A.ref(4), A.enhance2Before],
            cta: 'Remember me',
            onDone: (picked) => {
              pop();
              runGenerating({ steps: ['Checking faces', 'Learning your features', 'Remembering you'], duration: 1900, preview: picked[0] }, () => {
                rememberMe('Me · Summer', picked);
                showToast('Remembered');
              });
            },
          });
        }}
      >
        Pick 4 photos
      </PillWhite>
    </div>
  );
}

function ProfileToday() {
  const { closeSheet } = useStore();
  return (
    <div className="px-5 pt-1">
      <h3 className="text-[20px] font-bold">Account</h3>
      <div className="mt-3 space-y-2 rounded-2xl bg-white/[0.05] p-4 text-[14px]">
        <div className="flex justify-between"><span className="text-mute">Plan</span><span className="font-semibold">Free</span></div>
        <div className="flex justify-between"><span className="text-mute">History</span><span className="font-semibold">Not kept</span></div>
        <div className="flex justify-between"><span className="text-mute">Your face model</span><span className="font-semibold">Used once</span></div>
      </div>
      <p className="mt-3 text-[13px] text-mute">Results go to your camera roll. There is nothing here to come back to.</p>
      <PillWhite className="mt-5" onClick={closeSheet}>Close</PillWhite>
    </div>
  );
}

export const FREE = FREE_LIMIT;

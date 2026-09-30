import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { A, FRIEND, OTHERS, TRIPS, progressOf } from '../state/data';
import { FREE_LIMIT, useStore } from '../state/store';
import type { Sheet } from '../state/types';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { SheetFrame } from '../components/Overlays';
import { Avatar, LeverTag, PillBrand, PillWhite, ProgressBar } from '../components/ui';

export function SheetHost() {
  const { sheet, closeSheet } = useStore();
  return (
    <AnimatePresence>
      {sheet && (
        <SheetFrame key={`${sheet.type}-${sheet.type === 'withFriend' ? sheet.via ?? '' : ''}`} onClose={closeSheet} tall={sheet.type === 'paywall' || sheet.type === 'paywallGeneric' || sheet.type === 'together'}>
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
    case 'together':
      return <TogetherShowcase />;
    case 'cancelled':
      return <Cancelled />;
    case 'withFriend':
      return <WithFriend title={sheet.title} image={sheet.image} via={sheet.via} projectId={sheet.projectId} />;
    case 'privacy':
      return <Privacy />;
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
        <div className="mt-0.5 text-[13px] text-mute">{trial ? 'Then billed weekly · cancel anytime, your projects stay' : 'Billed weekly'}</div>
      </div>
    </>
  );
}

/** "Keep this in a project?": people choose what to keep and where. */
function KeepThis({ photo, title }: { photo: string; title: string }) {
  const { creations, closeSheet, push, keepLook, startTrip, showToast, resetStack, track } = useStore();
  const projects = creations.filter((c) => !c.chatOnly);
  const hasTrip = projects.some((c) => c.id === 'trip');
  const fromTrip = photo.includes('enhance2') || photo.includes('trip_') || photo.includes('me_ref_4');
  const open = (id: string) => {
    closeSheet();
    resetStack([{ name: 'studio' }, { name: 'creation', id }]);
  };
  return (
    <div className="px-5 pt-2">
      <div className="flex items-center gap-3">
        <Img src={photo} className="h-14 w-14 rounded-xl" label={false} />
        <div>
          <h3 className="text-[20px] font-bold leading-tight">Keep this in a project?</h3>
          <p className="text-[13px] text-mute">A project keeps going: all the photos, with progress.</p>
        </div>
      </div>

      {fromTrip && !hasTrip && (
        <button
          data-demo="keep-new-trip"
          onClick={() => {
            const id = startTrip();
            showToast('Philippines trip started');
            open(id);
          }}
          className="relative mt-4 block w-full rounded-2xl bg-white p-3.5 text-left text-black"
        >
          <LeverTag l="t" />
          <div className="text-[12px] font-bold uppercase tracking-wider text-[#FF2E7E]">Suggested · new project</div>
          <div className="mt-0.5 text-[18px] font-bold leading-tight">Philippines trip</div>
          <div className="text-[13px] text-black/60">16 more photos from 12–18 Sep in your gallery</div>
          <div className="mt-2.5 flex gap-1">
            {TRIPS.map((s) => (
              <Img key={s} src={s} degrade className="h-11 flex-1 rounded-lg" label={false} />
            ))}
          </div>
        </button>
      )}

      {projects.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-mute">Your projects</div>
          {projects.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                if (c.intent === 'trip' || c.intent === 'family') showToast(`Already in ${c.title}`);
                else {
                  keepLook(photo, title, c.id);
                  showToast(`Kept in ${c.title}`);
                }
                open(c.id);
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
      )}

      <button
        onClick={() => {
          closeSheet();
          push({ name: 'create' });
        }}
        className="mt-2 flex w-full items-center gap-3 rounded-2xl bg-white/[0.05] p-2.5 text-left"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><I.Plus /></span>
        <span className="flex-1 text-[15px] font-semibold">Another new project</span>
      </button>
      <button
        onClick={() => {
          closeSheet();
          track('saved_to_gallery');
          showToast('Saved to Gallery');
        }}
        className="mt-1 h-11 w-full text-[13px] font-semibold text-white/50"
      >
        No thanks, just save it
      </button>
    </div>
  );
}

/** What Together adds, shown to free users as the reason to try Pro. */
function TogetherRow() {
  return (
    <div data-demo="together-showcase" className="relative mt-4 rounded-2xl bg-white/[0.05] p-3.5">
      <LeverTag l="t" />
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {[FRIEND, ...OTHERS].map((m) => (
            <Avatar key={m} name={m} size={26} />
          ))}
        </div>
        <span className="text-[14px] font-bold">With Pro, make it together</span>
      </div>
      <ul className="mt-2 space-y-1 text-[12.5px] text-white/70">
        <li>• Invite the friends who were there into the project</li>
        <li>• Duo shoots, and friends’ styles with your own face</li>
        <li>• One Remini chat for everyone in the project</li>
      </ul>
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
        <p className="mt-2 text-[14px] leading-relaxed text-mute">Finishing {c.title} now. Together is on: invite the friends who were there.</p>
        <PillWhite demo="finish-now" className="mt-7" onClick={() => finishAfterTrial(creationId)}>Finish {c.title}</PillWhite>
      </div>
    );

  const done = c.photos.filter((p) => p.status === 'enhanced');
  const rest = c.photos.filter((p) => p.status !== 'enhanced');
  return (
    <div data-demo="paywall-unfinished" className="relative px-5">
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
      <p className="mt-2 text-center text-[12px] text-mute">{rest.length} photos waiting · your {done.length} stay yours either way</p>
      <TogetherRow />
      <PlanBlock trial={trial} setTrial={setTrial} />
      <PillBrand demo="start-trial" className="mt-4" onClick={() => startTrial(creationId)}>
        {trial ? 'Start free trial' : 'Continue'}
        <LeverTag l="t" />
      </PillBrand>
      <button onClick={closeSheet} className="mt-1 h-10 w-full text-[13px] font-semibold text-white/50">Keep my {done.length} for now</button>
    </div>
  );
}

function TogetherShowcase() {
  const { creations, startTrial, closeSheet, setFlags, showToast } = useStore();
  const [trial, setTrial] = useState(true);
  const trip = creations.find((c) => c.id === 'trip');
  return (
    <div className="px-5">
      <div className="grid grid-cols-3 gap-1.5">
        {[A.trip(1), A.trip(2), A.trip(5)].map((s) => (
          <Img key={s} src={s} className="aspect-[3/4] rounded-xl" label={false} />
        ))}
      </div>
      <h3 className="mt-4 text-center text-[24px] font-bold leading-tight tracking-tight">Make it together</h3>
      <p className="mt-1 text-center text-[13.5px] text-white/65">Your projects, with the people in them.</p>
      <TogetherRow />
      <PlanBlock trial={trial} setTrial={setTrial} />
      <PillBrand
        className="mt-4"
        onClick={() => {
          if (trip) startTrial(trip.id);
          else {
            setFlags({ isPro: true });
            closeSheet();
            showToast('Trial started · Together is on');
          }
        }}
      >
        {trial ? 'Start free trial' : 'Continue'}
        <LeverTag l="t" />
      </PillBrand>
      <button onClick={closeSheet} className="mt-1 h-10 w-full text-[13px] font-semibold text-white/50">Not now</button>
    </div>
  );
}

function Cancelled() {
  const { closeSheet } = useStore();
  return (
    <div className="px-5 pt-1">
      <h3 className="text-[20px] font-bold">Pro ended</h3>
      <p className="mt-1 text-[14px] text-mute">Your projects stay: view and download everything. Restart Pro to keep going.</p>
      <PillWhite className="mt-5" onClick={closeSheet}>OK</PillWhite>
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

const APPS: { name: string; color: string; glyph: string }[] = [
  { name: 'WhatsApp', color: '#25D366', glyph: 'W' },
  { name: 'Messages', color: '#34C759', glyph: 'M' },
  { name: 'Instagram', color: '#E1306C', glyph: 'I' },
  { name: 'TikTok', color: '#111', glyph: 'T' },
];

/**
 * Share (any photo, as today) or invite into a project. Invites go out through
 * any app; friends without Remini get a link straight into the project.
 */
function WithFriend({ title, image, via: initialVia, projectId }: { title: string; image: string; via?: string; projectId?: string }) {
  const { closeSheet, track, showToast, creations, paolaJoined, inviteFriends, friendJoins, resetStack } = useStore();
  const [via, setVia] = useState<string | null>(initialVia ?? null);
  const project = creations.find((c) => c.id === projectId);
  const joinLink = `remini.app/join/${(project?.title ?? 'you').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const pickApp = (name: string) => {
    if (project) return setVia(name);
    closeSheet();
    track(`shared_via_${name.toLowerCase()}`);
    showToast(`Shared via ${name}`);
  };

  const sendInvite = () => {
    if (!project) return;
    closeSheet();
    inviteFriends(project.id, via ?? 'link');
    showToast(`Invites sent to ${FRIEND}, Luca and Marco`);
    if (!paolaJoined)
      window.setTimeout(() => {
        friendJoins();
        showToast(`${FRIEND} joined ${project.title} from your link`);
        resetStack([{ name: 'studio' }, { name: 'creation', id: project.id }]);
      }, 1600);
  };

  // Step 2: the invite as it appears in the chosen app.
  if (via && project)
    return (
      <div className="px-5 pt-1">
        <button onClick={() => setVia(null)} className="text-[13px] font-semibold text-white/60">‹ Back</button>
        <h3 className="mt-1 text-[20px] font-bold">Invite via {via}</h3>
        <p className="mt-1 text-[13px] text-mute">Friends without Remini get a link that opens {project.title} with everyone’s photos in it.</p>
        <div data-demo="invite-preview" className="mt-4 rounded-[22px] bg-[#0b141a] p-3">
          <div className="text-center text-[11px] text-white/40">{via} · Philippines crew 🌴</div>
          <div className="ml-auto mt-2 w-[240px] overflow-hidden rounded-[14px] bg-[#005c4b]">
            <Img src={image} className="h-[150px] w-full" label={false} />
            <div className="p-2.5">
              <div className="text-[13px] font-semibold leading-snug">All our trip photos are here, enhanced. Add yours!</div>
              <div className="mt-1 rounded-lg bg-black/20 p-2 text-[11.5px]">
                <div className="font-semibold">Join {project.title} on Remini</div>
                <div className="text-white/60">{joinLink}</div>
              </div>
            </div>
          </div>
        </div>
        <PillBrand demo="send-invite" className="mt-4" onClick={sendInvite}>
          Send to the group
          <LeverTag l="I" />
        </PillBrand>
      </div>
    );

  return (
    <div className="px-5 pt-1">
      <h3 className="text-[20px] font-bold">{project ? `Invite to ${project.title}` : 'Share'}</h3>
      <div data-demo="share-apps" className="relative mt-3">
        {project && <LeverTag l="I" />}
        <div className="text-[12px] font-semibold uppercase tracking-wider text-mute">{project ? 'Send the invite through' : `Share “${title}” to`}</div>
        <div className="mt-2.5 flex justify-between">
          {APPS.map((a) => (
            <button key={a.name} data-demo={`app-${a.name.toLowerCase()}`} onClick={() => pickApp(a.name)} className="flex flex-col items-center gap-1.5 text-[11px] text-white/75">
              <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl text-[18px] font-extrabold text-white" style={{ background: a.color }}>
                {a.glyph}
              </span>
              {a.name}
            </button>
          ))}
          <button onClick={() => { track('link_copied'); showToast('Link copied'); }} className="flex flex-col items-center gap-1.5 text-[11px] text-white/75">
            <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-white/10"><I.Link size={22} /></span>
            Copy link
          </button>
        </div>
        {project && <p className="mt-2.5 text-[12px] leading-snug text-mute">Each friend adds their own photos and, if they want, their own face. Only they can add it, and they can remove it anytime.</p>}
      </div>
      {project && paolaJoined && (
        <>
          <div className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-mute">Already in</div>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/[0.05] p-2.5">
            <Img src={A.friend} className="h-10 w-10 rounded-full" label={false} />
            <span className="flex-1 text-[15px] font-semibold">{FRIEND}</span>
            <span className="text-[12px] text-mute">joined from your link</span>
          </div>
        </>
      )}
    </div>
  );
}

function Privacy() {
  const { closeSheet } = useStore();
  return (
    <div className="px-5 pt-1">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2ED47A]/15 text-[#2ED47A]"><I.Shield /></span>
      <h3 className="mt-3 text-[20px] font-bold">Your face, your call</h3>
      <ul className="mt-3 space-y-2.5 text-[14px] leading-snug text-white/80">
        <li>• Only you can add your face. Photos of you from projects are offered, never added on their own.</li>
        <li>• Friends see what you make together, never your face data.</li>
        <li>• You’re told when a friend uses your profile in a project, and you can remove it anytime.</li>
        <li>• Studio is private: projects are seen only by the people in them.</li>
      </ul>
      <PillWhite className="mt-6" onClick={closeSheet}>Got it</PillWhite>
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
        <div className="flex justify-between"><span className="text-mute">Free enhancements</span><span className="font-semibold">{FREE_LIMIT}</span></div>
      </div>
      <PillWhite className="mt-5" onClick={closeSheet}>Close</PillWhite>
    </div>
  );
}

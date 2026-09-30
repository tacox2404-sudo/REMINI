import { A, CAMERA_ROLL, INTENTS, TRIP_PHOTOS_OF_ME } from '../state/data';
import { useStore } from '../state/store';
import type { Intent } from '../state/types';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { LeverTag, NavHeader, PillWhite, ProgressBar } from '../components/ui';

/** Likeness grows with the photos you choose to add. */
const likeness = (n: number) => (n >= 9 ? { v: 0.94, label: 'Great likeness' } : n >= 7 ? { v: 0.82, label: 'Very good likeness' } : { v: 0.62, label: 'Good likeness' });

export function IdentityScreen({ id }: { id: string }) {
  const { identities, creations, newLooks, pop, push, openSheet, improveMe, removeProfile, showToast } = useStore();
  const p = identities.find((i) => i.id === id) ?? identities[0];
  if (!p) return <NavHeader title="Profile" onBack={pop} />;
  const mine = p.owner === 'me';
  const lk = likeness(p.refs.length);
  const trip = creations.find((c) => c.id === 'trip');
  const canAddFromTrip = mine && trip && !p.refs.includes(TRIP_PHOTOS_OF_ME[0]);
  const usedIn = creations.filter((c) => !c.chatOnly && (c.looks.length > 0 || c.intent === 'profile'));

  return (
    <div className="relative min-h-full pb-10">
      <NavHeader title="" onBack={pop} right={<button onClick={() => openSheet({ type: 'privacy' })} className="grid h-10 w-10 place-items-center"><I.Shield size={20} /></button>} />
      <div className="flex flex-col items-center px-4">
        <span className={`rounded-full p-[3px] ${mine ? 'bg-brand' : 'bg-white/20'}`}>
          <Img src={p.cover} className="h-24 w-24 rounded-full ring-4 ring-ink" label={false} />
        </span>
        <h1 className="mt-3 text-[26px] font-bold tracking-tight">{p.name}</h1>
        <div className="mt-0.5 text-center text-[13px] text-mute">{p.subtitle} · {p.refs.length} photos</div>
      </div>

      {mine && (
        <div data-demo="me-likeness" className="px-4 pt-5">
          <div className="rounded-2xl bg-white/[0.05] p-3.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold">{lk.label}</span>
              <span className="text-mute">improves as you add photos</span>
            </div>
            <ProgressBar value={lk.v} className="mt-2" />
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/70">
              The profile Remini already makes for AI Photos, now kept. It stays with you and gets better over time, so every project, pack and duo shoot looks more like you today.
            </p>
          </div>
        </div>
      )}

      {canAddFromTrip && (
        <div data-demo="add-to-me" className="relative mx-4 mt-3 rounded-2xl bg-card p-3.5 ring-1 ring-[#FF2E7E]/25">
          <LeverTag l="w" />
          <div className="text-[14px] font-bold">3 photos of you in {trip.title}</div>
          <div className="mt-2 flex gap-1.5">
            {TRIP_PHOTOS_OF_ME.map((s) => (
              <Img key={s} src={s} className="h-14 w-14 rounded-xl" label={false} />
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <button onClick={() => { improveMe(); showToast('Me updated · better likeness'); }} className="h-9 rounded-full bg-white px-4 text-[13px] font-semibold text-black">Add to Me</button>
            <span className="text-[11.5px] text-mute">Only you can add photos of you.</span>
          </div>
        </div>
      )}

      {mine && newLooks && (
        <button onClick={() => push({ name: 'result', kind: 'set', image: A.linkedin(1), images: [A.linkedin(1), A.linkedin(2), A.linkedin(3)], title: 'Casual Headshot' })} className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-card p-3 text-left">
          <Img src={A.linkedin(1)} className="h-12 w-12 rounded-xl" label={false} />
          <span className="flex-1">
            <span className="block text-[14px] font-bold">New looks with your updated Me</span>
            <span className="block text-[12px] text-mute">Casual Headshot · keep them if you like them</span>
          </span>
          <I.Chevron size={16} className="text-mute" />
        </button>
      )}

      <div data-demo="me-history" className="px-4 pt-5">
        <h2 className="text-[17px] font-bold">{mine ? 'How Me has grown' : `${p.name}’s profile`}</h2>
        <div className="mt-2.5 space-y-0">
          {p.history.map((h, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${i === p.history.length - 1 ? 'bg-[#FF2E7E]' : 'bg-white/30'}`} />
                {i < p.history.length - 1 && <span className="w-px flex-1 bg-white/15" />}
              </div>
              <div className="pb-3">
                <div className="text-[11.5px] text-mute">{h.when}</div>
                <div className="text-[13.5px]">{h.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mine && usedIn.length > 0 && (
        <div className="px-4 pt-3">
          <h2 className="text-[17px] font-bold">Used in</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {usedIn.map((c) => (
              <button key={c.id} onClick={() => push({ name: 'creation', id: c.id })} className="rounded-full bg-white/[0.08] px-3 py-1.5 text-[12.5px] font-semibold">
                {c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pt-5">
        <h2 className="text-[17px] font-bold">Photos</h2>
        <div className="mt-2.5 grid grid-cols-5 gap-1.5">
          {p.refs.map((r, i) => (
            <Img key={r + i} src={r} className="aspect-square rounded-xl" label={false} />
          ))}
        </div>
      </div>

      <div className="mx-4 mt-6 rounded-2xl bg-card p-3.5 text-[13px] leading-snug text-white/80">
        <b className="text-white">{mine ? 'Private to you.' : `Only ${p.name} controls this.`}</b> {mine ? 'Friends see what you make together, never your face data. You’re told when a friend uses it.' : `${p.name} added her own face for duo shoots and can remove it anytime.`}
        {mine && (
          <button onClick={() => { removeProfile(p.id); pop(); showToast('Profile removed'); }} className="mt-2 block text-[13px] font-semibold text-[#FF6A6A]">
            Remove my profile
          </button>
        )}
      </div>
    </div>
  );
}

/** "New project": what it is, then a few photos to start from. */
export function CreateScreen() {
  const s = useStore();
  const { pop } = s;
  const start = (intent: Intent) => {
    s.track(`new_project: ${intent}`, 't');
    const pool = intent === 'family' ? [1, 2, 3, 4].map(A.old) : intent === 'trip' ? CAMERA_ROLL : [...[1, 2, 3, 4].map(A.ref), A.enhance2Before, A.trip(1)];
    s.push({
      name: 'picker',
      title: 'Pick a few photos to start',
      min: 1,
      max: 5,
      preselect: 3,
      pool,
      cta: 'Create',
      onDone: (picked) => {
        s.runGenerating({ steps: ['Looking at your photos', 'Setting up the project'], duration: 1600, preview: picked[0] }, () => {
          const id = s.createFromIntent(intent, picked);
          s.pop();
          s.replaceTop({ name: 'creation', id });
        });
      },
    });
  };

  return (
    <div>
      <NavHeader title="" onBack={pop} />
      <div className="px-4">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">New project</h1>
        <p className="mt-1 text-[14px] text-mute">A job that keeps going. Add photos now or later.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {INTENTS.map((it) => (
            <button key={it.id} data-demo={`intent-${it.id}`} onClick={() => start(it.id)} className="relative h-[170px] overflow-hidden rounded-[20px] text-left active:scale-[0.98]">
              <Img src={it.cover} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <span className="absolute left-3 top-3 text-[20px]">{it.emoji}</span>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-[15px] font-bold leading-tight">{it.title}</div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-white/70">{it.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <PillWhite className="mt-5 !bg-white/10 !text-white" onClick={pop}>Not now</PillWhite>
      </div>
      <div className="h-10" />
    </div>
  );
}

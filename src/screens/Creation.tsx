import { A, FRIEND, TRIPS, progressOf } from '../state/data';
import { FREE_LIMIT, useStore } from '../state/store';
import type { ProjectPhoto } from '../state/types';
import { BeforeAfter } from '../components/BeforeAfter';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { Avatar, LeverTag, NavHeader, NewBadge, PillWhite, ProBadge, ProgressBar } from '../components/ui';
import { ProgressRing } from './Studio';

function PhotoTile({ ph, family, onOpen }: { ph: ProjectPhoto; family: boolean; onOpen: () => void }) {
  const done = ph.status === 'enhanced';
  const src = done ? ph.enhanced ?? ph.original : ph.original;
  return (
    <button onClick={onOpen} className="relative aspect-[3/4] overflow-hidden rounded-[12px] bg-card2">
      <Img src={src} degrade={!done && !family} className="absolute inset-0" label={false} />
      {ph.status === 'processing' && (
        <div className="absolute inset-0 grid place-items-center bg-black/40">
          <div className="shimmer absolute inset-0" />
          <span className="spinner relative" />
        </div>
      )}
      {done && (
        <span className="absolute bottom-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-black">
          <I.Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export function CreationScreen({ id }: { id: string }) {
  const { creations, pop, push, enhanceAll, continueCreation, openSheet, isPro, cancelled, freeUsed, processing, addRestOfTrip, showToast, track } = useStore();
  const c = creations.find((x) => x.id === id);
  if (!c) return <NavHeader title="" onBack={pop} />;
  const pr = progressOf(c);
  const photoBased = c.intent === 'trip' || c.intent === 'family';
  const remaining = c.photos.filter((p) => p.status === 'original').length;
  // Show each photo once; the rest are summarised in a "+N" tile.
  const seen = new Set<string>();
  const shown = c.photos.filter((p) => (seen.has(p.original) ? false : (seen.add(p.original), true))).slice(0, 8);
  const extra = c.photos.length - shown.length;
  const isTrip = c.id === 'trip';
  const tripStarting = isTrip && c.photos.length < 3;
  const invite = () => (isPro ? openSheet({ type: 'withFriend', title: c.title, image: c.cover, link: '', projectId: c.id }) : openSheet({ type: 'together' }));

  return (
    <div className="relative min-h-full pb-10">
      <NavHeader
        title={c.title}
        onBack={pop}
        right={
          <button data-demo="invite-top" onClick={invite} className="relative grid h-10 w-10 place-items-center rounded-full active:bg-white/10" aria-label="Invite friends">
            <I.Users size={20} />
            <LeverTag l="I" className="right-0 top-0" />
          </button>
        }
      />

      <div className="px-4 pt-1">
        <div className="flex items-center gap-3">
          <ProgressRing value={pr.done / pr.total} size={56} stroke={5} label={`${Math.round((pr.done / pr.total) * 100)}%`} />
          <div className="min-w-0 flex-1">
            <div data-demo="creation-progress" className="text-[20px] font-bold leading-tight">{pr.label}</div>
            <div className="mt-0.5 text-[12px] text-mute">{c.place ? `${c.place} · ` : ''}{c.style ? `${c.style} · ` : ''}saves itself</div>
          </div>
        </div>
        <ProgressBar value={pr.done / pr.total} className="mt-3" />
      </div>

      {cancelled && (
        <div data-demo="after-cancel" className="relative mx-4 mt-4 rounded-2xl bg-card p-3.5">
          <LeverTag l="w" />
          <div className="text-[14px] font-bold">Everything here stays yours</div>
          <div className="mt-0.5 text-[12.5px] text-mute">You’re on Free: view and download it all. Restart Pro to keep going.</div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { track('download_all_after_cancel'); showToast(`${pr.done} photos saved to Gallery`); }} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white text-[13px] font-semibold text-black"><I.Download size={15} /> Download all</button>
            <button onClick={() => openSheet({ type: 'together' })} className="h-9 flex-1 rounded-xl bg-white/10 text-[13px] font-semibold">Restart Pro</button>
          </div>
        </div>
      )}

      {c.shared && (
        <div data-demo="project-members" className="mx-4 mt-4 rounded-2xl bg-card p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center -space-x-2">
              {c.shared.members.map((m) => (
                <Avatar key={m} name={m} size={30} />
              ))}
              {c.shared.invited.map((m) => (
                <Avatar key={m} name={m} size={30} className="opacity-35" />
              ))}
            </div>
            <span className="text-[12px] text-mute">
              {c.shared.members.length} in{c.shared.invited.length ? ` · ${c.shared.invited.join(', ')} invited` : ''}
            </span>
          </div>
          {isTrip && <div className="mt-2 text-[11.5px] text-mute">Friends join free: adding photos and their own face costs nothing.</div>}
          {c.shared.feed.length > 0 && (
            <div className="mt-2.5 space-y-1">
              {c.shared.feed.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[12.5px] text-white/75">
                  <Avatar name={f.who} size={18} /> <span className="min-w-0 flex-1 truncate"><b className="text-white">{f.who}</b> {f.text}</span>
                  <span className="text-mute">{f.when}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tripStarting && (
        <div data-demo="add-rest" className="relative mx-4 mt-4 rounded-2xl bg-card p-3.5 ring-1 ring-[#FF2E7E]/30">
          <LeverTag l="t" />
          <div className="text-[15px] font-bold">{c.photos.length === 1 ? 'Your trip starts here' : 'Two photos from the same trip'}</div>
          <div className="mt-0.5 text-[12.5px] text-mute">{c.photos.length === 1 ? 'Keep more photos from it, or add them from your gallery.' : 'Add the rest from your gallery and enhance them together.'}</div>
          <button
            onClick={() =>
              push({
                name: 'picker',
                title: 'Photos from 12–18 Sep',
                min: 1,
                max: 6,
                preselect: 6,
                pool: TRIPS,
                cta: 'Add to the trip',
                onDone: () => {
                  pop();
                  addRestOfTrip();
                  showToast('Philippines trip: 17 photos');
                },
              })
            }
            className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-white text-[14px] font-semibold text-black"
          >
            <I.Plus size={16} /> Add the rest of the trip
          </button>
        </div>
      )}

      {isTrip && !tripStarting && !c.shared && !cancelled && (
        <button data-demo={isPro ? 'invite-card' : 'together-teaser'} onClick={invite} className="relative mx-4 mt-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-card p-3.5 text-left ring-1 ring-white/10">
          <LeverTag l={isPro ? 'I' : 't'} />
          <div className="flex -space-x-2">
            {[FRIEND, 'Luca', 'Marco'].map((m) => (
              <Avatar key={m} name={m} size={30} />
            ))}
          </div>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[14.5px] font-bold">Make it with the friends who were there {!isPro && <ProBadge className="!h-[18px] !text-[9.5px]" />}</span>
            <span className="block text-[12px] text-mute">{isPro ? 'Invite them: they add their photos, you create together' : 'Together comes with Pro: invites, duo shoots, one chat for all'}</span>
          </span>
          <I.Chevron size={18} className="text-mute" />
        </button>
      )}

      {photoBased && c.looks.length > 0 && (
        <div data-demo="made-here" className="px-4 pt-4">
          <div className="text-[13px] font-semibold text-white/60">Made in this project</div>
          <div className="mt-2 flex gap-2">
            {c.looks.map((l) => (
              <button key={l.id} onClick={() => push({ name: 'result', kind: 'look', image: l.src, title: l.title })} className="relative h-[120px] w-[92px] overflow-hidden rounded-xl">
                <Img src={l.src} className="absolute inset-0" label={false} />
                {l.isNew && <NewBadge className="absolute left-1 top-1" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <button data-demo="project-chat" onClick={() => push({ name: 'chat', creationId: c.id })} className="relative mx-4 mt-4 block w-[calc(100%-2rem)] rounded-[20px] p-[1.5px] text-left" style={{ background: 'linear-gradient(135deg,#FF7A45,#FF2E7E,#B57CFF)' }}>
        <LeverTag l="c" />
        <span className="flex items-center gap-3 rounded-[19px] bg-[#141419] p-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand"><I.Enhance size={20} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">Remini chat{c.shared ? ` · shared with ${c.shared.members.length}` : ''}</span>
            <span className="block text-[12.5px] leading-snug text-white/65">{c.shared ? 'Everyone in the project can ask Remini, on all the photos.' : 'Ask Remini for anything it does, on this project.'}</span>
          </span>
          <I.Chevron size={18} className="text-mute" />
        </span>
      </button>

      {photoBased ? (
        <>
          <div className="grid grid-cols-3 gap-1.5 px-4 pt-4">
            {shown.map((ph) => (
              <PhotoTile key={ph.id} ph={ph} family={c.intent === 'family'} onOpen={() => push({ name: 'photo', creationId: c.id, photoId: ph.id })} />
            ))}
            {extra > 0 && (
              <div className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-[12px] bg-card2">
                <Img src={c.photos[c.photos.length - 1].original} degrade className="absolute inset-0 opacity-50" label={false} />
                <span className="relative text-[22px] font-bold">+{extra}</span>
              </div>
            )}
          </div>
          {remaining > 0 && !cancelled && !tripStarting && (
            <div className="space-y-2 px-4 pt-4">
              <PillWhite demo="enhance-all" disabled={processing === c.id} onClick={() => enhanceAll(c.id)}>
                <I.Enhance size={18} /> {c.intent === 'family' ? 'Restore all' : 'Enhance all'} · {remaining} waiting
                <LeverTag l="t" />
              </PillWhite>
              {!isPro && <p className="text-center text-[12px] text-mute">{Math.max(0, FREE_LIMIT - freeUsed)} of {FREE_LIMIT} free enhancements left</p>}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1.5 px-4 pt-4">
            {Array.from({ length: Math.max(c.goal, c.looks.length) }, (_, i) => c.looks[i]).map((l, i) =>
              l ? (
                <button key={l.id} onClick={() => push({ name: 'result', kind: 'look', image: l.src, title: l.title })} className="relative aspect-[3/4] overflow-hidden rounded-[12px]">
                  <Img src={l.src} className="absolute inset-0" label={false} />
                  {l.isNew && <NewBadge className="absolute left-1.5 top-1.5" />}
                </button>
              ) : (
                <span key={`slot${i}`} className="grid aspect-[3/4] place-items-center rounded-[12px] border border-dashed border-white/20 text-white/35">
                  <I.Plus size={18} />
                </span>
              ),
            )}
          </div>
          {pr.done < pr.total && !cancelled && (
            <div className="px-4 pt-4">
              <PillWhite demo="make-more" onClick={() => continueCreation(c.id)}>
                <I.Enhance size={18} /> Make {pr.total - pr.done} more, same style
                <LeverTag l="w" />
              </PillWhite>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function PhotoScreen({ creationId, photoId }: { creationId: string; photoId: string }) {
  const { creations, pop, enhanceAll } = useStore();
  const c = creations.find((x) => x.id === creationId);
  const ph = c?.photos.find((x) => x.id === photoId);
  if (!c || !ph) return <NavHeader title="Photo" onBack={pop} />;
  const done = ph.status === 'enhanced';
  const family = c.intent === 'family';
  return (
    <div className="flex h-full flex-col">
      <NavHeader title={done ? (family ? 'Restored' : 'Enhanced') : 'Original'} onBack={pop} />
      <div className="flex-1 px-4 pb-4">
        {done ? (
          <BeforeAfter after={ph.enhanced ?? ph.original} before={ph.enhanced ? ph.original : undefined} className="h-full rounded-[22px]" />
        ) : (
          <div className="relative h-full overflow-hidden rounded-[22px]">
            <Img src={ph.original} degrade={!family} className="absolute inset-0" />
          </div>
        )}
      </div>
      <div className="px-4 pb-8">
        {!done ? (
          <PillWhite
            onClick={() => {
              pop();
              enhanceAll(c.id);
            }}
          >
            <I.Enhance size={18} /> {family ? 'Restore all' : 'Enhance all'}
          </PillWhite>
        ) : (
          <p className="text-center text-[13px] text-mute">Drag the handle to compare</p>
        )}
      </div>
    </div>
  );
}

export const TRIP_COVER = A.trip(1);

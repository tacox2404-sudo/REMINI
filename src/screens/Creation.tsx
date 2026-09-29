import { A, progressOf } from '../state/data';
import { FREE_LIMIT, useStore } from '../state/store';
import type { ProjectPhoto } from '../state/types';
import { BeforeAfter } from '../components/BeforeAfter';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { Avatar, LeverTag, NavHeader, NewBadge, PillWhite, ProgressBar } from '../components/ui';
import { ProgressRing } from './Studio';

/** How each album style looks on the photos (a stand-in for the real re-render). */
export const STYLE_FILTER: Record<string, string> = {
  'Golden hour film': 'saturate(1.18) sepia(0.12) contrast(1.03)',
  'Warm 35mm film': 'sepia(0.38) saturate(1.3) contrast(1.1) hue-rotate(-10deg)',
};

function PhotoTile({ ph, family, onOpen, look }: { ph: ProjectPhoto; family: boolean; onOpen: () => void; look?: string }) {
  const done = ph.status === 'enhanced';
  const src = done ? ph.enhanced ?? ph.original : ph.original;
  return (
    <button onClick={onOpen} className="relative aspect-[3/4] overflow-hidden rounded-[12px] bg-card2">
      <Img src={src} degrade={!done && !family} className="absolute inset-0 transition-[filter] duration-700" style={done && look ? { filter: STYLE_FILTER[look] } : undefined} label={false} />
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
  const { creations, pop, push, enhanceAll, continueCreation, openSheet, isPro, freeUsed, processing, identities, restyleAll } = useStore();
  const c = creations.find((x) => x.id === id);
  if (!c) return <NavHeader title="" onBack={pop} />;
  const pr = progressOf(c);
  const photoBased = c.intent === 'trip' || c.intent === 'family';
  const remaining = c.photos.filter((p) => p.status === 'original').length;
  // Show each photo once; the rest of the set is summarised in a "+N" tile.
  const seen = new Set<string>();
  const shown = c.photos.filter((p) => (seen.has(p.original) ? false : (seen.add(p.original), true))).slice(0, 8);
  const extra = c.photos.length - shown.length;
  const me = identities[0];
  const friendLink = `remini.app/c/${c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="relative min-h-full pb-10">
      <NavHeader
        title={c.title}
        onBack={pop}
        right={
          <button onClick={() => openSheet({ type: 'withFriend', title: c.title, image: c.cover, link: friendLink })} className="relative grid h-10 w-10 place-items-center rounded-full active:bg-white/10" aria-label="Make this with a friend">
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
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-mute">
              {me && <Img src={me.cover} className="h-4 w-4 rounded-full" label={false} />} {c.style ? `“${c.style}” on every photo` : `Made with ${me?.name ?? 'Remini'}`} · saves automatically
            </div>
          </div>
        </div>
        <ProgressBar value={pr.done / pr.total} className="mt-3" />
      </div>

      {c.shared && (
        <div data-demo="album-members" className="mx-4 mt-4 rounded-2xl bg-card p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {c.shared.members.map((m) => (
                <Avatar key={m} name={m} size={30} />
              ))}
            </div>
            <span className="text-[12px] text-mute">{c.shared.members.length} people · Philippines</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex-1 rounded-xl bg-white/[0.06] px-3 py-2 text-[13px]">
              <span className="text-mute">One style for everyone · </span>
              <b>{c.shared.style}</b>
            </span>
            <button data-demo="restyle-all" onClick={() => restyleAll(c.id, c.shared!.style === 'Golden hour film' ? 'Warm 35mm film' : 'Golden hour film')} className="relative h-9 shrink-0 rounded-xl bg-white px-3 text-[12.5px] font-semibold text-black">
              Change for all
              <LeverTag l="w" />
            </button>
          </div>
          <div className="mt-2.5 space-y-1">
            {c.shared.feed.slice(0, 2).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-[12.5px] text-white/75">
                <Avatar name={f.who} size={18} /> <b className="text-white">{f.who}</b> {f.text}
                <span className="ml-auto text-mute">{f.when}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button data-demo="album-chat" onClick={() => push({ name: 'chat', creationId: c.id })} className="relative mx-4 mt-3 block w-[calc(100%-2rem)] rounded-[20px] p-[1.5px] text-left" style={{ background: 'linear-gradient(135deg,#FF7A45,#FF2E7E,#B57CFF)' }}>
        <LeverTag l="w" />
        <span className="flex items-center gap-3 rounded-[19px] bg-[#141419] p-3">
          <span className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-xl bg-brand"><I.Enhance size={22} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">{c.shared ? 'Album chat · presets for everyone' : 'Remini chat · presets and filters'}</span>
            <span className="block text-[12.5px] leading-snug text-white/65">
              {c.shared ? 'Anyone in the album can apply a style or filter to all the photos at once.' : 'Apply a preset or filter to this creation with your locked profile.'}
            </span>
          </span>
          <I.Chevron size={18} className="text-mute" />
        </span>
      </button>

      {photoBased ? (
        <>
          <div className="grid grid-cols-3 gap-1.5 px-4 pt-4">
            {shown.map((ph) => (
              <PhotoTile key={ph.id} ph={ph} family={c.intent === 'family'} look={c.shared?.style ?? (c.intent === 'trip' ? c.style : undefined)} onOpen={() => push({ name: 'photo', creationId: c.id, photoId: ph.id })} />
            ))}
            {extra > 0 && (
              <div className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-[12px] bg-card2">
                <Img src={c.photos[c.photos.length - 1].original} degrade className="absolute inset-0 opacity-50" label={false} />
                <span className="relative text-[22px] font-bold">+{extra}</span>
              </div>
            )}
          </div>
          <div className="space-y-2 px-4 pt-4">
            {remaining > 0 ? (
              <PillWhite demo="enhance-all" disabled={processing === c.id} onClick={() => enhanceAll(c.id)}>
                <I.Enhance size={18} /> {c.intent === 'family' ? 'Restore all' : 'Enhance all'}
                <LeverTag l="t" />
              </PillWhite>
            ) : (
              <PillWhite onClick={() => openSheet({ type: 'withFriend', title: c.title, image: c.cover, link: friendLink })}>
                <I.Users size={18} /> Make this with a friend
              </PillWhite>
            )}
            {!isPro && remaining > 0 && (
              <p className="text-center text-[12px] text-mute">{Math.max(0, FREE_LIMIT - freeUsed)} free enhancements left</p>
            )}
          </div>
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
          <div className="px-4 pt-4">
            {pr.done < pr.total ? (
              <PillWhite demo="make-more" onClick={() => continueCreation(c.id)}>
                <I.Enhance size={18} /> {pr.done ? `Make ${pr.total - pr.done} more` : `Make my ${c.title}`}
                <LeverTag l="w" />
              </PillWhite>
            ) : (
              <PillWhite onClick={() => openSheet({ type: 'withFriend', title: c.title, image: c.cover, link: friendLink })}>
                <I.Users size={18} /> Make this with a friend
              </PillWhite>
            )}
          </div>
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

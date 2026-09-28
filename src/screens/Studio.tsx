import { A } from '../state/data';
import { useFlows } from '../state/flows';
import { useStore } from '../state/store';
import type { Project } from '../state/types';
import { TopBar } from '../components/Chrome';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { Avatar, HScroll, LeverTag, NewBadge, ProgressBar, SectionHeader } from '../components/ui';
import { AskBar } from './Chat';
import { useEffect, useState } from 'react';

export function progressOf(p: Project) {
  const done = p.photos.filter((ph) => ph.status === 'enhanced').length;
  const verb = p.template === 'archive' ? 'restored' : 'enhanced';
  if (!p.photos.length) return { done: p.looks.length ? 1 : 0, total: 1, label: `${p.looks.length} looks created` };
  return { done, total: p.photos.length, label: `${done} of ${p.photos.length} photos ${verb}` };
}

function ProjectCard({ p }: { p: Project }) {
  const { push } = useStore();
  const pr = progressOf(p);
  return (
    <button data-demo={`project-${p.id}`} onClick={() => push({ name: 'project', id: p.id })} className="w-[220px] shrink-0 overflow-hidden rounded-[20px] bg-card text-left active:scale-[0.98]">
      <div className="relative h-[140px]">
        <Img src={p.cover} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {p.lastEdit === 'Just now' && <NewBadge className="absolute left-2.5 top-2.5" />}
        <div className="absolute bottom-2 left-3 flex -space-x-1.5">
          {p.photos.slice(1, 4).map((ph) => (
            <Img key={ph.id} src={ph.enhanced ?? ph.original} className="h-7 w-7 rounded-lg ring-2 ring-card" label={false} />
          ))}
        </div>
      </div>
      <div className="p-3">
        <div className="truncate text-[15px] font-bold">{p.title}</div>
        <div className="mt-0.5 text-[12px] text-mute">{pr.label}</div>
        <ProgressBar value={pr.done / Math.max(pr.total, 1)} className="mt-2" />
        <div className="mt-2 text-[11px] text-white/45">Edited {p.lastEdit}</div>
      </div>
    </button>
  );
}

export function StudioHome() {
  const { identities, projects, looks, savedLooks, push, openSheet, runGenerating, track, createFreestyle, introSeen, setIntroSeen, demo } = useStore();
  useEffect(() => {
    if (introSeen || demo !== null) return;
    setIntroSeen(true);
    openSheet({ type: 'studioIntro' });
  }, [introSeen, demo, setIntroSeen, openSheet]);
  const { tryTrendWithIdentity } = useFlows();
  const [library, setLibrary] = useState<'latest' | 'saved'>('latest');
  const own = projects.filter((p) => !p.shared);
  const shared = projects.filter((p) => p.shared);
  const meLooks = looks.filter((l) => l.identityId === 'me');
  const hasNew = meLooks.some((l) => l.isNew);
  const firstNew = meLooks.findIndex((l) => l.isNew);

  return (
    <div>
      <TopBar />
      <div className="px-4 pb-1 pt-3">
        <h1 className="text-[30px] font-bold leading-none tracking-tight">My Studio</h1>
        <p className="mt-1.5 text-[13px] text-mute">Everything you create with Remini, kept and ready to continue</p>
        <div className="mt-4">
          <AskBar
            demo="studio-ask"
            label="Ask Remini: “me as an astronaut on a film set”"
            onOpen={() => push({ name: 'chat', projectId: createFreestyle() })}
          />
        </div>
      </div>

      {/* 1. You */}
      <div data-demo="identities" className="pb-1">
        <SectionHeader title={<span className="relative">My identities<LeverTag l="c" className="-right-5 -top-1" /></span>} sub="Train once, reuse in every tool, trend and project" />
        <HScroll className="gap-4">
          {identities.map((idn, i) => (
            <button key={idn.id} data-demo={`identity-${idn.id}`} onClick={() => push({ name: 'identity', id: idn.id })} className="flex w-[76px] shrink-0 flex-col items-center gap-2">
              <span className={`relative rounded-full p-[2.5px] ${i === 0 ? 'bg-brand' : 'bg-white/15'}`}>
                <Img src={idn.cover} className="h-[68px] w-[68px] rounded-full ring-[3px] ring-ink" label={false} />
                {i === 0 && hasNew && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-[#FF2E7E] ring-[3px] ring-ink" />}
              </span>
              <span className="line-clamp-2 text-center text-[12px] font-medium leading-tight">{idn.name}</span>
            </button>
          ))}
          <button onClick={() => openSheet({ type: 'newIdentity' })} className="flex w-[76px] shrink-0 flex-col items-center gap-2">
            <span className="grid h-[73px] w-[73px] place-items-center rounded-full border-2 border-dashed border-white/20 text-white/70">
              <I.Plus />
            </span>
            <span className="text-center text-[12px] font-medium leading-tight text-white/70">New identity</span>
          </button>
        </HScroll>
      </div>

      {/* 2. This week */}
      <SectionHeader title="New this week" sub="Trends arrive already rendered on you" />
      <div data-demo="weekly-banner" className="relative mx-4 overflow-hidden rounded-[22px] bg-card">
        <div className="flex">
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold">🔥 Trending</span>
              <div className="mt-2.5 text-[18px] font-bold leading-tight">Y2K Yearbook is trending: see it on you</div>
              <div className="mt-1 text-[12px] text-mute">Preview made with Me. No upload.</div>
            </div>
            <button onClick={() => tryTrendWithIdentity('y2k')} className="relative mt-3 flex h-10 items-center justify-center gap-1.5 rounded-full bg-white text-[14px] font-semibold text-black active:scale-95">
              Try with Me
              <LeverTag l="w" />
            </button>
          </div>
          <div className="relative w-[140px] shrink-0">
            <Img src={A.y2kMe} className="absolute inset-0" />
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">Preview · Me</span>
          </div>
        </div>
      </div>

      {/* 3. Projects */}
      <SectionHeader
        demo="continue"
        title={<span className="relative">Projects<LeverTag l="w" className="-right-5 -top-1" /></span>}
        sub="Bigger jobs you come back to"
        right={
          <button data-demo="new-project" onClick={() => push({ name: 'newProject' })} className="relative flex h-8 shrink-0 items-center gap-1 rounded-full bg-white px-3 text-[13px] font-semibold text-black active:scale-95">
            <I.Plus size={16} /> New
            <LeverTag l="t" />
          </button>
        }
      />
      <HScroll>
        {own.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </HScroll>

      {/* 4. Shared albums */}
      <SectionHeader title={<span className="relative">Shared albums<LeverTag l="I" className="-right-5 -top-1" /></span>} sub="Create together: friends add photos and ask Remini for group looks" />
      <div className="space-y-2 px-4">
        {shared.map((p) => (
          <button key={p.id} data-demo="shared-summer" onClick={() => push({ name: 'project', id: p.id })} className="flex w-full items-center gap-3 rounded-[18px] bg-card p-2.5 text-left">
            <Img src={p.cover} className="h-14 w-14 rounded-xl" label={false} />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">
                {p.title} · {p.shared!.owner} + {p.shared!.collaborators.length - 1}
              </div>
              <div className="mt-0.5 truncate text-[12px] text-mute">
                {p.shared!.feed[0].who} {p.shared!.feed[0].text} · {p.shared!.feed[0].when}
              </div>
            </div>
            <div className="flex -space-x-2">
              {p.shared!.collaborators.slice(0, 3).map((c) => (
                <Avatar key={c} name={c} size={24} />
              ))}
            </div>
          </button>
        ))}
        <button onClick={() => push({ name: 'newProject', template: 'trip' })} className="flex h-12 w-full items-center justify-center gap-1.5 rounded-[18px] border border-dashed border-white/15 text-[13px] font-semibold text-white/70">
          <I.Users size={16} /> Start a shared album
        </button>
      </div>

      {/* 5. Looks library */}
      <SectionHeader
        demo="latest-looks"
        title={<span className="relative">Looks<LeverTag l="w" className="-right-5 -top-1" /></span>}
        sub={library === 'latest' ? 'Everything made with Me, newest first' : 'Setups you can reuse on any photo'}
        right={
          <div className="flex shrink-0 rounded-full bg-white/[0.07] p-0.5 text-[12px] font-semibold">
            {(['latest', 'saved'] as const).map((k) => (
              <button key={k} onClick={() => setLibrary(k)} className={`h-7 rounded-full px-3 ${library === k ? 'bg-white text-black' : 'text-white/60'}`}>
                {k === 'latest' ? 'Latest' : 'Saved setups'}
              </button>
            ))}
          </div>
        }
      />
      {library === 'latest' ? (
        <HScroll>
          {meLooks.slice(0, 10).map((l, i) => (
            <button
              key={l.id}
              data-demo={i === firstNew ? 'new-look' : undefined}
              onClick={() => push({ name: 'result', kind: 'look', image: l.src, title: l.title })}
              className="relative h-[150px] w-[112px] shrink-0 overflow-hidden rounded-[16px]"
            >
              <Img src={l.src} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              {l.isNew && <NewBadge className="absolute left-2 top-2" />}
              <span className="absolute bottom-2 left-2 right-2 truncate text-left text-[12px] font-semibold">{l.title}</span>
            </button>
          ))}
        </HScroll>
      ) : (
        <HScroll>
          {savedLooks.map((s) => (
            <div key={s.id} className="flex w-[250px] shrink-0 items-center gap-3 rounded-[18px] bg-card p-2.5">
              <Img src={s.cover} className="h-14 w-14 shrink-0 rounded-xl" label={false} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold">{s.title}</div>
                <button
                  onClick={() =>
                    runGenerating({ steps: [`Loading "${s.title}"`, 'Generating with Me', 'Done'], duration: 1800, preview: s.cover }, () => {
                      track('saved_look_reused', 'w');
                      push({ name: 'result', kind: 'look', image: s.cover, title: s.title });
                    })
                  }
                  className="mt-1.5 flex h-7 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[12px] font-semibold active:bg-white/20"
                >
                  <I.Refresh size={13} /> Use again
                </button>
              </div>
            </div>
          ))}
        </HScroll>
      )}
      <div className="h-28" />
    </div>
  );
}

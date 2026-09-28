import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { spurs } from '../state/chat';
import { useStore } from '../state/store';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { Avatar, LeverTag, NavHeader } from '../components/ui';

function ReminiAvatar() {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-white">
      <I.Enhance size={15} />
    </span>
  );
}

export function ChatScreen({ projectId }: { projectId: string }) {
  const { projects, pop, push, sendChat, chatTyping, openSheet, identities } = useStore();
  const p = projects.find((x) => x.id === projectId);
  const [text, setText] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const msgs = p?.chat ?? [];
  const typing = chatTyping === projectId;

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs.length, typing]);

  if (!p) return <NavHeader title="Chat" onBack={pop} />;
  const identity = identities.find((i) => i.id === p.identityId) ?? identities[0];
  const send = (t: string) => {
    if (!t.trim() || typing) return;
    sendChat(p.id, t);
    setText('');
  };

  return (
    <div className="flex h-full flex-col">
      <NavHeader
        title={
          <span className="flex flex-col items-center leading-tight">
            <span className="flex items-center gap-1.5">
              <span className="bg-brand bg-clip-text text-transparent">Remini chat</span>
            </span>
            <span className="text-[11px] font-medium text-mute">{p.title}</span>
          </span>
        }
        onBack={pop}
        right={
          p.shared ? (
            <div className="flex -space-x-2 pr-2">
              {p.shared.collaborators.slice(0, 3).map((c) => (
                <Avatar key={c} name={c} size={24} />
              ))}
            </div>
          ) : (
            <Img src={identity.cover} className="mr-2 h-7 w-7 rounded-full" label={false} />
          )
        }
      />

      <div ref={list} className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-2">
        <div className="mx-auto max-w-[280px] rounded-2xl bg-white/[0.04] p-3 text-center text-[12px] leading-relaxed text-mute">
          {p.shared
            ? 'Everyone in this album can ask Remini for ideas. Results use each person’s identity and land in the album.'
            : `Describe an idea or an improvement. Remini uses your identity "${identity.name}" and saves results to "${p.title}".`}
        </div>
        {msgs.map((m) => {
          const mine = m.from === 'me';
          const bot = m.from === 'remini';
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${mine ? 'justify-end' : ''}`}>
              {bot && <ReminiAvatar />}
              {!mine && !bot && <Avatar name={m.from} size={28} />}
              <div className={`max-w-[78%] ${mine ? 'items-end' : ''} flex flex-col gap-1.5`}>
                {!mine && !bot && <span className="text-[11px] font-semibold text-mute">{m.from}</span>}
                <div className={`rounded-[18px] px-3.5 py-2.5 text-[14px] leading-snug ${mine ? 'rounded-br-md bg-white text-black' : 'rounded-bl-md bg-card2'}`}>{m.text}</div>
                {m.images && (
                  <div className={`grid gap-1.5 ${m.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {m.images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          m.action === 'animate'
                            ? push({ name: 'animate', src, projectId: p.id })
                            : push({ name: 'result', kind: 'look', image: src, title: 'From Remini chat' })
                        }
                        className={`relative overflow-hidden rounded-2xl ${m.images!.length > 1 ? 'aspect-[3/4]' : 'aspect-[4/5] w-[210px]'}`}
                      >
                        <Img src={src} className="absolute inset-0" label={false} />
                        {m.action === 'animate' && (
                          <span className="absolute inset-0 grid place-items-center bg-black/25">
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-black"><I.Play size={18} /></span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {bot && m.images && m.action !== 'animate' && <span className="text-[11px] text-[#2ED47A]">✓ Added to {p.title}</span>}
                {m.action === 'enhanced' && <span className="text-[11px] text-[#2ED47A]">✓ Enhancing all photos in the project</span>}
                {m.action === 'paywall' && (
                  <button onClick={() => openSheet({ type: 'paywall', projectId: p.id, stage: 'offer' })} className="relative mt-0.5 self-start rounded-full bg-brand px-3.5 py-2 text-[13px] font-semibold">
                    Start free trial
                    <LeverTag l="t" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <ReminiAvatar />
              <div className="flex gap-1 rounded-[18px] rounded-bl-md bg-card2 px-3.5 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-white/70" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
              <span className="text-[12px] text-mute">Creating…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.06] bg-ink pb-5 pt-2.5">
        <div data-demo="chat-spurs" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5">
          {spurs(p).map((sp) => (
            <button key={sp} onClick={() => send(sp)} disabled={typing} className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-[12.5px] font-medium text-white/85 active:bg-white/10 disabled:opacity-40">
              ✨ {sp}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="mx-4 flex items-center gap-2 rounded-full bg-card2 py-1.5 pl-4 pr-1.5 ring-1 ring-white/10 focus-within:ring-white/30"
        >
          <input
            data-demo="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={p.shared ? 'Ask Remini for the group…' : 'Describe what you want…'}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/35"
          />
          <button type="submit" disabled={!text.trim() || typing} className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-black disabled:opacity-30" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <LeverTag l="w" />
          </button>
        </form>
      </div>
    </div>
  );
}

/** Entry bar that opens the chat, used on Studio home and project pages. */
export function AskBar({ onOpen, label, demo }: { onOpen: () => void; label: string; demo?: string }) {
  return (
    <button data-demo={demo} onClick={onOpen} className="relative flex w-full items-center gap-3 rounded-full bg-card2 py-2 pl-2 pr-4 text-left ring-1 ring-white/10 active:bg-white/10">
      <ReminiAvatar />
      <span className="flex-1 truncate text-[14px] text-white/55">{label}</span>
      <span className="text-[12px] font-semibold text-[#FF6A8E]">Chat</span>
      <LeverTag l="w" />
    </button>
  );
}

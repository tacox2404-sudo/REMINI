import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { presetsFor } from '../state/chat';
import { useStore } from '../state/store';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { Avatar, LeverTag, NavHeader } from '../components/ui';

function ReminiAvatar({ size = 28 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-brand text-white" style={{ width: size, height: size }}>
      <I.Enhance size={size * 0.54} />
    </span>
  );
}

/** Remini chat, same place as today (the bubble). It opens your chats: yours, and one per project. */
export function ChatsScreen() {
  const { creations, pop, push } = useStore();
  const personal = creations.find((c) => c.chatOnly);
  const projects = creations.filter((c) => !c.chatOnly && c.chat);
  const last = (id: string) => {
    const c = creations.find((x) => x.id === id);
    const m = [...(c?.chat ?? [])].reverse()[0];
    return m ? `${m.from === 'me' ? 'You' : m.from === 'remini' ? 'Remini' : m.from}: ${m.text}` : '';
  };
  const Row = ({ id, title, sub, avatar, demo }: { id: string; title: string; sub: string; avatar: React.ReactNode; demo?: string }) => (
    <button data-demo={demo} onClick={() => push({ name: 'chat', creationId: id })} className="flex w-full items-center gap-3 rounded-[18px] bg-card p-3 text-left">
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold">{title}</span>
        <span className="block truncate text-[12px] text-[#FF8FB0]">{sub}</span>
        <span className="block truncate text-[12.5px] text-mute">{last(id)}</span>
      </span>
      <I.Chevron size={16} className="text-mute" />
    </button>
  );
  return (
    <div data-demo="chats-list">
      <NavHeader title={<span className="bg-brand bg-clip-text text-transparent">Remini chat</span>} onBack={pop} />
      <p className="px-4 text-[13px] text-mute">One chat just for you, and one inside each project, shared with everyone in it.</p>
      <div className="space-y-2 px-4 pt-4">
        {personal && <Row id={personal.id} title="Remini" sub="Just you" avatar={<ReminiAvatar size={44} />} demo="chat-personal" />}
        {projects.map((c) => (
          <Row
            key={c.id}
            id={c.id}
            demo={`chat-${c.id}`}
            title={c.title}
            sub={c.shared ? `Project · with ${c.shared.members.filter((m) => m !== 'You').join(', ')}` : 'Project · just you'}
            avatar={
              <span className="relative shrink-0">
                <Img src={c.cover} className="h-11 w-11 rounded-xl" label={false} />
                {c.shared && (
                  <span className="absolute -bottom-1 -right-1 flex -space-x-1.5">
                    {c.shared.members.filter((m) => m !== 'You').slice(0, 2).map((m) => (
                      <Avatar key={m} name={m} size={18} />
                    ))}
                  </span>
                )}
              </span>
            }
          />
        ))}
        {!projects.length && <div className="rounded-[18px] border border-dashed border-white/15 p-3.5 text-[13px] text-mute">Each project you keep gets its own chat here.</div>}
      </div>
    </div>
  );
}

export function ChatScreen({ creationId }: { creationId: string }) {
  const { creations, pop, push, sendChat, chatTyping, identities, keepFromChat, chatCtx } = useStore();
  const p = creations.find((x) => x.id === creationId);
  const [text, setText] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const msgs = p?.chat ?? [];
  const typing = chatTyping === creationId;

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs.length, typing]);

  if (!p) return <NavHeader title="Chat" onBack={pop} />;
  const me = identities.find((i) => i.id === 'me');
  const presets = presetsFor(p, chatCtx());
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
            <span className="bg-brand bg-clip-text text-transparent">Remini chat</span>
            <span className="text-[11px] font-medium text-mute">{p.chatOnly ? 'Just you' : p.title}</span>
          </span>
        }
        onBack={pop}
        right={
          p.shared ? (
            <div className="flex -space-x-2 pr-2">
              {p.shared.members.slice(0, 3).map((m) => (
                <Avatar key={m} name={m} size={24} />
              ))}
            </div>
          ) : me ? (
            <Img src={me.cover} className="mr-2 h-7 w-7 rounded-full" label={false} />
          ) : null
        }
      />

      <div ref={list} data-demo="chat-thread" className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-2">
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
                  <div className={`grid gap-1.5 ${m.images.length > 1 ? 'grid-cols-3' : 'grid-cols-1'}`}>
                    {m.images.map((src, i) => (
                      <button key={i} onClick={() => push({ name: 'result', kind: 'look', image: src, title: 'From Remini chat' })} className={`relative overflow-hidden rounded-2xl ${m.images!.length > 1 ? 'aspect-[3/4]' : 'aspect-[4/5] w-[200px]'}`}>
                        <Img src={src} className="absolute inset-0" label={false} />
                      </button>
                    ))}
                  </div>
                )}
                {bot && m.images && (
                  m.kept ? (
                    <span className="text-[11.5px] text-[#2ED47A]">✓ Kept</span>
                  ) : (
                    <button data-demo="chat-keep" onClick={() => keepFromChat(p.id, m.id)} className="relative flex h-8 w-fit items-center gap-1.5 rounded-full bg-white px-3 text-[12.5px] font-semibold text-black">
                      <I.Studio size={14} /> {p.chatOnly ? 'Keep in a project' : `Keep in ${p.title}`}
                      <LeverTag l="w" />
                    </button>
                  )
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
              <span className="text-[12px] text-mute">Working…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.06] bg-ink pb-5 pt-2.5">
        <div data-demo="chat-spurs" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5">
          {presets.map((sp) => (
            <button key={sp.label} onClick={() => send(sp.label)} disabled={typing} className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-[12.5px] font-medium text-white/85 active:bg-white/10 disabled:opacity-40">
              ✨ {sp.label}
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
            placeholder={p.shared ? 'Ask Remini, for everyone…' : 'Ask Remini…'}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/35"
          />
          <button type="submit" disabled={!text.trim() || typing} className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-black disabled:opacity-30" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

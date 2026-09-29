import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StatusBar, TopBar } from './components/Chrome';
import { ChatBubble, TodayHome, TodayScreen, ToolBar } from './screens/Today';
import { FirstCreationScreen } from './screens/First';
import { GeneratingOverlay, Spotlight, Toast } from './components/Overlays';
import { BEATS } from './state/demo';
import { useStore } from './state/store';
import type { Route } from './state/types';
import { AboutScreen, AnimateScreen, GridScreen, PickerScreen, ResultScreen, Splash, TrendScreen } from './screens/Flows';
import { ChatScreen } from './screens/Chat';
import { CreateScreen, IdentityScreen } from './screens/Identity';
import { OnboardingScreen } from './screens/Onboarding';
import { CreationScreen, PhotoScreen } from './screens/Creation';
import { LockScreen } from './screens/Outside';
import { SheetHost } from './screens/Sheets';
import { StudioEntryCard, StudioScreen } from './screens/Studio';
import { Shell } from './shell/Shell';

function renderRoute(r: Route) {
  switch (r.name) {
    case 'today':
      return <TodayScreen screen={r.screen} />;
    case 'first':
      return <FirstCreationScreen step={r.step} path={r.path} />;
    case 'studio':
      return <StudioScreen />;
    case 'onboarding':
      return <OnboardingScreen start={r.step} />;
    case 'trend':
      return <TrendScreen trendId={r.trendId} />;
    case 'result':
      return <ResultScreen {...r} />;
    case 'picker':
      return <PickerScreen {...r} />;
    case 'identity':
      return <IdentityScreen id={r.id} />;
    case 'create':
      return <CreateScreen />;
    case 'creation':
      return <CreationScreen id={r.id} />;
    case 'photo':
      return <PhotoScreen creationId={r.creationId} photoId={r.photoId} />;
    case 'chat':
      return <ChatScreen creationId={r.creationId} />;
    case 'lock':
      return <LockScreen />;
    case 'about':
      return <AboutScreen />;
    case 'animate':
      return <AnimateScreen src={r.src} creationId={r.creationId} />;
    case 'grid':
      return <GridScreen title={r.title} items={r.items} />;
  }
}

/** Both modes open on Remini's usual home; With Studio adds the entry to your kept work. */
function TabRoot() {
  const { mode } = useStore();
  return (
    <>
      <TopBar />
      {mode === 'studio' && <StudioEntryCard />}
      <TodayHome />
    </>
  );
}

function Layer({ visible, fromRight, dir, web, children }: { visible: boolean; fromRight: boolean; dir: 1 | -1; web: boolean; children: ReactNode }) {
  const controls = useAnimationControls();
  const first = useRef(true);
  useEffect(() => {
    if (!visible) return;
    const from = first.current ? (fromRight && dir > 0 ? { x: '100%', opacity: 1 } : { x: 0, opacity: 0 }) : { x: '-25%', opacity: 0.6 };
    first.current = false;
    controls.set(from);
    controls.start({ x: 0, opacity: 1, transition: { type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.36 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  return (
    <motion.div animate={controls} className={`absolute inset-0 flex-col ${web ? 'bg-[#F4F4F6]' : 'bg-ink'}`} style={{ display: visible ? 'flex' : 'none' }}>
      {children}
    </motion.div>
  );
}

function PhoneContent() {
  const { stack, tab, mode, navDir, splash, setSplash, demo, onboarded, resetStack } = useStore();
  const top = stack[stack.length - 1];

  useEffect(() => {
    const t = window.setTimeout(() => setSplash(false), 1400);
    return () => clearTimeout(t);
  }, [setSplash]);

  // With Studio starts like Remini: the onboarding question, then a suggested first creation.
  useEffect(() => {
    if (splash || demo !== null || mode !== 'studio' || onboarded.studio || stack.length) return;
    resetStack([{ name: 'onboarding', step: 'question' }]);
  }, [splash, demo, onboarded, mode, stack.length, resetStack]);

  return (
    <>
      {/* Every stack layer stays mounted (so screens keep local state behind a picker); only the top is shown. */}
      {[null, ...stack].map((r, i) => {
        const isTop = i === stack.length;
        const layerKey = r ? `${i}-${r.name}-${'id' in r ? r.id : ''}` : `root-${mode}-${tab}`;
        const lock = r?.name === 'lock';
        const web = false;
        return (
          <Layer key={layerKey} visible={isTop} fromRight={!!r} dir={navDir} web={web}>
            {lock ? (
              <div className="absolute inset-x-0 top-0 z-10">
                <StatusBar />
              </div>
            ) : (
              <StatusBar dark={web} />
            )}
            <div className={`no-scrollbar relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${lock ? '!absolute inset-0' : ''}`}>
              {r ? renderRoute(r) : <TabRoot />}
            </div>
          </Layer>
        );
      })}
      {!top && <ToolBar />}
      {!top && <ChatBubble />}
      <SheetHost />
      <GeneratingOverlay />
      <Toast />
      <AnimatePresence>{splash && <Splash key="splash" />}</AnimatePresence>
    </>
  );
}

export function Phone() {
  const { demo } = useStore();
  const root = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 32) / 868));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const target = demo !== null ? BEATS[demo]?.target ?? null : null;

  return (
    <div className="phone-slot" style={{ ['--s' as string]: scale }}>
      <div className="phone-bezel">
        <div ref={root} data-phone className="phone-screen">
          <PhoneContent />
          <div className="dynamic-island" />
          <Spotlight target={target} root={root} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <Shell phone={<Phone />} />;
}

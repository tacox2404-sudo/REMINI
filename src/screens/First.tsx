import { A } from '../state/data';
import { useStore } from '../state/store';
import { I } from '../components/Icons';
import { Img } from '../components/Img';
import { LeverTag, NavHeader, PillWhite } from '../components/ui';

/**
 * The first activity suggested by the onboarding answer: a normal Remini
 * generation. Before it runs the app shows only Remini's sample imagery; the
 * user's face appears from the lock-in onwards.
 */
export function FirstCreationScreen({ step, path = 'profile' }: { step: 'intro' | 'confirm'; path?: 'profile' | 'restore' }) {
  const { pop, push, replaceTop, lockIdentity, runGenerating, resetStack } = useStore();

  // Restore path: no profile needed, just the family's old photos.
  if (path === 'restore')
    return (
      <div className="flex h-full flex-col">
        <NavHeader title="" onBack={() => resetStack([], -1)} />
        <div className="px-4">
          <div className="text-[13px] font-semibold text-[#FF6A8E]">Suggested for you · Restore old photos</div>
          <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight">Bring your family photos back</h1>
          <p className="mt-1.5 text-[14px] text-white/65">Enhance restores faces, scratches and colour. Pick a few old photos to start.</p>
        </div>
        <div className="mx-4 mt-5 grid place-items-center rounded-[24px] bg-card py-10">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand"><I.Enhance size={30} /></span>
          <span className="mt-3 text-[14px] text-white/70">Faces · scratches · colour</span>
        </div>
        <div className="mt-auto px-4 pb-6">
          <PillWhite
            demo="pick-old"
            onClick={() =>
              push({
                name: 'picker',
                title: 'Pick old photos',
                min: 1,
                max: 4,
                preselect: 4,
                pool: [1, 2, 3, 4].map(A.old),
                cta: 'Restore',
                onDone: () =>
                  runGenerating({ steps: ['Uploading', 'Restoring faces', 'Repairing scratches'], duration: 2000, preview: A.old(1) }, () =>
                    replaceTop({ name: 'result', kind: 'restore', image: A.restored(1), images: [A.restored(1), A.restored(2), A.restored(3)], title: 'Restored' }),
                  ),
              })
            }
          >
            <I.Photos size={18} /> Pick old photos
          </PillWhite>
        </div>
      </div>
    );

  if (step === 'intro')
    return (
      <div className="flex h-full flex-col">
        <NavHeader title="" onBack={() => resetStack([], -1)} />
        <div className="px-4">
          <div className="text-[13px] font-semibold text-[#FF6A8E]">Suggested for you · Profile or work photos</div>
          <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight">Your LinkedIn photo</h1>
          <p className="mt-1.5 text-[14px] text-white/65">Casual Headshot pack. Add 4 selfies and get professional headshots of you.</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1.5 px-4">
          {[20, 21, 22, 23, 24, 25].map((n) => (
            <Img key={n} src={A.generic(n)} className="aspect-[3/4] rounded-xl" label={false} />
          ))}
        </div>
        <p className="px-4 pt-2 text-[12px] text-mute">Examples from the pack</p>
        <div className="mt-auto px-4 pb-6">
          <PillWhite
            demo="add-selfies"
            onClick={() =>
              push({
                name: 'picker',
                title: 'Add 4 selfies',
                min: 4,
                max: 4,
                preselect: 4,
                pool: [...[1, 2, 3, 4].map(A.ref), A.enhance2Before, A.enhanceBefore],
                cta: 'Continue',
                onDone: () => {
                  pop();
                  replaceTop({ name: 'first', step: 'confirm' });
                },
              })
            }
          >
            <I.Camera size={18} /> Add 4 selfies
          </PillWhite>
        </div>
      </div>
    );

  return (
    <div className="flex h-full flex-col">
      <NavHeader title="" onBack={() => replaceTop({ name: 'first', step: 'intro' })} />
      <div className="px-4">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Is this you?</h1>
        <p className="mt-1.5 text-[14px] text-white/65">Lock in your profile once. Every creation, style and friend’s invite can use it, and it adapts to each one.</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 px-4">
        {[1, 2, 3, 4].map((n) => (
          <Img key={n} src={A.ref(n)} className="aspect-square rounded-2xl" label={false} />
        ))}
      </div>
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 text-[13px]">
        <I.Photos size={18} className="text-[#FF6A8E]" />
        <span className="flex-1 text-white/80">
          Profile <b className="text-white">Me</b> · version <b className="text-white">Work</b> for this LinkedIn set
        </span>
      </div>
      <div className="mt-auto space-y-1 px-4 pb-6">
        <PillWhite
          demo="lock-in"
          onClick={() => {
            lockIdentity([1, 2, 3, 4].map(A.ref));
            runGenerating({ steps: ['Locking in your profile', 'Generating Casual Headshot', 'Picking your best 3'], duration: 2200, preview: A.linkedin(1) }, () =>
              replaceTop({ name: 'result', kind: 'set', image: A.linkedin(1), images: [A.linkedin(1), A.linkedin(2), A.linkedin(3)], title: 'Casual Headshot' }),
            );
          }}
        >
          <I.Lock size={17} /> Yes, lock in my profile
          <LeverTag l="c" />
        </PillWhite>
        <button onClick={() => replaceTop({ name: 'first', step: 'intro' })} className="h-11 w-full text-[14px] font-semibold text-white/50">
          Not me, retake
        </button>
      </div>
    </div>
  );
}

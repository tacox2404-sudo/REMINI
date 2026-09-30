# Remini Studio · clickable concept prototype

**Studio** is a personal space inside Remini where people create, keep and grow their work, alone or with friends. Everything made anywhere in Remini can flow into it, and everything in it can use the rest of Remini.

- **Projects**: a job that keeps going (a trip, a family archive, a set of looks), with progress ("5 of 17 enhanced") and Enhance all. After any result, people choose whether to keep it in a project.
- **Profiles**: Me is the face profile Remini already makes for AI Photos, now kept and improving over time as you add photos of yourself. Friends' profiles exist only when they add their own face.
- **Together** (a trial feature): invite friends into a project through any app, duo shoots, a friend's shared style with your own face. Everyone makes what they like, in any style.
- **Remini chat**: the bubble opens one personal chat plus one inside each project, shared with its members. It only offers what Remini already does.

Design rules: free limits stay as they are, people choose what to keep and share, only a person can add their own face, nothing is held back after cancelling, Studio is private, not a feed. "Today" mode is a short replica of the current app. AI steps are simulated with prepared images.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

`npm run build` produces a **single self-contained `dist/index.html`** (JS, CSS and the Inter font are inlined). You can open it straight from disk, zip `dist/` and send it, or drop `dist/` on Vercel or Netlify with no config. Images are loaded from `dist/assets/`, which is copied from `public/assets/`.

On desktop the app sits in a 390×844 phone frame with the controls around it. On a real phone (width ≤ 500 px) it goes full screen and the controls move behind a small floating button.

## Images

The photos live in `public/assets/` (web-sized JPGs); the full-size originals are kept in `originals/` and are not shipped. Any missing file falls back to a gradient placeholder.

| File | Used for |
|---|---|
| `me_ref_1..4.jpg` | The saved "Me" identity |
| `enhance_before/after.jpg`, `enhance2_before/after.jpg` | Enhance before/after pairs |
| `me_look_1..8.jpg` | AI looks of you (trends, community style previews) |
| `trend_y2k_me.jpg`, `trend_y2k_me_2.jpg` | Y2K Yearbook result and "Try another photo" |
| `linkedin_1..6.jpg` | The LinkedIn set |
| `archive_old_1..4.jpg`, `archive_restored_1..4.jpg` | Family archive before/after |
| `trip_1..6.jpg` | Philippines trip project (17 of your photos, then Paola's) |
| `friend_marta.jpg` | Paola, the friend |
| `friend_marta_90s.jpg`, `remix_me_90s.jpg`, `together_90s.jpg` | Paola's own 80s film look, the same style with your face, and your duo shoot. Shown only after Paola shares her style |
| `generic_*.jpg` | Today mode sample imagery, cropped from screenshots of the current app |

## Presenting

- **Experience: Today / With Studio.** First open in each mode starts with onboarding, like the real app.
- **Start demo.** Guided tour with captions and highlights. `→` next, `←` back, `Esc` exit. Every step resets the app to a known state, so clicking around never breaks it.
- **Why it matters** (bottom-right corner, meant for after the demo): tags the screens with t (trial start), c (conversion), w (paid weeks) and I (installs), explains each lever, and shows the event log, including `segment: …` and `intent: …`.

### Guided demo path

Nine steps, 15 beats, each tagged with the lever it moves:

1. **Remini today**: the home, and a quick enhance saved to the camera roll.
2. **Keep**: the same enhance with Studio. Keep puts the first photo in a new project, Philippines trip. A second photo from the trip is added to it.
3. **The project**: you add the rest from your gallery (17 photos, 2 done), then the Studio home.
4. **The free limit** (trial start): "5 of 17 done, finish your trip with Pro", with Together shown.
5. **Together**:
   - Invite via WhatsApp (installs). Joining and adding photos is free for friends.
   - Paola joins the trip and, separately, shares her own 80s look (conversion).
   - Your version and a duo shoot go into a separate project, 80s with Paola.
6. **Day 6 of the trial** (conversion): the trial ends tomorrow, and the projects keep going.
7. **Coming back** (paid weeks):
   - Welcome back two weeks later: Luca's photos, and new looks you can try (made only if you tap).
   - Me, kept and improving: from 4 selfies to 6 photos.
8. **After cancelling**: projects stay viewable and downloadable.
9. **Why it pays**: the impact model on one page (scenarios and levers, plus where the value comes from).

After the demo, **Explore on your own** opens specific moments:
- a returning free user
- onboarding with Studio on the paywall
- Remini chat
- the shared trip
- the restore and profile paths
- notifications
- AI Photos today

### Screenshots

`screenshots/NN-*.png` has the phone for every demo beat, and `screenshots/full/` has the whole window with levers on. After adding your own images, regenerate them:

```bash
npm run build && npm run screenshots
```

The script uses Playwright's Chromium (`npx playwright install chromium` if it isn't installed; set `CHROMIUM_PATH` to use another binary).

## How it's built

React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion. No backend, all state in memory.

```
src/
  state/
    types.ts      Route, Sheet, Creation, Identity, CommunityStyle… (the state model)
    data.ts       Seed data and asset names (identities, creations, styles, trends, segments)
    store.tsx     React context: navigation stack, sheets, generating overlay,
                  analytics log, journey stages, domain actions (startTrip, enhanceAll,
                  startTrial, inviteFriends, friendJoins, applyFriendStyle, makeDuo, improveMe…)
    flows.ts      Multi-step flows shared by screens (quick enhance, trend Today vs Studio)
    chat.ts       Remini chat presets: only actions Remini already has and the prototype can show
    npv.ts        The impact model, formula for formula, with the three scenarios
    demo.ts       The guided demo: each beat sets a journey stage + a target to highlight
  components/     Phone chrome (status bar, top bar, bottom nav), Img with placeholder
                  fallback, before/after slider, sheets, generating overlay, spotlight
  screens/        Today tabs, Onboarding, First action, Result, Studio home, Project + photo
                  viewer, Me and friends' profiles, New project, Chats list and chat, Lock screen,
                  Sheets (Keep this, paywall with Together, Together showcase, Share / Invite…)
  shell/          Controls, event log and demo caption outside the phone
```

State model in short: `mode` (today | studio), `tab`, a navigation `stack` of typed routes (every layer stays mounted so screens keep their state behind a picker), one optional `sheet`, one optional `generating` overlay, domain data (`identities`, `creations`, `paolaJoined`, `styleShared`, `cancelled`), the onboarding `segment`, plan flags (`freeUsed` of 5, `isPro`), `events` for the lever log, and `demo` (current step or null).

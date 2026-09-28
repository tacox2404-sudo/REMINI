# Remini Studio · clickable concept prototype

A high-fidelity mobile prototype for a proposed Remini feature: **Studio**, a personal creative space built on the identity tech Remini already has. Identities you reuse, projects you finish, looks you keep, albums you create with friends, and a chat that turns an idea or an instruction into images. Trends still acquire users, but every trend, enhancement and look now lands somewhere the user comes back to.

This is a design concept, not the real app. It uses a text wordmark, a neutral stand-in app icon and no real Remini assets. All AI results are simulated (a 1.8–2.5 s "generating" animation, then a prepared image).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

`npm run build` produces a **single self-contained `dist/index.html`** (JS, CSS and the Inter font are inlined). You can open it straight from disk, zip `dist/` and send it, or drop `dist/` on Vercel or Netlify with no config. Images are loaded from `dist/assets/`, which is copied from `public/assets/`.

On desktop the app sits in a 390×844 phone frame with the controls around it. On a real phone (width ≤ 500 px) it goes full screen and the controls move behind a small floating button.

## Adding your images

Drop images into `public/assets/` with these names, then rebuild. Any missing file falls back to a generated gradient placeholder, so the app never breaks and you can add images gradually. (HEIC files from an iPhone need converting to JPG first, because Chrome can't display HEIC.)

| File | Count | Used for |
|---|---|---|
| `me_ref_1.jpg` … `me_ref_4.jpg` | 4 | Reference selfies of the "Me" identity |
| `enhance_before.jpg`, `enhance_after.jpg` | 2 | A blurry or old photo of you and its Remini-enhanced version |
| `me_look_1.jpg` … `me_look_6.jpg` | 6 | AI Photos results of you (looks library, pack covers, filters) |
| `trend_y2k_me.jpg` | 1 | The trend of the week rendered on you |
| `linkedin_1.jpg` … `linkedin_4.jpg` | 4 | Professional headshots in the "LinkedIn refresh" project |
| `archive_old_1.jpg` … `archive_old_4.jpg` | 4 | Old family photos (before) |
| `archive_restored_1.jpg` … `archive_restored_4.jpg` | 4 | The same photos restored (after) |
| `trip_1.jpg` … `trip_6.jpg` | 6 | Trip photos for "Weekend away" and the "Summer ’26" shared album |
| `friend_marta.jpg` | 1 | The friend in the shared album |
| `creative_1.jpg` … `creative_4.jpg` | optional | Results shown by Remini chat (falls back to your looks) |

## Presenting

Controls outside the phone:

- **Experience: Today / With Studio.** Today is the current app: a home feed of packs, the face model buried in AI Photos, results that can only be saved to the gallery. With Studio adds the Studio tab (first position, NEW dot) and everything below.
- **Start demo.** The guided tour, with a caption card and a highlight on the element to tap. `→` next, `←` back, `Esc` exit. You can click inside the app at any point; each demo beat resets the app to a known state, so jumping around never breaks it.
- **Why it matters** (bottom-right corner, separate from the demo). Meant for after the demo. Switching it on tags the screens with the business lever each element is designed to stimulate and opens a panel that explains each lever, where it is tagged, and a live event log (e.g. `chat_prompt_sent → w`).
  - **t** trial start · **c** trial-to-paid conversion · **w** paid weeks (retention) · **I** installs
- **Lock screen** jumps to the notifications screen. **Reset** restores the seed data.

### Guided demo path (10 steps)

1. **Today:** a trend needs a fresh selfie upload, the result can only be saved to the gallery, and nothing persists.
2. **With Studio:** a welcome sheet explains the space, then Studio home: Ask Remini, identities, new this week, projects, shared albums, looks library.
3. **Identities:** the existing identity technology brought to the front.
4. **Create "LinkedIn refresh"** from a just-enhanced photo through "Save to a Project?".
5. **Free limit on "Enhance all"** → a trial framed as "Finish your project" (same trial-then-weekly plan) → back in the project while everything processes.
6. **Saved setup and re-run**, then **improving it with a chat instruction**.
7. **A trend drops:** "Try with Me" (no re-upload) → Save to Studio → it appears in the looks library.
8. **Lock-screen notifications** that deep-link back into the right screen.
9. **Shared albums:** share link and collaborators, friends creating together in the album chat, and a friend joining on the web.
10. **Freestyle:** describe any idea from the top of Studio and Remini makes it with your identity.

### Remini chat

Every project and shared album has a chat, and the "Ask Remini" bar on Studio home starts a Freestyle project. Replies are simulated with keyword rules (`src/state/chat.ts`): "fix the light" enhances every photo (or offers the trial on a free plan), "movie poster", "Y2K", "beach", "animate", "headshot" and similar return prepared images that land in the project. The suggestion chips above the input are the creativity prompts for each kind of project.

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
    types.ts      Route, Sheet, Project, Identity, Look… (the state model)
    data.ts       Seed data and asset names (identities, looks, projects, trends)
    store.tsx     React context: navigation stack, sheets, generating overlay,
                  analytics log, domain actions (createProject, enhanceAll,
                  startTrial, generateLooks, rerunSetup, joinShared…)
    flows.ts      Multi-step flows shared by screens (enhance, trend Today vs Studio)
    chat.ts       Simulated Remini chat: keyword replies and creativity prompts
    demo.ts       The guided demo: each beat sets a known app state + a target to highlight
  components/     Phone chrome (status bar, top bar, bottom nav), Img with placeholder
                  fallback, before/after slider, sheets, generating overlay, spotlight
  screens/        Tabs (Enhance home, AI Photos, Filters, Videos, Retouch), Studio home,
                  Identity, New project, Project + photo viewer, Result, Trend, Picker,
                  Lock screen, Web recipient, Sheets (save-to-project, paywall, share…)
  shell/          Controls, event log and demo caption outside the phone
```

State model in short: `mode` (today | studio), `tab`, a navigation `stack` of typed routes (every layer stays mounted so screens keep their local state behind a picker), one optional `sheet`, one optional `generating` overlay, domain data (`identities`, `looks`, `projects`, `savedLooks`), plan flags (`freeUsed` of 5, `isPro`), `events` for the lever log, and `demo` (current beat or null).

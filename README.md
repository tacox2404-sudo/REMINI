# Remini Studio · clickable concept prototype

**Studio** is a new space in Remini to come back to your own photo and video creations, on your own or with friends, with gen AI along the way.

- **My Creations**: projects that keep one style and save themselves ("Family archive, 4 of 12 restored").
- **Together**: albums with friends that change together, with a shared Remini chat that makes recap videos and posters from the group's photos.
- **Remix**: this week's trends already applied to your saved Me, and styles from the community you can remix and publish.
- **Me**: saved identities, several profiles, private.

"Today" mode is a short, deliberately limited replica of the current app for comparison. AI steps are simulated with prepared images.

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
| `trip_1..6.jpg` | Friends trip, Philippines (17 photos: these 6 plus a "+11" tile) |
| `friend_marta.jpg` | Paola, the friend |
| `friend_marta_90s.jpg`, `remix_me_90s.jpg` | Optional: Paola's "90s yearbook" and your remix (fall back to `friend_marta.jpg` and `me_look_5.jpg`) |
| `generic_*.jpg` | Optional face-free imagery for Today mode (gradient placeholders otherwise) |

## Presenting

- **Experience: Today / With Studio.** First open in each mode starts with onboarding, like the real app.
- **Start demo.** Guided tour with captions and highlights. `→` next, `←` back, `Esc` exit. Every step resets the app to a known state, so clicking around never breaks it.
- **Why it matters** (bottom-right corner, meant for after the demo): tags the screens with t (trial start), c (conversion), w (paid weeks) and I (installs), explains each lever, and shows the event log, including `segment: …` and `intent: …`.

### Guided demo path

**Today (3 steps):** the home and bottom tools, AI Photos with a 4-selfie profile, Remini Chat.

**With Studio:** Welcome to Studio (value proposition) → set up around you → your Studio → Keep going → Together: the Friends trip (Philippines) → change the style for everyone → the album chat (poster, recap video) → your turn → finish the album (5 of 17, trial) → New for you → Keep this → Styles from the community → Make your version → Publish as a style → Challenge a friend → Create with Remini chat → Me: saved identities → Why it pays (interactive NPV model).

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
                  analytics log, domain actions (answerSegment, createFromIntent,
                  enhanceAll, startTrial, keepLook, remixStyle, publishStyle…)
    flows.ts      Multi-step flows shared by screens (enhance, trend Today vs Studio)
    chat.ts       Simulated Remini chat (kept on creation pages, not in the demo)
    intent.ts     "What are you creating?" → Pick 3 to 5 photos → creation
    demo.ts       The guided demo: each beat sets a known app state + a target to highlight
  components/     Phone chrome (status bar, top bar, bottom nav), Img with placeholder
                  fallback, before/after slider, sheets, generating overlay, spotlight
  screens/        Tabs (Enhance home, AI Photos, Filters, Videos, Retouch), Studio home,
                  Onboarding, Me/My Creations/Remix sections, Identity, What are you creating?,
                  Creation + photo viewer, Result, Trend, Picker, Lock screen, Coming next,
                  Sheets (Keep this, both paywalls, Make this with a friend, Publish as a style…)
  shell/          Controls, event log and demo caption outside the phone
```

State model in short: `mode` (today | studio), `tab`, a navigation `stack` of typed routes (every layer stays mounted so screens keep their state behind a picker), one optional `sheet`, one optional `generating` overlay, domain data (`identities`, `creations`, community `styles`), the onboarding `segment`, plan flags (`freeUsed` of 5, `isPro`), `events` for the lever log, and `demo` (current step or null).

# Remini Studio: prototype brief

This brief explains a clickable concept prototype, so you can review it without running it. The file `remini-studio-screens.pdf` has one page per demo beat, with the phone screen, the step, the title and the caption shown in the demo. Read the two together.

The prototype was built for a product manager interview with Remini (Bending Spoons). It is a concept, not the real app: no backend, no real AI, and every image is a pre-made file. It follows a strategy document that is the source of truth for the concept, and an impact model spreadsheet for the numbers.

## The problem it answers

Remini delivers great results for a single task, but little carries on after it. About 95% of installs never start a trial, and payers leave after about 4 weeks. Meanwhile single AI edits are becoming a commodity, viral waves fade and new users cost more. The growth path is giving people reasons to do more and come back, not more installs. The two main users need the same thing: fixers (most users, who enhance) have big jobs and stop at the free limit; creators have small jobs that need to grow.

## The idea

Studio is a personal space inside Remini where people create, keep and grow their work, alone or with friends. In order of importance:

1. **Projects**: a job that keeps going (a trip, a family archive, a set of looks), with visible progress and Enhance all. After any result, the app asks whether to keep it in a project. People choose.
2. **Profiles**: Me is the face profile Remini already makes for AI Photos, now kept and improving over time as you add photos of yourself. Friends' profiles exist only when they add their own face.
3. **Together** (a trial feature): invite friends into a project through any app, duo shoots, a friend's shared style used with your own face. Everyone makes what they like, in any style.
4. **Remini chat**: the bubble opens one personal chat plus one inside each project, shared with its members. It only offers what Remini already does.

Design rules: free limits stay as they are; people choose what to keep and share; only a person can add their own face and can remove it anytime; nothing is held back after cancelling; Studio is private, not a public feed.

## The demo (9 steps, 23 beats)

1. **Remini today**: the home, AI Photos with its 4-selfie profile, and a quick enhance saved to the camera roll.
2. **Start as usual**: onboarding asks "What brings you to Remini?". A quick enhance has Save and Share as always, plus a new Keep. "Keep this in a project?" suggests the Philippines trip, with 16 more photos from the same days.
3. **What Studio is**: the trip project at 1 of 17, then the Studio home with Projects, Profiles and Together.
4. **The free limit**: Enhance all uses the free enhancements, and the limit lands inside the trip ("5 of 17 done"). Pro finishes it, and Together is shown as a reason to try.
5. **Trial week, together**: the trip finishes. You invite friends via WhatsApp and Paola joins with her photos and her own face. She shares her 80s style, which you use with your face (Me is saved from 4 selfies the first time). Then a duo shoot, and the shared project chat.
6. **Chats and Me**: the bubble opens your chats. Me offers to add the photos of you from the trip.
7. **Coming back**: lock-screen notifications (Paola added photos, Luca joined, new looks with your updated Me), Welcome back, and how Me has grown.
8. **After cancelling**: every project stays viewable and downloadable.
9. **Why it pays**: the impact model.

## What each moment is meant to trigger

- **Trial start**: the free limit lands inside a project, and Together is showcased.
- **Conversion**: during the trial week, friends join, share styles and create in the shared chat.
- **Paid weeks**: unfinished projects, new looks on an improving profile, and friends' additions.
- **Installs**: invited friends arrive into a project with work already waiting.

## The business case (from the impact model)

- **The target**: $5M NPV over 2 years, about 10% of the ~$51M that subscriptions from new users bring in.
- **Why no single lever**: the levers multiply, so 1% on any lever is worth the same ($700 a day). Pushing one lever without a real change in behaviour can pull the others down.
- **Three scenarios**:
  - Trial rush: trials +20%, conversion −5%, paid weeks flat. $4.7M.
  - Balanced (base): trials +10%, conversion held, paid weeks +6%. $5.3M, 1.06x the target.
  - Engaged: trials +7%, conversion +3%, paid weeks +10%. $6.3M.
- **The bar**: +16.0% revenue per install. Balanced delivers +16.9%.
- **Costs and upside**:
  - Studio's real cost is margin: with more AI usage, the margin after AI cost falls from 89% to about 86%, worth −$1.5M.
  - Returning free users starting a trial add about $0.8M.
  - Invites add about 0.3% more installs.
- **Assumptions**: 2 months to build, a test month on 10% of new installs, a rollout month at 50%, a 9% discount rate. The case data is fictitious.

## What is simulated

- Every generation is a timed animation that shows a pre-made image.
- Paola joining, her photos and the friends' activity are scripted.
- The paywall, the trial and cancelling do not charge or change anything real.
- Notifications are a drawn lock screen.

## How to open it

- **As a person**: open `remini-studio-standalone.html` in Chrome or Safari on a laptop. It works offline (about 8 MB, images embedded). Press "Start demo", use → and ← to move and Esc to leave. The top toggle switches between Today and With Studio. "Why it matters" in the bottom-right corner shows the lever tags and the event log.
- **As Claude in a chat**: the HTML file is mostly embedded image data, so reading it is not useful. Use this brief and the PDF.
- **As Claude Code**: the source is in the GitHub repo `tacox2404-sudo/REMINI`, branch `claude/remini-studio-prototype-g6rena`. Run `npm install`, then:
  - `npm run dev` to try it;
  - `npm run build` for the single-file build;
  - `npm run standalone` for the offline HTML;
  - `npm run screenshots` to regenerate the screenshots with Playwright.

## What feedback is useful

- Is the step from a quick enhance to "Keep this in a project?" natural, or does Studio feel bolted on?
- Is it clear what Studio is by beat 8?
- Does the free limit inside the project feel fair, and does Together read as a reason to try Pro?
- Is Me, kept and improving, clearly different from the profile Remini has today?
- Is the invite, from WhatsApp into the project, believable?
- Which beats could be cut to keep the demo under about 5 minutes?

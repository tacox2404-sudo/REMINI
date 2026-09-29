# Remini Studio: prototype brief

This brief explains a clickable concept prototype so you can review it without running it. The file `remini-studio-screens.pdf` has one page per demo step, with the phone screen, the step title and the caption shown in the demo. Read the two together.

The prototype was built for a product manager interview with Remini (Bending Spoons). It is a concept, not the real app: no backend, no real AI, and every image is a pre-made file.

## The idea in one paragraph

Today, Remini is a set of one-off tools. You enhance a photo, try a trend, save or share it, and leave. Studio adds a place where your own work continues. It starts from normal Remini use. When you like a result you tap "Keep this", and it becomes a creation you can continue in the same style. Your AI profile (Remini already builds one from 4 selfies) becomes "Me": you confirm it once and lock it in, and it adapts per creation (a Work version for LinkedIn photos, an Everyday version later). Then you invite a friend from outside Remini, make things together, and build a group album where one preset applies to everyone's photos. The free usage runs out on work you care about, which is where the Pro trial is offered.

## What Studio holds

Studio contains only the user's own work and work shared with friends. Trends, filters and effects stay on Remini's usual pages.

- **Welcome back**: shown when you return, with what is waiting.
- **Keep going**: creations in progress, for example "LinkedIn set 3 of 5".
- **Remix**: your versions of each style (80s film, Y2K Yearbook). One style per creation; making more only adds the same style.
- **Chats**: every conversation with Remini chat, ready to reopen.
- **Together**: the friend who joined, their shared style, the photo made together, and the group album "Friends trip · Philippines".
- **Me**: the locked profile and its versions.

## The user journey (the demo order)

1. **Remini today** (3 beats): the current home, AI Photos with its 4-selfie profile, and Remini Chat.
2. **Normal use first**: onboarding asks why you are here ("Profile or work photos" or "Restore old photos"). The profile path suggests a LinkedIn headshot, asks "Is this you?", locks the profile in, and shows the result with Save, Share and the new "Keep this".
3. **Kept in Studio**: the set appears under Keep going; Me shows the locked profile and its Work version.
4. **On your own**: AI Filters runs "80s Vibes" directly on your profile; keeping it creates an "80s film" creation. Remini chat offers presets (80s film, Y2K Yearbook, Studio headshot), and each result goes to that style's creation. Remix and Chats appear in Studio.
5. **One friend**: Share opens WhatsApp, Messages, Instagram, TikTok or a link. Paola is not on Remini, so she gets the photo with "Join me on Remini" and a link. She joins, becomes your Remini friend, shares her 80s style back, you "Make your version", then "Make it together".
6. **The group**: the "Friends trip · Philippines" album with Paola, Luca and Marco. In the album chat, a preset like Golden hour changes every member's photos at once.
7. **Free usage ends**: "Finish your Friends trip with Pro" offers the trial on unfinished work (5 of 17 done).
8. **Coming back**: a lock-screen notification about the LinkedIn set, then Welcome back in Studio.
9. **Why it pays**: an interactive business model (below).

## The levers and the business model

Each design element carries a tag for the business lever it is meant to move. The tags and an event log appear when "Why it matters" is switched on.

- **t**: trial starts
- **c**: trial to paid conversion
- **w**: paid weeks (retention)
- **I**: installs (friends joining through invites)

The closing card has sliders for t, c and w. The levers multiply, so the NPV follows the combined uplift: (1 + t)(1 + c)(1 + w) − 1. The model is calibrated so that +5.6% on each lever (about 17.8% combined) gives a $5M NPV. The Low, Base and High cases give $2.6M, $5.9M and $11.2M. These figures come from the interview's business case with fictitious data, and the model is deliberately simplified.

## What is simulated

- Every generation is a timed animation that shows a pre-made image.
- "Paola joined", the friends' photos and the group activity are scripted.
- The paywall and trial do not charge anything.
- Notifications are a drawn lock screen, not real push.
- The user's personal photos appear only after a generation; before that, the app shows generic Remini examples.

## How to open it

- **As a person**: open `remini-studio-standalone.html` in Chrome or Safari on a laptop. It works offline (about 8 MB, with the images embedded). Press "Start demo", then use → and ← to move through the steps and Esc to leave. The top toggle switches between Today and With Studio. "Why it matters" in the bottom-right corner shows the lever tags.
- **As Claude in a chat**: the HTML file is mostly embedded image data, so reading it is not useful. Use this brief and the PDF.
- **As Claude Code**: the source is in the GitHub repo `tacox2404-sudo/REMINI`, branch `claude/remini-studio-prototype-g6rena`. Run `npm install`, then `npm run dev` to try it, `npm run build` for the single-file build, `npm run standalone` for the offline HTML, and `npm run screenshots` to regenerate the demo screenshots with Playwright.

## What feedback is useful

- Is the step from "normal Remini use" to "Keep this" natural, or does Studio feel bolted on?
- Is "Me" (lock in once, versions per creation) clear from the screens?
- Is the invite from outside Remini (WhatsApp, then joining) believable as an install driver?
- Does the paywall moment feel earned, or too early?
- Is each lever tag plausible for the element it sits on?
- Which beats could be cut to keep the demo under about 5 minutes?

## Rules the design follows

- Nothing mixed or random: one style per creation, and more results stay in that style.
- Remini chat works with presets and filters only. No videos or posters.
- Captions describe what the user gets; they do not criticise the current app.
- It is labelled as a concept prototype and uses no real Remini logo or copied assets.

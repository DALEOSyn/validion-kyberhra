# QA play-test — Kancelária STOPA MVP

**Date:** 2026-11-25 · **Reviewer:** qa-playtester · **Build:** `main` at `d7c203a`, `npm run build` + `vite preview` (production build, CSP and service worker active)
**Screenshots:** `docs/reviews/qa-shots/` (deviceScaleFactor 1)

## Verdict: FAIL

There are no blockers. Every case in both tracks can be finished, nothing leaves the device, and axe-core reports nothing. The FAIL comes from two major issues that hit the main audience: a child on a phone, and a keyboard or screen-reader user. The case length also needs a decision from the producer.

**To get a PASS:**
1. Fix F1, so the clue hint is visible on a 360 px phone right after a tap.
2. Fix F2, so keyboard focus is not lost in trust-or-trap and lock-up (WCAG 2.4.3).
3. Settle F3: either trim the junior cases towards about 5 minutes, or have the producer accept about 7 to 9 minutes per case, to be confirmed by a timed classroom pilot.

The minor findings can wait for a later round.

## What was tested

- **All 8 cases** (J1–J4, T1–T4), each played from the start screen to the debrief, plus the arc scenes after J4 and T4. Personas and viewports:
  - 11-year-old: 360×740, touch, best answers
  - wrong on purpose: 360×740 (all decoys, minimum clues, a bad decision, every wrong verify option, wrong trust-or-trap answers, lock-up distractors and wrong order)
  - quick, sceptical 14-year-old: 1440×900, wrong-path run
  - teacher: 1920×1080
  - reflow: 320×568
  - 200 % zoom: 640×400 CSS px
  - keyboard only: 1280×800 with reduced motion
- **axe-core** (wcag2a/aa, 21a/aa, 22aa) on every screen at 360 and at 1920, in both the best-answer and wrong-answer runs: **0 violations**.
- **Network:** no request left the origin in any run, and there were no console errors. The CSP has `form-action 'none'` and `connect-src 'self'`.
- **Offline:** after the first load, I reloaded offline and played T1. All fonts loaded from the cache and no request failed.
- **Progress:**
  - Every case unlocks the next one, even after a 0-star run. There are no dead ends.
  - Best stars are kept on replay, and ranks rise as expected (Bronzová, Strieborná, Zlatá lupa; overovanie, reportáž, hlavný spis).
  - Progress survives a reload. Reset asks first and then clears both tracks (also covered by the existing e2e).
- **Help** opens from every screen, keeps the case state, focuses its heading and returns focus to "Pomoc" when closed. The debrief also shows the 116 111 line.
- **Reduced motion:** all three animations are gated on `prefers-reduced-motion: no-preference`.
- **Test suites:** `npm test` gave 47 of 47. `npm run e2e` gave 10 of 10 on three runs; one earlier run failed all 5 phone-360 tests (see F14).

## Estimated time per case (from reading load)

I counted the words on screen along the best-answer path, plus the clue hints. Reading speed: about 110 words per minute for age 11 and about 150 for age 14. Interaction time: 20–30 taps, about 1.5–2 minutes.

| Case | Words read | Est. minutes |
|---|---|---|
| J1 Drak zadarmo | ~630 | ~7 |
| J2 Kód pre kamaráta | ~650 | ~7 |
| J3 Zámok na účte | ~820 | ~9 |
| J4 Kričiaca obrazovka | ~850 (+ arc) | ~9 |
| T1 Ľahká brigáda | ~860 | ~7.5 |
| T2 Cheat zadarmo | ~830 | ~7.5 |
| T3 Bez signálu | ~940 | ~8 |
| T4 Nové číslo | ~1020 (+ arc) | ~8.5 |

- **Junior track:** about 32 minutes. **Teen track:** about 31 minutes. Both still fit a 45-minute lesson, but with little time left for the class to talk.
- A quick, sceptical player who skims finishes a case in about 3–4 minutes. They can do that on the junior track with full stars, see L1.

## Findings

### Major

**F1. On a phone, the clue hint appears below the fold (both tracks)**

- **Steps:** At 360×740, open J1 and press "Vziať lupu". Tap "Kryptoria_Oficial_Team".
- **Expected:** The hint ("Stopa: neznámy účet …") is visible next to the tapped clue.
- **Actual:**
  - The `.tip` box sits under the evidence. In J1 that is about y 775, already below a 740 px screen.
  - In two- and three-artefact cases it is 800–1,300 px below the tapped line: T2 has its tip at about y 1,640.
  - The meter (0/5 → 1/5) is also off-screen.
  - A child taps, sees only a yellow highlight, and never reads why it is a clue. That hint is the main teaching moment of the scan.
- **Suggestion:** show the hint inline under the tapped line, or make the meter and tip bar sticky at the bottom of the viewport.
- **Screenshot:** `03-junior-scan-j1-360.png`; `04-teen-evidence-t2-1920.png` shows how long T2 is even at 1920.

**F2. Keyboard focus is lost to `<body>` in trust-or-trap and lock-up (WCAG 2.4.3 Focus Order, 4.1.3)**

- **Steps (trust-or-trap):** Using the keyboard only, answer card 1 in any trust-or-trap. Focus moves to "Ďalej", which is good. Press Enter.
  - **Expected:** Focus moves to the new card or its answer buttons.
  - **Actual:** The "Ďalej" button unmounts and focus goes to `BODY`. The next Tab starts again at the HUD ("Úvod"). A screen-reader user does not hear that a new card has appeared.
- **Steps (lock-up):** In J3, T1 or T2, place any card with Enter.
  - **Actual:** The card is removed from the DOM and focus again goes to `BODY`, every time (the script recorded 5–6 times per case).
- **Fix:** after each card or step, move focus to the card text or to the first remaining card.

**F3. Cases run well over the ~5-minute target (see the table)**

- J3 and J4 are the longest junior cases: two artefacts, a 6-item trust-or-trap, and in J3 also a lock-up.
- Places that could be trimmed:
  - the junior intro dialogues (5 bubbles in J1)
  - the long "Ak sa to už stalo" lists
  - 6 trust-or-trap items in J3 (J3 also has a lock-up)
  - the four rules in the J4 arc, shown as one paragraph
- If the length stays, the producer needs to accept it explicitly and confirm it with a timed pilot.

### Minor

**F4. The trust-or-trap progress dots stack vertically.**
- The global `ol { flex-direction: column }` rule overrides `.dots`, which sets no direction.
- Result: a vertical column of 5–6 bars instead of a row.
- Fix: add `flex-direction: row` to `.dots`.
- Screenshot: `10-bug-trust-trap-dots-vertical-j3-360.png`.

**F5. The generic prompts do not match some cases.**
- In J3 the buttons say "Dobrý zámok / Slabé miesto", but the trust-or-trap prompt still asks "Je to v poriadku, alebo je to pasca?".
- The scan Tip always says "Čo od teba chcú a kto to píše?", which does not fit J3's password weak spots or a pop-up.
- Screenshot: `10-…`.

**F6. On touch devices, `.tap:hover` uses the same yellow as a found clue.**
- A tapped decoy keeps a sticky hover on mobile and looks "found" for a moment.
- Fix: wrap the hover style in `@media (hover: hover)`.

**F7. "Úvod" in the middle of a case, and the browser or Android Back button, drop the case without asking.**
- Back leaves the app entirely, because the game has no history entries.
- Stars are only saved at the debrief, so an 11-year-old on a phone can lose a case with one tap.

**F8. At 320 px, T2's 8-circle meter overflows by 3 px and causes horizontal scroll (WCAG 1.4.10).** Fine at 360.

**F9. Escape does not close the help screen.** Not required, but expected by keyboard users.

**F10. After "Áno, vymazať", the confirm buttons unmount and focus goes to `BODY`.** Reset also writes nothing back to storage, so a "Zvuk: zap" setting is lost on the next reload.

**F11. In the teen theme, the empty clue-meter circles have very low contrast.**
- The empty ring is `#4f5864` on `#272c34`, about 1.9:1.
- The filled state is only a teal ring, so the meter is hard to read on a projector.
- It is `aria-hidden` and the "n/total" text carries the count, so this is not a hard failure of WCAG 1.4.11.

**F12. Locked case cards are `disabled` buttons, so keyboard users never Tab onto them.**
- Their status text "Zamknutý. Najprv uzavri…" is light grey, and axe skips disabled elements.
- Suggestion: use `aria-disabled` with a readable colour instead.

**F13. At 1920 for the teacher, the content column stays about 790 px wide at about 18 px body text.**
- Most of the projector width is unused, and the back row will struggle to read clues.
- Suggestion: a "class mode" or a larger `clamp()` font size above 1600 px.
- Screenshots: `05-decision-j1-1920.png`, `04-…`.

**F14. One `npm run e2e` run failed all 5 phone-360 tests (one of them timed out on `serviceWorker.ready`).**
- Three later runs passed 10 of 10. It may have been the first build racing my own preview server, but it is worth watching in CI.

**F15. The junior debrief rule heading wraps into a narrow column at 360 px.**
- The rule `h3` has `padding-right: 6.5rem`, which keeps it clear of the UZAVRETÉ stamp.
- Screenshot: `06-debrief-j1-0stars-360.png`.

## Learning issues

**L1. Junior scan: tapping everything costs nothing.**
- In J1 every line of the message is tappable, and junior decoys have no star cost. Tapping every underlined part gives 3 of 3 stars without reading.
- The teen track handles this with `max_decoys: 2` (a tap-everything run loses the clue star).
- Suggestion: either show plain, non-tappable lines in junior evidence too, or give a gentle "read first" nudge after several taps in a row.

**L2. The T1 debrief note says "Posielať cez svoj účet peniaze … je trestný čin, aj keď to človek nevedel."**
- For ages 13–15 this is the most fear-inducing line in the game (Red Line 5).
- Whether it is legally accurate is open: liability usually depends on knowledge or negligence.
- I am handing this to the fraud-researcher and learning-psychologist; softer wording that still warns is possible.
- Screenshot: `07-debrief-t1-0stars-360.png`.

**L3. The 0-star debrief does not say why the teen clue star was missed.**
- When the decoy limit was exceeded, the player sees 5 or 6 clues listed as found and the clue star unmet, with no reason given.
- Suggestion: add "označené neutrálne detaily: 5 z max. 2".

## Fun and attention

- **Strong points:**
  - The wrong decisions have concrete consequences ("Účet je preč"), always followed by a calm next step.
  - The Tieň clue card and the arc scenes give a reason to go on to the next case.
- **Where attention drops:**
  - the long intro dialogues before the first tap (J1 has 5 bubbles)
  - scrolling through the three-artefact teen scans on a phone (T2, T3), made worse by F1
  - the 6th trust-or-trap card in J3, which comes after a lock-up in the same case
- **The quick gamer** sees the junior track as too easy (see L1). The teen decoy limit is the right kind of challenge.

## Safety checks

- No external requests in any run.
- No forms or links: help entries show addresses as plain text, and the help phone numbers are also plain text (not `tel:` links).
- All brands are fictional, and the in-game footer says so.

# GDD — Kancelária STOPA / Ozvena (VALIDION kids' cybersecurity game, MVP)

**Owner:** game-designer · **Date:** 2026-11-25 · **Status:** DRAFT for review (sceptic-reviewer, learning-psychologist, fraud-researcher for every threat claim, Roman for the open questions in §15).
**Companion:** `docs/CASE_SPECS.md` (all 8 cases in detail). **Rules:** `CLAUDE.md` Red Lines 1–9 override anything here.

---

## 1. One-paragraph pitch

A short, free, Slovak browser game for children aged 11–15. On the start screen the player picks one of two tracks. **Kancelária STOPA** (11–12) is a warm comic detective club in the fictional town of Lipovec that chases a scammer called Tieň. **Ozvena** (13–15) is a more grown-up, thriller-light investigation by a school podcast team in the same town, who find out that the friendly recruiter "Dax" is a mask. Each track has 4 cases of about 5 minutes, so one track fits one 45-minute lesson. The player only ever defends: spot the clues, choose the safe action, verify another way, tell a trusted adult, and know what to do if it already happened.

## 2. Design pillars

| # | Pillar | What it means in practice |
|---|---|---|
| P1 | **Habit, not trivia** | Every case is scored on the *action* (open the app yourself, call the known number, refuse, tell an adult), not on guessing "fake". Verifying through another channel always beats a lucky guess. |
| P2 | **Calibrated trust** | Every artefact has decoys (neutral details that look suspicious) and every quick round has genuine items. The player learns that the *ask* is the tell, not a logo, a voice, a follower count or a missing diacritic. |
| P3 | **Calm, not fear** | No real timers, no alarm screens outside the in-world fake, no exclamation marks in teaching text. Pressure belongs to the scammer and is shown, never imposed. After every slip: "Toto sa môže stať komukoľvek." plus one fixing step. |
| P4 | **Consequence and recovery** | A bad choice plays out believably and safely (account gone, money sent, messages from your account), then the player practises recovery. In the teen track the recovery is a scored drill. |
| P5 | **A trusted adult is always a right answer** | Where money, threats, strangers or account loss appear, "povedz to dospelému, ktorému dôveruješ" is a valid, rewarded option. |
| P6 | **Short and finishable** | ~5 minutes per case, no case longer than 7 minutes for a slow reader, no dead ends, every case finishable with 0 stars. |

## 3. Audience split and track choice

| | Junior: **Kancelária STOPA** | Teen: **Ozvena** |
|---|---|---|
| Recommended age | 11–12 | 13–15 |
| Reading age | about 11 | about 13 |
| Tone | Warm comic, cork board, detective dog Fúzik | Investigative, thriller-light: night messages, a podcast studio, a case file ("spis"). Never horror, never threats of harm. |
| Player role | New detective in the club ("nová posila kancelárie") | New member of the podcast's verification desk ("overovací stôl") |
| Threats | Game-item phishing, code theft, weak passwords, fake app pushed by a scare pop-up | Money-mule recruitment, cheat download and stolen passwords, SIM swap with a fake account-recovery contact, "new number" voice-clone family scam |

**Start screen.** Two large cards side by side (stacked on mobile): "Kancelária STOPA · odporúčame 11–12 rokov" and "Ozvena · odporúčame 13–15 rokov". Both are always open (no age gate, no typed age, Red Line 7). Each card shows its own progress (cases done, stars). A "Kde nájsť pomoc" link is always visible. Progress per track is separate in `localStorage`; switching tracks never loses progress.

## 4. The case loop (shared engine)

Every case is a sequence of **steps** taken from the fixed mechanic list below. The engine plays the steps in order; content decides which steps a case uses.

```
[recall] → brief (story) → scan → decision → [verify] → consequence → drill (tt | lockup) → debrief → [arc scene]
```

- **Recall "Pamätáš si?"** (cases 2–4, 10 s, unscored, PSYCHOLOGY §4): pick the ending of the previous rule from 3 options (M2 component, no scoring).
- **Worked example:** in the first case of each track the first clue is pre-revealed and explained, and counts as found.
- **Reuse:** from case 2 on, one artefact or TT item reuses an earlier trick in a new channel (table in CASE_SPECS).

### 4.1 Time budget per case (target, average reader)

| Step | Junior | Teen |
|---|---|---|
| Brief (3–5 chat lines) | 0:30 | 0:30 |
| Evidence scan | 1:00–1:30 (1–2 artefacts) | 1:45–2:15 (2–3 artefacts) |
| Decision + consequence | 0:40 | 0:45 |
| Verify channel | — | 0:20 |
| Drill (5 TT items or lock-up) | 1:00 | 0:50 |
| Debrief | 0:40 | 0:40 |
| **Total** | **~4:30** | **~5:30** |
| Arc scene (last case only) | +0:45 | +1:00 |

A track (4 cases + arc scene) is therefore about 20–25 minutes of play, which leaves room in a 45-minute lesson for the class discussion the storyline prototype invites.

### 4.2 Mechanic M1: evidence scan

- **Shows** one or more artefacts (chat/DM, SMS, email, social profile or post, video page, web page, pop-up, lock-screen notifications, call log, voice-note transcript). With several artefacts, tabs labelled "Dôkaz A / B / C"; all tabs are open from the start.
- **Every tappable span is one of:** `clue` (counts, turns highlighted, shows the clue hint) or `decoy` (a neutral detail; shows a gentle hint explaining why it is not a tell on its own, marks the span with a soft "?" style, never red). Non-tappable text is plain.
- **Meter:** "Stopy: n / total". The "Ďalej" button appears at `minClues` (junior 3, teen usually 4; T4 uses 3 because it has fewer sourced clues). The player may continue scanning after it appears.
- **Help:** a "Tip" button is always available. It points to the artefact (and the line) with the nearest unfound clue, in the voice of Mira/Fúzik (junior) or Sára (teen). Tips have no cost (accessibility).
- **Edge cases:** tapping a found clue again re-shows its hint, no double count. Tapping a decoy again re-shows its hint; for scoring a decoy counts once. Leaving the scan with fewer than all clues is fine; unfound clues are listed in the debrief as "Prehliadnuté stopy" in neutral wording.
- **Teen only:** decoy taps are counted as "neutrálne detaily označené ako stopa" and affect the evidence star (see §8). The counter is never shown during the scan, only in the debrief.

### 4.3 Mechanic M2: decision

- 3 options (junior) or 4 options (teen), labelled A–D, written as infinitives or imperatives (no gendered forms). Option order is fixed in content, not randomised, so a teacher can discuss "option C".
- Each option has `class: best | ok | bad` and a consequence.
- **Junior consequence:** one paragraph. **Teen consequence:** a chained consequence in two beats, "Hneď:" and "Neskôr:" (an hour, a night or two days later), so the player sees how one tap grows.
- Every `ok` and `bad` consequence ends with the fixed line "Toto sa môže stať komukoľvek." and one "Ďalší krok:" sentence. `best` ends with a short confirmation of the habit (no cheerleading).
- No retry inside the case (the consequence is the lesson). "Hrať znova" on the debrief replays the whole case.

### 4.4 Mechanic M2v: verify channel (teen; a decision variant)

- One question "Ako/kde to overiť?" with 4 channels. Exactly one is `correct` (an independent channel the player opens or already knows); the other three are plausible wrong channels (the same thread, a number or link the suspect supplied, a search result or a crowd guess).
- A wrong pick shows why, then lets the player pick again until correct. Only the first pick counts for scoring.
- Implemented with M2's component (options + feedback), so no new engine work.

### 4.5 Mechanic M3: quick round "Dôvera alebo pasca"

- 5 cards, one at a time: a source line ("SMS · BZUK", "Mama osobne") and a short text. Two buttons: **Dôvera** / **Pasca**. Feedback shows "Správne." or "Tentoraz nie." plus the reason, then "Ďalej".
- Every round has 2–3 genuine (safe) items and 2–3 traps, so blind distrust can never get the star.
- Teen variant may relabel the buttons ("Bezpečné" / "Pasca"); the logic is identical.

### 4.6 Mechanic M4: lock-up (ordered steps)

Two sub-modes, both "tap cards in the right order":

- **M4a ordered steps.** 4–6 step cards are shown shuffled plus 0–2 distractor cards. The player taps cards to place them into numbered slots 1..n. Each step has an integer `rank`; steps with the **same rank are interchangeable** (this avoids punishing defensible orders). Tapping a card whose rank is not the lowest remaining: the card shakes, a gentle hint appears, the tap counts as one error, the card stays in the pool. Tapping a distractor: hint "Toto do postupu nepatrí, lebo …", one error, the distractor is greyed out. Finished when all steps are placed. Teen timelines (what to do first, second…) use this mode.
- **M4b passphrase builder (J3 only).** 9–12 word chips; some are decoys (things others can guess: town, year, pet, club name, the word "heslo"). The player picks 4 chips; they join with hyphens into a practice passphrase with a simple length bar. Picking a decoy chip shows a hint and counts one error; the chip is greyed out. A fixed note says "Toto heslo je len cvičné. Svoje skutočné heslo nikde neukazuj ani nepíš." No free text input anywhere.
- **Edge cases:** no time limit; the player cannot fail; after 3 errors on the same slot the correct card gets a soft highlight (accessibility).

### 4.7 Mechanic M5: debrief ("Spis prípadu")

Fixed layout, in this order:

1. Stars (0–3) with an accessible label "Hviezdy: n z 3".
2. "UZAVRETÉ" stamp and **the one rule** in the form „Keď…, tak…“ (junior ≤ 12 words, teen ≤ 15; identical on the debrief, the evidence card and the end screen; optional one-line extra under it, never inside it).
3. "Stopy v tomto prípade": 3–5 bullets (the key clues, found ones ticked, unfound ones listed under "Prehliadnuté stopy" without blame).
4. "Ak sa to už stalo": 3–6 numbered steps; the first concrete step is always doable today; the list always includes telling a trusted adult.
5. Story clue card ("Stopa k Tieňovi č. n" junior / "Do spisu: n" teen).
6. Rank line (only if the rank changes), the calm line "Toto sa môže stať komukoľvek. Dôležité je vedieť, čo urobiť ďalej." (when the decision was not `best`), buttons "Ďalší prípad", "Hrať znova", "Na úvod".
7. Help footer: Linka detskej istoty **116 111** and "Kde nájsť pomoc".

**Layer-1 budget** (this repo's `docs/PSYCHOLOGY.md` §1): junior ≤ 30 words (one clue, one rule), teen ≤ 40 words (the deciding clue, why it decides, one rule). The rest of the debrief is layer 2, below the fold.

### 4.8 Story scenes

Brief and arc scenes are chat-style lines (portrait + name + one or two sentences) with a "Ďalej" button and a "Preskočiť" link. No choices, no scoring. They never end on an unresolved threat.

## 5. Junior storyline: Kancelária STOPA

### 5.1 Cast (from the approved storyline v0.2)

| Who | Role |
|---|---|
| **Ty** | New member of the club. Never named, never gendered. |
| **Mira** | Founder of the club; calm, funny. "Detektív nič nerozbíja. Detektív si všíma." |
| **Fúzik** | Detective dog; explains hard words in one sentence. |
| **Lea**, **Tomáš** | Classmates and the first clients (J1, J2). |
| **pani učiteľka Šimková** | Leads the school game club (J3); a one-line adult. |
| **Babi Zora** | Runs the bakery under the office; the trusted adult; client in J4. |
| **Tieň** | Mystery scammer who "signs" with a small dragon 🐉. |

**Rule for the dragon.** The dragon is a *story* clue, never a real-world warning sign. Whenever it appears in a scan it is a `decoy` whose hint says "Podpis sám osebe nič nedokazuje. Skutoční podvodníci sa nepodpisujú." and the debrief story card is visually separate from the clues.

### 5.2 Arc (MVP: 4 cases, partial reveal)

| Case | Beat | Tieň clue added to the board |
|---|---|---|
| J1 Drak zadarmo | Lea is offered a free dragon skin in Kryptoria via a Bzuk DM. | The message is signed with a small dragon. |
| J2 Kód pre kamaráta | "Tomáš" asks the player for an SMS code; the real Tomáš walks in, his account was stolen. | The stolen account's status changed to 🐉. Tieň writes from stolen accounts. |
| J3 Zámok na účte | Tieň got into the school game club's account with a password leaked from the Kotol forum. | Tieň did not guess the password: it was in a leak. Tieň collects what people leave lying around. |
| J4 Kričiaca obrazovka | A scary "virus" pop-up on Babi Zora's tablet pushes a "cleaner" app. | A tiny dragon in the corner of the pop-up. Same dragon, four tricks. |

**Ending (arc scene after J4, partial reveal, no cliffhanger).** The club pins the four clues on the cork board and connects them with red string. Mira: "Štyri triky, jeden drak. Ale nikdy nič múdre: falošná výhra, požičaný účet, uniknuté heslo, strašiace okno." Babi Zora takes the board, with the children's parents, to the police. The answer comes back: Tieň is not one villain from Lipovec but a name for a group of scammers far away who send the same tricks to thousands of people. Who exactly they are is police work ("To už je práca pre políciu. My sme našli to podstatné."). Mira: "Tieň nevyhrá, keď ľudia vedia, na čo si dať pozor. Teraz to vieš aj ty." Final card: "Kancelária STOPA zostáva otvorená. Ukáž svoje stopy doma alebo kamarátovi." The storyline panels s07–s10 (Dvojníčka, QR, tenisky, Tieň útočí naraz) stay in the backlog for a later season; nothing in the MVP points to them.

### 5.3 Look

Cork board, paper folder, warm palette from the prototype (`--cork`, `--paper`, `--teal`). Comic portraits. Fúzik explains every technical word once ("dvojstupňové overenie = druhý zámok").

## 6. Teen storyline: Ozvena

### 6.1 Identity

**Ozvena** is a student podcast at the school in Lipovec, recorded in a converted storeroom next to the library, with a red "NAHRÁVAME" light. The player joins the **overovací stôl** (verification desk): the person who checks every tip before it goes on air. The case file is a digital "spis" with pinned screenshots and connecting lines, dark-blue night palette with one accent colour (signal amber), audio-waveform motifs. The voice is a calm investigative podcast, not a cartoon: short sentences, dry humour, no slang in teaching text.

Tagline on the start card: *„Niekto v Lipovci zbiera cudzie účty, heslá aj hlasy. Over to skôr, než to pustíme do éteru.“*

### 6.2 Cast

| Who | Role |
|---|---|
| **Ty** | New member of the verification desk. Never named, never gendered. |
| **Sára Lacková (15)** | Founder and host; her voice is the podcast. Target in T3 and impersonated in T4. |
| **Matej Kováč (14)** | Sound and editing, curious about tech, a bit overconfident. Client in T2 (he is the one who slips). |
| **pani Bieliková** | School librarian, former journalist, supervises the podcast. The trusted adult. |
| **Kristián (15, 9.B)** | Sends the first tip (T1). |
| **Oto** | Kristián's friend, off-screen; already said yes to Dax (recovery is taught through him). |
| **Nela (14)** | Matej's friend; receives a link from his hijacked account (T2). |
| **pani Lacková** | Sára's mother; receives the "new number" voice note (T4). |
| **Dax** (`@dax_brigady`) | A friendly, polished "recruiter" with a lifestyle profile. Turns out to be a mask. |

**Cameo.** A "Kancelária STOPA" sticker on the library door and the shared apps (Bzuk, Kryptoria in the background) make it one town. No knowledge of the junior track is needed.

### 6.3 Arc: "Kto je Dax?"

The team plans an episode on summer jobs and gets a tip about an "easy job". Each case adds one pin to the spis, and each case's attack uses something the people of Lipovec left lying around: a bank account, saved passwords, public personal details, a public voice.

| Case | Beat | Pin in the spis |
|---|---|---|
| T1 Ľahká brigáda | Dax offers Kristián 150 €/week "for using his bank account". Oto already sent his login. | Dax's contact for "payments" is `@kvapka.desk` in Bzuk. |
| T2 Cheat zadarmo | Matej ran a free Kovoboj cheat; next morning his accounts send links to friends. | The cheat site's "Podpora" page lists the same `@kvapka.desk`. Dax and the cheat are connected. |
| T3 Bez signálu | At 21:10 Sára's phone loses signal while her mother's has it; a password reset she did not ask for arrives, and a fake "Záber Obnova účtu" profile asks for the code. Her birth date and number are public on her profile. | The attackers used Sára's public number and birth date. Matej notes: "Sárin hlas je verejne v 40 hodinách podcastu." |
| T4 Nové číslo | Sára's mother gets a message and a voice note in Sára's voice from a "new number" asking for 290 €. Sára is out of the studio, her phone on silent. | The voice was made from podcast episodes. |

**Why T4 is the cloned voice / "new number" case and not the fake-influencer investment ad.** (1) It closes the chain: the attackers fail to take Sára's account in T3, so they use the one thing that is public anyway, her voice. It is also the best-sourced teen case (ESAs factsheet in Slovak, NBS). (2) It turns the player into the protector of their own family, which is realistic for 13–15 (they rarely have money to invest, but their parents receive "mami, mám nové číslo" messages) and gives a concrete habit to take home: call the old number, agree a family code word. (3) Its verify step is the richest in the track: the known number does not answer, and the player must still not accept the new channel. The investment ad (A5.1) still appears once, as a trap item in the T4 quick round, so the threat is named.

**Ending (arc scene after T4).** On the spis, Matej runs Dax's profile photo through a reverse image search with pani Bieliková: the same face sits on four profiles with four names. Pins connect: the `@kvapka.desk` contact (T1, T2), public personal details (T3), the podcast voice (T4). Pani Bieliková, with the parents, hands the spis to the police. Sára: "Dax nie je človek. Je to maska. Za ňou je skupina ľudí ďaleko odtiaľto, ktorá nepotrebuje byť geniálna. Stačí jej, keď sa ponáhľame." The red light turns on and episode 5 "Požičané ja" goes on air. Sára's closing words, which are also the track's summary rule: "Spomaľ. Over si to inou cestou. Povedz to niekomu." Final card: "Spis uzavretý. Odvysielané." with the four rules and the help card. Nobody is in danger, nothing is left open.

## 7. Progression

- **Unlocks.** Within a track, case n+1 unlocks when case n is *finished* (any number of stars). The arc scene plays after the 4th case is finished. Both tracks are open from the start.
- **Replay.** Any finished case can be replayed; the best star count per case is kept.
- **Stars** per case: 0–3 (rules in §8). Track total: 0–12.
- **Ranks are badges, not role nouns** (Red Line 9 forbids gendered nouns for the player; the prototype's "nováčik / detektív" must change). Ranks come from the track's total stars and are generous, so finishing with average play reaches the third badge.

| Track total stars | Junior badge | Teen pass ("preukaz") |
|---|---|---|
| 0–2 | Papierová lupa | Preukaz: stáž |
| 3–5 | Bronzová lupa | Preukaz: overovanie |
| 6–8 | Strieborná lupa | Preukaz: reportáž |
| 9–12 | Zlatá lupa | Preukaz: hlavný spis |
| All 4 cases finished (any stars) | Odznak STOPA | Odznak "Odvysielané" |

- **Completion screen** per track: badge, the four rules (one per case), the "Ak sa to už stalo" cards, the help card. No totals of mistakes, no ranking against others.
- **Storage** (`localStorage`, key prefix `stopa.`): `stopa.track.<junior|teen>.case.<id>.best` (0–3), `.finished` (bool), `stopa.settings` (sound, text size, reduced motion). Nothing else. A "Vymazať postup" button on the start screen.

## 8. Scoring rules (exact)

### 8.1 Junior case stars

| Star | Rule |
|---|---|
| ★1 Stopy | Clues found ≥ `starClues` (J1, J2, J4: 4 of 5; J3: 3 of 4). Decoy taps never matter. |
| ★2 Rozhodnutie | Decision class `best`. |
| ★3 Výcvik | TT: ≥ 4 of 5 correct. Lock-up (J3): total errors ≤ 2. |

### 8.2 Teen case stars

| Star | Rule |
|---|---|
| ★1 Dôkazy | Clues found ≥ `starClues` (given per case, about 75 % of all clues) **and** decoy taps ≤ 2. |
| ★2 Rozhodnutie | Decision `best` **and** verify channel correct on the first pick. |
| ★3 Výcvik | Lock-up: total errors ≤ 1 (distractor taps count). TT: ≥ 4 of 5 correct. |

### 8.3 Principles

- Stars never block progress. 0 stars still finishes the case and unlocks the next one.
- A `bad` decision is not a "fall" counter; there is no lives system.
- The decoy rule is the main teen difficulty lever: tapping everything is not a strategy.
- Hints and tips are free (accessibility).
- The star rules are constants per case in content (`starClues`, `maxDecoys`, `ttMin`, `lockupMaxErrors`) so balancing is data-only.

## 9. Difficulty: junior vs teen (concrete)

| Lever | Junior | Teen |
|---|---|---|
| Artefacts per case | 1–2 | 2–3, across different devices (DM + web page + notifications, etc.) |
| Clues / decoys per case | 4–5 clues, 2–3 decoys | 6–9 clues, 4–5 decoys |
| Clue visibility | Loud: caps, "ZADARMO", obvious foreign link | Subtle: good grammar, polite *vy*, plausible domains, real app prompts carrying a false situation |
| Genuine artefacts in the scan | Rare (the J3 login alert, the tablet's own install prompt in J4) | Regular: a real game notification (T2), a real password-reset email (T3), the player's own public profile (T3) |
| Clues needed to continue / for the star | 3 / 4 | 4 / about 75 % and ≤ 2 decoys |
| Decision options | 3 | 4, two of them plausible |
| Consequence | One step | Chained in two beats ("Hneď:" / "Neskôr:") |
| Verify channel step | No (the habit is inside the best option) | Yes, every case; first pick scored |
| Drill | TT in J1, J2, J4; passphrase + order in J3 | Ordered recovery timelines with distractors (T1, T2); TT with calibration items (T3, T4) |
| Recovery | Listed in the debrief | Played as a scored drill in two cases, listed in all |
| Story | One mystery, comic, warm | Chained investigation, each case enables the next |
| Text | Reading age 11, ≤ 14 words per sentence where possible | Reading age 13, ≤ 18 words |

## 10. Learning objectives

| ID | Objective (the player can…) | Cases |
|---|---|---|
| LO-X1 | Pause and verify through a channel they open or already know, never the one the message supplies. | all |
| LO-X2 | Name telling a trusted adult as a first-line action when money, codes, strangers or account loss are involved. | all |
| LO-X3 | Recall the first two "Ak sa to už stalo" steps for the case's threat. | all |
| LO-X4 | Tell neutral details (logo, name, photo, voice, follower count, polite tone, missing diacritics) from real tells (the ask, the hurry, the channel). | all, scored in teen |
| LO-J1 | Log in to a game only through the game or its app; free-item offers that ask for a login are a trap. | J1 |
| LO-J2 | Never share a login or SMS code, even with a friend; verify a friend by another channel. | J2 |
| LO-J3 | Build a long passphrase, use a different password per account, turn on two-step verification. | J3 |
| LO-J4 | Install apps only from the official store; check who made an app and what permissions it wants; refuse unneeded permissions and uninstall, even when a scary window pushes. | J4 |
| LO-T1 | Recognise money-mule recruitment (the job is your bank account) and refuse; know the "already said yes" order. | T1 |
| LO-T2 | Get games and add-ons only from official stores or the developer; don't run downloaded cheats; if passwords were stolen, recover from a clean device, email first, remove unknown devices, two-step login. | T2 |
| LO-T3 | Treat a sudden, longer loss of signal as a reason to tell a parent, who calls the operator at once; never give a one-time code to anyone, including "support" or "the operator"; use official recovery you open yourself; share less personal detail; prefer app-based sign-in to SMS. | T3 |
| LO-T4 | Treat a voice or photo as no proof; for "new number + money", call the old number or someone who is with the person; agree a family code word. | T4 |

## 11. Accessibility, devices and time

- **Mobile first** (360 px wide), works on school desktops and tablets; touch targets ≥ 44 × 44 px (clue spans are padded line segments, never single short words).
- **Keyboard:** every tappable span is a `<button>`; Tab order follows reading order; Enter/Space activate. Visible focus ring.
- **Screen reader:** artefacts have an `aria-label` ("Správa v aplikácii Bzuk"); hints in an `aria-live="polite"` region; stars and meters have text equivalents.
- **Colour is never the only signal:** found clues get a tick icon + underline; decoys a "?" icon.
- **No real timers.** In-world countdowns (J1 "do 15 minút", J4 "00:59") are static text or loop silently; with `prefers-reduced-motion` they never animate.
- **Text size** toggle (100 % / 125 %), sound off by default, no flashing (the J4 pop-up "blinks" at most by a static red border).
- **Session safety:** every step can be left; progress saves after each finished case; a case resumes from its start.
- **Lesson fit:** a track ≈ 20–25 min of play; teacher can project one case and discuss its decision.
- **Bundle:** text and SVG art only; no video, no audio files required (voice notes are transcripts with a waveform graphic).

## 12. Content rules for writers (summary; CLAUDE.md wins)

1. **Fictional names only** (Red Line 1). Registry needed in `content/brands.yaml`: Kryptoria (game), Pixelbrána (launcher), Bzuk (chat app), Záber (photo social network), Klipko (video platform), Kovoboj (teen shooter game), Fórum Kotol (gaming forum), Javor banka (bank), Telko Lúč (mobile operator), Kvapka Partners (fake firm). `sceptic-reviewer` checks none collides with a real brand.
2. **Identifiers:** domains only `*.example`; phone numbers masked as `+421 9•• ••• 507`; IBANs start `SK00` (check digits 00 are never valid, so every IBAN fails the checksum by construction).
3. **No working material:** fake login pages are drawn as static, visibly-in-game images; no input fields that look like credential capture; the J3 passphrase is built from chips, never typed.
4. **No mechanism walkthroughs:** say "program vzal uložené heslá z počítača", never how; say "hlas sa dá napodobniť z nahrávok", never how.
5. **Gender-free player text:** present tense, imperatives, infinitives, noun phrases. Watch *si + l-participle* (*stihol, klikol, žiadal*), *sám/sama*, *pripravený*. Applies also to in-world messages addressed to the player. Known prototype fixes: "aby si to stihol niekto overiť" → "aby nebol čas niečo overiť"; ranks "nováčik / detektív" → badges (§7).
6. **Decoys are neutral details, never wrong answers:** logos, names, profile photos, follower counts, view counts, polite tone, the voice itself, emoji, time of day, missing diacritics. A feature becomes a clue only if `fraud-researcher` confirms a source for it (marked "source needed" in CASE_SPECS).
7. **Money-mule wording (T1):** Kristián and Oto are targets, never criminals; the legal consequence sentence appears once, in the debrief, followed by the next step; no punishments, prison or parents' liability on screen; never "nebudeš mať problém".
8. **Every case cites** at least one Slovak or EU source in `content/sources.yaml` (Red Line 6); CASE_SPECS lists the source ids per case and keeps every teaching claim inside `docs/SOURCES.md` "Facts we can teach". Supporting-only (non-EU or industry) sources never count alone.
9. **Child safety (Red Line 8):** sextortion, grooming, bullying never as cases; help cards only.

## 13. Data model hints (for frontend-engineer)

```yaml
id: T2
track: teen            # junior | teen
title: Cheat zadarmo
threat: [B2.4, B3.1]
lo: [LO-T2, LO-X1, LO-X3]
sources: [<ids>]
brief: [{who: sara, text: "..."}]
steps:
  - type: scan
    minClues: 4
    artefacts:
      - id: A
        kind: videoPage      # dm | sms | email | profile | post | videoPage | webPage | popup | lockscreen | callLog | voiceNote
        label: "Dôkaz A · Video na Klipku"
        parts: [{id: free, kind: clue, text: "...", hint: "..."}, {id: views, kind: decoy, text: "...", hint: "..."}, {text: "..."}]
  - type: decision
    options: [{id: A, text: "...", class: bad, now: "...", later: "...", next: "..."}]
  - type: verify
    prompt: "..."
    options: [{id: c, text: "...", correct: true, feedback: "..."}]
  - type: lockup        # or: tt
    mode: order         # order | passphrase
    steps: [{text: "...", rank: 1}]
    distractors: [{text: "...", hint: "..."}]
debrief: {rule: "...", clues: [...], ifHappened: [...], storyClue: "..."}
stars: {starClues: 6, maxDecoys: 2, lockupMaxErrors: 1}
```

Schema validation in CI should also enforce: ≥ 1 decoy per artefact in teen, TT has ≥ 2 safe and ≥ 2 trap items, every `ok`/`bad` option has `next`, every domain ends `.example`, every IBAN starts `SK00`.

## 14. Out of MVP

- Storyline panels s07–s10 (fake profile, QR sticker, fake shop, combined finale) and a second teen season (fake investment ad as a full case, ClickFix, data-breach phishing). MFA push spam stays out until an SK or EU source exists.
- Teacher mode (lesson plan, class discussion prompts in-game, printable certificate). The storyline prototype's "Otázka pre triedu" can ship as a PDF outside the game later.
- Audio voice-overs, real audio of voice notes (transcripts only in MVP).
- English or other languages (Slovak only; strings still go through i18n files).
- Free-text input of any kind, accounts, leaderboards, sharing, analytics.
- Timers, lives, streaks, daily rewards.
- Store packaging (web PWA only until Roman approves).

## 15. Open questions for Roman

1. **Teen identity:** is "Ozvena" (school podcast, verification desk, antagonist mask "Dax") the right fit, or should the teen track keep "STOPA" in its name for brand continuity (for example "STOPA: Ozvena")?
2. **Ranks:** approve replacing "nováčik / detektív" with badges ("Bronzová lupa", "Preukaz: overovanie") to meet the gender-neutral rule.
3. **Open tracks:** confirm both tracks are open to everyone with the age shown only as a recommendation.
4. **T4 choice:** confirm the cloned-voice / "new number" case over the fake-influencer investment ad (reasons in §6.3).
5. **Thin sourcing (decided by the producer 2026-11-25, for Roman's information):** MFA push spam is dropped (no SK/EU source), T3 is now SIM swap + fake account recovery (ENISA). J4 keeps the scare pop-up only as the setting and teaches the SK-CERT store-and-permissions habit; T2 teaches official stores and "don't run downloaded cheats" without claiming an SK/EU warning about cheat infostealers. Roman may still prefer to replace the J4 lure with SK-CERT's "app from a deceptive ad".

## 16. Hand-offs

- **frontend-engineer:** §4 (mechanics M1–M5, M2v, M4a/b), §7–8 (progression, storage, scoring), §11 (accessibility), §13 (data model).
- **scenario-writer:** `docs/CASE_SPECS.md` for all text; §5–6 for voice and cast; §12 for rules.
- **fraud-researcher:** every clue marked "source needed" in CASE_SPECS, the sources per case, and the T3 fallback question.
- **learning-psychologist:** §2, §4.7, §6 (teen tone), §8 (stars and ranks), T1 and T4 wording.
- **ux-artist:** two visual identities (cork comic vs night-blue spis), devices: chat, SMS, email, profile/post, video page, web page, pop-up, lock screen, call log, voice-note transcript.

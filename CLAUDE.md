# CLAUDE.md — Kancelária STOPA (VALIDION kids' cybersecurity game)

Every Claude Code session and every agent in `.claude/agents/` in this repo obeys this file. The agent definitions were copied from the Scam Atlas project; where they mention Scam Atlas, cities, chapters or `docs/PLAN.md` of that project, read them as this game, its tracks and cases, and this repo's docs.

## What we are building
A short, free browser game in **Slovak** that introduces children aged **11 to 15** to cybersecurity, for VALIDION's cybersecurity awareness programme. Two tracks, chosen on the start screen:

- **Junior track (11–12): "Kancelária STOPA".** A detective club of classmates in the fictional town of Lipovec solves internet cases. Warm comic style, simple evidence, one trick per case. A mystery scammer "Tieň" (signs with a small dragon) is unmasked at the end.
- **Teen track (13–15):** harder cases and a different, more grown-up storyline (designed in `docs/GDD.md`): several pieces of evidence per case, better-made fakes, chained consequences, and threats teens actually meet (money-mule "easy job" offers, cracked-game infostealers, SIM swap and account recovery, MFA push spam, cloned voice / "new number", investment and crypto ads, data-breach follow-ups).

Each case is about 5 minutes, so a track fits one 45-minute lesson. The player only ever **defends**: spotting clues, choosing the safe action, verifying another way, telling a trusted adult.

## Red Lines (non-negotiable; the `sceptic-reviewer` blocks any change that breaks them)
1. **Fictional brands only.** No real company, bank, game, launcher, platform, app, influencer, school, government body or person is imitated: no real logos, names, domains, phone numbers, IBANs or UI look-alikes. Real organisations may be *named only* on the help screen ("Kde nájsť pomoc") as factual references.
2. **No working attack material.** No functional phishing pages, credential-capturing forms, malware, scripts that send messages, payloads or attack walkthroughs. Fake login forms in the game never send data anywhere and are visibly part of the game.
3. **Non-routable identifiers.** Domains use `.example`, `.test` or `.invalid`. Phone numbers are fictional or masked. IBANs are invalid by checksum. QR codes resolve only to an in-game route.
4. **Defensive framing.** Every case ends with a debrief: the clues, the one rule, and "Ak sa to už stalo" (what to do if it already happened). Never "how a scammer would do it".
5. **Respectful and calm.** No mocking, no shame, no fear. After a slip: "Toto sa môže stať komukoľvek." and one fixing step. No exclamation marks in teaching text.
6. **Accuracy.** Every case cites at least one public, reputable Slovak or EU source in `content/sources.yaml` (SK-CERT/NBÚ, Polícia SR, NBS, SOI, Slovenská banková asociácia, ENISA, Europol, Better Internet for Kids / Zodpovedne.sk, etc.). The `fraud-researcher` verifies.
7. **Privacy.** No tracking, analytics, ads, accounts, or typed-in names. Progress lives in `localStorage` only. Nothing leaves the device.
8. **Child safety.** Sextortion, grooming, self-harm and cyberbullying are never played as cases; they appear only as calm help cards with **Linka detskej istoty 116 111** and "povedz to dospelému, ktorému dôveruješ". No sexual, violent or gory content. "Tell a trusted adult" is always a valid, rewarded choice where money, threats or strangers are involved.
9. **Slovak tone.** Informal *ty*; no gendered forms about the player (no *klikol si / klikla si*, no *(a)* endings, no *hráč/hráčka*): use present tense, imperatives, infinitives, noun phrases. Reading age about 11 for the junior track, about 13 for the teen track. Sentences under about 18 words.

## Tech stack
TypeScript, Vite, Preact, CSS modules or plain CSS, static site, installable PWA with offline play. Content as data in `content/` (validated by a schema at build and in CI). Vitest for logic and content validation; Playwright smoke play-through (run with `--trace off`); axe-core for accessibility. Target bundle under 1 MB. CI on GitHub Actions using Roman's **self-hosted runner** (`runs-on: [self-hosted]`). No deploy without Roman's approval.

## How work is run
- `docs/STATUS.md` is the single source of truth (done, in progress, next). Update it at the end of every task.
- Every change passes `sceptic-reviewer`; content also passes `fraud-researcher`; UI also passes `qa-playtester`; story and UI also pass `learning-psychologist`.
- Licence: code MIT, content CC BY-SA 4.0.

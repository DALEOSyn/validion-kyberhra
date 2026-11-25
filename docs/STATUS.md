# STATUS — Kancelária STOPA MVP

Format: `YYYY-MM-DD · owner · task · state · note`

## MVP goal
Playable Slovak web game with two tracks (Junior 11–12, Teen 13–15), 4 cases per track, help screen, progress in localStorage, offline PWA, tests and CI. Reviewed by sceptic, fraud-researcher, learning-psychologist and QA.

## Log
- 2026-11-25 · producer · repo skeleton, CLAUDE.md, agents copied · done · repo not yet on GitHub (Roman to create `daleosyn/cybersec-for-children`)
- 2026-11-25 · fraud-researcher · content/sources.yaml + docs/SOURCES.md (8 MVP cases + SK help screen) · done (awaiting sceptic review) · J2, T1, T4 well sourced; J1, J3 medium; J4 and T2 thin (lure only from non-EU/industry); T3 MFA push spam has no SK/EU source (producer decision); Stopline not shown (Ochráň ma is current EU-listed hotline)
- 2026-11-25 · learning-psychologist · docs/PSYCHOLOGY.md v0.1 (track motivation, teen storyline, emotional safety, habit transfer, pre/post check, review checklist) · done · needs native SK check of example lines, fraud-researcher check of money-mule and trusted-adult wording, and a qualified human review of §3 before pilot (Roman decides)
- 2026-11-25 · game-designer · docs/GDD.md + docs/CASE_SPECS.md (two tracks: Kancelária STOPA junior, Ozvena teen; 8 cases with clues, decoys, decisions, verify, drills, debriefs, star rules) · done (awaiting sceptic, fraud-researcher, learning-psychologist review) · aligned with SOURCES.md after producer note: T3 rebuilt as SIM swap + fake account recovery (no MFA push spam), J4 and T2 teach only store/permissions/no-cheats habits; rules in „Keď…, tak…“ form; items marked "fraud-researcher confirms" are plain until sourced; open for Roman: teen identity "Ozvena", badge ranks instead of nováčik/detektív, open tracks, T4 choice. Note for learning-psychologist: PSYCHOLOGY.md §4 teen rule example and pre/post item 4 still describe push spam
- 2026-11-25 · frontend-engineer · MVP engine + UI (Vite/Preact/TS, two themed tracks, Zod content schema + docs/CONTENT_SCHEMA.md, J1 ported, teen t1 placeholder, progress/unlocks/ranks in localStorage, help screen, PWA offline, red-line linter, Vitest + Playwright/axe, CI) · done, awaiting review · bundle 280 KB total (JS 19 KB gzip); not built yet: GDD M4b passphrase builder, evidence tabs and images, track completion screen; needs sceptic-reviewer, qa-playtester, learning-psychologist

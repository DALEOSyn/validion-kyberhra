# Sceptic review: Kancelária STOPA MVP (main @ d7c203a)

Reviewer: sceptic-reviewer · 2026-11-25 · Standard: CLAUDE.md Red Lines 1–9.

## Verdict: FAIL

1 blocker · 3 major · 9 minor. `npm run check` is green (typecheck, lint, Vitest, red-line lint, build) and `npm run e2e` is green (10/10, axe clean, no external requests, offline works).

## Findings

### Blocker

1. **blocker** · `content/cases/junior/j1-drak-zadarmo.yaml:84-102` · Red Line 8: a stranger ("Kryptoria_Oficial_Team · nový kontakt") is after an 11-year-old's game login, and none of the three decision options lets the player tell a trusted adult. The adult only appears in `if_it_happened`, which is too late to count as a choice. Red Line 8 says telling a trusted adult is "always a valid, rewarded choice" where strangers are involved. **Fix:** put "a povedať to dospelému" into the `verify` (best) option text and its consequence, or add it as a rewarded option. Add a validator rule, or at least a content test, so that every case flagged money, threat or stranger offers it.

### Major

2. **major** · `content/cases/teen/t1-lahka-brigada.yaml:227-229` · Accuracy and target framing. "Posielať cez svoj účet peniaze za niekoho iného je trestný čin, aj keď to človek nevedel." has two problems. (a) It is too broad: sending money on someone else's behalf is often legal (paying for a friend, for example). (b) "aj keď to človek nevedel" goes beyond the NBS sources. Those say mules often do not *realise* that what they are doing is an offence. They do not say the offence applies whatever the person knew. Told to 13–15-year-olds (some of whom are under 14, the age of criminal responsibility), the sentence works as a threat and casts the teen as an offender. That breaks GDD §12.7 and PSYCHOLOGY §2 ("target, never a criminal"). **Fix:** narrow it to what the sources support, e.g. "Posielať ďalej cudzie peniaze cez svoj účet môže byť trestný čin. Mnohí mladí to nevedia." Keep the next-step sentence. The fraud-researcher re-checks it against sk-nbs-crypto-mule-2025, and CASE_SPECS.md:360 and SOURCES.md T1 are aligned to match.
3. **major** · `.github/workflows/ci.yml:1-35` · CI does not run `npm run e2e`. CLAUDE.md makes the Playwright play-through and axe part of the stack, and the only checks on CSP, the service worker, offline play, the no-external-request guard and accessibility live in that suite. As it stands, a PR can break all of them and still pass CI. **Fix:** add an e2e job (`needs: checks`, `npm ci`, then `npm run e2e` with `CI=1`). Rely on browsers already on the self-hosted runner through `PLAYWRIGHT_BROWSERS_PATH`, as playwright.config.ts expects. Do not use `--with-deps`, which needs sudo.
4. **major** · `.github/workflows/ci.yml:6,19` · `on: pull_request` together with `runs-on: [self-hosted]`. If the repo becomes public, any fork PR runs arbitrary code (`npm ci` lifecycle scripts, tests) on Roman's machine. **Fix:** gate the job with `if: github.event_name == 'push' || github.event.pull_request.head.repo.full_name == github.repository`. Also note in DECISIONS/README that the repo setting "require approval for all outside collaborators" must be on before the repo goes public.

### Minor

5. **minor** · `src/content/schema.ts:280-285`, `scripts/lib/content.ts` · Red Line 8 needs 116 111 to be present, and `HelpLine` (src/ui/Help.tsx:37) shows `entries[0]` under every debrief. Nothing checks that the first entry is Linka detskej istoty 116 111: a reorder would silently put another number there. **Fix:** add a validator check and a unit test.
6. **minor** · `scripts/lib/redline.ts:85-96` · The gender heuristic misses common shapes. I tested these and each returned 0 hits: "Ak si to už poslal", "Ak si ho už nainštaloval", "Keď si už heslo zadal", "Dobre si to zvládla", "a klikol si", "Buď opatrný", "Zostaň pokojná", "si skvelý detektív". The current content is clean (I read all 8 cases and the UI strings by hand). **Fix:** let `OBJ` take up to two words, add "a/aj/no" before `L_PART si`, add `buď|zostaň|ostaň + -ý/-á` and `si + adjective + noun`, and add these strings to tests/unit/redline.test.ts.
7. **minor** · `scripts/lib/redline.ts` · Red Line 3 is only half automated: there is no phone or IBAN check. The content is fine today (masked numbers; T4 IBAN `SK00…` fails mod-97). **Fix:** flag any IBAN that passes mod-97 and any unmasked run of 9 or more digits that looks like a phone number.
8. **minor** · `content/cases/teen/t1-lahka-brigada.yaml:88,128-129` vs `docs/PSYCHOLOGY.md:44` ("never on screen: how money moves") · The 90 %/10 % split and the "later" laundering chain (a buyer's payment arrives and is forwarded within the hour) are more mechanics than recognition needs. It is not a playbook, but it contradicts the project's own rule. **Fix:** "Väčšinu pošleš ďalej, kúsok si necháš." and drop the buyer detail, or amend PSYCHOLOGY §2 explicitly.
9. **minor** · `content/cases/junior/j1-drak-zadarmo.yaml:71`, `j2-kod-pre-kamarata.yaml:223`, `j4-kriciaca-obrazovka.yaml:274` · "Skutoční podvodníci sa nepodpisujú." is false as a general statement: the same message is signed "Tím Kryptoria". It could also teach 11-year-olds that a signed message is not a scam. **Fix:** "Podpis nič nedokazuje. Ale toho draka si zapamätaj."
10. **minor** · `content/cases/junior/j2-kod-pre-kamarata.yaml:199` · "Toto je naozajstná SMS od Bzuku." bases authenticity on the sender name, and SMS sender names can be faked. **Fix:** "Kód je pravý. Problém nie je SMS, ale kto ju od teba chce."
11. **minor** · `content/cases/junior/j2-kod-pre-kamarata.yaml:165-168` · A stale comment says the vote-2026 source is cited "in a comment only", but line 170 cites it. **Fix:** delete the comment.
12. **minor** · `content/cases/teen/t1-lahka-brigada.yaml:9` · The summary is shown on the track screen and starts with the English word "Recruiter". **Fix:** "Dax ponúka…".
13. **minor** · code hygiene, grouped:
    (a) `vite.config.ts:61`: the SW version hashes file names and chunk code lengths only. A change that touches only `public/`, `index.html` or the CSP leaves sw.js byte-identical, so returning players keep the stale cache-first copy. Hash the asset `source` too.
    (b) `vite.config.ts:72`: `style-src 'unsafe-inline'` looks unneeded (Preact sets styles through the CSSOM). Remove it and re-run e2e.
    (c) `src/app.tsx:56`: reset calls `setProgress` without `saveProgress`, so the sound and lastTrack settings are lost on reload.
    (d) `prototypes/*.html:3`: the prototypes load Google Fonts. They are not shipped, but opening them makes a third-party request. Switch to local fonts or add a header warning.
    (e) `tests/e2e/smoke.spec.ts`: only J1 and T1 are played. Add a data-driven play-through of every case's best path.

## Checked and clean
- Red Line 1: I grepped every case and tracks.yaml for 90+ game, platform, messenger, bank, telco and courier names: no hits. Bzuk, Záber, Klipko, Kryptoria, Kovoboj, Pixelbrána, Telko Lúč and Kvapka Partners have no real-brand colours or UI. Real organisations appear only in help.yaml and sources.yaml. Case `sources:` ids are not rendered in the UI.
- Red Line 2: T1 and T2 show only the victim side. There are no file names, extensions, malware names or install steps, and the cheat lure is shown as a clue, not an instruction.
- Red Line 3: all domains are `.example`; phone numbers are masked; the IBAN check digits are invalid.
- Red Line 4: all 8 debriefs have clues, a rule and "Ak sa to už stalo", and HelpLine shows 116 111 under every debrief and arc scene.
- Red Line 5: no "!" in case text. Every bad outcome carries "Toto sa môže stať komukoľvek." and one next step.
- Red Line 6: every case cites a tier 1–3 SK or EU source, and the validator enforces this. T2 and T4 make no claim that an SK or EU body warned about their lure.
- Red Line 7: CSP is `default-src 'self'`; no fetch, beacon or analytics; localStorage only; the e2e guard really fails on external requests (I confirmed this with a scratch test).
- Red Line 8: no sextortion, grooming or bullying case.
- Red Line 9: no gendered player forms found by hand; all case sentences are 18 words or fewer.
- XSS: no `dangerouslySetInnerHTML` or `innerHTML`; all content renders as JSX text.
- SW: same-origin GET only, own files only, scope `./`.
- Dependencies: 4 runtime deps, `npm audit` reports 0 vulnerabilities. Actions are SHA-pinned, `persist-credentials: false`, `contents: read`.

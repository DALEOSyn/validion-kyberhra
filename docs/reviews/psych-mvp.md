# Psychology review: MVP content and UI

Reviewer: `learning-psychologist` (AI advisor, not a licensed psychologist) · Date: 2026-11-25 · Checklist: `docs/PSYCHOLOGY.md` §5 (items C1–C14 below).
Scope: `content/tracks.yaml`, `content/cases/junior/*.yaml`, `content/cases/teen/*.yaml`, `content/help.yaml`, `src/app.tsx`, `src/ui/*.tsx`, `src/styles/*.css`, intent in `docs/GDD.md`.
Slovak wording below needs a native reader's check. Legal and factual wording also needs `fraud-researcher`.

## Verdict: FAIL

2 blockers and 7 majors. The blockers are small text fixes. Most of the content is strong. The tone is calm, and there is no shame wording, no exclamation marks and no gendered forms about the player (I grepped for *-l si / -la si*, *(a)*, *hráč*, *naletieť*, *obeť* and found nothing). Every slip gets "Toto sa môže stať komukoľvek." plus one next step in the same panel. The recovery lists are ordered. The money-mule and infostealer cases never show mechanism or glamour. There are no dark patterns: no streaks, no rankings, no timers, sound is off by default, and the reset confirmation is neutral.

### Does the teen track meet the client's "harder and different" bar?
**Mostly yes in the content, but not yet in the experience.**
- **Harder:** 2–3 artefacts per case, decoys that cost the evidence star, a verify step with retries, chained "Hneď / Neskôr" consequences, recovery drills, and real teen threats (mule, infostealer, SIM swap, cloned voice).
- **Different:** the podcast verification desk, a cast aged 14–16, no mascot, a faceless "maska" opponent, a dark muted theme, and the teen as the competent one in the family.

Four things undercut it:
- The start screen is branded as the junior club (finding 3).
- The best option is always the longest one, so it can be guessed without reading (finding 4).
- T4 tells the player the answer before the case starts (finding 5).
- The debrief looks the same in both tracks and runs far past the layer-1 budget (finding 6).

Fix findings 3–6 and the teen track meets the bar.

---

## Blockers

**1. T1: the legal sentence calls an unknowing target a criminal and gives no clear action.** (C5 No fear, C11 No glamour / target never a criminal, §2 Money mules)
- File: `content/cases/teen/t1-lahka-brigada.yaml` → `debrief.note`
- Problem: "…je trestný čin, aj keď to človek nevedel." The story has just shown Oto doing exactly this without knowing. So the line tells the player that Oto, the target, committed a crime. That contradicts the "target, never a criminal" framing. It is also a heavy legal claim that `fraud-researcher` has not verified in this form. The next step that follows, "skorá pomoc je správny krok", is too vague to work as the controlling action.
- Replace with (the §2 draft, still subject to `fraud-researcher` verification):
  > Posielať cez svoj účet cudzie peniaze je trestný čin a zodpovednosť môže niesť majiteľ účtu. Ak sa to už stalo, čím skôr to povieš dospelému, tým lepšie. Ak ťa niekto tlačí pokračovať, je to dôvod hľadať pomoc hneď.

**2. J1: no trusted-adult option, although a stranger contacts the child.** (C7 Trusted adult, Red Line 8)
- File: `content/cases/junior/j1-drak-zadarmo.yaml` → `decision.options[id=verify].text`
- Problem: an unknown account messages Lea, but none of the three options includes telling an adult. Red Line 8 requires this to be a valid, rewarded choice.
- Replace with:
  > Neklikať. Otvoriť Kryptoriu priamo a pozrieť správy v nej. Účet v Bzuku nahlásiť a ukázať to dospelému.
- Also change `consequence` to:
  > Lea otvorí Kryptoriu vlastnou cestou. V hre žiadna výhra nie je. Správu ukáže mame a účet v Bzuku nahlási. Tieň odchádza naprázdno.

## Major

**3. The start screen is the junior club, so 13–15-year-olds enter through a children's brand.** (C10 Track fit; GDD §3 "Start screen")
- File: `src/ui/StartScreen.tsx`; `content/tracks.yaml` → `tracks[*].age`
- Problem:
  - The heading reads "Detektívny klub · Lipovec" and the logo reads "Kancelária STOPA". The whole start screen therefore presents Ozvena as a sub-level of the kids' club.
  - The age labels read "11 – 12 rokov" and "13 – 15 rokov", which feel like a gate. The GDD specifies "odporúčame".
  - The cards show no per-track progress.
  - A teen's first impression decides engagement (Yeager et al. 2018).
- Fix:
  - Make the start screen neutral. Heading: **„Lipovec · internetové prípady“**. Logo: **„Vyber si trasu“**.
  - Note: **„Na internete sa skrývajú falošné ponuky, ukradnuté účty a nastražené odkazy. Vyber si trasu.“**
  - Set `age` to **„odporúčame 11 – 12 rokov“** and **„odporúčame 13 – 15 rokov“**.
  - Show "Uzavreté: n/4" on each card.
  - Make sure the teen card is styled with the teen tokens, not only `.teen-preview`.

**4. The best option is always the longest and most complete, so it can be guessed without judging.** (C10 Track fit "obvious right answers"; the teen "harder" bar)
- Files and current word counts:
  - T1 `decision.options[refuse]` (16 words, against 7–9 for the others)
  - T2 `[clean-start]` (27, against 7–12)
  - T3 `[tell-mum]` (35, against about 9)
  - T4 `[wait-old]` (18, against 4–9)
  - The same pattern appears in J1, J3 and J4.
- Problem: the length cue makes the right answer readable from the text's size. It also breaks the cognitive-load budget on the decision screen.
- Fix: keep every option at about 8–14 words, move the detail into `consequence`, and make one distractor equally thorough-sounding.
  - T1 refuse: **„Odmietnuť, Daxa nahlásiť a povedať to dospelému. Varovať Ota.“**
  - T2 clean-start: **„Povedať to dospelému a heslá meniť z iného, čistého zariadenia, najprv e-mail.“**
  - T3 tell-mum: **„Hneď to povedať mame, nech volá operátorovi. Záber otvoriť len vlastnou cestou.“** Then set its `consequence` to: **„Mama volá operátorovi z iného telefónu. Sára otvorí Záber sama, zmení heslo, odstráni neznáme zariadenia a „podporu“ nahlási.“**
  - T4 wait-old: **„Neplatiť, novému číslu neodpisovať a počkať na Sáru zo starého čísla.“**
  - Example of a more tempting distractor, for T2 `[uninstall]`: **„Cheat odinštalovať, spustiť antivírus a zmeniť heslo k hre.“** It sounds thorough but still misses the clean device and e-mail first. Change its `later` to match.

**5. T4 gives away the answer in the brief.** (Teen "harder" bar; C13 recall in the final mixed case)
- File: `content/cases/teen/t4-nove-cislo.yaml` → `intro.lines[1]`, `[2]`, `[3]`
- Problem: "Sára je v škole", "volala som do školy, na číslo, ktoré poznám" and "To bol dobrý krok." together tell the player that the message is fake and what the verify answer is, before they see any evidence. The final case should test all four habits, not hand them over.
- Replace:
  - `[1]` with **„Pani Lacková, pošlite nám, čo vám prišlo. Sáru medzitým skúsime nájsť.“**
  - `[2]` with **„Je to jej hlas. Ale nedvíha mi.“**
  - `[3]` with **„Screenshoty už máme.“**
  - `verify.options[known-numbers].consequence` with **„Pani Lacková volá do školy na číslo, ktoré pozná. Škola potvrdí, že Sára je v budove.“**
- Sára is still never in danger: she walks in 6 minutes later.

**6. The debrief is one long screen that is far over the layer-1 budget, in both tracks.** (C3 Layer 1 budget; GDD §4.7)
- File: `src/ui/CaseView.tsx` → `DebriefStep`
- Problem: stars, rule, all clues (up to 6), missed clues, note, 4–6 recovery steps, the star checklist and the story card all show at once. In T1 that is about 150 words before the help line. The GDD requires layer 2 "below the fold".
- Fix: layer 1 shows only the stars, the rule, the first found clue (or the first clue if none was found) and `note`. Put "Stopy v tomto prípade", "Prehliadnuté stopy" and "Hviezdy" behind a neutral disclosure button **„Celý spis“**. Keep "Ak sa to už stalo" visible as a heading with its list open, because Red Line 4 requires it on every debrief.

**7. No retrieval: the previous rule is read out, not recalled.** (C13 Retrieval; GDD §4 "Recall Pamätáš si?")
- Files: `src/engine/flow.ts` (no recall stage). Content: `intro.lines[0]` of J2–J4 and T2–T4.
- Problem: Mira, Sára and Matej simply restate the previous rule. That is re-reading, not retrieval practice (Roediger and Karpicke 2006). The worked example is also not implemented: the clue explained in the J1 and T1 intros does not count as found.
- Fix: add the unscored "Pamätáš si?" stage from GDD §4: three endings, then the full rule. Junior prompt: **„Pamätáš si pravidlo z minulého prípadu? Vyber koniec vety.“** Teen prompt: **„Z minulého spisu. Ako pokračuje pravidlo?“** Then cut the rule text from those intro lines. Pre-mark `sender` (J1) and `pay` (T1) as found.

**8. T1: Oto's story ends unresolved.** (C6 Recovery, "case ends with the character safe"; §2 "end safe and supported")
- File: `content/cases/teen/t1-lahka-brigada.yaml` → `lock_up.correct`
- Problem: the case ends on "Zostáva Oto, ktorý už poslal údaje." and a drill. The player never learns that Oto is supported.
- Replace with **„Presne tak. Zastaviť, dospelý, banka, polícia. Oto to ešte večer povie otcovi a ráno idú spolu do banky.“**

**9. The help screen has no calm cards for sextortion and cyberbullying.** (C8 Help; Red Line 8)
- File: `content/help.yaml`
- Problem: Red Line 8 says these topics appear *as* calm help cards. They are among the most likely real problems for 13–15-year-olds, and today only "Ochráň ma" touches on them, indirectly. Confirm with the producer whether this is MVP scope. If it is, add two entries after `ipcko`. Both need `fraud-researcher` to verify the wording and add sources.
  - `vydieranie`: **„Niekto ťa vydiera fotkou alebo videom? Nie je to tvoja chyba. Neplať a nič ďalšie neposielaj. Povedz to dospelému, ktorému dôveruješ, alebo zavolaj na 116 111.“**
  - `ublizovanie`: **„Niekto ťa na internete uráža alebo zosmiešňuje? Nie je to tvoja chyba. Neodpovedaj, odfoť si to a povedz to dospelému, ktorému dôveruješ.“**

## Minor

10. **T3 rule cue is too broad.** (C9 Calibration) `t3-bez-signalu.yaml` → `debrief.rule`. A phone losing signal is usually harmless (a tunnel, a lift), so the cue risks teaching a neutral detail as a tell. The rule is also an order ("povedz rodičovi") rather than a reason. Proposed (14 words): **„Keď zmizne signál a príde nečakaná obnova hesla, tak s rodičom hneď volaj operátorovi.“** Update the same wording in the T4 `intro.lines[0]` and the T4 `arc_scene.closing`.

11. **T3 quick round labels a phone status as a trap.** `trust_or_trap.items[4]` labels "Bez služby" as "Pasca". A status bar is not a trap. Either drop the item, or change its `text` to **„Už hodinu „Bez služby“ a v e-maile je obnova hesla, ktorú nerobíš.“**

12. **T4 recovery steps are out of order.** `debrief.if_it_happened` ends with "…najprv to povedz dospelému". Reorder to:
    1. **„Ak správa prišla tebe, najprv to povedz dospelému, ktorému dôveruješ.“**
    2. **„Už neplať a s novým číslom prestaň komunikovať.“**
    3. **„Rodič hneď zavolá do banky na číslo zo zadnej strany karty alebo z aplikácie.“**
    4. **„Spolu to oznámte polícii.“**
    5. **„Varuj rodinu a dohodnite si rodinné heslo.“**

13. **The teen reveal line is never used.** (C4) Add „Podvod bol pripravený tak, aby vyzeral pravý.“ after "Toto sa môže stať komukoľvek." in T4 `decision.options[pay-now].calm` and T2 `decision.options[same-pc].calm`.

14. **T4 arc line is ambiguous.** `arc_scene.lines[3]` "Dax nie je človek" can read as "Dax is an AI". Change it to **„Dax nie je skutočný človek. Je to maska.“**

15. **J4 rule and closing point to installing an app.** `j4-kriciaca-obrazovka.yaml` → `debrief.rule` and `arc_scene.closing`. The rule's action steers the child towards installing a "cleaner" from the store. The case's best action is to close the window and install nothing. Proposed (11 words): **„Keď okno ženie inštalovať aplikáciu, tak ho zavri a nič neinštaluj.“**

16. **J4 recap names the wrong trick.** `arc_scene.lines[1]` says "požičaný účet", but J2 was a requested code. Change to **„Falošná výhra, vypýtaný kód, uniknuté heslo, strašiace okno.“**

17. **J3 rule cue does not match the case.** `debrief.rule` uses "Keď zakladáš účet", but the case is about fixing an existing account, and the rule has two actions. Suggested: **„Keď nastavuješ heslo, tak daj dlhé, iné a zapni druhý zámok.“** (11 words)

18. **The debrief stamp is drawn in alarm red.** (C5) `src/styles/app.css` → `.closed .rubber` uses `--bad`. Use `--accent` so teaching screens carry no alarm colour.

19. **Money-mule and takeover debriefs use the generic help line.** (§3 Help placement) `HelpLine` shows only 116 111. For T1, T2 and T3, add one line under "Ak sa to už stalo": **„Pri peniazoch alebo účte: banka cez rodiča, polícia 158. Viac v časti Pomoc.“**

20. **Teen scan load is heavy.** (C14) All 2–3 artefacts are stacked on one long screen. The GDD specifies "Dôkaz A / B / C" tabs. Add tabs before the classroom pilot, because phones in particular make the stacked layout long.

21. **No skip link on story scenes.** (C14) GDD §4.8 asks for a "Preskočiť" link on brief and arc scenes, which helps replays and slower readers. It is not implemented.

## Checklist summary
| # | Item | Junior | Teen | UI |
|---|---|---|---|---|
| 1 | Defensive only | PASS | PASS | – |
| 2 | One rule | PASS (minor 15, 17) | PASS (minor 10) | – |
| 3 | Layer 1 budget | FAIL (6) | FAIL (6) | FAIL (6) |
| 4 | No shame | PASS | PASS (minor 13) | PASS |
| 5 | No fear | PASS | FAIL (1) | minor 18 |
| 6 | Recovery | PASS | FAIL (8) | – |
| 7 | Trusted adult | FAIL (2) | PASS | – |
| 8 | Help | PASS | major 9 | PASS |
| 9 | Calibration | PASS | PASS (minor 10, 11) | – |
| 10 | Track fit | PASS | FAIL (3, 4, 5) | FAIL (3) |
| 11 | No glamour | PASS | FAIL (1) | – |
| 12 | No dark patterns | PASS | PASS | PASS |
| 13 | Retrieval | FAIL (7) | FAIL (7) | FAIL (7) |
| 14 | Accessibility | PASS | minor 20 | minor 21 |

Blocker 2 touches Red Line 8, so `sceptic-reviewer` should see it. Before a classroom pilot, a qualified human (a child or school psychologist) should review the money-mule wording and the help cards, as `docs/PSYCHOLOGY.md` already notes.

---

## Re-review 2026-11-25

Reviewer: `learning-psychologist` (AI advisor, not a licensed psychologist). Method: I read the current `content/`, `src/ui/CaseView.tsx`, `src/ui/StartScreen.tsx`, `src/ui/Help.tsx`, `src/app.tsx` and `src/content/schema.ts`. I could not run git or the game in this session, so this is a close read of the play path in code, not a timed play-through. QA's play-test still covers how it plays.

### Verdict: FAIL (2 small must-fix items, both one-line YAML edits)

Both blockers are resolved, and so are 6 of the 7 majors. The two remaining must-fix items are small, but both work against the "harder" bar or the worked example, so I hold the verdict until they land.

### Status of the first-round findings
| # | Status | Note |
|---|---|---|
| 1 | Resolved | T1 note now uses `fraud-researcher`'s hedged wording („môže byť trestný čin“), followed in the same panel by „ešte dnes to povedz dospelému“. It no longer says Oto committed a crime. Suggestion S3 below. |
| 2 | Resolved | J1 `verify`: „Neklikať, otvoriť Kryptoriu priamo, účet nahlásiť a ukázať to dospelému.“, with `tells_adult: true`. |
| 3 | Resolved | „Lipovec · internetové prípady“ / „Vyber si trasu“, the agreed note, „odporúčame …“ ages, „Uzavreté: n/4“, and each card carries its own `data-theme`. |
| 4 | Resolved for length | Teen best options are no longer clearly the longest: T1 10 words against 8–11, T4 11 against 4–13. In T2 (12 against 11) and T3 (13 against 11) the best is still slightly the longest, which is acceptable. A new cue has replaced the length cue, though: see must-fix R1. |
| 5 | Resolved | The T4 brief now uses the wording proposed in finding 5. The school call has moved to `verify.known-numbers`. |
| 6 | Resolved | The debrief now has 4 pages: Pravidlo, Stopy, Ak sa to už stalo, Stopa v príbehu. The exit buttons appear only on the last page, so every player passes „Ak sa to už stalo“, which meets Red Line 4. The help line shows on pages 3 and 4. Page 1 does not show the first found clue, which I accept. |
| 7 | Partly resolved | The recall stage is built and filled for J2–J4 and T2–T4. It is unscored, gives calm feedback („Tentoraz nie.“ followed by the full rule), and the correct answer sits in a different position from case to case. The rule restatements are gone from the intros. The worked example is still not wired up: see must-fix R2. |
| 8 | Resolved | T1 `lock_up.correct`: „… Oto to ešte večer povie otcovi a ráno idú spolu do banky.“ |
| 9 | Resolved, with suggestions | Three topic cards: vydieranie / intímne fotky, kyberšikana, „Je mi veľmi ťažko“. See H1–H4. |
| 10–19 | Resolved | T3 rule and quick-round item, T4 recovery order, reveal lines in T2 and T4, „Dax nie je skutočný človek. Je to maska.“, J4 rule and recap, J3 rule, stamp drawn in accent, help line for money and accounts in T2 and T3 (T1 points to Pomoc in its note). |
| 20 | Open (deferred) | Evidence tabs. Still needed before the classroom pilot, for phones. |
| 21 | Partly resolved | „Preskočiť úvod“ is on intros with more than 2 lines. Arc scenes have no skip link. Minor. |

### Must-fix
**R1. Teen (and junior) decisions: the only option that mentions an adult is always the best one.** (C10 Track fit, the teen "harder" bar)
- Where: `decision.options` in T1–T4. The best option names „dospelému“, „mame“ or „otcovi“, and no other option does. J1–J4 follow the same pattern, which I accept for 11–12-year-olds.
- Problem: after two cases a teen can choose by spotting the adult instead of judging the evidence. This is the same guessability problem as finding 4, with a different cue.
- Smallest fix: let one distractor in at least two teen cases mention an adult but get the *timing* wrong, which is itself the lesson. Both stay `outcome: ok`, and their existing `calm` lines already say "ešte dnes":
  - T3 `sleep.text`: **„Reštartovať mobil, ísť spať a ráno to povedať mame.“**
  - T2 `warn-tomorrow.text`: **„Varovať kamarátov a zajtra to povedať otcovi.“**
- Red Line 8 still holds, because the best option still tells an adult. `sceptic-reviewer` should confirm that an "adult, but later" option scored as `ok` is acceptable.

**R2. J1 and T1 promise a worked example that does not happen.** (§4 Worked example, C13)
- Where: the J1 intro says „Prvú ti ukážem. Odosielateľa Lea nepozná …“ and the T1 intro says „Prvú stopu ti ukážem: veľa peňazí za takmer nič.“, but `scan.pre_found` is empty in both files. The player is told the clue is shown, then has to find it, and the meter starts at 0.
- Fix: in `j1-drak-zadarmo.yaml`, add `pre_found: [sender]` under `scan:`. In `t1-lahka-brigada.yaml`, add `pre_found: [pay]`. Then check that the clue-star minimums still work: either keep them, which makes the stars one clue easier, or raise `min` by 1.

### Help topic cards (most sensitive)
The wording is good: no shame, no fear, „Nie je to tvoja chyba.“ comes first, 116 111 is named in every card, the trusted adult is always there, there are no gendered forms, and „S tým netreba zostať osamote“ avoids *sám/sama*. The evidence advice („Správy nemaž … ale nikomu ich nepreposielaj“) is right for intimate images. These are suggestions, not blockers:
- **H1. Grooming is covered only through images.** Red Line 8 names grooming, but the card's heading is about blackmail and photos. Add one sentence to `pomoc-vydieranie.text`, after „Nie je to tvoja chyba.“: **„Ak ťa niekto cudzí online žiada o tajnosť, fotky alebo stretnutie, povedz to dospelému.“** The heading could become **„Niekto ma vydiera, chce fotky alebo stretnutie“**.
- **H2. The fear of being judged is the main reason young people stay silent.** Add to the end of `pomoc-vydieranie.text`: **„Na linke 116 111 ťa nikto nesúdi a nemusíš povedať meno.“** The anonymity part is already verified in the LDI entry.
- **H3. The topic cards sit below 9 contact cards.** A distressed child has to scroll a long way. Add a short line under `intro` that points to them, for example **„Keď ide o niečo ťažké, karty nájdeš nižšie.“**, or move the topic section directly after 116 111.
- **H4. The trusted-adult sentence appears twice on each topic card**: once in the card text and again in `help.trusted_adult`, which `Help.tsx` adds under every card. Drop the repeat in `Help.tsx` for topic cards.
- The card advice lines still need `fraud-researcher` sources (noted in `help.yaml`). A qualified human should review these three cards before the pilot. That decision is Roman's.

### Other suggestions
- **S1.** T2 and T3: the best option is still 1–2 words longer than any other. If R1 is done, this does not matter.
- **S2.** Recall runs before the brief, even when the previous case was not played. That is fine while cases unlock in order.
- **S3.** T1 note, optional: replace „Platí to, aj keď si to človek neuvedomuje.“ with **„Preto je dôležité zastaviť čo najskôr.“** This keeps the reason to act and drops the extra weight. It needs `fraud-researcher` to accept it.
- **S4.** Arc scenes have no „Preskočiť“ link (finding 21, the remaining part).

### Teen bar, as played (code read)
**Yes once R1 lands.**
- **Different:** a neutral start screen, Ozvena styling on its own card, the podcast desk, the faceless „maska“ opponent, and a calm resolution for Oto.
- **Harder:** 2–3 artefacts with decoys, recall of earlier rules, a T4 brief that no longer gives away the answer, chained "Hneď / Neskôr" consequences, and recovery drills.

The one thing still making it easy is the adult cue in R1.

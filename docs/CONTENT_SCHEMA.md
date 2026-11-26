# CONTENT_SCHEMA — how to write a case

**Owner:** frontend-engineer · **For:** scenario-writer, fraud-researcher, game-designer · **Contract:** `src/content/schema.ts` (Zod).

Content is data. The engine knows nothing about specific cases: it plays whatever the YAML in `content/` describes.
`npm run validate`, `npm test` and `npm run build` all reject a file that does not match this schema, and
`npm run redline` rejects real brands, real domains, gendered player forms and exclamation marks in teaching text.

Design source: `docs/GDD.md` (mechanics §4) and `docs/CASE_SPECS.md` (the 8 cases). This file says how to type them.

## 1. File layout

```
content/
  tracks.yaml                  both tracks: theme, ranks (badges), cast, case order
  cases/junior/<id>.yaml       one file per case; file name = id
  cases/teen/<id>.yaml
  sources.yaml                 owned by fraud-researcher; every case cites ids from here
  help.yaml                    "Kde nájsť pomoc" (real organisations may be named only here, in sources.yaml and about.yaml)
  about.yaml                   "O hre": what the game is, privacy, feedback for adults, help line (pilot build)
```

To add a case: write `content/cases/<track>/<id>.yaml`, then add the id to `cases:` of that track in `tracks.yaml`
(the position in that list is the case number, and `number:` in the file must match it). Nothing else.

## 2. General rules

- **ids** are lowercase kebab-case: `j2-kod-pre-kamarata`, `pass`, `call-old`.
- **Unknown keys are errors** (a typo such as `debreif:` fails), except in `sources.yaml`.
- Text is plain text. No HTML, no Markdown. Emojis are fine.
- Quote a value that contains `: ` (colon + space), a value with a comma inside `{ … }` flow style, or one that starts with `"`, `[`, `{`, `@`, `*` or `#`:
  `hint: "Stopa: časový tlak."`.
- Slovak, informal *ty*, no gendered forms about the player (Red Line 9), no exclamation marks in teaching text
  (Red Line 5). In-world text written *by* a named character may use that character's gender ("vraj som vyhrala").
- Domains end in `.example`, `.test` or `.invalid`. Handles with a dot (`@kvapka.desk`) look like domains to the
  linter: write `@kvapka_desk`. Phone numbers are masked (`+421 9XX XXX 123`). IBANs start `SK00`.

## 3. tracks.yaml

```yaml
tracks:
  - id: junior                 # junior | teen
    title: Kancelária STOPA
    tagline: Detektívny klub · Lipovec
    age: 11 – 12 rokov
    theme: junior              # junior (warm comic) | teen (dark investigation desk)
    intro: >-                  # sticky note on the case list
      V meste niekto rozposiela falošné výhry ...
    placeholder: false         # true shows a PLACEHOLDER banner
    planned_cases: 4           # empty "pribudne" slots up to this number
    rank_label: Odznak         # HUD chip and "Nový odznak: …" line
    ranks:                     # badges, rising min_stars, one must be 0 (GDD §7)
      - { min_stars: 0, name: Papierová lupa }
      - { min_stars: 3, name: Bronzová lupa }
    footer: Hra Kryptoria, aplikácia Bzuk ... sú vymyslené.
    cast:                      # every `speaker:` in this track's cases must be a cast id
      - id: mira
        name: Mira
        role: vedúca kancelárie          # optional, shown as "Mira, vedúca kancelárie"
        avatar: { kind: person, skin: "#e2b896", hair: "#3b2a6b", hair_style: short, band: "#2a7d74" }
        # kind: person | dog | unknown ; hair_style: short | long | bun | none ; band: optional headband colour
    cases:                     # order = case numbers; next case unlocks when the previous one is closed
      - j1-drak-zadarmo
```

## 4. A case file, field by field

| Field | Required | Meaning |
|---|---|---|
| `id`, `track`, `number` | yes | id = file name; `number` = position in `tracks.yaml` |
| `title`, `summary` | yes | case card on the list |
| `placeholder` | no | `true` shows a PLACEHOLDER banner |
| `risk` | no | list of `money`, `threat`, `stranger`. When set, the decision or verify step needs a `best` or `ok` option with `tells_adult: true` (Red Line 8); the validator checks it |
| `recall` | no | „Pamätáš si?“ question before the brief (§4a) |
| `sources` | yes, ≥ 1 | ids from `sources.yaml`; at least one must be SK or EU and tier 1–3 (Red Line 6) |
| `intro` | yes | `stamp` (optional heading), `lines` (dialogue), `button` (default „Vziať lupu“) |
| `evidence` | yes, 1–3 | the artefacts to scan (§5) |
| `scan` | yes | `min_clues` (button appears), `prompt` (first tip text), `button`; optional `tip` (question added to the Tip hint, e.g. „Čo od teba chcú a kto to píše?“) and `pre_found` (clue ids already marked as found: the worked example explained in the brief) |
| `decision` | yes | 3–4 options, exactly one `best` (§6) |
| `verify` | no | teen "how to verify" step; same shape as `decision`; wrong picks may be retried, the first pick scores |
| `trust_or_trap` | one of these two | quick round (§7) |
| `lock_up` | one of these two | ordered-steps drill (§8) |
| `debrief` | yes | the closed case file (§9) |
| `arc_scene` | no | story scene after the debrief, for the last case of a track (§10) |
| `stars` | yes, 1–3 | one star per rule (§11) |

Stage order: [recall] → intro → scan → decision → its consequence → [verify → feedback] → [trust_or_trap] → [lock_up] → debrief → [arc_scene].

**Dialogue line:** `{ speaker: <cast id>, text: ... }`.

## 4a. recall (optional, „Pamätáš si?“)

One unscored retrieval question about the rule of an earlier case (GDD §4, PSYCHOLOGY C13), shown before the brief.
The player picks one option, sees „Správne.“ or „Tentoraz nie.“ plus `feedback`, then goes on. No stars depend on it.
Once a case has a recall, cut the restated rule from its `intro.lines`.

```yaml
recall:
  title: Pamätáš si?                      # default
  question: Pamätáš si pravidlo z minulého prípadu? Vyber koniec vety. „Keď ti niekto sľúbi výhru za prihlásenie, …“
  options:                                # 2–3, exactly one correct: true
    - { id: open-direct, text: "tak neklikaj a otvor hru priamo.", correct: true }
    - { id: ask-sender, text: "tak sa toho účtu opýtaj, či je to pravda." }
    - { id: hurry, text: "tak sa prihlás rýchlo, kým výhra platí." }
  feedback: Keď ti niekto sľúbi výhru za prihlásenie, tak neklikaj a otvor hru priamo.   # say the full rule
  button: Ďalej                           # default
```

Teen prompt suggestion (PSYCHOLOGY finding 7): „Z minulého spisu. Ako pokračuje pravidlo?“

## 5. Evidence

```yaml
evidence:
  - kind: chat          # chat | sms | email | profile | webpage | popup | call
    label: Dôkaz A · Leina správa    # stamp above the artefact
    header: BZUK · súkromná správa   # bar on top (app, inbox, browser, caller)
    meta: "19:41"                    # optional, right side of the bar
    aria_label: Správa v aplikácii Bzuk   # screen-reader name
    lines:
      - "A plain line can be just a string."
      - style: sender       # body (default) | sender | subject | meta | link | address | button | title
        speaker: Dax        # optional label before the line (calls, group chats)
        segments:
          - text: Kryptoria_Oficial_Team          # a CLUE: counts, highlights, shows its hint
            clue:
              id: sender
              hint: "Stopa: neznámy účet. ..."
          - " · nový kontakt"                       # PLAIN text (a bare string)
          - text: GRATULUJEME 🎉                   # a DECOY: shows its hint, never counts as a clue
            decoy: Toto samo osebe stopa nie je. ...
```

- Clue ids are unique within a case. `scan.min_clues` ≤ number of clues.
- Segments on one line join directly: put the spaces inside the text (`" "` is a valid plain segment).
- `kind` changes only the frame (bubble, mail, browser, pop-up, transcript font). Use `style: address` for a URL bar,
  `style: button` for a fake button (it is never clickable as a button, only tappable as a clue/decoy if you make it one).
- Images are not supported yet. Describe them as text, e.g. a decoy `"[fotka: mladý muž pri aute]"`.
- The scan has a **Tip** button: it names the artefact that still holds an unfound clue. No content needed.
- Decoy taps are counted (each decoy once) for the `clues` star rule in both tracks (§11).
- On a phone the meter, the hint and the buttons stay in a bar at the bottom of the screen; keep hints to one or two
  short sentences so the bar stays small.

## 6. Decision and verify

```yaml
decision:
  title: Čo poradíš klientke?        # stage heading
  prompt:                            # optional dialogue above the options
    - { speaker: lea, text: tak čo mám spraviť? }
  next_button: "Rýchly výcvik: Dôvera alebo pasca"   # optional; button on the consequence screen
  options:                           # 3–4, shown A–D in this order, exactly one best
    - id: click
      text: Kliknúť na odkaz a rýchlo sa prihlásiť.  # infinitive or imperative
      outcome: bad                   # best | ok | bad
      label: Účet je preč            # headline of the consequence
      consequence: Stránka vyzerá ako Kryptoria ...   # teen: shown as "Hneď:" when `later` is set
      later: O dva dni banka účet zablokuje.          # optional second beat, "Neskôr:" (teen chained consequence)
      calm: "Toto sa môže stať komukoľvek. Ďalší krok: otvoriť hru priamo a zmeniť heslo."
```

`verify` has the same shape. In verify, a non-`best` pick shows its consequence and a „Vybrať iný spôsob overenia“
button; the player picks again until `best`. Write wrong-channel `calm` lines as a short nudge („Overuje sa inou cestou.“).

## 7. trust_or_trap

```yaml
trust_or_trap:
  title: Výcvik · Dôvera alebo pasca        # default
  start_button: "Rýchly výcvik: Dôvera alebo pasca"   # default; used by the button before the round
  trust_label: Dôvera                        # default; teen may use "Bezpečné"
  trap_label: Pasca                          # default
  prompt: Je to v poriadku, alebo je to pasca?   # default; the question under each unanswered card (J3: „Dobrý zámok, alebo slabé miesto?“)
  items:                                     # 3–8; must include both answers (GDD: 2–3 of each in 5)
    - source: Bzuk · kamarát Tomáš
      text: čau, prišiel ti teraz SMS kód? ...
      answer: trap                           # trust | trap
      why: Kód zo SMS je kľúč k tvojmu účtu. ...
```

## 8. lock_up (GDD M4a)

The player taps cards into slots 1..n. List `steps` **in the right order**. Steps with the same `rank` are
interchangeable. A step tapped too early, or a distractor, counts one error and shows a hint; the player cannot fail.
After 3 errors on one slot the game highlights a right card.

```yaml
lock_up:
  title: Oto už povedal áno
  prompt: V akom poradí to má riešiť?
  steps:                               # 3–6, in order
    - { id: stop, text: "Prestať: Daxovi už nič neposielať.", rank: 1 }
    - { id: tell-adult, text: Ešte dnes to povedať dospelému., rank: 2, hint: Najprv treba prestať. }
    - { id: police, text: S dospelým to oznámiť polícii., rank: 3 }
    - { id: report, text: Nahlásiť profil a varovať kamarátov., rank: 3 }   # same rank: either order
  distractors:                         # 0–2
    - { id: delete-chat, text: Zmazať chat., hint: Chat nemaž. Je to dôkaz. }
  wrong_order_hint: Ešte nie. Tento krok príde neskôr.   # default for steps without their own hint
  correct: Presne tak. Najprv zastaviť, potom dospelý.   # shown when every step is placed
```

`rank` is optional; without it a step gets its list position (all different, so a strict order).
The passphrase builder (GDD M4b, J3) is **not built yet**; ask the frontend-engineer before writing J3's part 1.

## 9. debrief

```yaml
debrief:
  rule: Ak ti správa sľúbi výhru za prihlásenie, neklikaj. ...   # the one rule (≤ 25 words)
  clues:                         # 1–6. With `clue:` the line is listed under "Prehliadnuté stopy" if not found
    - text: Výhra zadarmo od účtu, ktorý nepoznáš.
      clue: prize
    - Plain lines are always listed.
  note: Optional extra paragraph (e.g. the legal sentence in T1).
  if_it_happened:                # 1–6 numbered steps, "Ak sa to už stalo"; include telling a trusted adult
    - Otvor hru vlastnou cestou a hneď zmeň heslo.
  story_clue:
    title: Stopa k Tieňovi č. 1  # teen: "Do spisu: 1"
    text: Správu podpísal malý drak 🐉. Kto za ním stojí?
  calm: ...                      # default „Toto sa môže stať komukoľvek. Dôležité je vedieť, čo urobiť ďalej.“
                                 # shown only when the decision was not best
  next_teaser: Prípad č. 2 ... pribudne v ďalšej verzii.   # optional
```

The debrief is shown as four short pages, each scannable on a phone (PSYCHOLOGY C3):
1. **Pravidlo:** the stars, the „UZAVRETÉ“ stamp, `rule`, `note`, the „Nový odznak: …“ line and, when the decision was
   not best, `calm`;
2. **Stopy:** found clues and „Prehliadnuté stopy“;
3. **Ak sa to už stalo:** `if_it_happened` and the help line (first entry of `help.yaml`);
4. **Stopa v príbehu:** `story_clue`, the star checklist (labels from §11), `next_teaser`, the help line and the buttons.

`note` therefore sits next to the rule: keep it to one or two sentences.

## 10. arc_scene (optional)

```yaml
arc_scene:
  button: Záver príbehu            # default „Pokračovať v príbehu“; shown on the debrief
  stamp: Spis uzavretý. Odvysielané.
  lines:
    - { speaker: sara, text: Spomaľ. Over si to inou cestou. Povedz to niekomu. }
  closing: Optional sticky note under the dialogue.
```

## 11. stars (1–3 rules, one star each)

| Rule | Fields | Star when |
|---|---|---|
| `clues` | `min`, optional `max_decoys` | at least `min` clues found and at most `max_decoys` different decoys tapped. Without `max_decoys` the limit is half the case's decoys, rounded down, at least 1, so tapping everything never earns the star (QA L1). Write the label to match, e.g. „Nájsť aspoň 4 stopy, nie všetko naraz“ |
| `decision_best` | | the decision was `best` |
| `verify_best` | | the first verify pick was `best` |
| `decision_and_verify_best` | | both of the above, as one star |
| `trust_or_trap` | `min` | at least `min` quick-round answers right |
| `lock_up` | `max_errors` (default 1) | lock-up finished with at most that many errors |

Every rule may have a `label` (shown in the debrief checklist); otherwise a default label is used. When the clue star
is missed because of decoys, the checklist adds „Označené neutrálne detaily: n, najviac m.“

## 11a. help.yaml: contacts and topic cards

`help.yaml` has `title`, `intro`, `trusted_adult`, optional `topics_title` (default „Keď ide o niečo ťažké“) and
`entries`. An entry is a **contact** (`id`, `name`, `text`, optional `phone`, `url`, `url_label`) or, with `topic`,
a **topic card** for things that are never played as cases (Red Line 8: sextortion, grooming, cyberbullying,
self-harm).

- The **first entry must be the Linka detskej istoty contact, phone 116 111**: the debrief help line shows it. The
  validator fails otherwise.
- `topic` is a free kebab-case id (e.g. `vydieranie`, `kybersikana`, `grooming`). Topic cards are listed after the
  contacts under `topics_title`, in the same calm colours; `trusted_adult` is repeated under each.
- Every topic card must point to 116 111: in its `phone`, in its `text`, or through `contacts`.
- `contacts` (topic cards only) lists contact ids shown as „Kam sa obrátiť: …“.

```yaml
  - id: vydieranie
    topic: vydieranie
    name: Niekto ťa vydiera fotkou alebo videom
    text: Nie je to tvoja chyba. Neplať a nič ďalšie neposielaj.
    contacts: [linka-detskej-istoty, policia]
```

## 11b. about.yaml: the „O hre“ screen

Opened from the start screen (the quiet „O hre“ button next to „Pomoc“); it closes with „Späť do hry“ or Escape,
like the help screen. Fields:

- `title` (shown as the screen heading) and `help_line` (closing note). The validator requires `help_line` to name
  **116 111** (Red Line 8).
- `sections`: one or more `{ id, heading, text, address?, address_note? }`. `text` is a list of short paragraphs.
  `id`s are unique.
- `address` is shown as **plain text, never a link** (same rule as help addresses). Write it without a scheme
  (`github.com/owner/repo/issues`, not `https://…`); the validator rejects a scheme. `address_note` (e.g. „the forms
  there are public, so no names“) needs an `address`.
- `comment_box: true` (at most one section) shows the comment box for adults at the end of the section
  (`src/ui/CommentBox.tsx`, words in `src/feedback/comment.ts`): who is writing, case, optional rating 1–5, a comment
  of at most 500 characters. The game sends nothing: „Kopírovať text“ copies the comment in issue-form shape
  (`### Kto píše` / `### Prípad` / `### Hodnotenie` / `### Pripomienka`), and, only when the build sets
  `VITE_FEEDBACK_EMAIL`, „Poslať e-mailom“ is a `mailto:` link (subject „Pripomienka k hre <version>“) that opens the
  adult's own mail app. A maintainer pastes the text into an issue labelled `spatna-vazba` + `hra`; the exporter
  parses it as kind `hra`. That link is the only `mailto:` and the only `<a>` in the game (eslint exception for that
  one file). The CSP is the same with or without the address.

Like `help.yaml` and `sources.yaml`, `about.yaml` may name real organisations (VALIDION, GitHub, Linka detskej
istoty) and real addresses: the domains, denylist and phone rules skip it. The gender and IBAN rules still apply, and
the exclamation-mark rule applies to **every** value in the file (it is all explanation to the player).

```yaml
title: O hre
sections:
  - id: sukromie
    heading: Tvoje súkromie
    text:
      - Hra nič nikam neodosiela.
  - id: pripomienky
    heading: "Pre dospelých: pripomienky a chyby"
    text:
      - Pripomienky zbierame cez učiteľov a rodičov, nie priamo od detí.
    address: github.com/DALEOSyn/validion-kyberhra/issues
    address_note: Formuláre tam sú verejné. Nepíšte do nich mená detí ani iné osobné údaje.
help_line: Ak ťa niečo trápi, zavolaj na Linku detskej istoty 116 111.
```

## 12. Complete example: J1

`content/cases/junior/j1-drak-zadarmo.yaml` is the complete, valid reference for a junior case (one artefact,
decision, quick round). `content/cases/teen/t1-placeholder.yaml` exercises every teen feature (two artefacts,
`later`, `verify`, `lock_up` with ranks and distractors, decoy limit, `arc_scene`); it is a placeholder to be replaced.

```yaml
id: j1-drak-zadarmo
track: junior
number: 1
title: Drak zadarmo
summary: Lea vraj vyhrala draka do hry. Stačí sa prihlásiť cez odkaz.
sources: [sk-skcert-online-games-2020, eu-bik-gaming-teachers, eu-bik-ie-scams-young-2026, sk-skcert-hacked-accounts-2018]
risk: [stranger]
recall:
  question: Čo urobíš, keď ti príde správa s odkazom na prihlásenie?
  options:
    - { id: direct, text: "Otvoriť aplikáciu priamo, nie cez odkaz.", correct: true }
    - { id: link, text: "Kliknúť, ak správa vyzerá úradne." }
  feedback: Prihlasuj sa len v aplikácii alebo v hre, nikdy cez odkaz zo správy.
intro:
  stamp: Prípad č. 1 · Drak zadarmo
  lines:
    - { speaker: mira, text: Vitaj v STOPE. Práve prišla klientka. }
    - { speaker: lea, text: prišla mi táto správa v Bzuku. vraj som vyhrala draka do Kryptorie. mám kliknúť? }
  button: Vziať lupu
evidence:
  - kind: chat
    label: Dôkaz A · Leina správa
    header: BZUK · súkromná správa
    meta: "19:41"
    aria_label: Správa v aplikácii Bzuk
    lines:
      - style: sender
        segments:
          - text: Kryptoria_Oficial_Team
            clue: { id: sender, hint: "Stopa: neznámy účet. Slovo „Oficial“ si do mena môže dať ktokoľvek." }
          - " · nový kontakt"
      - segments:
          - text: GRATULUJEME 🎉
            decoy: Toto samo osebe stopa nie je. Sleduj, čo od teba chcú.
          - " "
          - text: "Si medzi 50 výhercami: skin Ohnivý drak zadarmo."
            clue: { id: prize, hint: "Stopa: veľká výhra zadarmo." }
      - segments:
          - text: Výhru si vyzdvihni do 15 minút, inak prepadne.
            clue: { id: hurry, hint: "Stopa: časový tlak." }
      - style: link
        segments:
          - text: kryptoria-odmeny.example/login
            clue: { id: link, hint: "Stopa: cudzí odkaz." }
scan: { min_clues: 3, prompt: "Ťukni na časť správy, ktorá ti nesedí.", button: Poradiť Lei }
decision:
  title: Čo poradíš klientke?
  prompt: [{ speaker: lea, text: tak čo mám spraviť? }]
  options:
    - { id: click, text: Kliknúť na odkaz a rýchlo sa prihlásiť., outcome: bad, label: Účet je preč,
        consequence: Po zadaní hesla sa do Leinho účtu prihlási niekto iný.,
        calm: "Toto sa môže stať komukoľvek. Ďalší krok: otvoriť hru priamo a zmeniť heslo." }
    - { id: ask, text: Odpísať tomu účtu a opýtať sa., outcome: ok, label: Skoro,
        consequence: Podvodník sa neprizná., calm: "Ďalší krok: overovať inou cestou." }
    - { id: verify, text: Neklikať. Otvoriť hru priamo. Účet nahlásiť a ukázať to dospelému., outcome: best,
        label: Prípad vyriešený, tells_adult: true,
        consequence: V hre žiadna výhra nie je., calm: Presne tak. }
trust_or_trap:
  items:
    - { source: Kryptoria · obchod v hre, text: "Víkendová akcia: skin za 200 kryštálov.", answer: trust, why: Je to priamo v hre. }
    - { source: Bzuk · kamarát Tomáš, text: pošli mi SMS kód, answer: trap, why: Kód zo SMS nikomu. }
    - { source: Video · komentár, text: Generátor kryštálov na kryst-gen.example, answer: trap, why: Generátory nefungujú. }
debrief:
  rule: Ak ti správa sľúbi výhru za prihlásenie, neklikaj. Prihlasuj sa len v hre.
  clues:
    - { text: "Výhra zadarmo od účtu, ktorý nepoznáš.", clue: prize }
    - { text: Časový tlak., clue: hurry }
  if_it_happened:
    - Otvor hru vlastnou cestou a hneď zmeň heslo.
    - Povedz to dospelému, ktorému dôveruješ.
  story_clue: { title: Stopa k Tieňovi č. 1, text: Správu podpísal malý drak 🐉. Kto za ním stojí? }
stars:
  - { type: clues, min: 3 }
  - { type: decision_best }
  - { type: trust_or_trap, min: 2 }
```

## 13. Red-line linter (`npm run redline`)

Reads every YAML value in `content/` (comments and keys are ignored). Rules live in `scripts/lib/redline.ts`.

| Rule | Where | Catches | Fix |
|---|---|---|---|
| domains | all files except top-level `sources.yaml`, `help.yaml`, `about.yaml` | any domain, e-mail host or URL whose TLD is not `.example`/`.test`/`.invalid` (also `GDD.md`, `@name.desk`) | use a reserved TLD, or write handles with `_` |
| denylist | same | real brands in `scripts/redline-denylist.txt`; case-insensitive, diacritics ignored; names of 5+ letters also in Slovak forms (`Robloxe`, `Slovenskej sporiteľne`) | use a fictional brand from the cast/world; add new real names to the denylist |
| gender | everywhere (not source titles) | `(a)`, `/a` endings; `hráč`; `ak si klikol`, `ak si to už poslal`, `keď si už heslo zadal`, `dobre si to zvládla`, `a klikol si`, `klikla si`, `si pripravený`, `buď opatrný`, `zostaň pokojná` | present tense, imperative, infinitive, noun phrase |
| exclaim | teaching text: `hint`, `decoy`, `why`, `consequence`, `later`, `calm`, `correct`, `wrong_order_hint`, `feedback`, the whole `debrief`, all of `about.yaml` | `!` | a full stop |
| phone | all files except top-level `sources.yaml`, `help.yaml`, `about.yaml` | an unmasked phone-like number: 9+ digits in one run of digits, spaces, `-`, `/`, optional `+` | mask digits: `0900 xxx xxx`, `+421 9•• ••• •12` |
| iban | everywhere | an IBAN that passes the mod-97 check | use check digits that fail it, e.g. `SK00 …` |

The gender rule is a heuristic: it misses unusual shapes and may, rarely, flag a third-person sentence. Rephrase rather
than argue with it; reviewers still read for tone. Known false positive: a third-person „… a zmenila si heslo“ after
„a“; rewrite as „… a zmení si heslo“ or name the person again. In-world artefacts are linted too: a scammer's message must not
gender the player either.

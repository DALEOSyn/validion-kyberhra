# Fraud-researcher fact check: MVP content (8 cases + help screen)

Reviewer: fraud-researcher · Date: 2026-11-25 · Standard: CLAUDE.md Red Line 6 (plus 5, 8, 9 for replacement wording)
Scope: `content/cases/junior/*.yaml`, `content/cases/teen/*.yaml`, `content/help.yaml`, and the trusted-adult clause in `docs/PSYCHOLOGY.md`.
Checked against `content/sources.yaml` and `docs/SOURCES.md`.

## Verdict: FAIL (0 blockers, 3 majors, 12 minors)

Every case cites at least one Slovak or EU source, and every cited id exists in `sources.yaml`. Red Line 6 is met for all 8 cases. The help-screen numbers, hours and target groups are correct: all four helplines were re-opened today. The verdict is FAIL because of three majors: an over-broad legal claim in T1, a logic error in the T3 SIM-swap story, and an unsourced claim in the PSYCHOLOGY trusted-adult line. Each has exact replacement text below. Once those three are applied, the content passes. The minors are recommended but do not block.

### What I changed (my files only)
- `content/sources.yaml`:
  - Added `sk-skcert-tech-support-2020`. This SK-CERT page covers fake warnings on websites and says "do not call the number"; it settles open item (d).
  - Added `sk-skcert-kedy-nas-kontaktovat`, the Slovak SK-CERT page whose menu label is "Nahlásiť incident".
  - Re-opened and requoted `sk-news-sita-police-mules-2026`.
  - Added to `eu-bik-ie-scams-young-2026` what it says, and does not say, about reporting and warning.
- `docs/SOURCES.md`:
  - J4 strength is now Medium.
  - Rewrote the T1 legal fact as "can be". Added the report-profile source and a note on "warn friends".
  - New section on what we can and cannot say about banks, police and the trusted adult.
  - Help table: the police row now says how a formal report is made. Removed the dangling `sk-numbering-decree-286-2022` reference (no such id in sources.yaml). The SK-CERT label is clarified.

Re-opened today: ldi.sk, ipcko.sk, linkadetskejdovery.sk, viacakonick.gov.sk, SK-CERT "Report an incident" and "Kedy nás kontaktovať", the SITA police money-mule article, BIK "Online scams and young people". I tried to open the Criminal Code (300/2005 Z. z., § 233/233a) and could not get readable text. So no threshold or penalty is asserted anywhere.

---

## Findings

### Majors

**1. [major] T1 · `content/cases/teen/t1-lahka-brigada.yaml` → `debrief.note` (open item c)**
Problem: "Posielať cez svoj účet peniaze za niekoho iného je trestný čin, aj keď to človek nevedel." The sentence is too broad and too absolute.
- "za niekoho iného" also covers innocent cases, such as paying a share for a friend or a parent.
- "je trestný čin, aj keď to človek nevedel" states as certain something the sources only give as a possibility. NBS says mules "don't realize … that they are committing a criminal offense". Police (via SITA) say liability "môže vzniknúť aj v prípade nedbanlivostného konania".
- Children under 14 are not criminally responsible (sk-justice-trestne-konanie, § 22 TZ). The track starts at 13.
Tone is otherwise calm and correct: no penalty, followed by the next step.
Replacement (sources: sk-nbs-crypto-mule-2025, sk-nbs-money-mule-2019, sk-news-sita-police-mules-2026):
```
Posielať ďalej cudzie peniaze cez svoj účet môže byť trestný čin. Platí to, aj keď si to človek neuvedomuje.
Ak sa to už stalo, skorá pomoc je správny krok. Ak ťa niekto tlačí pokračovať, je to dôvod hľadať pomoc hneď.
```

**2. [major] T3 · `content/cases/teen/t3-bez-signalu.yaml` → `evidence[0]` (reset e-mail) and `evidence[1]` clue `code`**
Problem: the story contradicts itself on SIM swap.
- The e-mail says the recovery code was sent to Sára's number, and that number is on someone else's SIM (clue `nosignal`). So the attacker already gets that SMS code.
- Sára cannot receive it at all, because she has no signal. Yet the fake "support" asks her to "Pošlite nám kód, ktorý Vám prišiel".
A 13–15-year-old who has just learned what SIM swap means will notice. It also teaches a wrong model of the attack. The fix keeps the same lesson (never hand over a code, eu-enisa-sim-swapping-2021). The code that the attacker lacks is now the one sent to Sára's e-mail.
Replacements:
- `evidence[0]` reset line:
  ```
  Záber: žiadosť o obnovenie hesla. Kód sme poslali na číslo +421 9•• ••• 214. Potvrdzovací kód je aj v tomto e-maile.
  ```
- `evidence[1]` code line:
  ```
  Pošlite nám kód z e-mailu, ktorý Vám prišiel, a dátum narodenia na overenie.
  ```
- clue `reset` hint:
  ```
  Stopa: obnovenie hesla, o ktoré Sára nežiadala. Kód ide aj na jej číslo, ktoré práve u nej nefunguje.
  ```
  The `code` hint, the debrief clue "„Podpora“ v súkromnej správe pýta kód." and the `send-code` option can stay as they are.

**3. [major] Teen trusted-adult line · `docs/PSYCHOLOGY.md` line 62 (open item b)**
Problem: "banka aj polícia sa často chcú rozprávať s dospelým" has no source. It is plausible, but I opened no bank terms for minors' accounts and no procedural-law text on interviewing minors. It is not used in any case file yet. It must not ship as written.
Replacement (sources: eu-bik-ie-scams-young-2026, sk-nbs-pozor-na-podvody, sk-news-sita-police-mules-2026, sk-justice-trestne-konanie):
```
Pri peniazoch, účtoch a vyhrážkach to rieš s dospelým, ktorému dôveruješ. Dvaja ľudia konajú rýchlejšie a dospelý ti pomôže zavolať do banky aj ísť na políciu.
```

### Minors

**4. [minor] T1 · `t1-lahka-brigada.yaml` → `debrief.if_it_happened[4]` (open item a)**
"Profil nahlás priamo v aplikácii a varuj kamarátov."
- The report part is supported: eu-bik-ie-scams-young-2026 says "Report the scam on the relevant platform."
- "Varuj kamarátov" has no source for money mules. None of Europol, NBS, the police (via SITA) or BIK says it. In the mule context it could also expose a friend who is already involved.
The best option already models the right thing ("Varovať Ota"). Replacement:
```
Profil nahlás priamo v aplikácii. Kamarátovi, ktorému píše ten istý človek, povedz, nech to rieši s dospelým.
```
The refuse option (`decision.options[3].text`, "… Varovať Ota.") can stay. It is a person-to-person step, matched by the new wording.

**5. [minor] J4 · `content/cases/junior/j4-kriciaca-obrazovka.yaml` → `sources` and clue `call` (open item d)**
Problem: the clue rested on two supporting-only sources (Swiss NCSC, ESET). Resolved: SK-CERT (sk-skcert-tech-support-2020, re-opened today) says fake warnings appear "through compromised websites, advertisements, applications" and "If you see a phone number with a warning message … do not call it". It also backs the `call` option's consequence: the caller asks you to install more apps.
Fix:
- Keep the clue.
- Add `sk-skcert-tech-support-2020` to `sources:`.
- Update the header comment: "The `call` clue rests on those two supporting sources…" becomes "The `call` clue rests on sk-skcert-tech-support-2020."
Optional sharper hint:
```
Stopa: číslo na „technika“ priamo vo varovaní. Na číslo z takého okna nevolaj.
```
Do not say "real warnings never show a number". SK-CERT says it about one software vendor's error messages, not about every system.

**6. [minor] T3 · `t3-bez-signalu.yaml` → `decision.options[3].consequence` (open item e)**
"Operátor cudziu SIM zablokuje a Sárino číslo vráti." The other T3 operator steps are correct:
- the parent calls from another phone;
- the operator is reached on the number from the contract or its app;
- the bank is checked;
- a one-time code goes to no caller, including a "operátor" (eu-enisa-sim-swapping-2021).
This line, though, promises an instant return. In practice, getting the number back usually needs the contract holder to identify themselves, and that may take time. No SK source describes operator procedure. Replacement:
```
Operátor cudziu SIM zablokuje a s mamou dohodne, ako Sárino číslo vrátiť. Účet ostal Sárin.
```

**7. [minor] J1 · `j1-drak-zadarmo.yaml` → clue `link` hint**
"Do hry sa vždy dostaneš cez jej vlastnú aplikáciu." The "vždy" overreaches: many games log in through a browser page too. Replacement:
```
Stopa: cudzí odkaz. Do hry choď cez jej aplikáciu alebo stránku, ktorú otvoríš vlastnou cestou.
```

**8. [minor] J1 · `j1-drak-zadarmo.yaml` → `sources` (clue `hurry`)**
Time pressure is a sound tell, but J1's sources tie urgency only to investment ads (eu-bik-ie-scams-young-2026). Add `eu-esas-ai-scams-factsheet-sk` ("Naliehavá žiadosť o peniaze alebo osobné informácie"). No text change.

**9. [minor] T2 · `t2-cheat-zadarmo.yaml` → `sources` (device reset step)**
"Napadnutý počítač nechaj dospelým obnoviť do pôvodného stavu" currently rests on the Swiss NCSC only. Two Slovak sources also advise a reset: `sk-skcert-malicious-app-2025` (factory reset) and `sk-skcert-tech-support-2020` ("consider resetting the device"). Add both. No text change.
The "vypni antivírus" and "zamknutý archív" red flags stay supporting-only (Swiss NCSC). That is accepted per the case header, and no line claims an SK/EU body warned about cheats.

**10. [minor] J2 · `j2-kod-pre-kamarata.yaml` → header comment, lines 9–12**
The comment says the messenger-named source id "is cited here in a comment until the fraud-researcher renames the id". That is stale. The id is in `sources:` (as in T2 and T3), and `scripts/lib/redline.ts` deliberately exempts `sources:` ids from the denylist. Delete lines 9–12. I am not renaming the id: that would break three case files at once for no lint gain.

**11. [minor] help · `content/help.yaml` → entry `policia` (open item f)**
"Podvod sa dá oznámiť na čísle 158 …"
- 158 is correct as the police number (sk-justice-dolezite-kontakty).
- No official page opened says to report fraud by calling 158. A formal report is made at any police station or prosecutor's office, in writing or orally for the record (sk-justice-trestne-konanie).
Replacement `text`:
```
Podvod sa dá oznámiť na ktoromkoľvek oddelení polície. Choď tam s rodičom alebo iným dospelým, ktorému dôveruješ. Číslo polície je 158.
```

**12. [minor] help · `help.yaml` → entry `sk-cert` → `url_label`**
The URL is the current English page ("Report an incident"). "Nahlásiť incident" is only the Slovak site's menu label (sk-skcert-kedy-nas-kontaktovat). Replacement:
```
sk-cert.sk, stránka „Report an incident“ (v angličtine)
```
The `text` is fine. SK-CERT asks the public to report scam links and taken-over accounts (sk-skcert-whatsapp-vote-2026), and an adult files it.

**13. [minor] help · `help.yaml` → entry `viac-ako-nick`**
The facts are correct: nonstop, anonymous chat, separate chats for "menej ako 12" and "viac ako 12", no phone line. The site also states that if a child's life or safety is at risk, it must tell helping adults or the authorities. Children should not be told "anonymne" without that. Replacement `text`:
```
Chat pre deti a mladých, nonstop a anonymne. Je zvlášť pre deti do 12 rokov a od 12 rokov. Nemá telefón. Ak ti hrozí nebezpečenstvo, privolajú pomoc.
```

**14. [minor] Derived, not quoted, but acceptable (no change)**
- J3/T2 "najprv e-mail": derived from SK-CERT naming e-mail as a key account (sk-skcert-passwords-2018) plus "change key accounts" (sk-skcert-hacked-accounts-2018).
- T4 clue `delete` ("staré si zmaž"): follows from the sourced known-number habit (eu-esas-ai-scams-factsheet-sk). No source names it as a tell.
- T1 `later` "banka účet zablokuje": plausible. The police say "bankový účet vedený na vaše meno je vašou zodpovednosťou".
Keep the wording as is. Don't strengthen any of them into "always".

---

## Checked and correct (no change)

- **J1:** the `prize`, `pass` and `sender` clues, all decoys, the best option (report and block in the app), all four "Ak sa to už stalo" steps, and the quick round. Sources: sk-skcert-online-games-2020, eu-bik-gaming-teachers, sk-skcert-hacked-accounts-2018.
- **J2:** all clues, including `nocall`, where SK-CERT says to phone the sender. The steps:
  - unlink devices, because deleting the app is not enough;
  - turn on two-step login;
  - warn friends by another channel;
  - an adult reports it.
  Sources: sk-skcert-whatsapp-vote-2026, sk-skcert-nova-vlna-2025, sk-minv-pk-podvod-leaflet. The friend-asks-directly framing is labelled as ours.
- **J3:**
  - a passphrase of 12+ characters;
  - a different password per account;
  - a password manager;
  - an app code is stronger than SMS, and "Aj SMS je lepšia ako nič";
  - no outdated 7-character rule and no "no dictionary words" rule.
- **J4:** official store, permissions, developer and reviews, the uninstall step, and "reset, passwords, bank" (sk-skcert-malicious-app-2025, sk-skcert-fakeapps-2018). The arc scene is story only, with no factual claim.
- **T1:** all 6 clues and decoys. The lock-up order is stop, then adult, then bank on the card or app number, then police (eu-europol-mule-jobs, sk-nbs-crypto-mule-2025, sk-news-sita-police-mules-2026). The verify round is correct. No penalties or figures appear.
- **T2:**
  - the official-store rule;
  - a ban for cheats;
  - the infostealer definition;
  - a clean device first, then e-mail, other accounts, devices, two-step login and the device reset.
- **T3 (apart from finding 2):**
  - `nosignal` as the first SIM-swap sign;
  - the parent calls the operator from another phone and checks the bank;
  - no code to a "operátor" caller;
  - app instead of SMS;
  - share less on the profile;
  - recovery only through the app opened by the player.
  These follow ENISA 2021 and SK-CERT. No statistics, no teen-targeting claim, no description of how a number is moved.
- **T4:**
  - an urgent money request from "family";
  - the voice is not proof, and it is never claimed to be detectable by ear;
  - call the old or known numbers;
  - a family safe word as an add-on;
  - the "if caught" steps: stop, bank, police.
  The investment-ad quick-round item is correct (eu-esas-ai-scams-factsheet-sk, sk-nbs-pozor-na-podvody, sk-nbs-crypto-warning-signs-2025).
- **help.yaml:**
  - 116 111 is nonstop, free, anonymous and for under-18s; its chat runs daily 18.00–22.00 (sk-ldi-home, sk-minedu-krizove-linky-2025).
  - IPčko is 0800 500 333, nonstop, free and anonymous.
  - Linka detskej dôvery is 0800 221 021; phone on working days 8.00–20.00, chat 8.00–19.00, free. Only the free number is shown.
  - Ochráň ma is shown only for illegal content, not scams. Stopline is correctly omitted.
  - 112 is shown for immediate danger. The order (talk, then report, then emergency) matches PSYCHOLOGY §3.
- **Every source id cited** in the 8 cases and in help.yaml comments exists in `content/sources.yaml`.

---

## Re-review 2026-11-25

Reviewer: fraud-researcher. I could not run `git diff 5137c12..HEAD`, because I have no shell here. Instead I read the current `content/` files in full against the first review.

### Verdict: FAIL (0 blockers, 2 majors, 1 minor)

Both remaining majors are one-line fixes. Once they are applied, the content passes.

### First-review findings
- **Applied correctly:** 1 (T1 note, with an accurate rewording of the second sentence), 2 (T3 e-mail, code line and `reset` hint), 4, 5, 6, 7, 8, 9, 10, 11, 12 and 13.
- **Major 3 is NOT applied.** `docs/PSYCHOLOGY.md` line 62 still says "banka aj polícia sa často chcú rozprávať s dospelým". Use the replacement from finding 3 above:
  ```
  Pri peniazoch, účtoch a vyhrážkach to rieš s dospelým, ktorému dôveruješ. Dvaja ľudia konajú rýchlejšie a dospelý ti pomôže zavolať do banky aj ísť na políciu.
  ```
  Also delete "(`fraud-researcher` checks the second clause.)".

### New content
- **`recall` questions (J2, J3, J4, T2, T3, T4): correct.** Each correct answer matches the previous case's `debrief.rule` word for word. Every distractor is advice the earlier case shows to be unsafe.
- **Changed case texts (T1, T3, J1, J4): correct.** No new factual claims.
- **R1 [major] help · `pomoc-vydieranie` → `text`.**
  - "ale nikomu ich nepreposielaj" has no source. No page I opened says it: Garda/Europol "Say No!", BIK teachers, BIK parents, Luxembourg and Slovenian police, Ochráň ma.
  - Every other line is sourced. "Neplať" and "nič ďalšie neposielaj" come from ie-garda-say-no-2017, eu-bik-sextortion-parents-2025 and lu-police-sextorsion-2021. "Nemaž, dôkazy" comes from ie-garda-say-no-2017 ("Don't delete anything"). "Zablokuj" comes from ie-garda-say-no-2017 and eu-bik-sextortion-parents-2025. "Nie je to tvoja chyba" comes from sk-ochranma-ibsa and eu-bik-sextortion-teachers. The trusted adult and 116 111 come from eu-bik-sextortion-teachers and sk-ldi-home.
  - Replacement `text`:
  ```
  Nie je to tvoja chyba. Neplať a nič ďalšie neposielaj. Správy nemaž, sú to dôkazy.
  Odosielateľa zablokuj. Povedz to dospelému, ktorému dôveruješ, alebo zavolaj na 116 111.
  ```
- **`pomoc-kybersikana`: PASS.** Sources: sk-minv-kybersikanovanie-brochure, sk-vudpap-kybersikanovanie-2024, sk-skcert-cyberbullying-2018, and sk-zodpovedne-kybersikanovanie for "not your fault".
- **`pomoc-je-mi-tazko`: PASS.** Sources: sk-ldi-home, sk-minedu-krizove-linky-2025, eu-youreurope-emergency-faq-sk.
- **R2 [minor] help.yaml lines 74–75 comment.** It is stale. Replace it with:
  ```
  # Advice sources (docs/SOURCES.md "Help topic cards"): vydieranie: ie-garda-say-no-2017, eu-bik-sextortion-parents-2025,
  # eu-bik-sextortion-teachers, sk-ochranma-ibsa; kybersikana: sk-minv-kybersikanovanie-brochure, sk-vudpap-kybersikanovanie-2024,
  # sk-zodpovedne-kybersikanovanie, sk-skcert-cyberbullying-2018; je-mi-tazko: sk-ldi-home, sk-minedu-krizove-linky-2025.
  ```

### Gap
I found no Slovak official page with step-by-step sextortion advice for children. I checked Polícia SR/MV SR, NKS, Ochráň ma, IPčko and the UNICEF SK guide. The steps therefore rest on EU sources. Europol's own "Say No!" page did not render, so I used the Garda relay instead.

### What I changed
- `content/sources.yaml`: added 11 sources, all opened today: eu-bik-sextortion-teachers, eu-bik-sextortion-parents-2025, eu-bik-sexual-extortion-2025, ie-garda-say-no-2017, lu-police-sextorsion-2021, si-policija-say-no, sk-skcert-cyberbullying-2018, sk-minv-kybersikanovanie-brochure, sk-vudpap-kybersikanovanie-2024, sk-zodpovedne-kybersikanovanie, sk-ochranma-ibsa.
- `docs/SOURCES.md`: new section "Help topic cards", with each advice line mapped to its sources.

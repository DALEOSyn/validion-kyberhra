# CASE_SPECS — 8 MVP cases (Kancelária STOPA + Ozvena)

**Owner:** game-designer · **Date:** 2026-11-25 · **Status:** DRAFT for scenario-writer, fraud-researcher, sceptic-reviewer, learning-psychologist.
**Read first:** `docs/GDD.md` (mechanics §4, scoring §8, content rules §12) and `CLAUDE.md` (Red Lines).

## How to read this file

- Slovak lines in „…“ are **draft in-game text**. The scenario-writer finalises them; meaning, clue/decoy roles and outcome classes are fixed by this spec.
- Every tappable span is listed: `clue` or `decoy`, with its hint. Non-listed text in an artefact is plain.
- **"source needed"** = the clue may only be taught as a warning sign if `fraud-researcher` confirms a source; otherwise make the span plain.
- All names, brands, domains, numbers and IBANs are fictional (GDD §12). Domains end `.example`; numbers are masked; IBANs start `SK00`.
- Player-facing text uses no gendered forms (present tense, imperatives, infinitives). In-world text written *by* a named character may use that character's gender.
- Threat ids refer to `THREAT_CATALOGUE.md` (A = fraud, B = malware/technical). **Source ids** in each case table point to `content/sources.yaml`; every teaching claim is aligned with `docs/SOURCES.md` "Facts we can teach" (revision 2026-11-25 after the producer note). "Supporting only" sources are non-EU or industry and never satisfy Red Line 6 on their own. Anything marked "fraud-researcher confirms" is plain text until a source is added.

## Recall, worked example and reuse (PSYCHOLOGY §4)

- **Worked example:** in J1 and T1 the first listed clue (`sender` in J1, `pay` in T1) is pre-revealed with Mira's or Sára's explanation and counts as found.
- **"Pamätáš si?"** (cases 2–4 of each track, 10 s, unscored): choose the ending of the previous case's rule from 3 options, then see the full rule. Distractor endings are written by the scenario-writer from that case's wrong decision options.
- **Earlier trick in a new channel** (from case 2 on):

| Case | Reused trick | Where |
|---|---|---|
| J2 | J1 "log in / give us a code for your account", now by email from fake support | TT 4 |
| J3 | J1 fake prizes, now posted by a hijacked club account | brief |
| J4 | J1 "password for free crystals" | TT 4 |
| T2 | T1 "too good to be true" offer, now a free cheat | artefact A |
| T3 | J2/T2 hijacked friend asking for a code | TT 4 |
| T4 | T2 "switch off your antivirus", plus T1-style easy-money promise as an investment ad | TT 4, TT 1 |

---

# JUNIOR TRACK: Kancelária STOPA

## J1 · Drak zadarmo

| Field | Value |
|---|---|
| Threat | A15.1 `gaming-account-phishing` |
| LO | LO-J1, LO-X1, LO-X4 |
| Steps | brief → scan (1 artefact) → decision (3) → TT (5) → debrief |
| Sources (`content/sources.yaml`) | sk-skcert-online-games-2020, eu-bik-gaming-teachers, eu-bik-ie-scams-young-2026, sk-skcert-hacked-accounts-2018; supporting only: ch-ncsc-gamer-phishing-2024 |
| Sourcing | Medium. Teach: a message asking for your game login is a red flag; free items/prizes for your password is a common trick; open the game yourself; buy only in the official store. Do NOT claim a Slovak body warned about skins; do NOT say games never give free items. |
| Reuse | Prototype `stopa-case1-v0.2.html` almost as is; fixes listed below |

**Story beat.** First day in the office. Lea got a Bzuk DM: she won a rare dragon skin in Kryptoria if she logs in via a link.

**Brief.**
- Mira: „Vitaj v STOPE. Práve prišla klientka.“
- Lea: „prišla mi táto správa v Bzuku. vraj som vyhrala draka do Kryptorie. mám kliknúť?“
- Mira: „Zober lupu a preskúmaj správu. Nájdi aspoň 3 stopy, že niečo nesedí.“
- Fúzik: „Haf. Bzuk je chatovacia appka, Kryptoria je hra. Obe sú vymyslené. Triky sú skutočné.“

**Artefact A: Bzuk DM to Lea, 19:41** (`minClues` 3, total 5)

| Span (draft) | Kind | Hint |
|---|---|---|
| „Kryptoria_Oficial_Team · nový kontakt“ | clue `sender` | „Stopa: neznámy účet. Hra ti zvyčajne nepíše cez chatovaciu appku. Slovo „Oficial“ si do mena môže dať ktokoľvek.“ |
| „GRATULUJEME 🎉“ | decoy | „Toto samo osebe stopa nie je. „Gratulujeme“ píšu aj skutočné hry. Sleduj, čo od teba chcú.“ |
| „Si medzi 50 výhercami: 5 000 kryštálov a skin Ohnivý drak zadarmo.“ | clue `prize` | „Stopa: veľká výhra zadarmo. Lákadlo, ktoré má vypnúť opatrnosť.“ |
| „Výhru si vyzdvihni do 15 minút, inak prepadne.“ | clue `hurry` | „Stopa: časový tlak. Kto ťa ženie, nechce, aby bol čas niečo overiť.“ (fixes prototype's gendered *stihol*) |
| „kryptoria-odmeny.example/login“ | clue `link` | „Stopa: cudzí odkaz. Do hry sa vždy dostaneš cez jej vlastnú aplikáciu.“ |
| „Prihlás sa menom a heslom do hry, aby sme ti výhru poslali.“ | clue `pass` | „Stopa: pýtajú heslo. Na poslanie výhry nikto tvoje heslo nepotrebuje.“ |
| „Tím Kryptoria 🐉“ | decoy | „Podpis sám osebe nič nedokazuje. Skutoční podvodníci sa nepodpisujú. Ale toho draka si zapamätaj.“ |

**Decision.** Lea: „tak čo mám spraviť? ten drak je fakt super“

| Opt | Text | Class | Consequence |
|---|---|---|---|
| A | „Kliknúť na odkaz a rýchlo sa prihlásiť, kým výhra neprepadne.“ | bad | „Stránka vyzerá ako Kryptoria, ale patrí Tieňovi. Po zadaní hesla sa do Leinho účtu prihlási niekto iný a rozdá jej predmety. Žiadny drak neprišiel.“ + „Toto sa môže stať komukoľvek. Ďalší krok: otvoriť hru priamo a zmeniť heslo.“ |
| B | „Odpísať tomu účtu a opýtať sa, či je to naozaj pravé.“ | ok | „Účet hneď odpíše: „Áno, je to 100 % pravé, ponáhľaj sa.“ Podvodník sa neprizná.“ + „Ďalší krok: overovať inou cestou, nie u toho, kto správu poslal.“ |
| C | „Neklikať. Otvoriť hru Kryptoria priamo a pozrieť správy v nej. Účet v Bzuku nahlásiť a zablokovať.“ | best | „Lea otvorí Kryptoriu vlastnou cestou. V hre žiadna výhra nie je. Účet v Bzuku nahlási. Tieň odchádza naprázdno.“ |

**Quick round (TT).** Keep the prototype's 5 items unchanged:

| # | Source | Text | Answer | Why |
|---|---|---|---|---|
| 1 | Launcher Pixelbrána · upozornenie v aplikácii | „Nová aktualizácia Kryptorie je pripravená. Spusti ju tlačidlom Aktualizovať.“ | safe | Prišlo v launcheri, ktorý máš nainštalovaný, a nepýta heslo. |
| 2 | Bzuk · kamarát Tomáš | „čau, prišiel ti teraz SMS kód? pošli mi ho prosím, potrebujem ho na turnaj“ | trap | Kód zo SMS je kľúč k účtu. Nikomu, ani kamarátovi. |
| 3 | Video · komentár | „GENERÁTOR KRYŠTÁLOV ZADARMO. Stiahni program z kryst-gen.example a spusti ho.“ | trap | Generátory nefungujú; takéto programy často kradnú heslá. |
| 4 | Kryptoria · obchod v hre | „Víkendová akcia: skin Mesačná líška za 200 kryštálov.“ | safe | Je to priamo v hre. Ak ide o skutočné peniaze, najprv sa porad s rodičom. |
| 5 | E-mail · podpora-kryptoria@ucet.example | „Váš účet bude dnes zrušený. Overte heslo tu: kryptoria-support.example“ | trap | Strašenie a odkaz, ktorý pýta heslo. Otvor hru vlastnou cestou. |

**Debrief.**
- Rule: „Keď výhra chce prihlásenie cez odkaz, tak otvor hru vlastnou cestou.“
- Clues: výhra zadarmo od neznámeho účtu · časový tlak · cudzí odkaz, ktorý pýta meno a heslo.
- Ak sa to už stalo: 1. Otvor hru vlastnou cestou a hneď zmeň heslo. Zmeň ho aj všade, kde bolo rovnaké. 2. Zapni dvojstupňové overenie. 3. Ak sa nevieš prihlásiť, použi oficiálne obnovenie účtu v hre. 4. Povedz to dospelému, ktorému dôveruješ. Ak sa platilo kartou, dospelý zavolá do banky. (sk-skcert-hacked-accounts-2018, sk-skcert-online-games-2020, eu-bik-ie-scams-young-2026)
- Story clue: „Stopa k Tieňovi č. 1: Správu podpísal malý drak 🐉. Kto za ním stojí?“

**Stars.** ★ ≥ 4 of 5 clues · ★ option C · ★ TT ≥ 4/5.

---

## J2 · Kód pre kamaráta

| Field | Value |
|---|---|
| Threat | A3.1 `messenger-account-takeover-code` (with A3.3 flavour) |
| LO | LO-J2, LO-X1, LO-X2 |
| Steps | brief → scan (2 artefacts) → decision (3) → TT (5) → debrief |
| Sources | sk-skcert-whatsapp-vote-2026, sk-skcert-nova-vlna-2025, sk-minv-pk-podvod-leaflet, sk-skcert-report-incident |
| Sourcing | High. Teach: hijacked accounts message the whole contact list; they want your code; never share or forward a code; call the friend on the usual number; turn on two-step login. Do NOT present "a friend asks you to forward a code" as a quoted SK-CERT case (it is our framing of the general rule). |

**Story beat.** A quiet afternoon. The player's phone buzzes twice: an SMS code from Bzuk and a message from "Tomáš" asking for it. The real Tomáš walks in during the best outcome: his account was stolen.

**Brief.**
- Mira: „Dnes je pokoj. Aspoň zatiaľ.“
- (Phone buzzes twice.) Fúzik: „Haf. Tvoj mobil. Dve správy naraz.“
- Mira: „Skôr než odpíšeš, preskúmaj obe.“

**Artefact A: SMS from BZUK** · **Artefact B: Bzuk chat "Tomáš 🎮"** (`minClues` 3, total 5)

| Art. | Span (draft) | Kind | Hint |
|---|---|---|---|
| A | „BZUK“ (sender) | decoy | „Toto je naozajstná SMS od Bzuku. Problém nie je SMS, ale kto ju od teba chce.“ |
| A | „Bzuk: tvoj overovací kód na prihlásenie je 482 913.“ | clue `unasked` | „Stopa: kód prišiel, hoci sa nikam neprihlasuješ. Niekto skúša vstúpiť do tvojho účtu.“ |
| A | „Nikomu ho neposielaj, ani kamarátom.“ | clue `warning` | „Stopa: sama SMS hovorí, komu kód patrí: nikomu. Myslí to vážne.“ |
| B | Tomáš's photo and name | decoy | „Meno a fotka sú naozaj Tomášove. Ukradnutý účet vyzerá presne ako ten pravý.“ |
| B | „ahoj, prišla ti teraz SMS s kódom? omylom som tam dal tvoje číslo, pošli mi ho sem“ | clue `askcode` | „Stopa: pýta kód, ktorý prišiel tebe. Kód nikdy nikomu, ani kamarátovi.“ |
| B | „prosím, rýchlo, o 5 minút začína turnaj“ | clue `hurry` | „Stopa: zhon. Kto sa ponáhľa, nechce, aby bol čas overiť.“ |
| B | „nevolaj, som v autobuse a nemôžem hovoriť“ | clue `nocall` | „Stopa: nechce hovor. A práve hovor na Tomášovo známe číslo to overí.“ |
| B | „turnaj v Kryptorii“ | decoy | „Tomáš Kryptoriu naozaj hrá. Kto ukradne účet, vidí aj staré správy a vie, čo kamaráti robia.“ |

No "unusual writing style" clue: it is not in SOURCES.md. The "omylom" excuse stays as plain flavour inside the `askcode` span, not as a separate tell.

**Decision.**

| Opt | Text | Class | Consequence |
|---|---|---|---|
| A | „Poslať kód. Veď je to Tomáš.“ | bad | „Do tvojho Bzuku sa prihlási niekto cudzí. O chvíľu z neho idú rovnaké správy tvojim kamarátom.“ + „Toto sa môže stať komukoľvek. Ďalší krok: povedať to dospelému a obnoviť účet cez „Zabudnuté heslo“.“ |
| B | „Opýtať sa v chate: „Si to naozaj ty?““ | ok | „Odpoveď príde hneď: „jasné, že som to ja, rýchlo“. Kto ukradol účet, sa neprizná.“ + „Ďalší krok: overiť inou cestou, napríklad hovorom.“ |
| C | „Kód neposlať. Overiť si to u Tomáša inou cestou: zavolať mu alebo sa ho opýtať osobne.“ | best | „Vtom sa otvoria dvere. Tomáš: „Niekto mi ukradol Bzuk. Neviem sa prihlásiť.“ S Babi Zorou obnoví účet a kamarátov varuje inou cestou.“ |

**TT.**

| # | Source | Text | Answer | Why |
|---|---|---|---|---|
| 1 | Práve sa prihlasuješ do Bzuku na novom tablete. SMS · BZUK | „Tvoj kód je 731 205. Nikomu ho neposielaj.“ | safe | Kód patrí k prihláseniu, ktoré práve robíš. Zadaj ho len do aplikácie. |
| 2 | Bzuk · Lea | „ahoj, môžeš mi poslať kód, čo ti príde? chcem ťa pridať do súťaže“ | trap | Kód nikdy nikomu, ani kamarátke. Jej účet mohol niekto ukradnúť. |
| 3 | Bzuk · Babi Zora | „Mám čerstvé rožky. Príďte dole, kým sú teplé.“ | safe | Bežná správa. Nič od teba nechce. |
| 4 | E-mail · „Podpora Kryptoria“ | „Napíšte nám kód z SMS, aby sme overili váš účet.“ | trap | Žiadna podpora kód nepotrebuje. |
| 5 | Bzuk · neznáme číslo | „Ahoj, to som ja, Tomáš, mám nové číslo. Pošli mi kód, čo ti príde.“ | trap | Nové číslo a prosba o kód. Over si to u Tomáša na starom čísle. |

**Debrief.**
- Rule: „Keď niekto chce kód z tvojho telefónu, tak ho nepošli nikomu.“ Extra line: „Kamarátovi zavolaj na jeho známe číslo.“
- Clues: kód, o ktorý nežiadaš · niekto ho chce · zhon · nechce hovor.
- Ak sa to už stalo: 1. Povedz to hneď dospelému, ktorému dôveruješ. 2. V nastaveniach Bzuku odpoj všetky zariadenia, ktoré nepoznáš. Zmazať aplikáciu nestačí. 3. Zmeň heslo a zapni dvojstupňové overenie. 4. Varuj kamarátov, nech na správy a odkazy z tvojho účtu nereagujú. 5. Dospelý to môže nahlásiť cez formulár SK-CERT. (sk-skcert-whatsapp-vote-2026, sk-skcert-nova-vlna-2025, sk-skcert-report-incident)
- Story clue: „Stopa k Tieňovi č. 2: V ukradnutom Tomášovom profile sa objavil drak 🐉. Tieň píše z ukradnutých účtov.“

**Stars.** ★ ≥ 4 of 5 clues · ★ option C · ★ TT ≥ 4/5.

---

## J3 · Zámok na účte

| Field | Value |
|---|---|
| Threat | B3.2 `credential-stuffing-password-reuse` |
| LO | LO-J3, LO-X2, LO-X3 |
| Steps | brief → scan (2 artefacts, "weak spots") → decision (3) → lock-up (M4b passphrase + M4a order) → debrief |
| Sources | sk-skcert-passwords-2018, sk-skcert-online-games-2020, sk-csirt-passwords-infographic-2024, sk-skcert-hacked-accounts-2018; supporting: sk-zodpovedne-osobne-udaje |
| Sourcing | Medium-High. Teach: a passphrase of at least 12 characters; a different password per account (and per game account); a password manager can remember them; two-step login, an app code is stronger than SMS; never tell anyone your password. Do NOT use "at least 7 characters" or "never use dictionary words"; do NOT say SMS codes are useless; no "check if your email was in a breach" step. |

**Story beat.** The school game club's Kryptoria account posts fake "prizes" and its picture is now a dragon. Pani učiteľka Šimková asks the club for help. In this case the clues are *weak spots*, not scam tells.

**Brief.**
- Pani učiteľka Šimková: „Náš klubový účet píše deťom čudné výhry. My sme nič také nepísali.“
- Mira: „Tieň sa dostal dnu. Nájdime, kade.“
- Fúzik: „Fórum Kotol minulý mesiac vykradli. Unikli aj heslá.“

**Artefact A: email "Kryptoria: nové prihlásenie"** (genuine alert) · **Artefact B: sticky note on the club's shared computer** (`minClues` 3, total 4)

| Art. | Span (draft) | Kind | Hint |
|---|---|---|---|
| A | „Nové prihlásenie do účtu HernyKlubLipovec z neznámeho zariadenia. Ak ste to neboli vy, zmeňte heslo v aplikácii.“ | decoy | „Toto je dobrý pomocník. Upozornenie prišlo od Kryptorie, nemá odkaz na prihlásenie a radí zmeniť heslo v aplikácii.“ |
| A | „Dvojstupňové overenie: vypnuté“ | clue `no2fa` | „Slabé miesto: chýba druhý zámok. S ním by samotné heslo nestačilo.“ |
| B | „meno: HernyKlubLipovec“ | decoy | „Meno účtu môže poznať každý. Chrániť treba heslo.“ |
| B | „heslo: klub1234“ | clue `short` | „Slabé miesto: krátke heslo z názvu klubu a čísel. Také sa skúša ako prvé.“ |
| B | „(rovnaké aj na e-mail klubu a na fórum Kotol)“ | clue `same` | „Slabé miesto: jedno heslo na troch miestach. Keď uniklo z fóra, otvorilo aj ostatné.“ |
| B | the note itself, „nalepené na spoločnom počítači v klubovni“ | clue `shared` | „Slabé miesto: heslo na lístku, ktorý vidí každý, kto ide okolo.“ |

**Decision.** Pani učiteľka: „Čo s tým urobíme?“

| Opt | Text | Class | Consequence |
|---|---|---|---|
| A | „Zmeniť heslo na klub12345.“ | bad | „Tieň skúsi podobné heslá. O deň je znova dnu.“ + „Toto sa môže stať komukoľvek. Ďalší krok: dlhé heslo z viacerých slov.“ |
| B | „Zmeniť heslo len na klubovom účte. E-mail a fórum nechať tak.“ | ok | „Klubový účet je bezpečnejší. Ale e-mail má stále staré heslo. Kto má e-mail, vie si zmeniť aj ostatné heslá.“ + „Ďalší krok: začať e-mailom.“ |
| C | „S pani učiteľkou: nové dlhé heslo z viacerých slov, pre každý účet iné, začať e-mailom. Zapnúť druhý zámok a odhlásiť cudzie zariadenia.“ | best | „Cudzie zariadenie je odhlásené. Klubový obrázok je znova logo klubu, nie drak.“ |

**Lock-up part 1 (M4b passphrase).** Prompt: „Postav cvičné heslo zo 4 slov, ktoré o klube nikto neuhádne.“
- Good chips: dáždnik, fialová, žirafa, polievka, trampolína, mesiac, ponožka, kompas.
- Decoy chips + hints: „Lipovec“ („Mesto pozná každý.“) · „2014“ („Roky a dátumy sa hádajú ľahko.“) · „Fúzik“ („Meno psa pozná celá kancelária.“) · „heslo“ („Toto slovo sa skúša ako prvé.“) · „klub“ („Názov klubu je na každom plagáte.“).
- Done when 4 good chips are chosen. The length bar shows the character count and turns to "dlhé" at 12 characters or more (SK-CERT: a sentence of at least 12 characters). Fúzik's line: „Dlhé heslo si nemusíš pamätať samo. Pomôže aj správca hesiel.“ (sk-skcert-passwords-2018). Fixed note: „Toto heslo je len cvičné. Svoje skutočné heslo nikde neukazuj ani nepíš.“

**Lock-up part 2 (M4a order).** Prompt: „Zamkni klubový účet v správnom poradí.“

| Rank | Step |
|---|---|
| 1 | „Otvoriť Kryptoriu vlastnou cestou a ísť do Nastavení.“ |
| 2 | „Zmeniť heslo na nové dlhé heslo, iné ako na e-maile.“ |
| 3 | „Zapnúť druhý zámok (dvojstupňové overenie). Kód z aplikácie je silnejší ako SMS.“ |
| 3 | „Napísať členom klubu, že účet bol cudzí, nech na jeho správy nereagujú.“ |

Distractor: „Napísať nové heslo na lístok a nalepiť ho na počítač.“ → „Toto nie. Lístok na spoločnom počítači vidí každý.“

**Debrief.**
- Rule: „Keď zakladáš účet, tak daj dlhé, iné heslo a druhý zámok.“
- Clues: krátke heslo · jedno heslo na viacerých miestach · heslo na viditeľnom lístku · chýba druhý zámok.
- Ak sa to už stalo: 1. Povedz to dospelému. 2. Zmeň heslo, najprv k e-mailu, potom všade, kde bolo rovnaké, každé iné. 3. Zapni dvojstupňové overenie. 4. Ak sa nevieš prihlásiť, použi oficiálne obnovenie účtu. 5. Daj vedieť kamarátom, nech na správy z účtu nereagujú. (sk-skcert-hacked-accounts-2018, sk-skcert-passwords-2018)
- Story clue: „Stopa k Tieňovi č. 3: Tieň heslo nehádal. Našiel ho v heslách, ktoré unikli z fóra Kotol. Tieň zbiera to, čo ľudia nechajú ležať.“

**Stars.** ★ ≥ 3 of 4 clues · ★ option C · ★ lock-up errors (both parts) ≤ 2.

---

## J4 · Kričiaca obrazovka (end of junior arc)

| Field | Value |
|---|---|
| Threat | B2 fake app outside the official store (fake "cleaner"), with an A9.2 scare pop-up as the setting |
| LO | LO-J4, LO-X2, LO-X4 |
| Steps | brief → scan (2 artefacts) → decision (4) → TT (5, mixed review of J1–J4) → debrief → **arc scene** |
| Sources | sk-skcert-malicious-app-2025, sk-skcert-fakeapps-2018, sk-nbs-pozor-na-podvody; supporting only (lure): ch-ncsc-fake-virus-alert-2025, sk-eset-kb-fake-virus-android |
| Sourcing | **Thin for the pop-up.** Per the producer note (2026-11-25) the case is built on the sourced habit: install only from the official store, check what an app asks for, refuse permissions it does not need and uninstall, check who made an app and its reviews, do not install because a message tells you to. The pop-up is the setting, not the lesson. Do NOT claim any SK/EU body warned about fake virus pop-ups; do NOT say official stores are always safe; do NOT make factual claims about how browsers or tablets behave ("a web page cannot know…", "a tablet never asks you to call"). |

**Story beat.** Babi Zora was reading a recipe on her tablet. A loud window said the tablet had viruses, and she tapped "STIAHNUŤ". Now the tablet asks whether to allow an install from this source and lists what the "cleaner" wants. She stops and comes upstairs. The club looks at both screens before anything is allowed.

**Brief.**
- Babi Zora: „Deti, tablet kričal, že má vírusy. Ťukla som na Stiahnuť a teraz sa ma na niečo pýta.“
- Fúzik: „Haf. Dobre, že ste prestali. Ešte nič nepovoľujte.“
- Mira: „Pozrime sa na obe obrazovky.“

**Artefact A: screenshot of the pop-up over a recipe page** · **Artefact B: the tablet's install and permission screen** (`minClues` 3, total 5)

| Art. | Span (draft) | Kind | Hint |
|---|---|---|---|
| A | „⚠ VÁŠ TABLET JE NAKAZENÝ (5 VÍRUSOV) · Do 00:59 sa poškodia fotky“ | clue `scare` | „Stopa: strach a odpočítavanie. Okno ženie do inštalácie. Pred inštaláciou sa vždy zastav.“ |
| A | „STIAHNUŤ Čistič PRO · cistic-pro.example“ | clue `download` | „Stopa: aplikácia z odkazu v okne, nie z oficiálneho obchodu. Aplikácie inštaluj len z oficiálneho obchodu.“ |
| A | „Alebo volajte technika: 0900 ••• •••“ | clue `call` (supporting source only; if the reviewer objects, make it plain text) | „Stopa: neznáme číslo z okna. Nevolaj naň.“ |
| A | Shield logo „Bezpečnostné centrum“ | decoy | „Štít a slovo „bezpečnosť“ si nakreslí ktokoľvek. Samo to nič nedokazuje.“ |
| A | Recipe „Lipovecké šišky“ behind | decoy | „Stránka s receptami nie je problém. Problém je, čo chce okno.“ |
| A | Tiny 🐉 in the pop-up corner | decoy | „Podpis sám osebe nič nedokazuje. Ale Fúzik ho už pozná.“ |
| B | „Povoliť inštaláciu aplikácií z tohto zdroja?“ | clue `source` | „Stopa: tablet upozorňuje, že aplikácia neprichádza z oficiálneho obchodu.“ |
| B | „Čistič PRO chce: kontakty, SMS správy, ovládanie obrazovky“ | clue `perms` | „Stopa: povolenia, ktoré čistič nepotrebuje. Na čo by mu boli tvoje SMS?“ |
| B | „Vývojár: neznámy · 0 hodnotení“ | clue `maker` | „Stopa: nevieš, kto aplikáciu robí, a nikto ju nehodnotil. Pri každej aplikácii pozri, kto ju robí.“ |
| B | „Batéria 64 %“ | decoy | „Bežný údaj tabletu. S aplikáciou nesúvisí.“ |

(`scare`, `download`, `source`, `perms`, `maker` are the 5 counted clues; `call` counts as a 6th only if fraud-researcher accepts the supporting source. Star threshold stays 4.)

**Decision.** Babi Zora: „Tak čo, mám to povoliť?“

| Opt | Text | Class | Consequence |
|---|---|---|---|
| A | „Povoliť všetko, nech je tablet čistý.“ | bad | „Čistič sa nainštaluje a hneď chce ďalšie povolenia. Babi už nevie, čo všetko v tablete robí.“ + „Toto sa môže stať komukoľvek. Ďalší krok: aplikáciu odinštalovať a ukázať tablet niekomu, kto sa vyzná.“ |
| B | „Zavolať na číslo technika z okna.“ | bad | „Milý hlas chce, aby Babi nainštalovala ešte jednu aplikáciu. Na Babinu otázku odpovedá: „Verte mi.““ + „Toto sa môže stať komukoľvek. Ďalší krok: zložiť a nič neinštalovať.“ |
| C | „Nechať tablet tak a počkať, kým sa to samo vyrieši.“ | ok | „Nič zlé sa nestalo, ale otázka na obrazovke ostáva.“ + „Ďalší krok: inštaláciu zrušiť a okno zavrieť.“ |
| D | „Inštaláciu zrušiť a nič nepovoliť. Okno zavrieť. Ak Babi chce čistič, hľadať ho len v oficiálnom obchode a pozrieť, kto ho robí a čo chce.“ | best | „Babi ťukne na Zrušiť a zavrie okno. Nič sa nenainštalovalo. Šišky sa dopečú načas.“ |

**TT (mixed review of the junior track).**

| # | Source | Text | Answer | Why |
|---|---|---|---|---|
| 1 | Aplikácia „Baterka“ z oficiálneho obchodu | „Baterka chce prístup k tvojim kontaktom a SMS.“ | trap | Baterka kontakty ani SMS nepotrebuje. Odmietni a aplikáciu odinštaluj. |
| 2 | Oficiálny obchod s aplikáciami | „Kryptoria · vývojár Kryptoria Studio · 4,6 ★ · 120 tis. hodnotení · Inštalovať“ | safe | Oficiálny obchod, známy vývojár a hodnotenia. Aj tak pozri, aké povolenia chce. |
| 3 | Kryptoria · v hre | „Odmena za týždennú výzvu je v tvojom batohu.“ | safe | Je to priamo v hre a nič nepýta. |
| 4 | Bzuk · neznámy účet | „Zadaj heslo do Kryptorie a dostaneš 1000 kryštálov.“ | trap | Heslo za výhru je vždy pasca. |
| 5 | Lea, osobne v škole | „Zapla som si druhý zámok. Ukážem ti, ako na to.“ | safe | Kamarátka osobne a dobrá rada. |

**Debrief.**
- Rule: „Keď okno ženie inštalovať aplikáciu, tak ju hľadaj len v oficiálnom obchode.“ Extra line: „Povolenia, ktoré aplikácia nepotrebuje, odmietni.“
- Clues: aplikácia z odkazu v okne, nie z obchodu · povolenia, ktoré čistič nepotrebuje · neznámy vývojár bez hodnotení · strach a zhon.
- Ak sa to už stalo: 1. Povedz to dospelému, ktorému dôveruješ. 2. Aplikáciu odinštaluj. 3. Ak dostala zvláštne povolenia, ukáž tablet dospelému. Môže byť potrebné tablet obnoviť do pôvodného stavu, zmeniť heslá a dať vedieť banke. (sk-skcert-malicious-app-2025)
- Story clue: „Stopa k Tieňovi č. 4: V rohu okna bol malý drak 🐉. Štyri triky, jeden drak.“

**Stars.** ★ ≥ 4 of 5 clues · ★ option D · ★ TT ≥ 4/5.

**Arc scene "Nástenka" (≈ 45 s, after the J4 debrief; unscored).**
1. Mira pins four cards on the cork board and connects them with red string: „Štyri triky, jeden drak.“
2. Fúzik: „Falošná výhra, požičaný účet, uniknuté heslo, strašiace okno. Nič múdre. Len rýchle.“
3. Babi Zora: „Toto zanesieme spolu s vašimi rodičmi na políciu.“
4. (Next day) Mira: „Polícia ďakuje. Tieň nie je jeden zloduch z Lipovca. Je to skupina podvodníkov ďaleko odtiaľto, ktorá posiela rovnaké triky tisícom ľudí. Kto presne, to už je práca polície.“
5. Mira: „Tieň nevyhrá, keď ľudia vedia, na čo si dať pozor. Teraz to vieš aj ty.“
6. End card: „Odznak STOPA“, the four rules, „Kancelária STOPA zostáva otvorená. Ukáž svoje stopy doma alebo kamarátovi.“ Help card with 116 111.

---

# TEEN TRACK: Ozvena

Tone reminders: investigative and dry, not childish, never scary. Sára, Matej and pani Bieliková speak in short, real sentences. No slang in teaching text. Consequences are chained ("Hneď:" / "Neskôr:") and always end with the next step.

## T1 · Ľahká brigáda

| Field | Value |
|---|---|
| Threat | A8.2 `money-mule-recruitment` (A8.1 flavour) |
| LO | LO-T1, LO-X1, LO-X2, LO-X3, LO-X4 |
| Steps | brief → scan (2 artefacts) → decision (4) → verify → lock-up (M4a, "Oto already said yes") → debrief |
| Sources | eu-europol-mule-jobs, sk-nbs-crypto-mule-2025, sk-nbs-money-mule-2019, eu-europol-iocta-2026, eu-bik-ie-scams-young-2026, eu-eures-fake-jobs-sk-2023; supporting: sk-news-sita-police-mules-2026 |
| Sourcing | High. Teach: a stranger offers quick, easy money; the "job" uses your own bank account to receive and send on money; no experience needed; everything online; young people and students are targeted on social media; never share bank login details; moving money for someone else is a criminal offence even if you didn't know. Do NOT show prison terms, fines or case figures; do NOT name a Slovak bank; do NOT say the police "launched a campaign". |
| Psychology | Money-mule on-screen rules (GDD §12.7) apply in full |

**Story beat.** Ozvena is preparing an episode about summer jobs. Kristián from 9.B sends a tip: a recruiter called Dax offers 150 € a week. His friend Oto already joined. "Je to legit?"

**Brief.**
- Sára: „Máme tip na epizódu. Overovací stôl, je to tvoje.“
- Kristián (Bzuk): „Dax zo Záberu ponúka brigádu, 150 € týždenne z mobilu. Oto už do toho išiel. Je to legit?“
- Pani Bieliková: „Pred éterom všetko overujeme. Aj to, čo vyzerá nevinne.“

**Artefact A: Záber profile + post by @dax_brigady** · **Artefact B: DM thread Dax → Kristián** (`minClues` 4, total 6 clues `pay`, `noexp`, `account`, `forward`, `online`, `login`; 5 decoys; `starClues` 5)

| Art. | Span (draft) | Kind | Hint |
|---|---|---|---|
| A | „Dax · Kvapka Partners · 48,2 tis. sledovateľov“ | decoy | „Sledovatelia sa dajú kúpiť. Nedokazujú nič dobré ani zlé. Sleduj, čo chce.“ |
| A | Profile photo: young man by a car | decoy | „Fotka nič nedokazuje. Môže byť cudzia aj vyrobená.“ |
| A | „Hľadám 3 ľudí z Lipovca na brigádu z mobilu. 150 € týždenne za 10 minút denne.“ | clue `pay` | „Stopa: veľa peňazí za takmer nič.“ |
| A | „Netreba skúsenosti, všetko z mobilu.“ | clue `noexp` | „Stopa: žiadne skúsenosti a všetko len online. Spolu s ľahkými peniazmi je to typický znak.“ |
| A | „Stačí mať 15+ a vlastný účet v banke. Píš DM.“ | clue `account` | „Stopa: hlavná podmienka je tvoj bankový účet. Taká „práca“ nie je brigáda.“ |
| A | Comment @patrik_9b: „Robím to druhý týždeň, výplata vždy prišla 👌“ | decoy | „Pochvala pod príspevkom nič nedokazuje, ani dobré, ani zlé. Kto ju naozaj napísal, sa dá overiť len mimo Záberu.“ |
| B | „Čau Kristián, videl som tvoj komentár 🙂“ | decoy | „Priateľský tón je normálny. Nič neprezrádza.“ |
| B | „Sme Kvapka Partners, robíme platby pre e-shopy v zahraničí. Banky nám obmedzujú prevody, tak potrebujeme lokálne účty.“ | decoy-like plain text (no tap) | Merged into `account`: the sourced tell is "the job uses your own account". |
| B | „Na tvoj účet príde platba. 90 % pošleš ďalej na účet, ktorý ti dám, 10 % je tvojich.“ | clue `forward` | „Stopa: cudzie peniaze na tvojom účte, ktoré máš poslať ďalej. Takéto peniaze často pochádzajú z podvodov.“ |
| B | „Zmluvu ani pohovor netreba, všetko vybavíme cez chat.“ | clue `online` | „Stopa: všetko len cez chat. Žiadny pohovor, nikto, koho by sa dalo stretnúť.“ |
| B | „Pošli fotku občianky a prihlasovacie údaje do bankovej appky, nastavím to za teba.“ | clue `login` | „Stopa: prihlasovacie údaje do banky nepatria nikomu. Ani zamestnávateľovi.“ |
| B | „A nikomu o tom nehovor, nech nám to konkurencia neskopíruje 😉“ | plain text; clue `secret` only if fraud-researcher adds a source (not in SOURCES.md) | (if sourced) „Stopa: tajnosť. Dobrá brigáda sa nemusí skrývať pred rodičmi.“ |
| B | „Výplata každý piatok.“ | decoy | „Pravidelná výplata je normálna. Stopa je v tom, čo máš robiť s cudzími peniazmi.“ |

**Decision.** Kristián: „Tak čo, mám Daxovi odpísať?“

| Opt | Text | Class | Consequence |
|---|---|---|---|
| A | „Skúsiť to raz s malou sumou a potom skončiť.“ | bad | Hneď: „Na Kristiánov účet príde 480 € od cudzej ženy. Dax píše, nech ich do hodiny pošle ďalej.“ Neskôr: „O dva dni banka účet zablokuje a pýta sa, odkiaľ sú peniaze. Žena ich poslala za tovar, ktorý nikdy nedostala.“ + „Toto sa môže stať komukoľvek. Ďalší krok: ešte dnes to povedať rodičovi a spolu zavolať do banky.“ |
| B | „Poslať Daxovi len číslo účtu. Prihlasovacie údaje nie.“ | bad | Hneď: „Číslo účtu stačí. Peniaze prídu rovnako.“ Neskôr: „Dax začne tlačiť, nech ich pošle ďalej, a píše čoraz častejšie.“ + „Toto sa môže stať komukoľvek. Ďalší krok: neodpovedať a povedať to dospelému.“ |
| C | „Vyžiadať si od Daxa zmluvu a názov firmy.“ | ok | Hneď: „Dax pošle pekné PDF so zmluvou a logom.“ Neskôr: „Vyrobiť ho je ľahké. A o Kristiánov účet tu ide stále.“ + „Ďalší krok: overovať mimo Daxa a povedať to dospelému.“ |
| D | „Odmietnuť. Daxa zablokovať a nahlásiť v Zábere. Povedať to rodičovi alebo pani Bielikovej. Varovať Ota.“ | best | „Kristián Daxovi neodpíše a profil nahlási. Doma to povie mame. Zostáva Oto, ktorý už poslal údaje.“ |

**Verify.** „Pod príspevkom Patrik píše, že výplata vždy prišla. Ako zistiť, či to naozaj napísal on?“

| Opt | Text | Correct | Feedback |
|---|---|---|---|
| a | „Odpísať Patrikovi pod komentár na Záberi.“ | no | „Odpovie ten, kto komentár napísal. Ak je účet falošný, všetko potvrdí.“ |
| b | „Napísať Daxovi, nech pošle Patrikov kontakt.“ | no | „Kontakt od Daxa vedie späť k Daxovi.“ |
| c | „Opýtať sa Patrika osobne v škole.“ | yes | „Patrik nemá o ničom tušenie. Taký komentár nikdy nenapísal. Niekto použil jeho meno a fotku.“ |
| d | „Pozrieť, koľko má Patrikov profil sledovateľov.“ | no | „Čísla nič neoveria.“ |

**Lock-up (M4a): „Oto už povedal áno. V akom poradí to má riešiť?“** (order: SOURCES.md T1 "stop moving money now, tell a parent, tell the bank, report it to the police" — eu-europol-mule-jobs, sk-nbs-crypto-mule-2025)

| Rank | Step |
|---|---|
| 1 | „Prestať: cez svoj účet už žiadne peniaze neposielať a Daxovi neodpovedať.“ |
| 2 | „Ešte dnes to povedať rodičovi alebo inému dospelému, ktorému Oto dôveruje.“ |
| 3 | „S dospelým zavolať do banky na číslo zo zadnej strany karty alebo z aplikácie a zmeniť prihlasovacie údaje.“ |
| 4 | „S dospelým to oznámiť polícii.“ |

Distractors: „Peniaze, ktoré už prišli, rýchlo poslať ďalej, nech je pokoj.“ → „Toto nie. Peniaze už nikam neposielaj a rieš to s bankou.“ · „Poslať Daxovi aj kartu, nech si to vybaví sám.“ → „Toto nie. Účet, kartu ani prihlásenie nikomu.“
(Reporting Dax's profile and warning friends stay in the debrief as extra steps; they are not in SOURCES.md, so fraud-researcher confirms or drops them.)

**Debrief.**
- Rule: „Keď za ľahkú prácu chcú tvoj účet, tak odmietni a povedz to dospelému.“
- Pressure line (once, PSYCHOLOGY §2): „Ak ťa niekto tlačí pokračovať, je to dôvod hľadať pomoc hneď.“
- Clues: ľahké peniaze od neznámeho · podmienkou je tvoj účet · cudzie peniaze poslať ďalej · prihlasovacie údaje do banky · žiadne skúsenosti, všetko online.
- Consequence sentence (only here, once; source sk-nbs-crypto-mule-2025, sk-nbs-money-mule-2019; learning-psychologist checks tone): „Posielať cez svoj účet peniaze za niekoho iného je trestný čin, aj keď to človek nevedel. Ak sa to už stalo, skorá pomoc je správny krok.“ No prison, fines or figures; never add "nebudeš mať problém".
- Ak sa to už stalo: the four lock-up steps in order, plus „Nahlásiť Daxov profil a varovať kamarátov.“ (pending source).
- "Do spisu 1": „Na platby Dax odkazuje na kontakt @kvapka.desk v Bzuku. Zapisujeme.“

**Stars.** ★ ≥ 5 of 6 clues and ≤ 2 decoys · ★ option D and verify (c) on first pick · ★ lock-up errors ≤ 1.

---

## T2 · Cheat zadarmo

| Field | Value |
|---|---|
| Threat | B2.4 `cheat-or-cracked-software` → B3.1 `infostealer-session-theft` |
| LO | LO-T2, LO-X1, LO-X3, LO-X4 |
| Steps | brief → scan (3 artefacts) → decision (4) → verify → lock-up (M4a "Čistý štart") → debrief |
| Sources | sk-skcert-online-games-2020, eu-europol-iocta-2026, sk-csirt-ms-2026-06, eu-bik-gaming-teachers, sk-skcert-hacked-accounts-2018, sk-skcert-whatsapp-vote-2026 (removing unknown linked devices); supporting only: ch-ncsc-mods-cheats-2024 |
| Sourcing | **Thin for the cheat → infostealer link.** Per the producer note the lesson is limited to: get games and add-ons only from official stores or trusted sites; don't run downloaded cheats (cheats can also get an account banned for good); programs that steal passwords exist and are a key tool behind attacks; if it happened, tell an adult, change passwords from a clean device starting with email, turn on two-step login, remove unknown devices, and have the infected device reset. "Switch off your antivirus" and "password-locked archive" are supporting-only red flags. Do NOT claim any SK/EU body warned that cheats carry infostealers; no malware names, file names, extensions or install steps. |

**Story beat.** Matej, the team's sound editor, downloaded a free aim helper for Kovoboj last night. "It didn't even work." This morning his game account shows a strange login, his Bzuk has sent a link to 23 friends, and his Záber password was changed. He is embarrassed. Sára: „Toto sa môže stať komukoľvek. Poďme to rozobrať.“

**Brief.**
- Matej: „Včera som stiahol cheat na Kovoboj. Nefungoval. A dnes ráno toto.“ (shows phone)
- Sára: „Rozoberieme to od začiatku. Video, stránka, mobil.“
- Pani Bieliková: „A potom poradie krokov. Na poradí tu záleží.“

**Artefact A: Klipko video page** · **B: download page** · **C: Matej's lock screen next morning** (`minClues` 4, total 8 clues `cheat`, `offstore`, `domain`, `av`, `archive`, `login`, `sent`, `changed`; 5 decoys; `starClues` 6)

| Art. | Span (draft) | Kind | Hint |
|---|---|---|---|
| A | „KOVOBOJ aim helper ZADARMO · funguje 2026“ | clue `cheat` | „Stopa: cheat z neznámeho zdroja. Aj keby fungoval, za cheaty môže prísť trvalý zákaz účtu.“ (eu-bik-gaming-teachers) |
| A | „1,2 mil. zhliadnutí“ | decoy | „Zhliadnutia nič nedokazujú, dobré ani zlé.“ |
| A | Thumbnail with a game screenshot | decoy | „Obrázok z hry spraví každý.“ |
| A | Three identical comments „funguje díky 🔥“ from different accounts | decoy | „Komentáre nič nedokazujú, dobré ani zlé. Sleduj, odkiaľ máš sťahovať.“ |
| A | „Stiahni z kovo-tools.example (v obchode to zakázali)“ | clue `offstore` | „Stopa: mimo oficiálneho obchodu. Hry a doplnky len z oficiálneho obchodu alebo dôveryhodnej stránky.“ (sk-skcert-online-games-2020) |
| B | Address bar „kovo-tools.example/download“ | clue `domain` | „Stopa: adresa nepatrí vývojárovi hry. Kovoboj má stránku kovoboj.example.“ |
| B | „Pred inštaláciou vypni antivírus. Hlási falošný poplach, lebo cheat je neviditeľný.“ | clue `av` (supporting source) | „Stopa: žiadosť vypnúť ochranu. Ochranu kvôli sťahovaniu nevypínaj.“ |
| B | „Archív je zamknutý, heslo: 2026“ | clue `archive` (supporting source) | „Stopa: zamknutý archív s heslom pri cheate je ďalší varovný znak.“ |
| B | „Veľkosť 14 MB · aktualizované 2. 11.“ | decoy | „Veľkosť a dátum nič neprezradia.“ |
| C | „Kovoboj: nové prihlásenie z neznámeho zariadenia“ | clue `login` | „Stopa: niekto je v Matejovom účte. Bez hesla, ktoré by mu Matej dal.“ |
| C | „Bzuk: správa odoslaná 23 kontaktom“ | clue `sent` | „Stopa: správy, ktoré Matej nepísal.“ |
| C | „Heslo k účtu Záber bolo zmenené. Ak ste to neboli vy, obnovte účet v aplikácii.“ | clue `changed` | „Stopa: zmenu hesla Matej nerobil.“ |
| C | „Kovoboj: sezóna 9 začína v piatok“ | decoy | „Bežná správa hry. Nie každé upozornenie je problém.“ |

After the scan, Sára explains in one line (no mechanism, and no claim that this is a documented SK/EU pattern): „Existujú programy, ktoré kradnú heslá. Tento sa tváril ako cheat.“ (eu-europol-iocta-2026, sk-csirt-ms-2026-06)

**Decision.** „Čo má Matej urobiť ako prvé?“

| Opt | Text | Class | Consequence |
|---|---|---|---|
| A | „Na tom istom počítači hneď zmeniť všetky heslá.“ | bad | Hneď: „Matej mení heslá na počítači, na ktorom bol cheat.“ Neskôr: „O hodinu je cudzie prihlásenie späť, aj s novým heslom.“ + „Toto sa môže stať komukoľvek. Ďalší krok: heslá meniť z iného, čistého zariadenia.“ |
| B | „Cheat odinštalovať a dúfať, že je hotovo.“ | bad | Hneď: „Cheat zmizne zo zoznamu.“ Neskôr: „Heslá má stále niekto cudzí. V noci odíde z Matejovho Bzuku ďalšia várka odkazov.“ + „Toto sa môže stať komukoľvek. Ďalší krok: povedať to dospelému a z čistého zariadenia zmeniť heslá.“ |
| C | „Napísať kamarátom, nech na odkaz neklikajú, a zvyšok riešiť zajtra.“ | ok | Hneď: „Varovanie pomôže, kamaráti sú opatrnejší.“ Neskôr: „Kým sa veci odkladajú, cudzí človek je stále v Matejových účtoch.“ + „Ďalší krok: ešte dnes začať e-mailom.“ |
| D | „Povedať to dospelému. Na tom počítači sa už neprihlasovať. Z iného, čistého zariadenia zmeniť heslo k e-mailu, potom ostatné, a zapnúť dvojstupňové overenie.“ | best | „Do večera majú účty nové heslá a dvojstupňové overenie a neznáme zariadenia sú odstránené. Počítač dá otec obnoviť do pôvodného stavu.“ |

**Verify.** „Nela dostala z Matejovho Bzuku: „pozri toto video s tebou 😂 klipko-video.example/x7“. Ako to má overiť?“

| Opt | Text | Correct | Feedback |
|---|---|---|---|
| a | „Opýtať sa v tom istom chate: „Si to ty, Matej?““ | no | „Odpíše ten, kto má účet: „Jasné, pozri to.““ |
| b | „Otvoriť odkaz, len sa pozrieť.“ | no | „Otvorením sa neoverí nič a riziko je zbytočné.“ |
| c | „Zavolať Matejovi na číslo, ktoré má uložené, alebo sa ho opýtať v škole.“ | yes | „Matej hneď potvrdí, že nič neposielal. Nela odkaz zmaže.“ |
| d | „Preposlať odkaz do triedneho chatu, či to niekto pozná.“ | no | „Takto sa odkaz šíri ďalej.“ |

**Lock-up (M4a): „Čistý štart. Zoraď kroky.“**

| Rank | Step |
|---|---|
| 1 | „Povedať to dospelému, ktorému dôveruješ.“ |
| 1 | „Na napadnutom počítači sa už nikam neprihlasovať.“ |
| 2 | „Na inom, čistom zariadení zmeniť heslo k e-mailu.“ |
| 3 | „Zmeniť heslá k ostatným účtom, každé iné.“ |
| 3 | „V nastaveniach účtov odstrániť zariadenia, ktoré nepoznáš.“ |
| 4 | „Zapnúť dvojstupňové overenie.“ |
| 5 | „Napadnutý počítač nechať dospelým obnoviť do pôvodného stavu.“ |

Distractor: „Vypnúť antivírus, aby neprekážal.“ → „Ochranu nevypínaj.“
Sources for the order: sk-skcert-hacked-accounts-2018 (change passwords, starting with email), sk-skcert-whatsapp-vote-2026 (remove unknown devices), sk-skcert-online-games-2020 (two-step login); device reset is supporting only (ch-ncsc-mods-cheats-2024).

**Debrief.**
- Rule: „Keď ponúkajú cheat mimo oficiálneho obchodu, tak ho nesťahuj ani nespúšťaj.“
- Clues: cheat z neznámej stránky · mimo oficiálneho obchodu · adresa nepatrí vývojárovi · žiadosť vypnúť ochranu · prihlásenia a správy, ktoré Matej nerobil.
- Ak sa to už stalo: the lock-up steps in order, plus „Daj vedieť kamarátom, nech na odkazy z tvojho účtu nereagujú.“
- "Do spisu 2": „Stránka kovo-tools.example má v časti Podpora kontakt @kvapka.desk. Ten istý ako pri Daxovi.“

**Stars.** ★ ≥ 6 clues and ≤ 2 decoys · ★ option D and verify (c) first pick · ★ lock-up errors ≤ 1.

---

## T3 · Bez signálu

| Field | Value |
|---|---|
| Threat | A3.4 `sim-swap-number-hijack` + fake account-recovery "support" asking for a code (A3.1) |
| LO | LO-T3, LO-X1, LO-X2, LO-X3, LO-X4 |
| Steps | brief → scan (3 artefacts) → decision (4) → verify → TT (5) → debrief |
| Sources | eu-enisa-sim-swapping-2021, sk-skcert-hacked-accounts-2018, sk-skcert-whatsapp-vote-2026, sk-skcert-online-games-2020; supporting: sk-news-teraz-eset-simswap-2025 |
| Sourcing | **Thin; MFA push spam removed** (producer note 2026-11-25: no SK or EU source). Teach only: a sudden, longer loss of signal can be the first sign of a SIM swap, and a parent must contact the operator at once and check the bank; never tell anyone a one-time code, even a caller who says they are from the operator; prefer an authenticator app to SMS where possible; share less personal detail on social media because scammers use it to pretend to be you; if you lose access, use the service's own official recovery that you open yourself, change passwords, tell contacts; remove unknown linked devices. Do NOT give SIM-swap statistics for Slovakia or claim it targets teens; the operator call is done by a parent (teen numbers are often on a parent's contract). |

**Story beat.** 21:10, the evening before recording. Sára's phone suddenly shows "Bez služby", while her mother's phone on the same network has full signal. On her laptop (home Wi-Fi) an email arrives about a password reset for Záber that she did not ask for, and a profile called "Záber Obnova účtu" offers to save her account. Her public Záber profile shows her birth date and phone number.

**Brief.**
- Sára (team chat on the laptop, 21:20): „Mobil nemá signál už desať minút. Mama vedľa mňa signál má. A teraz mi píše nejaká obnova účtu.“
- Matej: „Nič im neposielaj. Pošli screenshoty.“
- Pani Bieliková (in the group): „A povedz to mame hneď, nie ráno.“

**Artefact A: Sára's phone and laptop notifications** · **B: DM "Záber Obnova účtu ✔"** · **C: Sára's public Záber profile** (`minClues` 4, total 7 clues `nosignal`, `reset`, `fakesupport`, `code`, `hurry`, `birthday`, `phone`; 5 decoys; `starClues` 5)

| Art. | Span (draft) | Kind | Hint |
|---|---|---|---|
| A | Phone status bar „Bez služby · od 21:10“ | clue `nosignal` | „Stopa: mobil zrazu dlhšie nemá signál, hoci mama na tej istej sieti ho má. Môže to byť prvý znak, že Sárino číslo niekto preniesol na cudziu SIM.“ (eu-enisa-sim-swapping-2021) |
| A | Wi-Fi icon on the laptop | decoy | „Wi-Fi funguje, preto Sára môže písať aj bez signálu. To je v poriadku.“ |
| A | „21:10“ | decoy | „Čas sám nič neznamená. Dôležité je, že signál zmizol a nevracia sa.“ |
| A | Email on the laptop: „Záber: žiadosť o obnovenie hesla. Kód sme poslali na číslo +421 9•• ••• 214.“ | clue `reset` | „Stopa: obnovenie hesla, o ktoré Sára nežiadala. Kód ide na jej číslo, ktoré práve nefunguje u nej.“ |
| B | „Záber Obnova účtu ✔ · profil vytvorený pred 2 dňami“ | clue `fakesupport` | „Stopa: obyčajný nový profil, ktorý sa vydáva za podporu. Obnovu účtu otváraš len vlastnou cestou v aplikácii.“ (sk-skcert-hacked-accounts-2018) |
| B | Correct Záber logo as profile picture | decoy | „Logo si skopíruje ktokoľvek. Samo nič nedokazuje.“ |
| B | „Dobrý deň, vidíme pokus o prevzatie Vášho účtu. Pomôžeme Vám ho zachrániť.“ | decoy | „Zdvorilý tón nič nedokazuje, dobré ani zlé. Sleduj, čo chcú.“ |
| B | „Pošlite nám kód, ktorý Vám prišiel, a dátum narodenia na overenie.“ | clue `code` | „Stopa: pýtajú jednorazový kód. Kód nikomu, ani tomu, kto tvrdí, že je podpora alebo operátor.“ (eu-enisa-sim-swapping-2021, sk-skcert-whatsapp-vote-2026) |
| B | „Máte 15 minút, inak účet nenávratne stratíte.“ | clue `hurry` (generic pressure tell; fraud-researcher confirms, else plain) | „Stopa: zhon a strach. Majú zabrániť tomu, aby si to niekto overil.“ |
| C | Name and photo „Sára Lacková · 🎙 Ozvena“ | decoy | „Meno a fotka podcasterky sú verejné a to je v poriadku.“ |
| C | „🎂 3. 5. 2011“ | clue `birthday` | „Stopa: dátum narodenia verejne. Podvodníci také údaje použijú, aby sa vydávali za teba.“ (eu-enisa-sim-swapping-2021) |
| C | „📞 +421 9•• ••• 214 · píšte aj na Bzuk“ | clue `phone` | „Stopa: telefónne číslo verejne v profile. Čím menej o sebe zverejníš, tým lepšie.“ (eu-enisa-sim-swapping-2021) |

**Decision.** „Čo má Sára urobiť teraz?“

| Opt | Text | Class | Consequence |
|---|---|---|---|
| A | „Poslať „podpore“ kód a dátum narodenia, nech účet zachránia.“ | bad | Hneď: „„Podpora“ poďakuje.“ Neskôr: „O pár minút má Záber nové heslo a nový e-mail a Sára je odhlásená. Z jej profilu idú kamarátom odkazy.“ + „Toto sa môže stať komukoľvek. Ďalší krok: povedať to mame a s ňou otvoriť oficiálne obnovenie účtu v aplikácii.“ |
| B | „Reštartovať mobil a ísť spať. Ráno sa uvidí.“ | ok | Hneď: „Signál sa nevráti.“ Neskôr: „Ráno sú v e-maile ďalšie správy o zmene hesiel.“ + „Ďalší krok: ešte dnes to povedať mame, nech zavolá operátorovi.“ |
| C | „Napísať operátorovi cez odkaz, ktorý poslala „podpora“.“ | bad | Hneď: „Odkaz vedie na stránku, ktorá vyzerá ako Telko Lúč.“ Neskôr: „Pýta kód a heslo. Signál sa nevráti.“ + „Toto sa môže stať komukoľvek. Ďalší krok: operátorovi volá mama na číslo zo zmluvy alebo z jeho aplikácie.“ |
| D | „Hneď to povedať mame. Mama zavolá operátorovi z iného telefónu a skontroluje banku. Sára otvorí Záber vlastnou cestou, zmení heslo a odstráni neznáme zariadenia. „Podporu“ nahlási.“ | best | „Operátor cudziu SIM zablokuje a Sárino číslo vráti. Účet ostal Sárin. Sára prepne overenie zo SMS na aplikáciu a z profilu zmaže dátum narodenia aj číslo.“ |

**Verify.** „„Záber Obnova účtu“ tvrdí, že pomôže. Kde to Sára overí?“

| Opt | Text | Correct | Feedback |
|---|---|---|---|
| a | „Opýtať sa v správe na meno a číslo zamestnanca.“ | no | „Meno aj číslo si dá vymyslieť.“ |
| b | „Zavolať na číslo uvedené v ich profile.“ | no | „Číslo od toho, koho overuješ, nič neoverí.“ |
| c | „Otvoriť aplikáciu Záber vlastnou cestou: oficiálne obnovenie účtu a zoznam prihlásených zariadení.“ | yes | „V aplikácii žiadna „obnova“ nepíše. Je tam len žiadosť o heslo, ktorú Sára nespustila.“ |
| d | „Vyhľadať „Záber podpora“ a zavolať na prvý výsledok.“ | no | „Neoverené číslo z vyhľadávania nie je istota. Pomoc hľadaj v aplikácii.“ |

**TT (buttons Bezpečné / Pasca).**

| # | Source | Text | Answer | Why |
|---|---|---|---|---|
| 1 | Aplikácia Telko Lúč, ktorú otvoríš vlastnou cestou | „Faktúra za november je pripravená.“ | safe | Prišlo v oficiálnej aplikácii, ktorú otvoríš ty, a nič nepýta. |
| 2 | Hovor · „Telko Lúč“ | „Dobrý deň, pripravujeme výmenu vašej SIM. Nadiktujte mi kód, ktorý vám teraz príde.“ | trap | Jednorazový kód nikomu, ani volajúcemu „operátorovi“. Zlož a nech rodič zavolá na číslo zo zmluvy. |
| 3 | Záber · Nastavenia, ktoré otváraš ty | „Zapnúť overenie cez aplikáciu namiesto SMS?“ | safe | Overenie cez aplikáciu je silnejšie ako SMS. |
| 4 | Bzuk · kamarátka Nela | „ahoj, prišiel ti kód? klikla som omylom na tvoje číslo, pošli mi ho“ | trap | Kód nikomu, ani kamarátke. Over si to u Nely hovorom na jej známe číslo. |
| 5 | Tvoj mobil | „Už hodinu „Bez služby“, hoci ostatní doma signál majú.“ | trap | Môže to byť prvý znak prenesenia čísla. Povedz to hneď rodičovi, nech zavolá operátorovi z iného telefónu. |

**Debrief.**
- Rule: „Keď mobil zrazu dlho nemá signál, tak to hneď povedz rodičovi.“ Extra line: „Jednorazový kód nikomu, ani „podpore“ či „operátorovi“.“
- Clues: signál zmizol, hoci iní ho majú · obnova hesla, ktorú nikto nespustil · „podpora“ v súkromnej správe pýta kód · dátum narodenia a číslo verejne v profile.
- Ak sa to už stalo: 1. Povedz to rodičovi. Ten hneď kontaktuje operátora a skontroluje banku. 2. Otvor oficiálne obnovenie účtu vlastnou cestou v aplikácii. 3. Zmeň heslá a odstráň zariadenia, ktoré nepoznáš. 4. Daj vedieť kamarátom, nech na správy z tvojho účtu nereagujú. 5. Kde sa dá, prihlasuj sa cez aplikáciu namiesto SMS. 6. Zverejňuj o sebe menej. (eu-enisa-sim-swapping-2021, sk-skcert-hacked-accounts-2018, sk-skcert-whatsapp-vote-2026)
- "Do spisu 3": „Útočníci poznali Sárino číslo a dátum narodenia z jej verejného profilu.“ Matej: „Do účtu sa nedostali. Ale Sárin hlas je verejne v štyridsiatich hodinách podcastu.“ (sets up T4; T4 exists in the MVP, so this is not an open cliffhanger)

**Stars.** ★ ≥ 5 of 7 clues and ≤ 2 decoys · ★ option D and verify (c) first pick · ★ TT ≥ 4/5.

---

## T4 · Nové číslo (end of teen arc)

| Field | Value |
|---|---|
| Threat | A6.2 `hi-mum-new-number` + A6.3 `cloned-voice-family-emergency`; A5.1 named in TT |
| LO | LO-T4, LO-X1, LO-X2, LO-X3, LO-X4 |
| Steps | brief → scan (2 artefacts) → decision (4) → verify → TT (5, mixed review) → debrief → **arc scene** |
| Sources | eu-esas-ai-scams-factsheet-sk, sk-nbs-pozor-na-podvody, sk-minv-pk-podvod-leaflet; TT item 1: sk-nbs-crypto-warning-signs-2025, eu-bik-ie-scams-young-2026; supporting only: sk-news-sita-ahoj-mami-2025 |
| Sourcing | High (voice). Teach: an urgent request for money is a red flag even from someone who seems to be family; AI can copy familiar voices; call the family member yourself on the number you already know; agree a family safe word; if it happened, stop paying and stop contact, a parent tells the bank at once, report to the police. Do NOT teach that a fake voice can be spotted by ear; do NOT say "the ministry warns" about the text-message version. |
| Psychology | Family-emergency theme: calm pacing, Sára is never in danger, the scene that raises the worry resolves it. Content note on the case card: „Prípad o falošnej správe od člena rodiny.“ |

**Story beat.** Recording day. Sára has stepped out to the school canteen; her phone is on silent in her bag in the studio. Pani Bieliková's phone rings: it is Sára's mother. She received messages and a voice note in Sára's voice from a new number asking for 290 €, called Sára's old number and got no answer, then called the school on the number she knows. She forwards screenshots. The team must help her before Sára is back.

**Brief.**
- Pani Bieliková (on speaker): „Pani Lacková, Sára je v škole, len na chvíľu odišla. Pošlite nám, čo vám prišlo.“
- Pani Lacková: „Je to jej hlas. Ale nedvíha mi.“
- Matej: „Overovací stôl, toto je tvoje. Rýchlo, ale pokojne.“

**Artefact A: Bzuk chat from +421 9•• ••• 507** · **Artefact B: pani Lacková's call log** (`minClues` 3, total 5 clues `newnum`, `delete`, `hurry`, `otheracc`, `nocall` (+ `secret` if sourced); 4 decoys + 1 neutral; `starClues` 4, or 3 if `otheracc` is folded)

| Art. | Span (draft) | Kind | Hint |
|---|---|---|---|
| A | Profile photo: Sára's real photo | decoy | „Fotku si vezme ktokoľvek z verejného profilu. Nič nedokazuje.“ |
| A | „Mami, to som ja, Sára. Spadol mi mobil do vody 🙈 toto je moje nové číslo,“ | clue `newnum` | „Stopa: nové číslo. Overiť sa dá len cez staré.“ |
| A | „staré si zmaž.“ | clue `delete` | „Stopa: príkaz zmazať staré číslo. To je jediná cesta, ako to overiť.“ |
| A | „🙈“ and Sára's usual way of writing | decoy | „Štýl písania a emoji sa dajú okopírovať. Nič neoveria.“ |
| A | Voice note 0:14, transcript: „Mami, prosím ťa, potrebujem rýchlo zaplatiť za opravu mobilu, inak mi ho nevrátia.“ — the voice itself | decoy | „Hlas sám nič nedokazuje, ani že je pravý, ani že je falošný. Sárin hlas je verejne v podcaste. Sleduj, čo správa chce.“ |
| A | „Mám to len do 15:00.“ | clue `hurry` | „Stopa: naliehavá prosba o peniaze. Je to varovný znak, aj keď píše niekto z rodiny.“ (eu-esas-ai-scams-factsheet-sk) |
| A | „Pošli 290 € na účet kamarátky, ja zatiaľ nemám appku. SK00 1100 0000 0026 9812 3456 · Vanesa K.“ | clue `otheracc` (fraud-researcher confirms; else fold into `hurry` as "prosba o peniaze") | „Stopa: peniaze na účet niekoho iného.“ |
| A | „Nevolaj, mikrofón na novom mobile nejde, len píšem.“ | clue `nocall` | „Stopa: zavolať sa vraj nedá. Práve hovor na známe číslo by to overil.“ (habit source: eu-esas-ai-scams-factsheet-sk) |
| A | „A ocinovi to nehovor, poviem mu to sama.“ | plain text; clue `secret` only if a source is added | (if sourced) „Stopa: tajnosť pred rodinou. Bráni tomu, aby to niekto overil.“ |
| B | „Sára (mobil) · odchádzajúci · neprijatý · 13:52“ | decoy | „Že Sára nedvíha, nie je dôkaz, že správa je pravá. Mobil môže byť v taške.“ |
| B | „Škola, pani Bieliková · odchádzajúci · 13:55“ | clue-style positive (`kind: decoy`, does **not** count as a decoy tap) | „Toto je dobrý krok: mama volá na číslo, ktoré už pozná.“ |

Engineering note: the last row needs a `neutral: true` flag on a decoy so it shows the hint but is excluded from the teen decoy count. If that is too much, make the row plain text and move the line into the brief.

**Decision.** Pani Lacková: „Čo mám robiť? Je tri minúty po druhej.“

| Opt | Text | Class | Consequence |
|---|---|---|---|
| A | „Zaplatiť hneď. Je to predsa Sárin hlas.“ | bad | Hneď: „290 € odíde na cudzí účet.“ Neskôr: „O desať minút nové číslo píše znova: „ešte 150 € za poplatok“.“ + „Toto sa môže stať komukoľvek. Ďalší krok: už neplatiť, novému číslu neodpisovať a hneď to oznámiť banke.“ |
| B | „Poslať polovicu, pre istotu.“ | bad | Hneď: „145 € odíde na cudzí účet.“ Neskôr: „Nové číslo ďakuje a pýta zvyšok.“ + „Toto sa môže stať komukoľvek. Ďalší krok: zavolať do banky a novému číslu neodpisovať.“ |
| C | „Opýtať sa nového čísla na niečo, čo vie len Sára.“ | ok | Hneď: „Odpoveď: „mami, nemám čas na kvízy, ponáhľam sa“.“ Neskôr: „Otázka môže pomôcť, ale odpoveď sa dá nájsť aj na sociálnych sieťach.“ + „Ďalší krok: overiť cez staré číslo alebo osobne.“ |
| D | „Neplatiť a novému číslu neodpisovať. Počkať, kým sa Sára ozve zo starého čísla alebo osobne.“ | best | „O šesť minút vchádza Sára s fľašou vody. Zavolá mame zo svojho čísla. Mama nové číslo zablokuje a nahlási.“ |

**Verify.** „Sára nedvíha. Ako to mama overí?“

| Opt | Text | Correct | Feedback |
|---|---|---|---|
| a | „Zavolať na nové číslo a vypočuť si hlas naživo.“ | no | „Ani hlas v hovore z nového čísla nie je dôkaz.“ |
| b | „Napísať novému číslu, nech pošle selfie.“ | no | „Fotky sú na Sárinom profile. Poslať ich vie ktokoľvek.“ |
| c | „Skúšať staré číslo a zavolať niekomu, kto môže byť pri Sáre, na číslo, ktoré už má: škole, kamarátke, rodine.“ | yes | „Presne to pani Lacková robí. Škola potvrdí, že Sára je v budove.“ |
| d | „Pozrieť, či je na profile Sárina fotka.“ | no | „Fotku vezme ktokoľvek z jej profilu.“ |

**TT (mixed review of the teen track).**

| # | Source | Text | Answer | Why |
|---|---|---|---|---|
| 1 | Záber · reklama, tvár známej youtuberky | „Z 50 € som mala za týždeň 900 €. Klikni a začni aj ty.“ | trap | Zaručené zisky a známa tvár v reklame. Tvár aj hlas sa dajú zneužiť. |
| 2 | Bzuk · oco, uložené číslo | „Som v obchode. Chceš rožok alebo croissant?“ | safe | Známe číslo, bežná otázka, nič nepýta. |
| 3 | Plagát v kaviarni Pod Lipou | „Hľadáme pomoc na leto. Pohovor v pondelok o 16:00 tu na mieste, potrebný súhlas rodiča.“ | safe | Skutočné miesto, pohovor osobne, súhlas rodiča. Účet ani heslo nechcú. |
| 4 | Klipko · komentár | „Skiny zadarmo: stiahni generátor a vypni antivírus.“ | trap | Vypnúť ochranu nikdy. |
| 5 | Mama, osobne | „Dohodnime si rodinné heslo. Keď niekto z nás napíše z nového čísla, opýtame sa naň.“ | safe | Dobrý nápad. Doplnok k hovoru na staré číslo, nie náhrada. |

**Debrief.**
- Rule: „Keď známy píše z nového čísla o peniaze, tak mu zavolaj na staré číslo.“
- Extra line (under the rule, never replacing it): „Dohodnite si doma rodinné heslo.“
- Clues: nové číslo a „staré si zmaž“ · naliehavá prosba o peniaze · hovor „nejde“. Plus the decoy lesson: „Hlas ani fotka nie sú dôkaz. Umelá inteligencia vie napodobniť známy hlas.“ (sk-nbs-pozor-na-podvody, eu-esas-ai-scams-factsheet-sk)
- Ak sa to už stalo: 1. Už neplatiť a s novým číslom prestať komunikovať. 2. Rodič to hneď oznámi banke na číslo zo zadnej strany karty alebo z aplikácie. 3. Oznámiť to polícii. 4. Varovať rodinu. 5. Dohodnúť si rodinné heslo. Under-18 line: „Ak sa to stalo tebe, najprv to povedz dospelému, ktorému dôveruješ.“ (eu-esas-ai-scams-factsheet-sk, sk-nbs-pozor-na-podvody)
- "Do spisu 4": „Hlas v hlasovke bol poskladaný z epizód Ozveny.“

**Stars.** ★ ≥ `starClues` clues and ≤ 2 decoys · ★ option D and verify (c) first pick · ★ TT ≥ 4/5.

**Arc scene "Odvysielané" (≈ 60 s, after the T4 debrief; unscored).**
1. The spis on the wall: four pins. Matej, with pani Bieliková, runs Dax's profile photo through a reverse image search: „Tá istá tvár. Štyri profily, štyri mená.“
2. Pins connect: @kvapka.desk (T1, T2) · verejné číslo a dátum narodenia (T3) · hlas z podcastu (T4).
3. Pani Bieliková: „Spis odovzdáme polícii. Spolu s rodičmi. To je ich práca, nie naša.“
4. Sára: „Dax nie je človek. Je to maska. Za ňou je skupina ľudí ďaleko odtiaľto. Nepotrebujú byť geniálni. Stačí im, keď sa ponáhľame.“
5. The red light turns on: „NAHRÁVAME“. Epizóda 5: „Požičané ja“. Sára on air: „Spomaľ. Over si to inou cestou. Povedz to niekomu.“
6. End card: „Spis uzavretý. Odvysielané.“, badge "Odvysielané", the four rules, help card with 116 111.

---

## Summary table

| Case | Title | Threat | Artefacts | Clues / decoys | Decision | Verify | Drill | Star thresholds |
|---|---|---|---|---|---|---|---|---|
| J1 | Drak zadarmo | A15.1 | 1 | 5 / 2 | 3 | – | TT | 4 clues · C · TT 4 |
| J2 | Kód pre kamaráta | A3.1 | 2 | 5 / 3 | 3 | – | TT | 4 clues · C · TT 4 |
| J3 | Zámok na účte | B3.2 | 2 | 4 / 2 | 3 | – | Passphrase + order | 3 clues · C · ≤2 errors |
| J4 | Kričiaca obrazovka | B2 (A9.2 setting) | 2 | 5(+1) / 4 | 4 | – | TT review | 4 clues · D · TT 4 |
| T1 | Ľahká brigáda | A8.2 | 2 | 6 / 5 | 4 | yes | Order (Oto) | 5 clues ≤2 decoys · D+c · ≤1 error |
| T2 | Cheat zadarmo | B2.4 → B3.1 | 3 | 8 / 5 | 4 | yes | Order (čistý štart) | 6 ≤2 · D+c · ≤1 |
| T3 | Bez signálu | A3.4, A3.1 | 3 | 7 / 5 | 4 | yes | TT | 5 ≤2 · D+c · TT 4 |
| T4 | Nové číslo | A6.2, A6.3, A5.1 | 2 | 5(+1) / 4 | 4 | yes | TT review | 4 (or 3) ≤2 · D+c · TT 4 |

# SOURCES.md: facts we can teach, per case

Owner: fraud-researcher. Created 2026-11-25. Source ids point to `content/sources.yaml`.
Every fact below is tied to a source that was opened in this session (2026-11-25) unless the row says "reused".
Wording here is the researcher's English summary for writers, not game text. Game text stays calm (Red Line 5) and uses fictional brands only (Red Line 1).

**Sourcing strength** (Red Line 6 needs at least one Slovak or EU source per case):

| Case | Strength | Main SK/EU sources | Gap |
|---|---|---|---|
| J1 game-skin phishing | Medium | sk-skcert-online-games-2020, eu-bik-gaming-teachers, eu-bik-ie-scams-young-2026 | No Slovak source names skins or free currency; the SK-CERT page is from 2020. |
| J2 friend's account asks for code | High | sk-skcert-whatsapp-vote-2026, sk-skcert-nova-vlna-2025, sk-minv-pk-podvod-leaflet | SK-CERT describes a page asking for the code, not a friend asking directly. Close enough, see below. |
| J3 passwords, passphrases, two-step login | Medium-High | sk-skcert-passwords-2018, sk-skcert-online-games-2020, sk-csirt-passwords-infographic-2024 | SK-CERT pages are old (2018, 2020). |
| J4 fake "virus" pop-up, cleaner app | Medium (updated 2026-11-25 fact check) | sk-skcert-malicious-app-2025, sk-skcert-fakeapps-2018 (official stores, permissions), sk-skcert-tech-support-2020 (fake warnings on websites, "do not call the number") | SK-CERT 2020 describes fake error messages with a support number on websites, mainly on computers. No SK/EU source describes a fake warning that pushes a "cleaner" app on a phone or tablet: that part still rests on Swiss NCSC and ESET. |
| T1 easy-money jobs, money mules | High | eu-europol-mule-jobs, sk-nbs-crypto-mule-2025, eu-europol-iocta-2026, eu-bik-ie-scams-young-2026 | None. |
| T2 cheats, cracked games, infostealers | **Thin** | sk-skcert-online-games-2020 (official stores only), eu-europol-iocta-2026 (infostealers in general), eu-bik-gaming-teachers (cheats → ban) | **No Slovak or EU source links cheats or cracked games to infostealers.** That link rests on Swiss NCSC only. |
| T3 MFA push spam, SIM swap, fake recovery | **Thin (push spam: none)** | eu-enisa-sim-swapping-2021, sk-skcert-hacked-accounts-2018, sk-skcert-whatsapp-vote-2026 | **No SK or EU source on MFA push spam was found.** SIM swap: only ENISA 2021 and an industry relay in news. |
| T4 cloned voice / new number; investment ads | High (voice), Medium (ads) | eu-esas-ai-scams-factsheet-sk, sk-nbs-pozor-na-podvody, sk-minv-pk-podvod-leaflet, sk-nbs-crypto-warning-signs-2025 | Sources address adults. The "new number" text version only has a news relay. |

---

## J1: free skins or in-game currency for your game login (A15.1)

Facts we can teach
- A game-chat or private message that asks for your login is a red flag. Don't answer it, and don't share your game login with anyone. (sk-skcert-online-games-2020)
- A common trick is a promise of free items, VIP status, cheats or prizes in exchange for your password. With the password, the scammer can lock you out of your own account. (eu-bik-gaming-teachers)
- Links offering free game credits, prizes or exclusive skins are a common lure aimed at young people. (eu-bik-ie-scams-young-2026)
- Buy games and game content only in the platform's official store, not on a site that promises them cheaper or free. Fake sites steal personal and payment data. (sk-skcert-online-games-2020)
- Habit: open the game or its official app yourself instead of logging in through a link someone sent. Supporting: don't give out information on a site you reached through a stranger's link. (ch-ncsc-gamer-phishing-2024, non-EU, supporting only)
- If it already happened: change the password, and change it on every other account that used the same one. Turn on two-step login, and use the game's official recovery if you are locked out. Tell a parent: if they paid with a card, call the bank. (sk-skcert-hacked-accounts-2018, sk-skcert-online-games-2020, eu-bik-ie-scams-young-2026)

Must NOT claim
- Do not claim that Slovak police or SK-CERT warned about skin or currency phishing. No Slovak source names skins.
- Never cite IOCTA's "offenders target children on gaming platforms" here: that line is about sexual exploitation.
- Do not say official games never give free items. The tell is a free item that needs your login or a link.
- No real game, platform, launcher or currency names (Red Line 1).

## J2: a friend's stolen account asks for your SMS or login code (A3)

Facts we can teach
- Takeover messages come from a known contact's hijacked account. The attacker copies the contact list and sends the same message to everyone on it. (sk-skcert-whatsapp-vote-2026, sk-skcert-nova-vlna-2025)
- What they ask for is your phone number and the verification code. The code lets them link their own device to your account. (sk-skcert-whatsapp-vote-2026)
- Rule: never share verification codes with anyone, and never forward an SMS code to someone else. (sk-skcert-whatsapp-vote-2026, sk-minv-pk-podvod-leaflet)
- Habit: call the friend on their usual number before you act. SK-CERT says to phone the sender. (sk-skcert-whatsapp-vote-2026)
- Prevent it: turn on two-step login in the app. (sk-skcert-whatsapp-vote-2026)
- If it already happened: unlink every unknown device in the app's settings (deleting the app is not enough), warn your contacts not to open the link, and change any passwords you shared. Report it with the exact link: an adult can use the SK-CERT form. (sk-skcert-whatsapp-vote-2026, sk-skcert-nova-vlna-2025, sk-skcert-report-incident)

Must NOT claim
- The SK-CERT notes describe a fake page that asks for the code. A friend asking you directly to forward a code is our framing, and it is backed by the general "never share codes" rule (SK-CERT, MV SR). Don't present it as a quoted SK-CERT case.
- No real messenger names.

## J3: weak and reused passwords; passphrases and two-step login (B3)

Facts we can teach
- A strong password is a sentence of at least 12 characters, and spaces are often allowed. (sk-skcert-passwords-2018). CSIRT.SK says 12–16 characters (sk-csirt-passwords-infographic-2024).
- Use a different password for every account, and a different one for each game account. (sk-skcert-passwords-2018, sk-skcert-online-games-2020, sk-csirt-passwords-infographic-2024)
- A password manager can remember them for you. (sk-skcert-passwords-2018, sk-csirt-passwords-infographic-2024)
- Turn on two-step login. A code from an app is stronger than SMS: "avoid SMS authentication if possible". (sk-skcert-online-games-2020, sk-skcert-passwords-2018)
- Don't tell anyone your password, including friends. (sk-zodpovedne-osobne-udaje, supporting; sk-skcert-online-games-2020)
- If it already happened: change that password and every account that reused it, starting with email. Tell your contacts. If you are locked out, use the service's official recovery. (sk-skcert-hacked-accounts-2018)

Must NOT claim
- Not "at least 7 characters" (the outdated Zodpovedne.sk rule). Not "never use dictionary words" (CSIRT.SK infographic): that conflicts with passphrases. Follow SK-CERT.
- Don't say SMS codes are useless. They are weaker than an app, but much better than nothing.
- No "check whether your email was in a breach" step: we have no SK or EU source for it yet.
- Never show a real password-manager brand.

## J4: fake "your phone has a virus" pop-up pushing a cleaner app (B2/A9)

Facts we can teach
- Install apps only from the official app store. (sk-skcert-malicious-app-2025, sk-skcert-fakeapps-2018)
- Check what an app asks for. If it wants permissions it doesn't need, say no and uninstall it. (sk-skcert-malicious-app-2025, sk-skcert-fakeapps-2018)
- Even the official store can carry a fake app, so check who made it and read the reviews. (sk-skcert-fakeapps-2018)
- Don't install an app because a call or a message tells you to. (sk-nbs-pozor-na-podvody, which is about calls)
- Fake warnings appear through websites, ads and apps to make you call a "technical support" number. Don't call a number shown in a warning. The caller may ask you to install more apps. (sk-skcert-tech-support-2020, added 2026-11-25)
- The lure (supporting only, no SK/EU source for the app part): fake virus warnings are pop-up windows that open while you browse. They push a "cleaner" or antivirus tool that is itself malware. Close the page and don't tap the links. (ch-ncsc-fake-virus-alert-2025, sk-eset-kb-fake-virus-android)
- If it already happened: uninstall the app. If it got special permissions, show the phone to an adult: SK-CERT advises a factory reset, changing all passwords, and telling the bank. (sk-skcert-malicious-app-2025)

Must NOT claim
- Don't claim SK-CERT, NBÚ or an EU body warned about fake phone-virus pop-ups. **That lure is unsourced in SK/EU.** Producer decision: either accept the case as built on the official-store and permissions habit (SK-CERT), with the pop-up as the setting, or replace the lure with SK-CERT's "app from a deceptive ad".
- Don't say official stores are always safe.
- Never reuse SK-CERT's real 2025 lure (an adult-content app).

## T1: "easy money" job offers that make teens into money mules (A8)

Facts we can teach
- Red flags: someone you don't know offers quick, easy money. The "job" uses your own bank account to receive money and send it on. You need no experience, and everything happens online. (eu-europol-mule-jobs, sk-nbs-crypto-mule-2025)
- Young people are targeted on purpose: "people under 35, including minors" (Europol) and "students" (NBS). Recruiting happens through social media "get-rich" schemes. (eu-europol-mule-jobs, sk-nbs-crypto-mule-2025, eu-europol-iocta-2026)
- The pay may be a cut of the money or a "flashy gift". Many young people don't realise this is illegal. (eu-bik-ie-scams-young-2026)
- Other forms: renting out your account or crypto wallet, or receiving crypto "gifts". (eu-europol-iocta-2026). Never share bank login details. (sk-nbs-crypto-mule-2025, eu-eures-fake-jobs-sk-2023)
- Passing other people's money on through your own account **can be** a criminal offence, even if you don't realise it; police say liability can arise from negligence too. Say "can be" ("môže byť"), never "is always". Paying money on behalf of family or friends is not the issue: the pattern is money from strangers. (sk-nbs-crypto-mule-2025, sk-nbs-money-mule-2019; supporting: sk-news-sita-police-mules-2026, re-opened 2026-11-25)
- If it already happened: stop moving money now, tell a parent, tell the bank, and report it to the police. (eu-europol-mule-jobs, sk-nbs-crypto-mule-2025, sk-news-sita-police-mules-2026)
- Report the recruiter's profile on the platform. (eu-bik-ie-scams-young-2026: "Report the scam on the relevant platform.") "Warn friends" has no source for money mules: phrase it as helping a friend who is being recruited go to an adult.

Must NOT claim
- No prison terms, fines or case figures on screen. Never threaten the player (Red Lines 5, 8). The criminal-responsibility age (14, per sk-justice-trestne-konanie) is for designers only, not for teaching.
- Don't name a Slovak bank, and don't say the police "launched a campaign": the police statement is only relayed by news.

## T2: cheats, cracked games and mods that carry infostealers (B1/B3)

Facts we can teach
- Get games and game content only from official stores or trusted sites. (sk-skcert-online-games-2020)
- Infostealers (programs that steal passwords) are a key tool behind many attacks. (eu-europol-iocta-2026). Fake alerts and downloads deliver "infostealery alebo trójske kone na krádež hesiel". (sk-csirt-ms-2026-06, reused)
- Using hacks or cheat programs can also get your account banned for good. (eu-bik-gaming-teachers)
- Red flags (supporting only): the cheat comes in a password-locked archive, or the instructions say to switch off your antivirus. Sites offering cheats are built to trap players, and the stolen data can lead to hijacked email and social accounts. (ch-ncsc-mods-cheats-2024)
- If it already happened: tell an adult. From a clean device, change your passwords, starting with email, and turn on two-step login. The safest fix for the infected device is a reset. (ch-ncsc-mods-cheats-2024; sk-skcert-hacked-accounts-2018 for changing passwords and scanning)

Must NOT claim
- Don't claim any Slovak or EU body has warned that cheats or cracked games carry infostealers. **That link is non-EU (Swiss) and industry only.** Red Line 6 is met only through the official-store rule (SK-CERT) and the general infostealer threat (Europol).
- No malware family names, file names, extensions or install steps (Red Line 2).

## T3: account takeover through MFA push spam, SIM swap or fake account recovery (B3/A3)

Facts we can teach
- SIM swap: the first sign is that your phone suddenly loses signal for longer than a moment. A parent must contact the mobile operator at once and check the bank. (eu-enisa-sim-swapping-2021)
- Never tell anyone a one-time code, even a caller who says they are from your operator. (eu-enisa-sim-swapping-2021, sk-skcert-whatsapp-vote-2026)
- Where possible, use a sign-in method other than SMS, such as an authenticator app. Share less personal detail on social media, because scammers use it to pretend to be you. (eu-enisa-sim-swapping-2021, sk-skcert-online-games-2020; supporting: sk-news-teraz-eset-simswap-2025)
- If you lose access: use the service's own official recovery, which you open yourself. Change your passwords and tell your contacts. (sk-skcert-hacked-accounts-2018)
- After a takeover, check the account's linked devices and remove any you don't know. (sk-skcert-whatsapp-vote-2026)
- MFA push spam: **no SK or EU source.** The only teachable rule is the general "never approve or share a sign-in you didn't start", which is sourced only through code-sharing (sk-skcert-whatsapp-vote-2026).

Must NOT claim
- No statistics on SIM swap in Slovakia, and no claim that it targets teens.
- Teen phone numbers are often on a parent's contract, so the "call the operator" step should be done by a parent.
- Push spam should be drill-only, or left out until an SK or EU source exists. Producer decision.

## T4a: cloned voice or "new number" family money request (A6)

Facts we can teach
- Red flag: an urgent request for money, even from someone who seems to be a family member. (eu-esas-ai-scams-factsheet-sk)
- AI can copy familiar voices and make real-looking videos, and cloned speech can sound very natural. (sk-nbs-pozor-na-podvody, eu-esas-ai-scams-factsheet-sk)
- Habit: call or message the family member yourself on the number you already know. (eu-esas-ai-scams-factsheet-sk, sk-minv-pk-podvod-leaflet)
- Agree a family "safe word". (eu-esas-ai-scams-factsheet-sk)
- If it already happened: stop paying, stop the contact, have a parent tell the bank at once, and report it to the police. (eu-esas-ai-scams-factsheet-sk, sk-nbs-pozor-na-podvody)

Must NOT claim
- Never teach that a fake voice can be spotted by ear.
- The text-message "new number" version is backed only by a news relay of an MV SR statement (sk-news-sita-ahoj-mami-2025): don't say "the ministry warns".

## T4b: fake investment or crypto ads with fake celebrity or influencer endorsements (A5)

Facts we can teach
- Red flags: an ad with a celebrity's photo and endorsement, which are often fake; promises of high or guaranteed profits; time pressure. (eu-esas-ai-scams-factsheet-sk, sk-nbs-crypto-warning-signs-2025, sk-minv-pk-podvod-leaflet)
- Investment scams use social-media ads or influencers to look credible and urgent. (eu-bik-ie-scams-young-2026)
- No reputable financial firm promises high returns. Be sceptical of offers in the name of well-known people. (sk-minv-pk-podvod-leaflet, sk-nbs-pozor-na-podvody)
- Being asked to pay a "fee" before you can withdraw is a red flag. Never pay it. (sk-nbs-crypto-warning-signs-2025)
- If it already happened: stop paying, tell a parent, call the bank, and report it to the police. (eu-esas-crypto-factsheet-sk, sk-nbs-crypto-warning-signs-2025)

Must NOT claim
- No real celebrities, influencers or platforms. Don't say a fake can always be spotted from the video quality.
- Don't teach "check the NBS register" as a teen habit. Players are 13–15 and can't invest, so frame it as "show an adult" or a family member being targeted.

---

## Trusted adult: what we can say about banks and police (fact check 2026-11-25)

- Sourced: a parent contacts the bank (eu-bik-ie-scams-young-2026, sk-nbs-pozor-na-podvody); contact the bank and report it to the police (sk-news-sita-police-mules-2026, eu-europol-mule-jobs); a report is made at any police station, in writing or orally (sk-justice-trestne-konanie).
- NOT sourced: "banks and police often want to talk to an adult". It is plausible for a minor's account and for police interviews of minors, but no bank terms or procedural-law text was opened. Don't teach it. Say instead that an adult helps the teen call the bank and go to the police.

## Help screen ("Kde nájsť pomoc"): verified for Slovakia on 2026-11-25 (helplines re-opened again in the fact check the same day)

| # | Name | Number / URL | For whom | Hours | Cost / anonymity | Sources |
|---|---|---|---|---|---|---|
| 1 | Linka detskej istoty | **116 111**; chat at ldi.sk; email 116111@ldi.sk | Children and young people under 18 | Phone nonstop; chat daily 18:00–22:00 | Free, anonymous ("nemusíš nám povedať ani svoje meno") | sk-ldi-home, sk-justice-dolezite-kontakty, sk-minedu-krizove-linky-2025 |
| 2 | Viac ako NI(c)K (national helpline for children at risk; EU Safer Internet Centre helpline) | viacakonick.gov.sk (chat, form, app; **no phone**) | All children and young people; separate chats for under 12 and 12+ | 24/7 | Free (stated for the 12+ chat), anonymous chat; logs your IP; must inform authorities if a child is in danger | sk-viacakonick-home, eu-bik-sic-slovakia, sk-nks-kontakty-pomoci |
| 3 | IPčko | **0800 500 333**; chat at ipcko.sk; poradna@ipcko.sk | Anyone in a difficult situation; the ministry calls it an online counselling service "pre mladých" | 24/7 (not given per channel) | Free, anonymous | sk-ipcko-home, sk-minedu-krizove-linky-2025, sk-nks-kontakty-pomoci |
| 4 | Linka detskej dôvery | **0800 221 021**; chat at linkadetskejdovery.sk | Children, young people and parents | Phone on working days 8:00–20:00; chat on working days 8:00–19:00 | Phone free; anonymity not stated | sk-linkadetskejdovery-home, sk-justice-dolezite-kontakty, sk-nks-kontakty-pomoci |
| 5 | Polícia (Policajný zbor) | **158**, or any police station | Anyone. Under 18: go with a parent or another trusted adult (our wording) | n/s | Cost not stated. A criminal report cannot be anonymous. A formal report is made at a police station or prosecutor's office (in writing, orally for the record, or electronically with a qualified e-signature); no official source opened says "report fraud by calling 158". | sk-justice-dolezite-kontakty, sk-justice-trestne-konanie, sk-minv-pk-podvod-leaflet |
| 6 | SK-CERT (Národné centrum kybernetickej bezpečnosti) | sk-cert.sk "Report an incident" page (public form, English page); email incident@nbu.gov.sk. "Nahlásiť incident" is the Slovak site's menu label. | Anyone. For children, an adult files it. | n/s | No phone line | sk-skcert-report-incident, sk-skcert-kedy-nas-kontaktovat |
| 7 | Your bank (through a parent) | Number on the card or in the official app | When card data or money is involved | n/s | n/a | sk-nbs-pozor-na-podvody |
| 8 | 112 | **112** | Danger now | n/s | Don't claim it is free | eu-youreurope-emergency-faq-sk (reused) |
| 9 | Ochráň ma (national hotline for illegal online content) | ochranma.sk → "Nahlás to" | Reporting child sexual abuse material, grooming and other illegal content. **Red Line 8 help cards only, not for scams.** | 24/7 via the website (per BIK) | Anonymity not stated | sk-ochranma-home, eu-bik-sic-slovakia |

Not on the screen, and why
- **Stopline.sk**: the site is still online, but the EU Safer Internet Centre listing now names Ochráň ma as the national hotline. Stopline's status is unclear and it doesn't cover fraud. Don't show it.
- **Zodpovedne.sk**: an older, undated awareness site (eSlovensko). Parts are outdated, such as the 7-character password rule. It is not a help or report service, so leave it off. At most it is a "learn more" link for parents after a human review.
- **Polícia SR online reporting**: no official online form for reporting fraud was found. A report goes to a police station or prosecutor, in person or in writing; electronic filing needs a qualified e-signature. Don't invent an online route.
- **CSIRT.SK incident@csirt.sk**: only for fake state websites, and not re-checked in this session. It isn't relevant to these cases.
- **Linka detskej dôvery's second (mobile) number**: not marked free. Don't show it.

## Help topic cards (Red Line 8): advice lines, fact check 2026-11-25 (re-review)

Calm help cards only, never cases. Each advice line below was checked against a page opened on 2026-11-25.

| Card | Advice line | Sources |
|---|---|---|
| vydieranie | "Nie je to tvoja chyba." | sk-ochranma-ibsa ("nie ste na vine"), eu-bik-sextortion-teachers, eu-bik-sexual-extortion-2025 |
| vydieranie | "Neplať" | ie-garda-say-no-2017, eu-bik-sextortion-parents-2025, eu-bik-sextortion-teachers, lu-police-sextorsion-2021 |
| vydieranie | "nič ďalšie neposielaj" | ie-garda-say-no-2017 ("Don't share more"), lu-police-sextorsion-2021 |
| vydieranie | "Správy nemaž, sú to dôkazy" | ie-garda-say-no-2017 ("Preserve evidence. Don't delete anything."), eu-bik-sextortion-parents-2025, eu-bik-sextortion-teachers |
| vydieranie | "nikomu ich nepreposielaj" | **NOT sourced.** No opened page says it. Removed in the re-review replacement. |
| vydieranie | "Odosielateľa zablokuj" | ie-garda-say-no-2017, eu-bik-sextortion-parents-2025, lu-police-sextorsion-2021, si-policija-say-no |
| vydieranie | tell a trusted adult, 116 111 | eu-bik-sextortion-teachers, si-policija-say-no, sk-ldi-home |
| kybersikana | "Nie je to tvoja chyba." | sk-zodpovedne-kybersikanovanie ("Nespravil si nič zlé") |
| kybersikana | "Neodpovedaj." | sk-minv-kybersikanovanie-brochure, sk-vudpap-kybersikanovanie-2024, sk-skcert-cyberbullying-2018 |
| kybersikana | save messages as evidence | sk-minv-kybersikanovanie-brochure, sk-zodpovedne-kybersikanovanie, sk-skcert-cyberbullying-2018 |
| kybersikana | block | sk-minv-kybersikanovanie-brochure, sk-vudpap-kybersikanovanie-2024, sk-zodpovedne-kybersikanovanie |
| kybersikana | tell a trusted adult, 116 111 | sk-minv-kybersikanovanie-brochure, sk-zodpovedne-kybersikanovanie, sk-skcert-cyberbullying-2018 |
| je-mi-tazko | 116 111 nonstop and free; tell an adult; 112 if in danger now | sk-ldi-home, sk-minedu-krizove-linky-2025 (crisis lines for psychological support), eu-youreurope-emergency-faq-sk |

Gaps: no Slovak official page with step-by-step sextortion advice for children was found (Polícia SR, NKS, Ochráň ma, IPčko, UNICEF SK guide checked). The sextortion steps rest on EU sources (BIK, and EU national police relaying Europol's "Say No!"). The Europol campaign page itself did not render. Contacts on the cards are only those already verified in the table above.

Note for the Scam Atlas SK edition (I did not write to that repo): `justice.gov.sk` "Dôležité kontakty" now (modified 2026-11-03) gives Linka detskej dôvery as 0800 221 021, 8.00–20.00. That matches nks.gov.sk and the operator, so the number conflict recorded in its `where-to-report.draft.sk.yaml` is resolved.

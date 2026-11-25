# Psychology and learning design: Kancelária STOPA

Owner: `learning-psychologist` · Status: v0.1 draft (2026-11-25) · Related: `CLAUDE.md` (Red Lines 4, 5, 8, 9), `docs/GDD.md` (in progress), prototypes `prototypes/stopa-case1-v0.2.html` and `stopa-storyline-v0.2.html`. Adapted from Scam Atlas: Slovensko (`docs/PSYCHOLOGY.md`, `docs/sk/TONE_SK.md`).

> AI-drafted guidance, not clinical or child-protection advice. Before a classroom pilot, a qualified human (child or school psychologist) should review §3 and the teacher note. Roman decides on that review. Slovak examples need a native reader's check.

---

## 1. Motivation by track

**Shared base (self-determination theory).** Children keep playing when they feel competent (they can solve it), autonomous (their choices matter) and connected (characters they like). Points alone do not hold them.

**Junior 11–12.** This group likes collecting, characters, mascots, clear progress and praise from a friendly guide. The current prototype already works for them.

**Teen 13–15.** Teenagers are highly sensitive to status and respect. They turn away from messages that feel like adults telling them what to do. They engage when a choice lets them act on their own values, for example not letting anyone use or fool them (Yeager, Dahl and Dweck 2018; Bryan et al. 2016). What turns them off: being talked down to, a childish look, preaching, fake youth slang, obvious "right answers" and lectures after every click.

| | Junior (11–12) | Teen (13–15) |
|---|---|---|
| **Art** | Warm comic look, round characters, the dog, cork board, bright paper | Flatter and more muted graphic novel or "case file" look. Real-looking (fictional) phone UI, notifications and chat. No mascot in the main frame. No hoodie hackers, skulls, Matrix code or piles of cash |
| **Humour** | Gentle and situational: the dog, club rituals, silly clue names | Dry, observational, about real teen life (group chats, lag, the family group chat). Never at the expense of the person who was fooled. No adult-written slang |
| **Text** | Reading age about 11. One idea per sentence, ≤ 12 words if possible | Reading age about 13, sentences ≤ 18 words. Allow a technical term with a short gloss on first use (*infostealer, teda program, ktorý kradne heslá*) |
| **Debrief layer 1** | ≤ 30 words: one clue, one rule | ≤ 40 words: the deciding clue, why it decides, one rule |
| **Decisions** | One piece of evidence, one trick, 2–3 options | Several pieces of evidence, plausible distractors, one genuine message per track that is safe to trust (so they learn to judge, not to fear everything) |
| **Feedback** | Warm, immediate, specific: "Správne, adresa nesedí." | Explains why, like a knowledgeable peer. A neutral "Dôkaz" button opens the detail. No "Super!", no cheerleading |
| **Rewards** | Stickers, stamps, a case file filling up, unmasking Tieň | Case closed, a complete evidence board, the right to see "how the case continued" (an epilogue). Rewards show skill, not luck |
| **Never** | Fear, time pressure, losing streaks | Patronising "Vieš, čo je heslo?", moral lectures, "nauč sa to", tests that look like school, leaderboards |

**Both tracks:** no leaderboards or class rankings (privacy, and teens compare). No streaks, loot boxes, fake countdowns outside a case, or confirm-shaming. Timers appear only inside a case, and there is always a way to turn them off.

## 2. Teen storyline guidance

**Credible themes.** Use autonomy (their own money, their own accounts, their own decisions), peer status (the class group chat, a friend's hacked account posting in their name), gaming identity (an account that took hundreds of hours, skins, rank), money (pocket money, a first summer job, wanting something now) and protecting others (a younger sibling, a parent or grandparent who gets a "new number" message). The best frame is **the teen as the competent one in the family**, who also knows when to bring in an adult.

**Story shape.** Teen characters are 14–16, with flaws and real lives. Adults are fallible but not stupid. There is no cartoon villain. The opponents are faceless operations, seen only through their messages and ads. Consequences can chain across cases (a stolen session in case 2 explains a takeover in case 3), and each one is resolved before the case ends. No cliffhanger ends on a loss.

**Do not glamorise.** Never show the scammer's side, profits, lifestyle or skill. Never present "hacking back" or revenge as an option. Being a target of a money-mule recruiter is never portrayed as cool or as easy money. Show cheats and cracks only through what the player sees and their effect on the player's own accounts. Never explain how an infostealer or a SIM swap works (Red Lines 2 and 4).

**Do not shame the wish.** Wanting a free game, a cheat, extra money or a quick rank is normal. The lesson is about the risk and the habit, not about being a "good kid". No moralising about cheating.

**Money mules (teens are targets; many are victims too).**
- The offer looks like an ordinary job ("pomoc s platbami", "200 € za týždeň"). The tell is the ask: use your account or card, or pass money on.
- The story character is a **target, never a criminal**. They stop, or come forward early, and end safe and supported.
- The consequence appears **once**, factually and calmly, and the next step always follows in the same panel. Draft: *Požičať niekomu svoj účet na posielanie peňazí je trestný čin a zodpovednosť môže niesť majiteľ účtu. Ak sa to už stalo, čím skôr to povieš dospelému, tým lepšie.* `fraud-researcher` must verify this wording against Slovak sources.
- **Never on screen:** prison imagery, ages of criminal responsibility or sentences, threats from recruiters, how money moves, "you won't be in trouble" (nobody can promise that).
- Pressure line, used once: *Ak ťa niekto tlačí pokračovať, je to dôvod hľadať pomoc hneď.*
- "Ak sa to už stalo" order: stop replying and sending → tell a trusted adult today → call the bank with them on the number on the card → change login details → police with an adult → warn friends.

**Infostealers and account takeover.** The cue is visible: a cheat or crack that asks you to turn off the antivirus, a password-protected archive, a "join our private server to get the download" step (fictional platforms only). Recovery steps: from another, clean device, change passwords (email first), log out of all sessions, turn on 2FA, and tell a parent so the infected computer gets cleaned. The player is never told they "deserved" it for cheating.

## 3. Emotional safety for minors

**No fear appeals.** Fear without a clear, doable action leads to avoidance and denial (Witte and Allen 2000; Ruiter et al. 2014). Every risk is shown together with the action that controls it. No alarm colours in teaching screens, no jump scares, no countdowns in debriefs, no loss amounts on the end screen.

**No shame.** Fixed lines (word for word, both tracks):
- After a slip: **Toto sa môže stať komukoľvek.** + one fixing step.
- Teen add-on for a reveal: **Podvod bol pripravený tak, aby vyzeral pravý.**
- "Next time" never stands alone: *Toto sa môže stať komukoľvek. Nabudúce: over si to inou cestou.*
- Never: *naletieť, naivný, hlúpy, mal si vedieť, obeť*, counts of mistakes, or gendered past tense about the player.

**"Tell a trusted adult" without babying 15-year-olds.**
- Junior: *Povedz to dospelému, ktorému dôveruješ.* Keep it direct and warm.
- Teen: give a reason, not a rule. *Pri peniazoch, účtoch a vyhrážkach to rieš s dospelým, ktorému dôveruješ. Dvaja ľudia konajú rýchlejšie a dospelý ti pomôže zavolať do banky aj ísť na políciu.* Name concrete options: rodič, iný dospelý z rodiny, tréner, triedny učiteľ, výchovný poradca. Model it in the story: a respected teen character does it without drama.
- Asking an adult is always a valid, scored choice where money, threats or strangers are involved (Red Line 8). It is never the "weak" option.

**Help-card placement.**
- A **Pomoc** button sits in the same corner on every screen, one tap away.
- Every debrief ends with "Ak sa to už stalo" and a link to the help screen.
- Money-mule and takeover cases show a small help card inside the debrief.
- Help screen order: talk to someone (**Linka detskej istoty 116 111**) → report it (bank, police) → emergency 112. Only numbers verified by `fraud-researcher`.
- Sextortion, grooming, cyberbullying and self-harm appear only as calm help cards (Red Line 8), never as a case or a quiz item.

**Teacher note (for the teacher guide, not the game): if a child discloses something.**
1. Stay calm, listen and thank them for telling you. Do not question them in detail, especially not in front of the class.
2. Do not promise to keep it secret. Say who you will tell and why.
3. Follow your school's child-protection procedure and involve the school psychologist or *výchovný poradca*.
4. Money, account or job-offer cases: involve the parent the same day and help contact the bank. Threats, sexual content or grooming: follow child-protection procedure. Do not ask the child to forward images. Give 116 111.
5. Immediate danger: 112.
The game is not a counselling tool. Teachers should not use the class discussion questions to collect personal stories.

## 4. Habit transfer

**One rule per case as an if-then plan** ("Keď…, tak…"). If-then plans link a cue the player will see to one action and are recalled better under pressure than general advice (Gollwitzer and Sheeran 2006). Rules:
- The cue is what the player will actually **see** (a code request, a new number, a login request they did not make). The action is **one** concrete step.
- At most 12 words for Junior and 15 for Teen. Use the same wording on the case's debrief, the evidence card and the end screen.
- Imperative, gender-free, no exclamation marks.

Examples (native check pending):
- Junior: *Keď výhra chce prihlásenie cez odkaz, tak otvor hru vlastnou cestou.* · *Keď niekto chce kód z tvojho telefónu, tak ho nepošli nikomu.* · *Keď vyskočí strašiace okno, tak ho zavri a nič nesťahuj.*
- Teen: *Keď za ľahkú prácu chcú tvoj účet, tak odmietni a povedz to dospelému.* · *Keď cheat chce vypnúť antivírus, tak ho nespúšťaj.* · *Keď prídu prihlásenia, ktoré nerobíš, tak nič neschváľ a zmeň heslo.* · *Keď známy píše z nového čísla o peniaze, tak mu zavolaj na staré číslo.*

**Spacing and retrieval in 4 + 4 cases.** Retrieval and spacing beat rereading (Roediger and Karpicke 2006; Cepeda et al. 2006; Dunlosky et al. 2013).
- Each case opens with a 10-second "Pamätáš si?" in which the player **recalls** the previous rule (choose its ending from 3 options, then see the full rule). It is unscored and there is no penalty.
- From case 2 on, one piece of evidence reuses an earlier trick in a new channel (a code request now arrives by voice call), so the habit is not tied to one look.
- The final case of each track mixes all four rules. The end screen lists the four rules and no score.
- Worked example first: the first clue of case 1 is shown and explained, then the player finds the next one alone.
- Teacher guide: a 5-minute recall quiz one week later (the post-check below), which is the real spacing.

**Pre/post check (5 questions).** Anonymous. Use paper with a class tally, or in-game with **no storage**: the answers show a class-level summary only if the teacher enters tallies, and nothing is saved per child, no name, no device ID. Use the same items before and one week after the lesson, and shuffle the option order.
1. *Príde správa: „Máš výhru, prihlás sa tu.“ Čo urobíš?* (open the link / log in through the game or app itself ✔ / send it to friends)
2. *Kamarát píše: „Prišiel ti kód, pošli mi ho, omylom som zadal tvoje číslo.“* (send it / do not send, check with the friend another way ✔ / ignore and say nothing to anyone). The in-world speaker's own gender is fine.
3. Junior: *Vyskočí okno: „Máš vírus, stiahni opravu.“* (download / close it and tell an adult ✔ / call the number in the window). Teen: *Ponuka: „200 € týždenne, stačí požičať účet.“* (accept / refuse and tell an adult ✔ / ask for more money first)
4. Junior: *Aké heslo je najbezpečnejšie?* (meno a rok narodenia / rovnaké heslo všade / dlhá veta, pre každý účet iná ✔). Teen: *Mobil zrazu nemá signál a profil „podpory“ pýta kód na obnovenie účtu.* (send the code / do not send it, contact the operator and the service through their official app or number ✔ / wait a day). Changed by the producer on 2026-11-25: MFA push spam has no SK/EU source, so it is not taught.
5. Self-efficacy, 1–4: *Keď sa niečo pokazí na internete, viem, čo urobiť ako prvé.*
VALIDION reports only class-level percentages. Items 1–4 measure recognition and choice, and item 5 measures confidence. That is a fair claim; do not claim it proves behaviour change.

## 5. Review checklist (PASS or FAIL per case or screen)

Must-fix if any answer is "no":
1. **Defensive only.** Does the case show only what the player sees and does, with no mechanism or attack step?
2. **One rule.** Is there one "Keď…, tak…" rule within the word limit, used word for word everywhere, with a visible cue and one action?
3. **Layer 1 budget.** Is the debrief ≤ 30 words (Junior) or ≤ 40 (Teen), with one deciding clue and one step?
4. **No shame.** Are the fixed lines used, with no blame words, no mistake counts and no gendered forms about the player?
5. **No fear.** Is every risk paired with an action in the same panel, with no alarm imagery, no threats and no loss totals?
6. **Recovery.** Does "Ak sa to už stalo" have ordered steps, and does the case end with the character safe?
7. **Trusted adult.** Is telling an adult available and scored where money, threats or strangers appear, and is it worded for the track?
8. **Help.** Is Pomoc one tap away, in the same place, with only verified numbers?
9. **Calibration.** Is there at least one genuine message per track that is right to trust? Are neutral details never taught as tells?
10. **Track fit.** Does the art, humour, text length and reading age fit the track? Does the Teen screen avoid talking down, slang and lectures?
11. **No glamour.** Are crime, money or "hacker skill" never made attractive? Is a teen target never called a criminal?
12. **No dark patterns.** No streaks, rankings, fake urgency outside the case, confirm-shaming or nagging?
13. **Retrieval.** Does the case recall the previous rule and reuse one earlier trick in a new channel?
14. **Accessibility.** Is there one decision per screen, with actions in consistent places, timers that can be switched off, and screen-reader text for every clue?

Suggestions (not blocking): humour checked with real children of the track's age; a teen playtest (5+ players aged 13–15) before the content freeze.

## Sources
- Ryan, R. M. and Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation. *American Psychologist*, 55(1).
- Yeager, D. S., Dahl, R. E. and Dweck, C. S. (2018). Why interventions to influence adolescent behavior often fail but could succeed. *Perspectives on Psychological Science*, 13(1).
- Bryan, C. J. et al. (2016). Harnessing adolescent values to motivate healthier eating. *PNAS*, 113(39).
- Gollwitzer, P. M. and Sheeran, P. (2006). Implementation intentions and goal achievement: a meta-analysis. *Advances in Experimental Social Psychology*, 38.
- Witte, K. and Allen, M. (2000). A meta-analysis of fear appeals. *Health Education & Behavior*, 27(5). Ruiter, R. A. C. et al. (2014). Sixty years of fear appeal research. *International Journal of Psychology*, 49(2).
- Roediger, H. L. and Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science*, 17(3). Cepeda, N. J. et al. (2006). Distributed practice in verbal recall tasks. *Psychological Bulletin*, 132(3). Dunlosky, J. et al. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1).
- Hattie, J. and Timperley, H. (2007). The power of feedback. *Review of Educational Research*, 77(1).
- Europol, EMMA money-mule awareness campaigns (#DontBeAMule), for the "targets, not criminals" framing. `fraud-researcher` adds Slovak sources (Polícia SR, SK-CERT, Zodpovedne.sk) to `content/sources.yaml`.

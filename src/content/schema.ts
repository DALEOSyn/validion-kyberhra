/**
 * Content schema (the contract with the scenario writers; documented in docs/CONTENT_SCHEMA.md).
 *
 * Build-time only: the Vite content plugin and the tests validate content/ with these schemas and ship plain,
 * normalised JSON to the browser. Runtime code imports only the *types* from this file, never Zod.
 */
import { z } from 'zod';

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ids are lowercase kebab-case (a-z, 0-9, -)');
const text = z.string().trim().min(1);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'colour must be #rrggbb');

// ---------- tracks.yaml ----------

export const AvatarSchema = z.strictObject({
  kind: z.enum(['person', 'dog', 'unknown']).default('person'),
  skin: hex.default('#e2b896'),
  hair: hex.default('#3b2a6b'),
  hair_style: z.enum(['short', 'long', 'bun', 'none']).default('short'),
  band: hex.optional(),
});

export const CastMemberSchema = z.strictObject({
  id,
  name: text,
  role: text.optional(),
  avatar: AvatarSchema.default({ kind: 'person', skin: '#e2b896', hair: '#3b2a6b', hair_style: 'short' }),
});

export const RankSchema = z.strictObject({
  min_stars: z.number().int().min(0),
  name: text,
});

export const TrackSchema = z.strictObject({
  id: z.enum(['junior', 'teen']),
  title: text,
  tagline: text,
  age: text,
  theme: z.enum(['junior', 'teen']),
  intro: text,
  placeholder: z.boolean().default(false),
  planned_cases: z.number().int().min(1).max(12).optional(),
  rank_label: text.default('Hodnosť'),
  ranks: z.array(RankSchema).min(1),
  cast: z.array(CastMemberSchema).min(1),
  cases: z.array(id).min(1),
  footer: text.optional(),
});

export const TracksFileSchema = z.strictObject({
  tracks: z.array(TrackSchema).min(1),
});

// ---------- cases/<track>/<id>.yaml ----------

/** A piece of an evidence line: plain text, a clue (counts towards the scan) or a decoy (a near miss with a hint). */
const SegmentObjectSchema = z
  .strictObject({
    /** Not trimmed: spaces at the ends join segments on one line. */
    text: z.string().min(1),
    clue: z.strictObject({ id, hint: text }).optional(),
    decoy: text.optional(),
  })
  .refine((s) => !(s.clue && s.decoy), 'a segment is either a clue or a decoy, not both');

/** Normalised segment as the game receives it (a bare string becomes { text }). */
export interface SegmentData {
  text: string;
  clue?: { id: string; hint: string } | undefined;
  decoy?: string | undefined;
}

export const SegmentSchema = z.union([z.string().min(1).transform((t): SegmentData => ({ text: t })), SegmentObjectSchema]);

export const LINE_STYLES = ['body', 'sender', 'subject', 'meta', 'link', 'address', 'button', 'title'] as const;

const LineObjectSchema = z.strictObject({
  style: z.enum(LINE_STYLES).default('body'),
  /** Who says it (call transcripts, group chats). Free text, shown as a label. */
  speaker: text.optional(),
  segments: z.array(SegmentSchema).min(1),
});

/** Normalised line (a bare string becomes one plain body line). */
export interface LineData {
  style: (typeof LINE_STYLES)[number];
  speaker?: string | undefined;
  segments: SegmentData[];
}

export const LineSchema = z.union([
  z.string().min(1).transform((t): LineData => ({ style: 'body', segments: [{ text: t }] })),
  LineObjectSchema,
]);

export const EVIDENCE_KINDS = ['chat', 'sms', 'email', 'profile', 'webpage', 'popup', 'call'] as const;

export const EvidenceSchema = z.strictObject({
  kind: z.enum(EVIDENCE_KINDS),
  /** Stamp above the artefact, e.g. "Dôkaz A · Leina správa". */
  label: text,
  /** Bar on top of the artefact: app name, inbox, browser tab, caller. */
  header: text,
  /** Small text on the right of the bar: a time, "neznáme číslo" ... */
  meta: text.optional(),
  /** Accessible name of the artefact for screen readers. */
  aria_label: text,
  lines: z.array(LineSchema).min(1),
});

export const DialogueLineSchema = z.strictObject({
  speaker: id,
  text,
});

export const OptionSchema = z.strictObject({
  id,
  text,
  outcome: z.enum(['best', 'ok', 'bad']),
  /** Short headline of the result, e.g. "Prípad vyriešený". */
  label: text,
  /** What happens at once ("Hneď:" in the teen track when `later` is given). */
  consequence: text,
  /** Optional second beat of a chained consequence ("Neskôr:"), teen track. */
  later: text.optional(),
  /** Calm line under the result. For ok/bad: "Toto sa môže stať komukoľvek." plus one "Ďalší krok:" sentence. */
  calm: text,
  /** True when this option includes telling a trusted adult (Red Line 8; checked when the case sets `risk`). */
  tells_adult: z.boolean().optional(),
});

export const DecisionSchema = z
  .strictObject({
    title: text,
    prompt: z.array(DialogueLineSchema).default([]),
    options: z.array(OptionSchema).min(3).max(4),
    /** Label of the button on the result screen. */
    next_button: text.optional(),
  })
  .refine((d) => d.options.filter((o) => o.outcome === 'best').length === 1, 'exactly one option has outcome: best')
  .refine((d) => new Set(d.options.map((o) => o.id)).size === d.options.length, 'option ids must be unique');

export const TrustTrapItemSchema = z.strictObject({
  source: text,
  text,
  answer: z.enum(['trust', 'trap']),
  why: text,
});

export const TrustTrapSchema = z.strictObject({
  title: text.default('Výcvik · Dôvera alebo pasca'),
  start_button: text.default('Rýchly výcvik: Dôvera alebo pasca'),
  trust_label: text.default('Dôvera'),
  trap_label: text.default('Pasca'),
  /** Question under each card before it is answered. */
  prompt: text.default('Je to v poriadku, alebo je to pasca?'),
  items: z.array(TrustTrapItemSchema).min(3).max(8),
});

/**
 * Lock-up (GDD M4a): the player taps cards into slots 1..n. Steps are listed in the right order; steps with the same
 * `rank` are interchangeable. Distractors do not belong in the list. A wrong tap counts one error and shows a hint.
 */
export const LockUpSchema = z
  .strictObject({
    title: text,
    prompt: text,
    steps: z.array(z.strictObject({ id, text, rank: z.number().int().min(1).optional(), hint: text.optional() })).min(3).max(6),
    distractors: z.array(z.strictObject({ id, text, hint: text })).max(2).default([]),
    /** Hint for a step tapped too early (when the step has no own `hint`). */
    wrong_order_hint: text.default('Ešte nie. Tento krok príde neskôr. Čo treba urobiť skôr?'),
    /** Shown when every step is placed. */
    correct: text,
  })
  .transform((l) => ({ ...l, steps: l.steps.map((st, i) => ({ ...st, rank: st.rank ?? i + 1 })) }))
  .refine((l) => l.steps.every((st, i) => i === 0 || st.rank >= (l.steps[i - 1]?.rank ?? 0)), 'list lock_up steps in order: ranks must not go down')
  .refine((l) => new Set([...l.steps, ...l.distractors].map((x) => x.id)).size === l.steps.length + l.distractors.length, 'lock_up step and distractor ids must be unique');

/**
 * Recall ("Pamätáš si?", GDD §4): one unscored retrieval question at the start of a case, about the rule of an
 * earlier case. 2-3 options, exactly one `correct: true`. `feedback` is shown after any answer (say the full rule).
 */
export const RecallSchema = z
  .strictObject({
    title: text.default('Pamätáš si?'),
    question: text,
    options: z.array(z.strictObject({ id, text, correct: z.boolean().default(false) })).min(2).max(3),
    feedback: text,
    button: text.default('Ďalej'),
  })
  .refine((r) => r.options.filter((o) => o.correct).length === 1, 'exactly one recall option has correct: true')
  .refine((r) => new Set(r.options.map((o) => o.id)).size === r.options.length, 'recall option ids must be unique');

/** A debrief clue line. With `clue: <id>` it is ticked when found and listed under "Prehliadnuté stopy" when not. */
export const DebriefClueSchema = z.union([
  z.string().min(1).transform((t): { text: string; clue?: string | undefined } => ({ text: t })),
  z.strictObject({ text, clue: id.optional() }),
]);

export const DebriefSchema = z.strictObject({
  rule: text,
  clues: z.array(DebriefClueSchema).min(1).max(6),
  /** One optional extra paragraph after the clues (e.g. a legal consequence sentence). */
  note: text.optional(),
  if_it_happened: z.array(text).min(1).max(6),
  story_clue: z.strictObject({ title: text, text }),
  /** Shown when the decision was not the best one. */
  calm: text.default('Toto sa môže stať komukoľvek. Dôležité je vedieť, čo urobiť ďalej.'),
  next_teaser: text.optional(),
});

export const StarRuleSchema = z.discriminatedUnion('type', [
  /**
   * Found at least `min` clues and tapped at most `max_decoys` decoys. Without `max_decoys` the limit is half the
   * case's decoys, rounded down, at least 1 (see defaultMaxDecoys in src/engine/scoring.ts), so tapping
   * everything does not earn the star.
   */
  z.strictObject({ type: z.literal('clues'), min: z.number().int().min(1), max_decoys: z.number().int().min(0).optional(), label: text.optional() }),
  z.strictObject({ type: z.literal('decision_best'), label: text.optional() }),
  /** The first verify pick was the right channel. */
  z.strictObject({ type: z.literal('verify_best'), label: text.optional() }),
  /** Best decision and right verify channel on the first pick, as one star. */
  z.strictObject({ type: z.literal('decision_and_verify_best'), label: text.optional() }),
  z.strictObject({ type: z.literal('trust_or_trap'), min: z.number().int().min(1), label: text.optional() }),
  /** Lock-up finished with at most `max_errors` wrong taps. */
  z.strictObject({ type: z.literal('lock_up'), max_errors: z.number().int().min(0).default(1), label: text.optional() }),
]);

/** A story scene after the debrief (GDD: arc scene after the last case of a track). */
export const SceneSchema = z.strictObject({
  button: text.default('Pokračovať v príbehu'),
  stamp: text,
  lines: z.array(z.strictObject({ speaker: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), text })).min(1),
  closing: text.optional(),
});

export const CaseSchema = z.strictObject({
  id,
  track: z.enum(['junior', 'teen']),
  number: z.number().int().min(1),
  title: text,
  /** One line on the case card. */
  summary: text,
  placeholder: z.boolean().default(false),
  /**
   * What the case involves (Red Line 8). Required, so every author decides; write `risk: []` when none applies
   * (sceptic re-review minor 1). When any is given, the validator needs an option with `outcome: best` or `ok` and
   * `tells_adult: true` in the decision or verify step.
   */
  risk: z.array(z.enum(['money', 'threat', 'stranger'])),
  /** Optional "Pamätáš si?" question shown before the intro. */
  recall: RecallSchema.optional(),
  /** Ids from content/sources.yaml. At least one (Red Line 6). */
  sources: z.array(id).min(1),
  intro: z.strictObject({
    stamp: text.optional(),
    lines: z.array(DialogueLineSchema).min(1),
    button: text.default('Vziať lupu'),
  }),
  evidence: z.array(EvidenceSchema).min(1).max(3),
  scan: z.strictObject({
    min_clues: z.number().int().min(1),
    prompt: text.default('Ťukni na časť dôkazu, ktorá ti nesedí.'),
    button: text.default('Pokračovať'),
    /** Question added to the "Tip" hint, e.g. "Čo od teba chcú a kto to píše?". Without it the tip only names the artefact. */
    tip: text.optional(),
    /** Worked example: clue ids already marked as found when the scan starts (explained in the intro). */
    pre_found: z.array(id).default([]),
  }),
  decision: DecisionSchema,
  /** Teen verify channel: a wrong pick explains why and lets the player pick again; only the first pick scores. */
  verify: DecisionSchema.optional(),
  /** The drill: trust_or_trap, lock_up or both (at least one). */
  trust_or_trap: TrustTrapSchema.optional(),
  lock_up: LockUpSchema.optional(),
  debrief: DebriefSchema,
  arc_scene: SceneSchema.optional(),
  stars: z.array(StarRuleSchema).min(1).max(3),
}).refine((c) => c.trust_or_trap || c.lock_up, 'a case needs a drill: trust_or_trap, lock_up or both');

// ---------- sources.yaml, help.yaml ----------

/**
 * One source (owned by the fraud-researcher; field meanings in the header of content/sources.yaml).
 * Unknown extra fields are allowed so the researcher can add bookkeeping without an engine change.
 */
export const SourceSchema = z.looseObject({
  id,
  publisher: text,
  title: text,
  url: z.string().url().optional(),
  published: z.union([z.string(), z.number()]).optional(),
  accessed: z.union([z.string(), z.number()]).optional(),
  /** SK, EU or another country code. Only SK and EU sources satisfy Red Line 6. */
  region: z.string().optional(),
  /** 1 EU body · 2 national CERT · 3 other national authority · 4 NGO, operator, news (supporting only). */
  tier: z.number().int().min(1).max(4).optional(),
  used_for: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const SourcesFileSchema = z.strictObject({ sources: z.array(SourceSchema) });

export const HelpEntrySchema = z.strictObject({
  id,
  name: text,
  phone: text.optional(),
  url: z.string().url().optional(),
  /** Shown as text only, never as a live link (Red Line 7: nothing leaves the device unless the player types it). */
  url_label: text.optional(),
  text,
  placeholder: z.boolean().default(false),
  /**
   * A topic card instead of a contact (Red Line 8: sextortion, grooming, cyberbullying, self-harm appear only here).
   * Free kebab-case id, e.g. vydieranie, kybersikana, grooming. Topic cards are listed in their own calm section and
   * must point to 116 111: in `phone`/`text`, or by listing the Linka detskej istoty entry in `contacts`.
   */
  topic: id.optional(),
  /** Ids of contact entries shown under a topic card ("Kam sa obrátiť"). */
  contacts: z.array(id).default([]),
});

export const HelpFileSchema = z.strictObject({
  title: text,
  intro: text,
  entries: z.array(HelpEntrySchema).min(1),
  trusted_adult: text,
  /** Heading of the topic-card section. */
  topics_title: text.default('Keď ide o niečo ťažké'),
});

export type Avatar = z.output<typeof AvatarSchema>;
export type CastMember = z.output<typeof CastMemberSchema>;
export type Rank = z.output<typeof RankSchema>;
export type Track = z.output<typeof TrackSchema>;
export type TrackId = Track['id'];
export type Segment = SegmentData;
export type Line = LineData;
export type LineStyle = (typeof LINE_STYLES)[number];
export type Evidence = z.output<typeof EvidenceSchema>;
export type DialogueLine = z.output<typeof DialogueLineSchema>;
export type Option = z.output<typeof OptionSchema>;
export type Outcome = Option['outcome'];
export type Decision = z.output<typeof DecisionSchema>;
export type TrustTrapItem = z.output<typeof TrustTrapItemSchema>;
export type TrustTrap = z.output<typeof TrustTrapSchema>;
export type LockUp = z.output<typeof LockUpSchema>;
export type Debrief = z.output<typeof DebriefSchema>;
export type Recall = z.output<typeof RecallSchema>;
export type Scene = z.output<typeof SceneSchema>;
export type StarRule = z.output<typeof StarRuleSchema>;
export type Case = z.output<typeof CaseSchema>;
export type Source = z.output<typeof SourceSchema>;
export type HelpEntry = z.output<typeof HelpEntrySchema>;
export type Help = z.output<typeof HelpFileSchema>;

/** What the build ships to the browser (virtual:content). */
export interface GameContent {
  tracks: Track[];
  cases: Record<string, Case>;
  help: Help;
}

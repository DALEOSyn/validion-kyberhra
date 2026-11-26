# Pilot feedback in the repository

Comments about the game are captured as **GitHub issues**: in this repository through three issue forms and pasted
comments, and in the private repository `DALEOSyn/validion-kyberhra-feedback` for comments an adult sends from the
game. Both are exported weekly into `docs/feedback/` so they are versioned next to the code they change. The game
sends nothing about the child (Red Line 7, narrowed by Roman on 2026-11-26): the only thing it can send is a comment
an adult types into the comment box and sends on purpose with „Odoslať“, and only in a build with an endpoint. Its
only link is the optional mailto: in the comment box. Release plan: the "Plán: verejné vydanie pilotu a zber pripomienok" doc.

## Who writes what

| Form (`.github/ISSUE_TEMPLATE/`) | Who | Labels |
| --- | --- | --- |
| Pilotná hodina (učiteľ) | A teacher, once per pilot lesson: class poll counts, minutes per case, where children got stuck, quotes without names, any upset reactions | `spatna-vazba`, `lekcia` |
| Odborná recenzia | Psychologist, native Slovak reader, teacher, security expert: one finding per issue, with severity | `spatna-vazba`, `recenzia` |
| Pripomienka alebo chyba | Any adult who played the public pilot | `spatna-vazba`, `pripomienka` |
| Komentár z hry (e-mail or copied) | Any adult, from the comment box on the game's "O hre" screen, without a GitHub account; a maintainer pastes it | `spatna-vazba`, `hra` |
| Komentár z hry (Odoslať) | Any adult, from the same box; `server/feedback/` files it in the private feedback repository | `spatna-vazba`, `hra` |

**Children never file issues.** GitHub accounts need age 13+ and issues are public. Children give their views in class
(the teacher records the counts and anonymous quotes) or to a parent, who files a comment. Blank issues are off, and
the issue chooser shows Linka detskej istoty 116 111 for any child who lands there.

## Comments from the game (no account)

The "O hre" screen has a comment box for adults, with up to three buttons:

- **„Odoslať“** (only when the repository variable `FEEDBACK_ENDPOINT` is set; Settings > Secrets and variables >
  Actions > Variables). The game posts `{v, app_version, role, case, rating, text, hp}` to that URL: what the adult
  chose and typed, the game version, and an empty hidden honeypot field. No ids, no progress, no timestamps, no
  cookies, no referrer, nothing about the device; nothing is stored. The build adds only the endpoint's origin to the
  CSP `connect-src`. The server (`server/feedback/`, see its README) checks the origin, size and shape, drops bots,
  replaces e-mail addresses, phone-like numbers, links and IBAN-like strings with „[odstránené]“, and files an issue
  „Komentár z hry: <case>“ in the **private** repository `DALEOSyn/validion-kyberhra-feedback` with labels
  `spatna-vazba` + `hra` and a `### Verzia hry` field. It never logs or stores the IP address or the browser's user
  agent. On success the box says „Ďakujeme. Pripomienka je odoslaná.“ and clears the text; offline or on failure it
  keeps the text and points to „Kopírovať text“. Without `FEEDBACK_ENDPOINT` the build has no „Odoslať“ and no send
  code at all, and the CSP stays `connect-src 'self'`.
- **„Poslať e-mailom“** (only with the variable `FEEDBACK_EMAIL`) opens the person's own mail app with the comment
  pre-filled.
- **„Kopírovať text“** (always) copies it.

Copied and e-mailed text is already in issue-form shape (`### Kto píše`, `### Prípad`, `### Hodnotenie`,
`### Pripomienka`). A maintainer pastes it into a new issue in this repository labelled `spatna-vazba` + `hra`, removes
any personal data first, never pastes the sender's address, and then approves it as usual. A Power Automate flow in
VALIDION's Microsoft 365 may do the paste later. Sent comments need no paste: a maintainer checks each new issue in the
private repository the same way (the redaction is a safety net, not a check) and approves it there with `schvalene`.

Check the four fields before approving; anyone can edit the e-mail before sending, and anyone can post to the
endpoint, so a sent comment is not proof that it came from the game. The e-mail (with the sender's
address) goes to VALIDION's feedback mailbox and is read by the VALIDION pilot team; after a check, the comment is
copied without the address into this repository, and the e-mail is deleted once filed, at the latest 12 months after
the pilot. The "Kto píše" answers are "Zo školy", "Z rodiny", "Odborná verejnosť" or "Iné".

## Privacy rules for maintainers

- Every form says it is public and ends with a required "no personal data" check box.
- **Nothing is exported until a maintainer approves it.** Check each new feedback issue within 2 working days. If it
  holds a name, school, contact or anything that could identify a child, edit the text out and delete the older
  revision from the edit history (issue "edited" menu > the revision > "Delete revision from history"). Then add
  `schvalene`. Add `skryt` instead if it should never be exported.
- **An edit after approval needs a new approval.** The export skips any issue edited after `schvalene` was added and
  lists it in the run log. Check it again, then remove and re-add `schvalene`.
- If personal data ever reaches a commit or branch, closing the PR is not enough: delete the branch, and if it was
  merged, rewrite the history (Roman decides) and ask GitHub Support to purge cached views.
- Teachers do not describe an upset child in an issue. The form sends those details privately to the pilot
  coordinator. If an issue still suggests a child is at risk, lock it, add `skryt`, and tell Roman so the school can
  be contacted.
- The issue author's login is public. The lesson form suggests a personal account with no school in the profile, or
  sending the report to the coordinator, who files it.
- The export never copies the author's login or the privacy box. `SUMMARY.md` shows only dropdown answers; free text
  is only in `feedback.csv`.

## Export

- `npm run feedback:export` (with `GITHUB_TOKEN` set, as it uses the GraphQL API; or `--input issues.json` offline) also
  reads the private feedback repository (`--feedback-repo`, default `DALEOSyn/validion-kyberhra-feedback`) when
  `FEEDBACK_REPO_TOKEN` is set, and logs that it skipped it when not. Its rows show the issue as `feedback#12`. Approved
  free text from the private repository ends up in the public `feedback.csv`, like any approved issue. The export
  writes `docs/feedback/feedback.csv` (one row per approved issue, one column per question, safe to open in a spreadsheet) and
  `docs/feedback/SUMMARY.md` (counts per kind and case, median minutes per case against the 7–9 minute target, open
  expert items by severity).
- `.github/workflows/feedback-export.yml` runs it every Monday and on demand, creates the labels if missing and opens
  a pull request `feedback/export-<date>` when the CSV changed. With the secret `FEEDBACK_REPO_TOKEN` (fine-grained,
  Issues: read and write on the feedback repository only) the export step also creates the labels in that repository
  and reads it; no other step gets that secret. Only the label and PR steps get the write token; npm
  runs with `--ignore-scripts` and checkout keeps no credentials on the self-hosted runner. Run CI on that PR by hand: PRs opened by the workflow
  token do not start it.

## Triage

1. The producer reads `SUMMARY.md` and the open issues, and groups them into a fix list with a recommendation each.
2. Roman decides. Each accepted item becomes a normal change, reviewed as usual (sceptic, fraud-researcher,
   learning-psychologist, qa-playtester). The PR says `Fixes #<issue>` so the feedback issue closes on merge.
3. "Blokuje vydanie" items must be closed before the v1.0 gate.

## One-time setup when the repository exists

- Push `main`; the forms appear under Issues > New issue.
- Run "Feedback export" once by hand to create the labels, and check it passes on the self-hosted runner (it installs
  with `npm ci --ignore-scripts`; this has not run on the runner yet).
- Settings > Actions > General: "Read and write permissions" and "Allow GitHub Actions to create and approve pull
  requests", so the export can open its PR.
- For „Odoslať“ (Roman decides when): create the private repository `DALEOSyn/validion-kyberhra-feedback`, deploy
  `server/feedback/` (Azure Functions or Cloudflare Worker, see its README) with its own `GITHUB_TOKEN` (Issues: read
  and write on that repository only), set the variable `FEEDBACK_ENDPOINT` here to its URL, and add the secret
  `FEEDBACK_REPO_TOKEN` for the export. Unset the variable to turn „Odoslať“ off again at the next deploy.

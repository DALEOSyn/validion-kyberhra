# Pilot feedback in the repository

Comments about the game are captured as **GitHub issues** in this repository, through three issue forms, and exported
weekly into `docs/feedback/` so they are versioned next to the code they change. The game itself sends nothing and
opens no links (Red Line 7). Release plan: the "Plán: verejné vydanie pilotu a zber pripomienok" doc.

## Who writes what

| Form (`.github/ISSUE_TEMPLATE/`) | Who | Labels |
| --- | --- | --- |
| Pilotná hodina (učiteľ) | A teacher, once per pilot lesson: class poll counts, minutes per case, where children got stuck, quotes without names, any upset reactions | `spatna-vazba`, `lekcia` |
| Odborná recenzia | Psychologist, native Slovak reader, teacher, security expert: one finding per issue, with severity | `spatna-vazba`, `recenzia` |
| Pripomienka alebo chyba | Any adult who played the public pilot | `spatna-vazba`, `pripomienka` |
| Komentár z hry (e-mail) | Any adult, from the comment box on the game's "O hre" screen, without a GitHub account | `spatna-vazba`, `hra` |

**Children never file issues.** GitHub accounts need age 13+ and issues are public. Children give their views in class
(the teacher records the counts and anonymous quotes) or to a parent, who files a comment. Blank issues are off, and
the issue chooser shows Linka detskej istoty 116 111 for any child who lands there.

## Comments from the game (no account)

The "O hre" screen has a comment box for adults. The game sends nothing (Red Line 7): "Poslať e-mailom" opens the
person's own mail app with the comment pre-filled, "Kopírovať text" copies it. The e-mail body is already in
issue-form shape (`### Kto píše`, `### Prípad`, `### Hodnotenie`, `### Pripomienka`). A maintainer pastes it into a new
issue labelled `spatna-vazba` + `hra`, removes any personal data first, never pastes the sender's address, and then
approves it as usual. A Power Automate flow in VALIDION's Microsoft 365 may do the paste later. The address is the
repository variable `FEEDBACK_EMAIL` (Settings > Secrets and variables > Actions > Variables); without it the game shows
only "Kopírovať text".

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

- `npm run feedback:export` (with `GITHUB_TOKEN` set, as it uses the GraphQL API; or `--input issues.json` offline) writes
  `docs/feedback/feedback.csv` (one row per approved issue, one column per question, safe to open in a spreadsheet) and
  `docs/feedback/SUMMARY.md` (counts per kind and case, median minutes per case against the 7–9 minute target, open
  expert items by severity).
- `.github/workflows/feedback-export.yml` runs it every Monday and on demand, creates the labels if missing and opens
  a pull request `feedback/export-<date>` when the CSV changed. Only the label and PR steps get the write token; npm
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

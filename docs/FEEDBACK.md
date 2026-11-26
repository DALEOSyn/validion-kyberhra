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

**Children never file issues.** GitHub accounts need age 13+ and issues are public. Children give their views in class
(the teacher records the counts and anonymous quotes) or to a parent, who files a comment. Blank issues are off, and
the issue chooser shows Linka detskej istoty 116 111 for any child who lands there.

## Privacy rules for maintainers

- Every form says it is public and ends with a required "no personal data" check box.
- Check each new feedback issue within 2 working days. If it holds a name, school, contact or anything that could
  identify a child: edit the text out, hide the edit history (issue menu > "Delete" on the older revision), and add
  the label `skryt` if the issue should stay out of the export.
- If an issue suggests a child is at risk, do not discuss it in the issue: lock it, hide it with `skryt`, and tell
  Roman so the reporting school can be contacted.
- The export never copies the author's login or the privacy box.

## Export

- `npm run feedback:export` (with `GITHUB_TOKEN` set, or `--input issues.json` offline) writes
  `docs/feedback/feedback.csv` (one row per issue, one column per question, safe to open in a spreadsheet) and
  `docs/feedback/SUMMARY.md` (counts per kind and case, median minutes per case against the 7–9 minute target, open
  expert items by severity).
- `.github/workflows/feedback-export.yml` runs it every Monday and on demand, creates the labels if missing and opens
  a pull request `feedback/export-<date>` when the CSV changed. Run CI on that PR by hand: PRs opened by the workflow
  token do not start it.

## Triage

1. The producer reads `SUMMARY.md` and the open issues, and groups them into a fix list with a recommendation each.
2. Roman decides. Each accepted item becomes a normal change, reviewed as usual (sceptic, fraud-researcher,
   learning-psychologist, qa-playtester). The PR says `Fixes #<issue>` so the feedback issue closes on merge.
3. "Blokuje vydanie" items must be closed before the v1.0 gate.

## One-time setup when the repository exists

- Push `main`; the forms appear under Issues > New issue.
- Run "Feedback export" once by hand to create the labels.
- Settings > Actions > General: "Read and write permissions" and "Allow GitHub Actions to create and approve pull
  requests", so the export can open its PR.

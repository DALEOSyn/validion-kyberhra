# DECISIONS — Kancelária STOPA / Ozvena (VALIDION)

Gates and producer decisions. A task that depends on an open gate is not started.

| Date | Gate / decision | Decided by | Outcome |
| --- | --- | --- | --- |
| 2026-11-26 | Repository name | Roman | `DALEOSyn/validion-kyberhra` (private until G-Pilot is carried out) |
| 2026-11-26 | **G-Pilot: public pilot release** | Roman | **Approved.** Repository goes public; the game is deployed to GitHub Pages by `.github/workflows/pages.yml` after CI passes on `main`; pilot label and `noindex` stay on until G-v1.0. |
| 2026-11-26 | Feedback channel | Roman | GitHub issue forms in this repository, exported to `docs/feedback/` (docs/FEEDBACK.md). Children never file issues. |
| 2026-11-26 | Web address | Roman | GitHub Pages address for now; a VALIDION domain "will be provided" later (then add it under Settings > Pages and keep `base: './'`). |
| 2026-11-26 | Pilot timing | Roman | As soon as possible. |
| 2026-11-26 | Pilot classes and coordinator | Roman | Open, unstructured: Roman arranges schools and gives teachers the coordinator contact directly. |
| 2026-11-26 | Feedback data | Roman | VALIDION is the controller; feedback data is deleted 12 months after the pilot ends. |
| 2026-11-26 | Comments from within the game | Roman | Adults' comments are sent directly from the game („Odoslať“) to a small feedback endpoint on Cloudflare Workers (Roman, 2026-11-26) that does not store them itself but files them as private GitHub issues in `DALEOSyn/validion-kyberhra-feedback`. Cloudflare (passes them through) and GitHub (stores them) are US services; the box says so to the adult. Copy and e-mail stay as fallbacks. Red Line 7 in CLAUDE.md narrowed accordingly (only the typed comment, never anything about the child). Hosting: Cloudflare Worker (Roman chose it 2026-11-26). |
| 2026-11-26 | Formal *vy* in adult-facing texts | Producer note (interpretation, not an exception) | Red Line 9 governs how the game speaks to the player. Texts addressed to adults (the comment box, the „Pre dospelých“ section of „O hre“, the adults' address note) are not addressed to the player, so they use formal *vy*. Everything the child reads keeps informal *ty*. |
| 2026-11-26 | Who reads comments sent from the game | Roman | Roman reads them. A comment that looks like a child wrote it, or holds anything personal about a child, is never published or approved: `skryt`, then deleted once handled (steps in `docs/FEEDBACK.md`). This met the precondition for switching on „Odoslať“ (learning-psychologist). |

## Open gates
- **G-v1.0** (Roman): remove the pilot label and `noindex`, after "Blokuje vydanie" feedback is closed.
- **Store release** (Roman): Microsoft Store, Google Play, App Store; not started.

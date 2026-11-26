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
| 2026-11-26 | Comments from within the game | Roman | Adults' comments are sent directly from the game („Odoslať“) to a small EU feedback endpoint that files them as private issues in `DALEOSyn/validion-kyberhra-feedback`; copy and e-mail stay as fallbacks. Red Line 7 in CLAUDE.md narrowed accordingly (only the typed comment, never anything about the child). Hosting (Azure West Europe or Cloudflare) pending. |

## Open gates
- **G-v1.0** (Roman): remove the pilot label and `noindex`, after "Blokuje vydanie" feedback is closed.
- **Store release** (Roman): Microsoft Store, Google Play, App Store; not started.

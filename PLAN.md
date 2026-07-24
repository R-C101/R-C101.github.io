# Build Plan — Rishit Chugh OS Portfolio

A phased build. **We work one phase at a time and pause at the end of each** for review before moving on. Design decisions are locked in `CLAUDE.md`.

Legend: ✅ done · ▶ current · ⏳ next · ⬜ later · 🔒 blocked (needs something)

---

## Phase 0 — Foundation ✅
- ✅ Lock design decisions (windowing, aesthetic, mobile, boot) with the user.
- ✅ Write `CLAUDE.md` (project brief + design system + conventions).
- ✅ Scaffold repo structure (`os/`, `apps/*`, `shared/`, `assets/`, `data/`).
- ✅ Migrate assets from the live site: 55 recipes (JSON + images + manifest + format doc), `arxiv-ss.png`, Hinglish source notes.
- ✅ Write this plan.

## Phase 1 — OS Shell UI ▶  ← the "lock in the look" checkpoint · BUILT, awaiting sign-off
Desktop environment built with placeholder app windows. Files: `index.html`, `shared/tokens.css`, `os/os.css`, `os/os.js`.
- ✅ Boot screen: terminal boot sequence → desktop (every load, skip key). Blueprint target mark, orange `[ ok ]` log, progress bar.
- ✅ Desktop: blueprint wallpaper (blue gradient + faint drafting grid), top menu bar (mark + focused-app name + menus + wifi/battery + live clock), dock, desktop icons.
- ✅ Window manager: draggable windows, traffic-light controls (close / minimise-to-dock / maximise-restore), focus + z-order with unfocused dimming, dock running indicators, edge/corner resize, no-page-scroll rule.
- ✅ Modern-macOS chrome in blue/orange/white; 6 dock apps with authored SVG icons; stub interiors.
- ✅ Deep-link: `#projects` (or comma list) opens apps on load. Small-screen "best on desktop" notice.
- ✅ Verified with headless screenshots (boot / desktop / multi-window) at 1440×900.
- ⏳ **PAUSE for design approval** — wallpaper, chrome, dock, window feel. Then Phase 2.

Wallpaper direction settled: blue gradient + faint masked drafting grid + subtle orange bloom.

Also done in Phase 1: **animated wallpaper signature** — the name plotted in orange, off-center, on a continuous blueprint-plotter loop (motion-safe fallback). **App-loading mechanism decided: iframe-per-app** — each app is a self-contained `apps/<id>/index.html` loaded into the window body via `<iframe>`, giving each its own visual world with clean CSS isolation; focus-through-iframe handled by a click-shield. **Terminal folded into About** (dropped standalone Terminal from the dock).

## Phase 2 — About app ✅ (Terminal / TTY) — awaiting review
About reimagined as a **live terminal**: auto-played boot + neofetch identity, a right-hand **command cheat-sheet** (whoami/about/experience/projects/research/skills/resume/contact/clear/help, each with a short description), and a working CLI that streams each command's output into the transcript (git-log experience, htop skills, project tree, arXiv paper, socials). ↑/↓ history. Experience lives inside About (decision made). `apps/about/index.html`.

## Phase 3 — Projects app ✅ (Blueprint) — awaiting review
RECAP · CVAR · OKULARY as a dark **cyanotype drafting sheet** (`fresh-8-blueprint`): sheet-index rail, title block, dimensioned schematics, spec tables, orange callouts, real tags + links. `apps/projects/index.html`.

## Phase 4 — Documents app ✅ (Preprint) — awaiting review · 🔒 full paper text pending
Two-document **arXiv/LaTeX preprint reader** (`fresh-7-preprint`): a Library rail switching between the RECAP paper (title/author/abstract verbatim, `arxiv-ss.png` as Fig 1, honest abstract-derived section bodies flagged "full text forthcoming") and a preprint-styled résumé. `apps/documents/index.html`. 🔒 Drop in the real paper text/PDF when provided.

## Phase 5 — Recipe Book app ✅ (Field Notes) — awaiting review
Real recipe system (`data/recipes/`, 56 recipes) reskinned as a **field-notes lab-notebook** (`fresh-10-fieldnotes`): taped index-card grid over real photos, detail pages (ingredients/steps/macros), filters (diet/course/cuisine/chef) + search, graceful loading/empty/error states. Needs the local server (`fetch`). `apps/recipes/index.html`.

## Phase 6 — Contact / Connect app ✅ (shell world) — awaiting review
Centered Connect card in the shell world: GitHub/X/LinkedIn/email rows with authored SVG glyphs, mailto + résumé CTAs, blueprint-target monogram, "open to work" pill. `apps/contact/index.html`.

## Phase 7 — Polish ⬜
App-open/close motion, boot polish, window edge cases (empty/error/loading states), optional sound, small-screen "best on desktop" notice, focus management, keyboard shortcuts.

## Phase 8 — Audit & Deploy ⬜
a11y + performance + responsive audit, `prefers-reduced-motion` pass, favicon + meta/OG tags, final QA, GitHub Pages deployment (relative paths verified from a subpath).

---

## Open items to resolve as we go
- **Research paper file** for the Documents app (Phase 4). — pending from user
- **Experience: own app or a section of About?** — decide in Phase 2.
- **App-loading mechanism** (inline templates vs iframe-per-app for CSS isolation) — decide when building the first real app (Phase 2). iframe-per-app is leading because app interiors differ sharply.
- **Wallpaper** final direction (blueprint grid vs. gradient) — settle in Phase 1.

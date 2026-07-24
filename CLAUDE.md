# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A personal portfolio for **Rishit Chugh** (ML Engineer) built as a **mock desktop operating system**. Visitors land on a desktop, and every part of the portfolio opens as its own **app in a draggable window** — with working close / minimise / maximise controls, a dock, a menu bar, and a taskbar. This is not a scrolling page dressed up as an OS; it behaves like a real windowed environment.

It replaces the previous scroll-based portfolio (still live, kept in `../personal_portfolio/`). Design language, structure, and palette here are all new. The old site is **content source-of-truth and anti-reference for the look**, nothing more.

## Hard constraints (non-negotiable)

- **Static only.** Pure HTML/CSS/JS. No backend, no SSR, no build step. Must deploy on **GitHub Pages default deployment** and must run opened from disk (`file://`) — with one known exception below.
- **`fetch` exception:** the recipe app reads JSON from `data/recipes/`, so it needs a server locally (`python3 -m http.server`). This works on GitHub Pages as-is. This is the *only* thing that needs a server — the shell and every other app must work from `file://`.
- **External resources via public HTTPS CDN only** (Google Fonts; a vetted JS lib from cdnjs *only if unavoidable*). Prefer CSS/SVG/canvas. No asset that isn't fetchable over HTTPS.
- **All visuals authored in CSS/SVG/canvas** unless a real asset already exists in `assets/` or `data/`. No missing-file references.
- **Relative paths everywhere** (GitHub Pages project-page compatibility — the site may be served from a subpath).
- **Accessibility floor:** semantic HTML, body-text contrast ≥ 4.5:1, visible focus states, `prefers-reduced-motion` honored for heavy motion.

## The design system

Locked with the user. Do not drift from this without asking.

### Aesthetic
**Modern macOS** (Big Sur → Sonoma lineage), reskinned to a **blueprint palette**. Restrained and mostly-solid surfaces — **NOT** early-2000s Aqua, **NOT** heavy transparency or shiny candy glass. Subtle effects only (soft shadows, gentle vibrancy, rounded corners, hairline strokes). It should feel like a clean, current Mac that happens to be blue/orange/white.

The shell (desktop, dock, window chrome) is one calm, coherent world. **Each app is allowed its own interior world** (see the per-app table) — the window is the frame, the app is the painting.

### Palette (starting tokens — tune during build, keep as CSS custom properties in `shared/tokens.css`)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | primary window surface |
| `--paper-2` | `#F4F6FA` | recessed / sidebar surface |
| `--ink` | `#16202E` | primary text |
| `--ink-2` | `#5A6675` | secondary text |
| `--line` | `#D8DFE8` | hairline strokes |
| `--blue` | `#0B5FD6` | primary accent (blueprint blue) |
| `--blue-deep` | `#08306B` | Projects/blueprint dark ground |
| `--orange` | `#F26B1D` | secondary accent |
| `--desktop` | blue-tinted gradient + faint blueprint grid | wallpaper |

Traffic-light window controls stay the **familiar red / amber / green** — universally understood, most authentic. Everything else stays in blue/orange/white.

### Type
- **Shell** (menu bar, dock labels, window titles, Finder-like UI): `system-ui` / SF stack + a technical mono for small labels/telemetry.
- **Apps own their own fonts** to sell their world (see table). Load per-app, don't force one family across worlds.
- Big display type: tracking floor `-0.04em`. Shadows always have offset + blur (never a zero-offset colored halo).

## Per-app design worlds

Each app draws from one of the 10 concepts in `concepts/`. Keep those concept files intact as reference.

| App | Draws from | World |
|---|---|---|
| **Boot screen** | `os-3-tty` (loading part only) | Terminal boot sequence into the OS. Plays every load, skippable. Just the boot, not the full TUI. |
| **About** | `os-1-paper` / `os-2-aqua` windows + docks | Identity / hero. The window & dock vocabulary the whole shell is built on. |
| **Experience** | shell world | The 3 roles. May live inside About as a section — decide at that phase. |
| **Projects** | `fresh-8-blueprint` | Blue/orange/white blueprint / drafting. Source of the system palette. |
| **Documents** | `fresh-7-preprint` | arXiv/LaTeX preprint. Opens the RECAP paper **and** the résumé as documents. |
| **Recipe Book** | `fresh-10-fieldnotes` | Field-notes / lab-notebook. Reskins the real recipe data (`data/recipes/`). |
| **Contact / Connect** | shell world | Socials + email. |

Not used for the personal site: `os-4-hud`, `os-5-spatial`, `fresh-6-broadcast` (broadcast is earmarked for a future Liat.ai site), `fresh-9-swiss`. All concepts stay in `concepts/` — **do not delete them.**

## Window system spec

- **No page scroll.** `html,body{overflow:hidden;height:100%}`. The desktop is a fixed viewport. Only window *bodies* scroll internally when their content overflows.
- **Windows:** rounded, soft drop shadow, title bar with traffic-light controls (close, minimise, maximise/restore) on the left, title centered/left.
- **Interactions:** drag by title bar; click to focus (raise z-index); minimise to dock/taskbar; maximise to fill the workspace (below the menu bar) and restore.
- **Multiple windows** open at once, overlapping and stacking. A **dock** launches apps; a **taskbar/dock indicator** shows what's open. A top **menu bar** carries the OS identity + clock.
- **Desktop icons** may also launch apps.
- Keep window state in a small JS registry (`os/os.js`): open apps, positions, z-order, min/max state.

## Motion
One authored signature moment per world (app-open/genie, boot sequence), not scattered hovers. Exponential ease-out. Animate `transform`/`opacity`/`filter` only — never width/height/top/left for anything expensive. Retina-aware canvas (`devicePixelRatio`). Respect `prefers-reduced-motion`.

## Repository structure

```
index.html            OS shell entry (boot + desktop + window manager)
CLAUDE.md             this file
PLAN.md               phased build plan — read it before starting a phase
os/                   the desktop environment (shell): boot, desktop, window manager
apps/                 one folder per app; each is its own interior world
  about/ experience/ projects/ documents/ recipes/ contact/
shared/               tokens.css (palette/type), shared helpers
assets/               authored + migrated static assets
  paper/arxiv-ss.png  RECAP paper screenshot (real)
  wallpaper/          desktop wallpaper assets (authored)
data/                 fetched content
  recipes/            55 migrated recipes (<slug>/<slug>.json + image.webp), manifest.json, RECIPE-FORMAT.md
concepts/             the 10 design concepts + switcher — REFERENCE, do not delete
docs/                 working notes
```

App-loading mechanism (inline templates vs. iframe-per-app for CSS isolation) is decided when the first app is built; iframe-per-app is the leading candidate because apps have deliberately different interiors.

## Content (source of truth)

- **Name:** Rishit Chugh · **Role:** ML Engineer · **Email:** rishitchugh@gmail.com
- **Résumé:** https://docs.google.com/document/d/1a0imuYTlivn4lub8MxcYmARPLnv1Yl5G/edit
- **Socials:** X [@rishitchugh](https://x.com/chughrishit) · LinkedIn [in/rishit-chugh](https://www.linkedin.com/in/rishit-chugh/) · GitHub [@R-C101](https://github.com/R-C101)
- **Experience:** Data Scientist @ Liat.ai (2025) · LLM Intern @ DMI Finance (2024) · AI/ML Intern @ Lilac Mosaic (2024)
- **Projects:** RECAP (research paper, https://arxiv.org/abs/2601.15331) · CVAR (https://github.com/R-C101/CVAR) · OKULARY (https://github.com/SEAR-Innovate/OKULARY)
- Full detail lives in `../personal_portfolio/` (its `CLAUDE.md`, `index.html`, `main.js`). Use the **real hrefs**, `target="_blank" rel="noopener"`.
- **Research paper file:** only `assets/paper/arxiv-ss.png` (screenshot) exists so far. The user will provide the paper for the Documents app.

## Recipe data contract

Full schema in `data/recipes/RECIPE-FORMAT.md`. When editing recipes, preserve these standing rules:
- Every recipe JSON has a `diet` field (`veg`/`non-veg`; **egg = non-veg**; a veg dish with an *optional* meat/egg add-on stays `veg`).
- **High-protein bias:** ~50 g dry soya chunks per serving where it fits, as a real ingredient.
- Steps repeat exact measurements inline. Translated from Hinglish notes. **Never** add a "send Aunty a photo" sign-off.
- `chef`, `cuisine`, `course` drive filters. Data is `fetch`ed → recipes need a server locally.

## Dev

```
python3 -m http.server      # serve from repo root; needed for the recipe app's fetch
```
Everything else opens fine from `file://`. No build step. Keep page weight reasonable; lazy-load app interiors.

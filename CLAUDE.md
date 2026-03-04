# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for **Rishit Chugh**, an ML Engineer. Static site hosted on **GitHub Pages** — no backend, no server-side rendering. The site prioritizes bold, futuristic-yet-minimalist aesthetics with scroll-driven storytelling animations.

## Architecture

- **Static site**: Pure HTML/CSS/JS. All dependencies loaded via CDN or bundled locally. Must work as a GitHub Pages deployment (no build server required unless using a static site generator).
- **Scrollytelling design**: Apple-style scroll-triggered animations — elements appear, transform, and animate as the user scrolls. Uses GSAP + ScrollTrigger (CDN). JS-based animations are fully supported and encouraged — GitHub Pages serves static files, so any client-side JS works fine.
- **Modular sections**: Each major section is self-contained and swappable. Keep section markup, styles, and scripts isolated so custom components (shaders, WebGL backgrounds, animated widgets) can replace them without touching other sections.
- **Responsive**: Mobile-first design. Must work seamlessly on both mobile and desktop.

## Sections (in order)

1. **Hero/Landing** — Futuristic, minimalist intro with particle canvas. No face photo. Name + tagline + entrance animation.
2. **Experience** — Aceternity-style scroll timeline with sticky year titles on left, content on right, gradient line fill on scroll. Uses GSAP ScrollTrigger.
3. **Projects** — Editorial list layout with hover animations.
4. **Socials/Connect** — Links to GitHub, LinkedIn, Twitter/X, etc.
5. **Email/Collaborate** — Contact CTA with `rishitchugh@gmail.com`.

## Design System

- **Colors**: All defined as CSS custom properties in `:root`. Easily changeable — swap `--accent`, `--black`, `--white`, etc. to retheme the entire site.
- **Fonts**: Syne (display) + DM Mono (body) via Google Fonts CDN. Changeable by updating the `<link>` tag and `--font-display`/`--font-mono` vars.
- **Current palette**: Dark black bg (`#07070a`), warm cream text (`#E2DFD0`), vibrant orange accent (`#F97300`), warm gray (`#524C42`), deep plum sparingly (`#32012F`). Canvas particle colors are hardcoded in `main.js` as `rgba(249, 115, 0, ...)` — update when accent changes.

## Handling Component Prompts from the User

The user will provide React/Tailwind component prompts (e.g., from Aceternity UI, shadcn, etc.). These must be **adapted to vanilla HTML/CSS/JS + GSAP** since this is a static site with no React, no build tools, and no Tailwind.

**Process:**
1. Analyze the component's visual behavior and animation logic
2. Recreate the same effect using vanilla JS + GSAP + CSS
3. Match the layout, scroll behavior, and responsive breakpoints
4. Integrate with the existing design tokens (CSS custom properties)

**Refuse to implement if the component requires:**
- Server-side rendering (Next.js `getServerSideProps`, API routes)
- Database connections or backend APIs
- Server components (`"use server"`)
- Node.js runtime features not available in the browser

Explain why it can't work on static GitHub Pages and suggest alternatives.

## Design Principles

- **Futuristic minimalism**: Clean layouts with bold typographic choices and deliberate negative space. Avoid generic AI aesthetics (no purple-on-white gradients, no Inter/Roboto).
- **Scroll animations**: Smooth, performant scroll-triggered reveals. JS-based animations (GSAP, canvas, WebGL) are fine and encouraged for complex effects. Prefer `transform` and `opacity` for GPU-accelerated performance.
- **No face/photo dependency**: Use abstract visuals, geometric patterns, code-inspired textures, or subtle particle/shader effects instead of portrait photos.
- **Extensibility**: Sections should be easy to replace with custom components (e.g., a Three.js background, a shader hero, a Lottie animation) without restructuring the page.
- **Canvas / retina**: Always account for `window.devicePixelRatio` when sizing canvas elements.

## Personal Details

- **Name**: Rishit Chugh
- **Role**: ML Engineer
- **Email**: rishitchugh@gmail.com
- **Socials**: To be provided (use placeholder links for now)

## Development

Since this is a static site, development is straightforward:
- Open `index.html` in a browser, or use any local server (`python3 -m http.server`, VS Code Live Server, etc.)
- No build step unless a bundler is added later
- All assets should be relative-pathed for GitHub Pages compatibility

## Key Constraints

- Must deploy as a static GitHub Pages site (no Node.js server, no SSR)
- Animations must be performant — avoid layout thrashing, prefer `transform` and `opacity` for animations
- External libraries should be loaded via CDN with integrity hashes when possible
- Keep total page weight reasonable — optimize images, lazy-load below-fold content

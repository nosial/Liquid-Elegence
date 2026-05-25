# Liquid Elegance

Liquid Elegance is a Bootstrap 5 template supporting multiple colors and both a light/dark theme mode. This template
was generated using an in-house AI

## Quick Start

```bash
make # Install deps + full build
```

Or step by step:

```bash
make install # npm install
make build # Compile SCSS, JS, vendor, assets, HTML
```

## Development

```bash
make dev # Watch SCSS for changes
```

## Build Output

After building, open any HTML file in `dist/` directly in a browser. All assets are self-contained — no CDN dependencies.

```
dist/
├── css/liquid-elegance.css
├── js/{app,sidebar,charts,theme-customizer}.js
├── vendor/{bootstrap,feather-icons,chart.js}
├── index.html
└── pages/{dashboards,apps,crud,pages,auth,utility}/*.html
```

## Project Structure

```
src/scss/
├── main.scss              — Entry point (@use for all modules)
├── glass/                 — Liquid glass design system (tokens, effects, animations)
├── themes/                — Color theme definitions (default, ocean, sunset, etc.)
├── layout/                — Structural layout (sidebar, topbar, footer, responsive)
├── components/            — UI components (cards, buttons, forms, tables, etc.)
├── pages/                 — Page-specific styles (chat, mail, auth, etc.)
├── utilities/             — Utility classes (animations, helpers, print)
├── customizer/            — Theme customizer panel
├── rtl/                   — RTL language support overrides
└── variants/              — Per-theme/mode variant entry points
```

- `src/js/` — JavaScript modules
- `src/templates/` — Nunjucks templates (layouts, partials, pages)
- `scripts/` — Build scripts

### SCSS Architecture

This project uses the **Sass module system** (`@use` / `@forward`) instead of the deprecated `@import`:

- **`@forward`** in `_index.scss` files to aggregate and re-export module partials
- **`@use`** in `main.scss` to load each module
- **`@use ... as *`** in variant entry points for flat CSS output
- **PostCSS + Autoprefixer** for vendor prefix handling
- **Browserslist** config in `.browserslistrc`

# Copyright

Copyright (c) 2022-2026, Nosial—All Rights Reserved

# Licenses

ncc is licensed under the MIT License, see LICENSE for more information. Multiple licenses for the open-source
components used in this project can be found at LICENSE
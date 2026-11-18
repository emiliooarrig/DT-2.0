# Dulce Tentación — Design System Contract

Shared files (do **not** edit from page work; request changes instead):

| File | Role |
|---|---|
| `tokens.css` | CSS custom properties only (palette, type, spacing, motion…) |
| `base.css` | Reset, typography, links, focus, skip link, layout primitives, utilities, reduced-motion kill-switch |
| `components.css` | Header/nav, buttons, cards, badges, page-hero, CTA band, FAQ, floating WhatsApp, footer, reveal |
| `ui.js` | Nav drawer, header scroll state, reveal-on-scroll, `aria-current`, footer year |
| `snippets.html` | **Copy-paste markup** (head, header, footer, CTA, FAQ, hero, buttons) |
| `_preview.html` | Living style guide — open it in a browser to see every component |

## 1. Setup (every page)

1. Copy the `<head>` from `snippets.html` — (a) for `index.html`, (a') for `menu/`, `galeria/`, `contacto/`.
   Load order: Google Fonts → `tokens.css` → `base.css` → `components.css` → **page CSS** → Font Awesome kit → `ui.js` (defer).
2. Keep the tiny inline `<script>` that adds `html.js` (reveal depends on it; it also has a failsafe).
3. Body order: skip link → `<header class="site-header">` → `<main id="contenido" tabindex="-1">` → `<footer class="site-footer">` → `<a class="wa-float">`.
4. `<html lang="es-MX">`. Remove all links to the old `barra.css` and `footer-estilos.css`, and the old checkbox nav.
5. **Path rule:** snippets are written for root pages; in subfolder pages prefix every relative path with `../` (ready-made subfolder versions of head/header/footer are in `snippets.html`).

## 2. Rules (do / don't)

- **Palette is locked.** Never write a hex color in page CSS — use `var(--color-…)`. Only `rgba()` of palette colors or `rgba(0,0,0,x)` for shadows.
- Text on any pink/blue/lila background: `var(--color-text)` (#333) or darker. `--color-text-muted` (#666) only on white, `#f9f9f9`, `#ffe4e1`.
- `#ff69b4` (`--color-hot-pink` / `--color-accent-deco`) and `#E91E63` (`--color-fucsia`): decoration only (icons, borders, lines), **never** text or text backgrounds.
- White text only on `--color-fucsia-oscuro` (#C2185B) or a dark image overlay.
- Fonts: **Fraunces** (`--font-display`) for headings/display/accents; **DM Sans** (`--font-body`) for everything else. No Montserrat, Tangerine or Lucida.
- Font sizes: use the `--fs-*` tokens. Spacing: `--space-*`. Radii: `--radius-*`. Shadows: `--shadow-*`. Durations: `--dur-*`.
- Mobile-first: write base styles for 320px, then `@media (min-width: 480px | 768px | 1024px)`. No floats. No horizontal scroll at 320px. Touch targets ≥ 44px.
- One `<h1>` per page (in the page-hero on inner pages). Don't skip heading levels.
- **Images:** meaningful `alt` in Spanish describing the dessert ("Panqué de naranja glaseado"); decorative images `alt=""`. Add `width`/`height` and `loading="lazy"` below the fold. Prefer the existing `.webp` files.
- **WhatsApp is the only ordering channel**; use the exact href from `snippets.html`. Instagram is secondary. **No email anywhere.** External links: `target="_blank" rel="noopener"`.
- Page-specific classes must be prefixed with the page name (`.home-…`, `.menu-…`, `.galeria-…`, `.contacto-…`) to avoid collisions. Don't restyle shared classes globally from page CSS; scope overrides (e.g. `.menu-grid .card`) and keep them minimal.
- Don't put `.reveal` on elements that rely on `transform` for positioning (it animates `transform`). Wrap them instead.
- Any custom animation in page CSS must be neutralised under `@media (prefers-reduced-motion: reduce)` (base.css already forces near-zero durations globally).

## 3. Breakpoints

| Name | Query | What changes |
|---|---|---|
| base | < 480px | 1 column; header = logo + name + hamburger; CTA lives in drawer + floating button |
| sm | `min-width: 480px` | Header shows round WhatsApp icon button |
| md | `min-width: 768px` | Header CTA shows text; `.split`, `.grid--*`, footer → 2 cols; CTA band goes horizontal |
| lg | `min-width: 1024px` | Desktop nav bar (no drawer); `.grid--3/4` → 3/4 cols; footer → 4 cols |

## 4. Tokens (`tokens.css`)

**Palette (raw):** `--color-rosa` #ffafcc · `--color-rosa-claro` #ffc8dd · `--color-rosa-muy-claro` #ffe4e1 · `--color-rosa-medio` #ffb6c1 · `--color-hot-pink` #ff69b4 · `--color-fucsia` #E91E63 · `--color-fucsia-oscuro` #C2185B · `--color-rosa-oscuro` #d14d94 · `--color-lila` #cdb4db · `--color-azul-claro` #bde0fe · `--color-azul` #a2d2ff · `--color-amarillo` #ffce00 · neutrals `--color-negro` #000 · `--color-gris-900` #333 · `--color-gris-800` #4a4a4a · `--color-gris-700` #555 · `--color-gris-600` #666 · `--color-gris-200` #eee · `--color-gris-150` #f0f0f0 · `--color-gris-100` #f9f9f9 · `--color-gris-50` #fafafa · `--color-blanco` #fff.

**Semantic:** `--color-bg` (white) · `--color-bg-alt` (rosa muy claro) · `--color-bg-soft` (#f9f9f9) · `--color-surface` · `--color-surface-muted` · `--color-text` (#333) · `--color-text-strong` (#000) · `--color-text-muted` (#666) · `--color-text-inverse` (white) · `--color-heading` · `--color-accent` (fucsia oscuro, for text) · `--color-accent-deco` (hot pink, decoration) · `--color-link` / `--color-link-hover` · `--color-cta` / `--color-cta-text` / `--color-cta-hover` / `--color-cta-ring` · `--color-border` / `--color-border-soft` · `--color-focus` · `--color-header-bg` / `--color-footer-bg` / `--color-drawer-bg` · `--color-backdrop` · `--color-overlay-image` · `--color-badge-bestseller` / `--color-badge-new`.

**Type:** `--font-display`, `--font-body`, `--fraunces-soft` (100), `--fraunces-wonk` (0). Fluid sizes `--fs-xs` (≈13) · `--fs-sm` (14–15) · `--fs-base` (16–17) · `--fs-md` (18–20) · `--fs-lg` (20–24) · `--fs-xl` (24–32) · `--fs-2xl` (30–44) · `--fs-3xl` (36–56) · `--fs-display` (42–74). `--lh-tight` 1.1 · `--lh-snug` 1.25 · `--lh-base` 1.65. `--fw-light|regular|medium|semibold|bold` (300–700). `--tracking-tight`, `--tracking-wide`.

**Space:** `--space-1`…`--space-10` = 4, 8, 12, 16, 24, 32, 40, 48, 64, 80px. `--section-space` (56→104px), `--section-space-sm` (40→64px), `--gutter` (16→32px).

**Layout:** `--container-max` 1200px · `--container-narrow` 800px · `--measure` 65ch · `--header-h` 76px · `--header-h-scrolled` 62px · `--tap-min` 44px.

**Shape/elevation:** `--radius-sm|md|lg|xl|pill` (8/14/20/28/999) · `--scallop-r` 12px · `--shadow-xs|sm|md|lg` · `--shadow-cta` · `--shadow-header`.

**Motion:** `--dur-fast` 150ms · `--dur-base` 250ms · `--dur-slow` 400ms · `--dur-reveal` 700ms · `--ease-out` · `--ease-in-out` · `--ease-spring` · `--reveal-distance` 24px.

**Other:** `--focus-width` 3px · `--focus-offset` 3px · `--z-float` 90 · `--z-header` 100 · `--z-skip` 1000.

## 5. Classes

### Base / layout (`base.css`)
| Class | Purpose |
|---|---|
| `.skip-link` | "Saltar al contenido" → `#contenido` |
| `.container` / `.container--narrow` | Centered, max 1200px (800px narrow), fluid side padding ≥16px |
| `.section` | Vertical section padding. Tones: `--alt` (rosa muy claro), `--soft` (#f9f9f9), `--rosa`, `--rosa-claro`, `--lila`, `--azul`, `--azul-claro`. Spacing: `--tight`, `--flush-top`, `--flush-bottom`. Tinted tones auto-switch eyebrow + muted text to #333 |
| `.section-header` (`--left`) | Centered group: `.eyebrow` + `.section-title` + `.section-lead` |
| `.section-title` / `.section-lead` | Fraunces h2 style / intro paragraph |
| `.eyebrow` (`--plain`) | Small italic Fraunces kicker with a hot-pink dash (`--plain` removes the dash) |
| `h1–h3 em`, `.display em` | Italic "wonky" Fraunces accent in fucsia oscuro (large text only) |
| `.display` | Extra-large Fraunces (hero headline) |
| `.lead` | Larger intro paragraph |
| `.ornament` | Centered divider `— icon —`; put an `<i>` inside |
| `.grid` + `.grid--2/3/4` | 1 col → 2 (768) → 3/4 (1024) |
| `.grid-auto` | Auto-fit grid; tune `--grid-min` (default 260px) and `--grid-gap` |
| `.split` (`--reverse`) | 2 columns from 768px (media + text) |
| `.stack` | Vertical rhythm between children (`--stack-space`) |
| `.cluster` (`--center`) | Wrapping flex row (`--cluster-gap`) |
| `.scallop-top` / `.scallop-bottom` | Scalloped "doily" edge outside the element, colored `--scallop-color` (defaults to the element's `--section-bg`). Uses `::before` / `::after`; no `overflow:hidden` on that element |
| Utilities | `.visually-hidden`, `.text-center`, `.text-left`, `.text-muted`, `.text-accent`, `.text-strong`, `.measure`, `.mx-auto`, `.rounded`, `.rounded-xl`, `.shadow`, `.list-reset` (or `role="list"`) |

### Components (`components.css`)
| Block | Elements / modifiers |
|---|---|
| `.site-header` | `__inner`; state `.is-scrolled` (JS: shrinks + shadow). Sticky. |
| `.brand` | `__logo`, `__name` (header + footer) |
| `.site-nav` | `__list`, `__item`, `__link` (animated underline; `aria-current="page"` = active), `__cta` (drawer-only button); state `.is-open`. Drawer below 1024px, inline bar at ≥1024px |
| `.nav-toggle` | `__bars` (hamburger → X via `aria-expanded`) |
| `.header-cta` | `__text` (hidden <480, icon-only 480–767, full ≥768) |
| `.btn` | `--primary` (fucsia oscuro/white) · `--secondary` (rosa muy claro/#333) · `--outline` (border fucsia, #333 text → fills on hover; works on every tint) · `--light` (white/fucsia, for fucsia or photo backgrounds) · sizes `--sm` 44px, default 48px, `--lg` 56px · `--block` · `--icon` (needs `aria-label`). Hover = lift + shadow; icons wiggle |
| `.card` | `__media` (aspect ratio via `--card-ratio`, default 4/3), `__body`, `__title`, `__text`, `__footer`, `__badge` (absolute top-right), `__icon` (round icon holder). Modifiers: `--hover` (lift + image zoom; automatic on `a.card`), `--center`, `--accent` (hot-pink bottom border), `--soft` (rosa muy claro, flat), `--flat` |
| `.badge` | `--bestseller` (amarillo, "Más vendido") · `--new` (lila) · `--rosa` · `--azul` · `--soft` · `--fucsia` (white text) |
| `.page-hero` | `__inner`, `__title` (the page `<h1>`), `__lead`. Tones: default rosa claro, `--rosa`, `--alt`, `--lila`, `--azul`, `--azul-claro`, `--image` (+ inline `style="--hero-image:url('…')"`, white text over dark overlay). Add `.scallop-bottom` for a doily edge (not with `--image`) |
| `.cta-band` | `__inner`, `__content`, `__title`, `__text`, `__actions`. Tones: default rosa, `--rosa-claro`, `--alt`, `--lila`, `--azul`, `--azul-claro`, `--fucsia` (white text; `.btn--primary` auto-flips to white). Before the footer use `--lila`/`--azul`/`--alt` (rosa merges with the rosa footer) |
| `.faq` | `__item` (`<details>`, optional `name="faq"` for exclusive), `__question` (`<summary>`), `__icon` (+/−), `__answer`. Height animates in Chromium; elsewhere toggles instantly |
| `.wa-float` | Floating WhatsApp button, bottom-right, safe-area aware, 4 soft pulses then stops; hidden while the drawer is open |
| `.site-footer` | Built-in scalloped top. `__grid`, `__col`, `__tagline`, `__title`, `__links`, `__bottom`; `.social-links` / `.social-link`; `.contact-list` / `__icon`; `.hours` / `__row` |

## 6. Reveal-on-scroll API

```html
<div class="reveal">…</div>                         <!-- fade + 24px up (default) -->
<div class="reveal reveal--left">…</div>            <!-- --up | --left | --right | --zoom | --fade -->
<h2 class="reveal" data-reveal-delay="150">…</h2>   <!-- delay in ms (or "0.2s") -->
<div style="--reveal-delay: 200ms" class="reveal">  <!-- same, pure CSS -->
<ul class="grid grid--3" data-reveal-stagger="90">  <!-- each .reveal descendant delayed index × 90ms -->
  <li class="card reveal">…</li>
</ul>
<div class="reveal" data-reveal-repeat>…</div>      <!-- re-animates each time it enters -->
```
- Elements are only hidden when `html.js` is present; with no JS / reduced motion they're visible immediately.
- Content added later (e.g. gallery filtering): call `window.DTUI.observe(element)` (or `DTUI.refresh()`).
- Keep stagger groups ≤ ~8 items; don't reveal above-the-fold critical text with long delays.

## 7. JS hooks (`ui.js`)

| Hook | Behaviour |
|---|---|
| `[data-header]` | Gets `.is-scrolled` after 24px of scroll |
| `button[data-nav-toggle][aria-controls="menu-principal"]` | Toggles `aria-expanded`, `#menu-principal.is-open`, `html.is-nav-open` (scroll lock). Closes on link click, Escape (focus returns to toggle), outside/backdrop click, focus leaving, resize to ≥1024px |
| `#menu-principal` / `[data-nav]` | The drawer `<nav>` |
| `.site-nav__link`, `.site-footer__links a` | `aria-current="page"` added to the link matching the URL (skipped if any link in the group already has it hard-coded) |
| `[data-year]` | Text set to current year |
| `html.js`, `html.ui-ready` | JS present / reveal initialised |

## 8. Accessibility checklist

- Landmarks: `header`, `nav[aria-label]`, `main#contenido[tabindex="-1"]`, `footer`. Skip link is the first focusable element.
- Visible focus: 3px `--color-focus` outline (white automatically inside `.cta-band--fucsia` and `.page-hero--image`). Never remove outlines in page CSS.
- Icons: `<i … aria-hidden="true">`; icon-only links need `aria-label`.
- Contrast pairs that pass AA: #333 on every palette tint; white on #C2185B (5.9:1); #C2185B text on white/#f9f9f9/#ffe4e1 (≥4.9:1). Fucsia-oscuro on rosa/lila/azul only for large text (≥24px or ≥18.66px bold).
- Decision note: hover on primary buttons keeps #C2185B (white on #E91E63 is only 4.3:1), so hover feedback is lift + shadow + pink ring.

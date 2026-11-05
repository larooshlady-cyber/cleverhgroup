# Round 1: restyle both product sites in the Clever H Group style (2026-11-05)

Giorgi's ask: "keep the colors and information what this website speaks about but match in design cleverhgroup.com ... it's products of cleverhgroup".
So each site becomes a sibling of www.cleverhgroup.com: same design system and craft, its OWN colour accent and its OWN content.

| Product | Content source (1:1 copy, verbatim copy + assets) | Keep this palette | Output |
|---|---|---|---|
| Clever H Solutions | ~/cleverh/rebuild/solutions/ | its greens (#EAF3EC, #CFE3D6, #B9C9C1...) + red #C0392B as used | ~/cleverh/sites/solutions/ |
| CleverGeorgia | ~/cleverh/rebuild/georgia/ | its dark/gold (#1a1305, #fbf1de, #e8d9ad...) | ~/cleverh/sites/georgia/ |

Design reference (read, never edit): ~/cleverh/v2/ = www.cleverhgroup.com. index.html, theme.css (tokens: --accent etc), assets/core.css (neutral scale --n-*, components), assets/app.js (header, reveals, menu). Fonts Outfit 600-800 (display) + Inter 400-600 (body). Screenshot it at 1440 and 390 first to absorb the look.

## How
- Copy v2's structure and system: core.css + a per-site theme.css where the accent tokens are remapped to the product's palette. Reuse v2 patterns (sticky header turning solid on scroll, hero treatment, section rhythm, cards, reveals, footer, mobile menu) and adapt them to this site's sections.
- Add a small "a Clever H Group product" link to https://www.cleverhgroup.com in header or footer (use the H mark from v2 if it fits).
- Keep ALL information, sections, links (wa.me, mailto, t.me, YouTube), images and the language switchers (Solutions EN/KA, Georgia EN/FR/RU) working. Copy may be tightened only for layout, never facts.
- Remove em/en dashes from copy (all languages): use commas, periods or colons. `grep -rnP "\x{2014}|\x{2013}" sites/<x>` must return nothing.
- Static, relative paths, opens from Finder (file://). No build step. Do not deploy, push, or edit v2 / rebuild/.
- Taste: modern, big type, tight tracking, flat vivid colour, no serifs, no generic vector illustrations, not an equal white-card grid.

## Done means
- Headless Chrome full-page shots at 1440 and 390 in `<output>/_check/` (reveals forced visible), plus `_check/index.html`. Look at every section, fix every visible defect in one batched pass.
- Zero console errors, zero 404s, language switcher tested in each language.
- Headless Chrome: one instance at a time, kill after each shot.
- Reply in 10 lines.

## Hosting (main session deploys, not you)
Will be served at https://www.cleverhgroup.com/preview/solutions/ and /preview/georgia/ for client review. So: every path relative (works in a subfolder), add `<meta name="robots" content="noindex">`.

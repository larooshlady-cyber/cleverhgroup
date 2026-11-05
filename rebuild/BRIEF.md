# Rebuild round 0: 1:1 landing copies (2026-11-05)

Goal: rebuild the landing page of two Clever H client sites **1:1** (same sections, order, copy, images, links, colours, fonts, layout) as clean hand-written static HTML. No restyle yet; the Clever H Group style pass comes later (reference only: ~/cleverh/v2, live at www.cleverhgroup.com).

| Site | Live | Stack | Output folder |
|---|---|---|---|
| Clever H Solutions | https://cleverh.solutions/ | Wix (JS rendered) | ~/cleverh/rebuild/solutions/ |
| CleverGeorgia | https://clevergeorgia.com/ | static single page on Cloudflare | ~/cleverh/rebuild/georgia/ |

`_source.html` in each folder = raw curl of the live page (for Wix it is mostly runtime; render it in headless Chrome to see the real page and read copy).

## Rules
- Output: `index.html` + `styles.css` (+ small `script.js` only if the original has interaction: menu, accordion, slider, form). Images downloaded into `assets/` (Wix: static.wixstatic.com/media full-res, convert to webp/jpg at sensible size). Relative paths only, must open from Finder (file://). No build step, no frameworks.
- Copy verbatim from the live page (client's own content). All links (wa.me, mailto, t.me, youtube) kept as is. Forms: same fields; action = mailto prefill to the original contact address (no backend).
- Fonts: same families via Google Fonts if available, else closest match, note it.
- Responsive at 1440 and 390 like the original.
- Do not deploy, do not push, do not touch ~/cleverh/v2 or the server.
- No em/en dash introduced by you (copy that already has them: keep verbatim for 1:1, list them in your reply).

## Done means
- Headless Chrome full-page screenshots of ORIGINAL and REBUILD at 1440 and 390 in `<folder>/_check/` (orig-1440.png, rebuild-1440.png, ...) plus `_check/index.html` showing them side by side. Every section compared; fix visible differences in one batched pass.
- Zero console errors, zero 404s.
- Headless Chrome: one instance at a time, kill after each shot, keep RAM low.
- Reply in 10 lines: sections rebuilt, fonts used, anything not matched 1:1.

# daniel.fyi

Personal portfolio, built with Jekyll and served by GitHub Pages.

## Version 3: "Neural"

A single-page site with a WebGL particle field (Three.js) that changes shape as you scroll, plus GSAP scroll animations.

| What | Where |
|---|---|
| Hero, About, Quote, Contact copy | `index.html` |
| Experience entries | `_data/experience.yml` |
| Capability tiles | `_data/capabilities.yml` |
| Email, social links, GA4 ID | `_config.yml` |
| Styles | `css/style.scss` |
| Particle field and animations | `js/neural.js` |

The old `/about`, `/resume` and `/contact` URLs redirect to the matching sections on the homepage (`_layouts/redirect.html`).

Visitors with `prefers-reduced-motion` get a static particle field and no scroll animations, and all content stays visible if JavaScript fails to load.

# Kabsa Al-Ham — Restaurant System (UI/UX)

Frontend-only (UI/UX) build of the Kabsa Al-Ham unified restaurant portal.
No backend, no API keys, no external services required — everything runs on local mock data.

Includes 6 screens reachable from the portal:
- **POS System** — full point-of-sale + table/floor layout editor
- **Mini POS** — portable/tablet point-of-sale
- **Delivery App** — driver app (orders, earnings, map)
- **Client Ordering** — customer ordering flow (cart, checkout, loyalty)
- **Landing Website** — public marketing site
- **Portal** — gateway to all of the above

Bilingual **Arabic / English** with full RTL ⇄ LTR switching.

## Tech
- React 19 + TypeScript + Vite
- Tailwind CSS (local build — no CDN)
- Leaflet for maps, `motion` for animations, `lucide-react` for icons

## Run locally

**Prerequisite:** Node.js 18+

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

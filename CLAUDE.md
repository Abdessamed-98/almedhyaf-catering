# Web project (React 19 + TS + Vite + Tailwind 3.4)

Design source of truth for the whole suite. See `../CLAUDE.md` for workspace rules.

## Commands

- `npm run dev` — local (port 3000; also on LAN for phone testing)
- `npx tsc --noEmit` — typecheck (**`npm run build` does not typecheck**)
- `npm run build` — vite build only
- `npx -y gh-pages -d dist` — deploy to the client-visible site. **Only when explicitly asked.**

## Layout of `src/apps/`

- `website/` — marketing site (`WebsiteLayout.tsx` = shell/nav/footer + hash routing `#website/...`; pages Home, Menu, Branches, About, Projects, Blog, FAQ, Partners…)
- `pos/` — desktop POS (`POS.tsx`, `AddressMap.tsx` = Leaflet map+search delivery-address picker)
- `ordering/` — customer app (`Ordering.tsx`, ~4k lines; mobile + desktop layouts in one component)
- `delivery/` — driver app (`DeliveryApp.tsx`; job model in `src/data/delivery.ts`)
- `orders/` — order management (`OrdersApp.tsx`, `NewOrder.tsx`, `maps.tsx`)

Shared: `src/data/` (menus, orders, seeds), `src/ui/` (Button…), `src/contexts/LanguageContext.tsx` (`language`, `toggleLanguage`, `setLanguage`, `dir`), `src/hooks/useHardwareBack.ts`.

## Dark mode (the big system — read before styling)

- Tailwind `darkMode: 'class'`. The `dark` class goes on **each app's wrapper div** (website wrapper in `WebsiteLayout`, app roots in POS/Ordering/Delivery/Orders) — never on `<html>`; the apps theme independently (separate localStorage keys: `site-dark`, `ord-dark`, `del-dark`, `mgr-dark`, `pos-dark`).
- The palette lives as a **scoped override layer at the bottom of `src/index.css`** (`.dark .bg-white { … }` etc.) remapping the light utilities to warm charcoal (page `#151413`, cards `#252220`, cream text ramp, lightened accent text). New UI that only uses existing utilities inherits dark mode for free.
- **Gotchas already hit — don't repeat:**
  - The overrides are *descendant* selectors; a class on the same element as `dark` needs a compound selector (see `.dark.bg-pageBg` block).
  - Gradient stops (`from-[]/to-[]/via-[]`) are separate utilities — light-colored stops need explicit overrides (see the gradient-stop block).
  - Keep-dark exceptions exist for ink-on-gold (`.bg-secondary-500.text-ink`) and the ordering nav's active label (pinned `text-[#1D1D1B]`).
  - Partner/client logos render as white silhouettes in dark via `.partner-logo` filter.
  - An element with **no color class** inherits default black → invisible on dark. Always give text an explicit `text-gray-*` class.
- Hero art swaps per mode in `website/Home.tsx` (`useSiteTheme()` from WebsiteLayout); files `public/banners/hero[-mobile][-dark].webp`.

## RTL / i18n rules

- `body { direction: rtl; text-align: start }` — **never** `text-align: right` (broke EN alignment once).
- Use logical utilities (`start/end`, `ps/pe`, `ms/me`); chevrons/arrows flip with `language === 'en' ? 'rotate-180' : ''`.
- Toggle switches: knob anchored `start-1`, ON slides `ltr:translate-x-5 rtl:-translate-x-5` (physical `right-1` was a bug).
- Numbers/dates/ids inside Arabic text: wrap in `dir="ltr"`.

## Back navigation

`useHardwareBack(handler)` per app maps browser/phone back onto in-app navigation (modals close first → sub-screen → home → portal). The manager's NewOrder registers its own phase-stepper via a `registerBack` prop. **Every new modal/screen must be added to its app's handler.**

## Misc conventions

- Mock data lives beside the apps (`INITIAL_ORDERS`, `SEED_HISTORY`, saved-clients list…) — runtime state is in-memory and resets on reload.
- Leaflet maps: plain `L.map` in `useEffect` with divIcon pins (see `orders/maps.tsx`, `pos/AddressMap.tsx`); tiles stay light in dark mode (accepted).
- POS: shift + cash-drawer header buttons are commented out per client (easy to restore). Product cards show mock stock (`stockOf`) with «نفذ» sold-out state.

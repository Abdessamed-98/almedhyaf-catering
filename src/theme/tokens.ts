/**
 * ============================================================================
 * CLIENT THEME TOKENS — single source of truth for raw values used OUTSIDE
 * Tailwind (e.g. Leaflet map markers, inline SVG, canvas, dynamic styles).
 *
 * To re-skin for a new client, change the values here AND the matching values
 * in `tailwind.config.js` (the `clientTheme` block). Keep the two in sync.
 * ============================================================================
 */

/** Primary brand color (matches `brand-600` in tailwind.config.js). */
export const BRAND = '#801212';

/** Secondary brand color — gold (matches `accent.DEFAULT`). */
export const ACCENT = '#F8C15D';

/** Brand ink / near-black (matches `surfaces.textPrimary`). */
export const INK = '#1D1D1B';

/** Semantic status colors (match `success` / `warning` / `info` in tailwind). */
export const SUCCESS = '#2ECC71';
export const WARNING = '#F39C12';
export const INFO = '#3B82F6';

/** Neutral text colors. */
export const TEXT_PRIMARY = '#1A1A2E';
export const TEXT_SECONDARY = '#6B7280';

/**
 * Neon color palette for file versions.
 * Each version gets a distinct neon color for visual differentiation.
 */

const VERSION_COLORS = [
  '#15f3ec', // V1 — Cyan (original brand)
  '#a855f7', // V2 — Electric Purple
  '#ff6b9d', // V3 — Hot Pink
  '#ff8c42', // V4 — Electric Orange
  '#84ff57', // V5 — Neon Lime
  '#ffd700', // V6 — Gold
  '#5bc7f9', // V7 — Sky Blue
  '#ff5555', // V8 — Neon Red
  '#57ffd8', // V9 — Aquamarine
  '#c084fc', // V10 — Lavender
]

/**
 * Get the neon color for a version string like "V1", "V2", etc.
 * Falls back to cycling through the palette for V11+.
 */
export function getVersionColor(version: string | number): string {
  let num: number
  if (typeof version === 'number') {
    num = version
  } else {
    num = parseInt((version || 'V1').replace(/[^0-9]/g, '')) || 1
  }
  return VERSION_COLORS[(num - 1) % VERSION_COLORS.length]
}

/**
 * Get a subtle background color (with alpha) for version badges.
 */
export function getVersionBg(version: string | number): string {
  const color = getVersionColor(version)
  return `${color}18` // ~10% opacity hex
}

/**
 * Get a border color for version badges.
 */
export function getVersionBorder(version: string | number): string {
  const color = getVersionColor(version)
  return `${color}35` // ~20% opacity hex
}

/**
 * Get a glow/shadow color for version badges.
 */
export function getVersionGlow(version: string | number): string {
  const color = getVersionColor(version)
  return `0 0 12px ${color}40`
}

export { VERSION_COLORS }

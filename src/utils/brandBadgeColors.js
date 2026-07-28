// Derive a "metal ring" badge palette (light/mid/dark ring stops + text tint)
// from a single brand hex color, so the Founding-badge-style pill can be
// re-tinted to whichever brand brought a creator onto Creasume instead of
// always rendering gold. Falls back to the original gold palette when no
// color is available (e.g. color extraction failed on the uploaded logo).

const GOLD = { ringLight: '#FBE7A0', ringMid: '#D8A93C', ringDark: '#9A701F', text: '#F6E3A8' }
// Neutral "platinum" ring for logos with no real hue (black/white/gray marks —
// e.g. Puma, Nike). Forcing a fake hue onto an achromatic color is what used
// to turn these into an unintended salmon/brown tint (hue defaults to 0° when
// r=g=b, and boosting saturation at hue 0 is red).
const SILVER = { ringLight: '#F1F3F5', ringMid: '#ADB5BD', ringDark: '#495057', text: '#F1F3F5' }

function hexToHsl(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim())
  if (!m) return null
  const r = parseInt(m[1], 16) / 255
  const g = parseInt(m[2], 16) / 255
  const b = parseInt(m[3], 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return { h: h * 60, s, l }
}

function hslToHex(h, s, l) {
  s = Math.max(0, Math.min(1, s))
  l = Math.max(0, Math.min(1, l))
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r, g, b
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** @param {string} hex, @param {number} alpha 0-1 — e.g. "#3B82F6", 0.16 */
export function hexToRgba(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim())
  if (!m) return `rgba(216,169,60,${alpha})` // fallback: gold ringMid
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16))
  return `rgba(${r},${g},${b},${alpha})`
}

/** @param {string} hex e.g. "#3B82F6" — the brand's auto-extracted color. */
export function deriveBadgeColors(hex) {
  const hsl = hexToHsl(hex)
  if (!hsl) return GOLD
  const { h } = hsl
  // Genuinely achromatic source (black/white/gray logo) — there's no real hue
  // to work with, so render a neutral metal ring instead of fabricating one.
  if (hsl.s < 0.08) return SILVER
  // Keep saturation reasonably rich regardless of the source logo's own
  // saturation, so a pale/washed-out logo color still reads as a metal ring.
  const sat = Math.max(0.45, Math.min(0.85, hsl.s))
  return {
    ringLight: hslToHex(h, sat * 0.7, 0.82),
    ringMid: hslToHex(h, sat, 0.55),
    ringDark: hslToHex(h, sat, 0.34),
    text: hslToHex(h, sat * 0.55, 0.84),
  }
}

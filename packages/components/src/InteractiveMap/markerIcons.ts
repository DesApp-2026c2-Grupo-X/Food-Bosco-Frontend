import type { MarkerKind } from './types'

export interface MarkerIcon {
  html: string
  iconSize: [number, number]
  iconAnchor: [number, number]
}

const PIN_WIDTH = 30
const PIN_HEIGHT = 40
const PIN_ANCHOR: [number, number] = [15, 40]

const HOUSE_GLYPH =
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 12.618c.307-.275.5-.674.5-1.118V6.977a1.5 1.5 0 0 0-.585-1.189l-3.5-2.692a1.5 1.5 0 0 0-1.83 0l-3.5 2.692A1.5 1.5 0 0 0 3 6.978V11.5A1.496 1.496 0 0 0 4.493 13H5V9.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V13h.507c.381-.002.73-.146.993-.382m2-1.118a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3V6.977A3 3 0 0 1 2.67 4.6l3.5-2.692a3 3 0 0 1 3.66 0l3.5 2.692a3 3 0 0 1 1.17 2.378zm-5-2A.5.5 0 0 0 9 9H7a.5.5 0 0 0-.5.5V13h3z"/>'

const STORE_GLYPH =
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M3 6H13V14H3Z M6.2 10H9.8V14H6.2Z M4.7 7.6H6.1V9.1H4.7Z M9.9 7.6H11.3V9.1H9.9Z"/>' +
  '<path d="M2 3H14V5a2 2 0 0 1-4 0a2 2 0 0 1-4 0a2 2 0 0 1-4 0Z"/>'

const MOTO_GLYPH =
  '<path d="M3.2 9.8L4 7.6L6.8 7.6L8 9.4L10.4 9.4L11.2 6.4L12.8 6.4L12.8 7.6L11.9 7.6L11.2 10.4L3.2 10.4Z"/>' +
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M2.4 11.6a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0-4.2 0Z M3.5 11.6a1 1 0 1 0 2 0a1 1 0 1 0-2 0Z M9.4 11.6a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0-4.2 0Z M10.5 11.6a1 1 0 1 0 2 0a1 1 0 1 0-2 0Z"/>' +
  '<path d="M10.6 5.4H13.4V6.4H10.6Z"/>'

export const MARKER_GLYPHS: Record<MarkerKind, string> = {
  branch: STORE_GLYPH,
  client: HOUSE_GLYPH,
  rider: MOTO_GLYPH,
}

const LEGACY_ICON_SIZE: [number, number] = [26, 26]
const LEGACY_ICON_ANCHOR: [number, number] = [13, 13]

const legacyIconHtml = (color: string, label?: string): string =>
  `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:${color};color:#fff;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${label ?? ''}</span>`

export const buildMarkerIcon = (marker: {
  color: string
  kind?: MarkerKind
  label?: string
}): MarkerIcon => {
  if (!marker.kind) {
    return {
      html: legacyIconHtml(marker.color, marker.label),
      iconSize: LEGACY_ICON_SIZE,
      iconAnchor: LEGACY_ICON_ANCHOR,
    }
  }

  const glyph = MARKER_GLYPHS[marker.kind]
  const html =
    `<svg width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 30 40" ` +
    `xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<path d="M15 2C7.8 2 2 7.8 2 15c0 9 13 25 13 25s13-16 13-25C28 7.8 22.2 2 15 2Z" ` +
    `fill="${marker.color}" stroke="#ffffff" stroke-width="2"/>` +
    `<g transform="translate(7 7)" color="#ffffff" fill="currentColor">${glyph}</g>` +
    `</svg>`

  return {
    html,
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    iconAnchor: PIN_ANCHOR,
  }
}

export const MAP_MARKER_COLORS = {
  branch: '#1d4ed8',
  client: '#15803d',
  rider: '#ea580c',
} as const

export type MapMarkerKind = keyof typeof MAP_MARKER_COLORS

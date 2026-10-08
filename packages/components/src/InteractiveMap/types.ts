import type { ReactNode } from 'react'

export interface InteractiveMapPoint {
  latitude: number
  longitude: number
}

export type MarkerKind = 'branch' | 'client' | 'rider'

export interface InteractiveMapMarker extends InteractiveMapPoint {
  color: string
  label?: string
  kind?: MarkerKind
}

export interface InteractiveMapProps {
  center: InteractiveMapPoint
  markers: InteractiveMapMarker[]
  zoom?: number
  height?: string
  alt: string
  legend?: ReactNode
  note?: ReactNode
  interactive?: boolean
  plain?: boolean
  attributionControl?: boolean
}

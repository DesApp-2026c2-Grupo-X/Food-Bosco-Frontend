import { Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { buildLeafletTileUrl } from '@repo/api'
import { Card } from '../Card'
import {
  loadLeaflet,
  type LeafletLayerGroup,
  type LeafletMap,
  type LeafletNamespace,
} from './leafletLoader'
import type { InteractiveMapProps } from './types'

const TILE_ATTRIBUTION =
  'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a> | © <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'

type MapStatus = 'loading' | 'ready' | 'error'

export const InteractiveMap = ({
  center,
  markers,
  zoom = 14,
  height = '340px',
  alt,
  legend,
  note,
  interactive = true,
  plain = false,
  attributionControl = true,
}: InteractiveMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const leafletRef = useRef<LeafletNamespace | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layerRef = useRef<LeafletLayerGroup | null>(null)
  const [status, setStatus] = useState<MapStatus>('loading')

  useEffect(() => {
    let cancelled = false
    let observer: ResizeObserver | null = null

    loadLeaflet()
      .then((leaflet) => {
        if (cancelled || !containerRef.current || mapRef.current) return
        const retina = typeof window !== 'undefined' && window.devicePixelRatio >= 2
        const tileUrl = buildLeafletTileUrl('positron', retina)
        if (!tileUrl) {
          setStatus('error')
          return
        }
        const map = leaflet.map(containerRef.current, {
          zoomControl: interactive,
          attributionControl,
          scrollWheelZoom: interactive,
          dragging: interactive,
          touchZoom: interactive,
          doubleClickZoom: interactive,
        })
        leaflet
          .tileLayer(tileUrl, {
            attribution: TILE_ATTRIBUTION,
            maxZoom: 20,
          })
          .addTo(map)
        layerRef.current = leaflet.layerGroup().addTo(map)
        mapRef.current = map
        leafletRef.current = leaflet
        map.invalidateSize()
        setStatus('ready')

        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
          observer = new ResizeObserver(() => mapRef.current?.invalidateSize())
          observer.observe(containerRef.current)
        }
      })
      .catch(() => setStatus('error'))

    return () => {
      cancelled = true
      observer?.disconnect()
      mapRef.current?.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [interactive, attributionControl])

  const markerSignature = markers
    .map((marker) => `${marker.latitude},${marker.longitude},${marker.color},${marker.label ?? ''}`)
    .join('|')

  useEffect(() => {
    const leaflet = leafletRef.current
    const map = mapRef.current
    const layer = layerRef.current
    if (status !== 'ready' || !leaflet || !map || !layer) return

    layer.clearLayers()
    const points: [number, number][] = []

    for (const marker of markers) {
      points.push([marker.latitude, marker.longitude])
      const icon = leaflet.divIcon({
        className: 'fb-map-marker',
        html: `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:${marker.color};color:#fff;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${marker.label ?? ''}</span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })
      leaflet.marker([marker.latitude, marker.longitude], { icon }).addTo(layer)
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [48, 48], maxZoom: 16 })
    } else if (points.length === 1) {
      const only = points[0]
      if (only) map.setView(only, zoom)
    } else {
      map.setView([center.latitude, center.longitude], zoom)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, markerSignature, center.latitude, center.longitude, zoom])

  const mapBody = (
    <Box position="relative" width="full" height={height}>
      <Box ref={containerRef} width="full" height="full" aria-label={alt} />
      {status === 'loading' ? (
        <Box
          position="absolute"
          inset="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="bg.muted"
        >
          <Spinner color="brand.600" />
        </Box>
      ) : null}
      {status === 'error' ? (
        <Box
          position="absolute"
          inset="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="bg.muted"
          padding="4"
        >
          <Text fontSize="sm" color="fg.muted" textAlign="center">
            No pudimos cargar el mapa.
          </Text>
        </Box>
      ) : null}
    </Box>
  )

  if (plain) return mapBody

  return (
    <Card padding="0" overflow="hidden">
      {mapBody}
      {legend || note ? (
        <VStack align="stretch" gap="2" padding="4">
          {legend}
          {note}
        </VStack>
      ) : null}
    </Card>
  )
}

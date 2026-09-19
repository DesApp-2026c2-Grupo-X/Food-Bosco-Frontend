export interface LeafletLayerGroup {
  addTo: (map: LeafletMap) => LeafletLayerGroup
  clearLayers: () => void
}

export interface LeafletMap {
  setView: (coords: [number, number], zoom: number) => LeafletMap
  fitBounds: (
    coords: [number, number][],
    options?: { padding?: [number, number]; maxZoom?: number },
  ) => LeafletMap
  invalidateSize: () => void
  remove: () => void
}

export interface LeafletNamespace {
  map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap
  tileLayer: (
    url: string,
    options?: Record<string, unknown>,
  ) => { addTo: (map: LeafletMap) => void }
  layerGroup: () => LeafletLayerGroup
  marker: (
    coords: [number, number],
    options?: Record<string, unknown>,
  ) => { addTo: (group: LeafletLayerGroup) => void }
  divIcon: (options: Record<string, unknown>) => unknown
}

const LEAFLET_VERSION = '1.9.4'
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`

let loaderPromise: Promise<LeafletNamespace> | null = null

const injectStylesheet = () => {
  if (document.querySelector('link[data-leaflet="true"]')) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = LEAFLET_CSS
  link.dataset.leaflet = 'true'
  document.head.appendChild(link)
}

export const loadLeaflet = (): Promise<LeafletNamespace> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-window'))

  const existing = (window as unknown as { L?: LeafletNamespace }).L
  if (existing) return Promise.resolve(existing)
  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise((resolve, reject) => {
    injectStylesheet()
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.async = true
    script.onload = () => {
      const leaflet = (window as unknown as { L?: LeafletNamespace }).L
      if (leaflet) resolve(leaflet)
      else reject(new Error('leaflet-missing'))
    }
    script.onerror = () => reject(new Error('leaflet-failed'))
    document.head.appendChild(script)
  })

  return loaderPromise
}

/// <reference types="vite/client" />

/** Feature flag de la home server-side. Se evalúa en cada render. */
export const isHomeFeedEnabled = (): boolean => import.meta.env.VITE_HOME_FEED === 'true'

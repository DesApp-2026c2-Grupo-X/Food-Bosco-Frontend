/// <reference types="vite/client" />

/** Feature flag de la home server-side. Se evalúa en cada render. */
export const isHomeFeedEnabled = (): boolean => import.meta.env.VITE_HOME_FEED === 'true'

/** Feature flag de descuentos en productos y página de promociones. */
export const isProductPromotionsEnabled = (): boolean =>
  import.meta.env.VITE_PRODUCT_PROMOTIONS !== 'false'

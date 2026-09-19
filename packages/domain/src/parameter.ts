export interface Parameter {
  key: string
  value: number
  unit: string
}

export const PARAMETER_LABELS: Record<string, string> = {
  MAX_DISTANCE_KM: 'Distancia máxima para una sucursal disponible',
  BASE_PREP_MIN: 'Tiempo base de preparación',
  AVG_SPEED_KMH: 'Velocidad promedio de traslado',
}

import { Muted } from '../Muted'
import type { ActiveStatusTextProps } from './types'

export const ActiveStatusText = ({ active, feminine }: ActiveStatusTextProps) => (
  <Muted fontSize="sm">
    {active ? (feminine ? 'Activa' : 'Activo') : feminine ? 'Inactiva' : 'Inactivo'}
  </Muted>
)

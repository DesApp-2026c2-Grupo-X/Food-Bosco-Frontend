export interface FilterOption {
  value: string
  label: string
}

export const matchesActiveStatus = (active: boolean, filter: string): boolean => {
  if (filter !== 'active' && filter !== 'inactive') return true
  return filter === 'active' ? active : !active
}

export const optionsFromEntities = (
  items: { id: number | string; name: string }[],
): FilterOption[] => items.map((item) => ({ value: String(item.id), label: item.name }))

export const ACTIVE_FILTER_OPTIONS: FilterOption[] = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]

export const ACTIVE_FILTER_OPTIONS_FEMININE: FilterOption[] = [
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
]

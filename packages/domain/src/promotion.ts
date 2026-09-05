export interface Promotion {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  active: boolean
}

export interface PromotionInput {
  name: string
  description?: string | null
  startDate: string
  endDate: string
  active: boolean
}

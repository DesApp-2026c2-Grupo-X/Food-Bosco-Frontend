export interface Promotion {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  active: boolean
}

export interface PromotionInput {
  name: string
  description: string
  startDate: string
  endDate: string
  active: boolean
}

export interface OrderState {
  code: string
  name: string
  order: number
  active: boolean
}

export interface OrderStateInput {
  name: string
  order: number
  active: boolean
}

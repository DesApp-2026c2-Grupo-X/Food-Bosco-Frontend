import type { Branch } from './branch'
import type { Category } from './catalog'
import type { OrderStatus } from './order'
import type { PersonalizedProduct } from './personalization'
import type { Promotion } from './promotion'

export interface HomeFeedReorderItem {
  productId: string
  name: string
  quantity: number
}

export interface HomeFeedReorder {
  id: string
  number: string
  status: OrderStatus
  createdAt: string
  total: number
  branchId: string
  branch?: Branch | null
  items: HomeFeedReorderItem[]
}

export interface HomeFeedNearestBranch {
  branch: Branch
  distanceMeters: number
}

export interface HomeFeed {
  generatedAt: string
  hasHistory: boolean
  topCategory: Category | null
  favoriteBranch: Branch | null
  nearestBranch: HomeFeedNearestBranch | null
  categories: Category[]
  forYou: PersonalizedProduct[]
  discovery: PersonalizedProduct[]
  reorder: HomeFeedReorder[]
  promotions: Promotion[]
}

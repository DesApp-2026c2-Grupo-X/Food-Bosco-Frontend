export interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  disabled?: boolean
}

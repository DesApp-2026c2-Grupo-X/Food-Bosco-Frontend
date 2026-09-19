export interface SegmentedChoiceOption {
  value: string
  label: string
}

export interface SegmentedChoiceProps {
  value: string
  onChange: (value: string) => void
  options: SegmentedChoiceOption[]
}

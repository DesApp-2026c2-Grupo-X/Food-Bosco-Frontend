export interface FooterLink {
  label: string
  to: string
}

export interface FooterProps {
  brand?: string
  links?: FooterLink[]
}

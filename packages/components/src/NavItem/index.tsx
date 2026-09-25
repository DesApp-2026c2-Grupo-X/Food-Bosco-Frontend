import { MenuLink } from '../MenuLink'
import type { NavItemProps } from './types'

const VARIANT_STYLES = {
  pill: {
    paddingX: '4',
    paddingY: '2',
    fontWeight: { active: 'semibold', inactive: 'medium' },
    color: { active: 'white', inactive: 'fg.muted' },
    bg: { active: 'brand.500', inactive: 'transparent' },
    hoverColor: { active: 'white', inactive: 'brand.600' },
    hoverBg: { active: 'brand.500', inactive: 'bg.muted' },
  },
  sidebar: {
    paddingX: '3',
    paddingY: '2.5',
    gap: '3',
    fontWeight: { active: 'semibold', inactive: 'normal' },
    color: { active: 'brand.700', inactive: 'fg.muted' },
    bg: { active: 'bg.muted', inactive: 'transparent' },
    hoverColor: { active: 'brand.700', inactive: 'brand.600' },
    hoverBg: { active: 'bg.muted', inactive: 'bg.muted' },
  },
} as const

export const NavItem = ({
  to,
  label,
  active,
  icon,
  variant = 'pill',
  paddingY,
  onClick,
}: NavItemProps) => {
  const styles = VARIANT_STYLES[variant]

  return (
    <MenuLink
      to={to}
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap={'gap' in styles ? styles.gap : undefined}
      paddingX={styles.paddingX}
      paddingY={paddingY ?? styles.paddingY}
      borderRadius="full"
      fontWeight={active ? styles.fontWeight.active : styles.fontWeight.inactive}
      color={active ? styles.color.active : styles.color.inactive}
      bg={active ? styles.bg.active : styles.bg.inactive}
      _hover={{
        color: active ? styles.hoverColor.active : styles.hoverColor.inactive,
        bg: active ? styles.hoverBg.active : styles.hoverBg.inactive,
      }}
      transition="background-color 150ms, color 150ms"
    >
      {icon}
      {label}
    </MenuLink>
  )
}

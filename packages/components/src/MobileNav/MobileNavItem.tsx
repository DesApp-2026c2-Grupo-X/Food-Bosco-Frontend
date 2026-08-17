import { Badge, Box, Link as ChakraLink, Text } from "@chakra-ui/react"
import { NavLink } from "react-router-dom"
import type { MobileNavItem as MobileNavItemType } from "./types"

interface MobileNavItemProps {
  item: MobileNavItemType
  isActive: boolean
}

export const MobileNavItem = ({ item, isActive }: MobileNavItemProps) => {
  const { icon: IconComponent, label, path, badge } = item
  const showBadge = badge !== undefined && badge > 0

  return (
    <ChakraLink asChild>
      <NavLink to={path} aria-label={label}>
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="0.5"
          paddingX="3.5"
          paddingY="2"
          borderRadius="full"
          bg={isActive ? "brand.500" : "transparent"}
          color={isActive ? "white" : "fg.muted"}
          transition="background-color 150ms, color 150ms"
        >
          <IconComponent width={20} height={20} />
          <Text fontSize="2xs" fontWeight={isActive ? "semibold" : "medium"} lineHeight="1">
            {label}
          </Text>
          {showBadge ? (
            <Badge
              position="absolute"
              top="-4px"
              right="2px"
              minWidth="4"
              height="4"
              paddingX="1"
              borderRadius="full"
              fontSize="2xs"
              bg={isActive ? "white" : "brand.500"}
              color={isActive ? "brand.600" : "white"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {badge}
            </Badge>
          ) : null}
        </Box>
      </NavLink>
    </ChakraLink>
  )
}

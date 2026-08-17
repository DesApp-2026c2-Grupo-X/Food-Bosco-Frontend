import { Box, HStack } from "@chakra-ui/react"
import { useLocation } from "react-router-dom"
import { MobileNavItem } from "./MobileNavItem"
import type { MobileNavProps } from "./types"

export const MobileNav = ({ items, ariaLabel = "Navegación principal" }: MobileNavProps) => {
  const { pathname } = useLocation()

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname.startsWith(path)

  return (
    <Box
      position="fixed"
      bottom="4"
      left="0"
      right="0"
      display={{ base: "flex", md: "none" }}
      justifyContent="center"
      paddingX="4"
      zIndex="docked"
      pointerEvents="none"
    >
      <HStack
        as="nav"
        gap="0"
        bg="bg.panel"
        borderRadius="full"
        padding="1"
        border="1px solid"
        borderColor="border.subtle"
        boxShadow="lg"
        pointerEvents="auto"
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <MobileNavItem
            key={item.id}
            item={item}
            isActive={isActive(item.path, item.exact)}
          />
        ))}
      </HStack>
    </Box>
  )
}

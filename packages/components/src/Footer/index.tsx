import { Box, HStack, Link as ChakraLink, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import type { FooterProps } from "./types"

export const Footer = ({
  brand = "UNaHur · Comida al instante",
  links = [],
}: FooterProps) => (
  <Box
    as="footer"
    borderTop="1px"
    borderColor="border.subtle"
    paddingTop="8"
    paddingBottom="2"
    display={{ base: "none", md: "flex" }}
    justifyContent="space-between"
    gap="4"
    color="fg.muted"
    fontSize="sm"
  >
    <Text>{brand}</Text>
    <HStack gap="5">
      {links.map((link) => (
        <ChakraLink asChild key={link.to}>
          <Link to={link.to}>{link.label}</Link>
        </ChakraLink>
      ))}
    </HStack>
  </Box>
)

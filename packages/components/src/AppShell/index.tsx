import { Box, Container } from '@chakra-ui/react'
import { PageTransition } from '../PageTransition'
import type { AppShellProps } from './types'

export const AppShell = ({ header, showHeader, mobileNav, overlays, children }: AppShellProps) => (
  <Box bg="bg" minH="100vh" pb={{ base: '28', md: '0' }}>
    <Box display={{ base: showHeader ? 'block' : 'none', md: 'block' }}>{header}</Box>
    <Container
      as="main"
      maxW="containerContent"
      paddingTop={{ base: showHeader ? '6' : '3', md: '10' }}
      paddingBottom={{ base: '6', md: '10' }}
    >
      <PageTransition>{children}</PageTransition>
    </Container>
    {mobileNav}
    {overlays}
  </Box>
)

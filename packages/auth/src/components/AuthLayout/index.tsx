import { Box, Image, useMediaQuery } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import type { AuthLayoutProps } from './types'

export const AuthLayout = ({ image, leading }: AuthLayoutProps) => {
  const [isDesktop] = useMediaQuery(['(min-width: 48em)'], { ssr: false })

  if (isDesktop) {
    return (
      <Box minH="100dvh" display="flex" bg="bg">
        <Box
          width="480px"
          flexShrink={0}
          display="flex"
          flexDirection="column"
          paddingX="12"
          paddingY="10"
          overflowY="auto"
        >
          <Box width="100%" marginY="auto" display="flex" flexDirection="column">
            {leading ? (
              <Box alignSelf="flex-start" marginBottom="12">
                {leading}
              </Box>
            ) : null}
            <Outlet />
          </Box>
        </Box>
        {image ? (
          <Box flex="1" minWidth={0} position="relative" overflow="hidden">
            <Image
              src={image}
              alt="Imagen decorativa"
              position="absolute"
              inset="0"
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
        ) : null}
      </Box>
    )
  }

  return (
    <Box minH="100dvh" bg="bg">
      <Box
        minH="100dvh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent={{ base: 'flex-start', md: 'center' }}
        paddingX="5"
        paddingTop={{ base: 'calc(env(safe-area-inset-top) + 1rem)', md: '8' }}
        paddingBottom={{ base: '8', md: '8' }}
      >
        <Box width="full" maxW="sm">
          {leading ? (
            <Box
              display="flex"
              alignItems="center"
              minHeight="10"
              marginBottom="8"
              justifyContent="flex-start"
            >
              {leading}
            </Box>
          ) : null}
          <Box
            bg={{ base: 'transparent', md: 'bg.panel' }}
            border={{ base: 'none', md: '1px solid' }}
            borderColor="border.subtle"
            borderRadius={{ base: 'none', md: '3xl' }}
            padding={{ base: '0', md: '10' }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

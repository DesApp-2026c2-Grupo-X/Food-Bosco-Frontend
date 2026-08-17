import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react'
import Clock from '@gravity-ui/icons/Clock'
import GeoPin from '@gravity-ui/icons/GeoPin'
import Handset from '@gravity-ui/icons/Handset'
import { BackButton, Muted, PageContainer, PageTitle, Strong, Subtle } from '@repo/components'
import { MOCK_BRANCHES } from '../../utils/sucursales'

export const SucursalesPage = () => {
  return (
    <PageContainer>
      <BackButton />
      <VStack align="start" gap="1">
        <PageTitle>Sucursales</PageTitle>
        <Muted>Los locales que pueden atender tu zona.</Muted>
      </VStack>

      <VStack gap="3" align="stretch">
        {MOCK_BRANCHES.map((branch) => (
          <Box
            key={branch.id}
            bg="bg.panel"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            padding="5"
          >
            <HStack justify="space-between" marginBottom="3">
              <Strong fontSize="lg">{branch.name}</Strong>
              <Badge
                colorPalette={branch.open ? 'green' : 'red'}
                variant="subtle"
                borderRadius="full"
                paddingX="2.5"
                paddingY="1"
              >
                {branch.open ? 'Abierta' : 'Cerrada'}
              </Badge>
            </HStack>
            <VStack gap="2" align="stretch" color="fg.muted" fontSize="sm">
              <HStack gap="2">
                <Box color="brand.600" display="inline-flex">
                  <GeoPin width={16} height={16} />
                </Box>
                <Text>{branch.address}</Text>
              </HStack>
              <HStack gap="2">
                <Box color="brand.600" display="inline-flex">
                  <Handset width={16} height={16} />
                </Box>
                <Text>{branch.phone}</Text>
              </HStack>
              <HStack gap="2">
                <Box color="brand.600" display="inline-flex">
                  <Clock width={16} height={16} />
                </Box>
                <Text>Hoy: {branch.hours}</Text>
                <Subtle>· {branch.distanceKm.toLocaleString('es-AR')} km</Subtle>
              </HStack>
            </VStack>
          </Box>
        ))}
      </VStack>
    </PageContainer>
  )
}

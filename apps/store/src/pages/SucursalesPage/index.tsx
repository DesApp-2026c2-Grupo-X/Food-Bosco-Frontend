import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react'
import Clock from '@gravity-ui/icons/Clock'
import GeoPin from '@gravity-ui/icons/GeoPin'
import Handset from '@gravity-ui/icons/Handset'
import { BackButton, Muted, PageContainer, PageTitle, Strong } from '@repo/components'
import { useAddresses, useAvailableBranches } from '@repo/api'
import { useAddressStore } from '../../stores/addressStore'
import type { Branch } from '@repo/domain'

const todayOfWeek = () => ((new Date().getDay() + 6) % 7) + 1

const todayHours = (branch: Branch): string => {
  const today = branch.hours.find((hour) => hour.dayOfWeek === todayOfWeek())
  if (!today || today.closed || !today.opening || !today.closing) return 'Cerrada'
  return `${today.opening} a ${today.closing}`
}

export const SucursalesPage = () => {
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((address) => address.id === selectedAddressId)
  const { branches, isLoading } = useAvailableBranches(selected?.latitude, selected?.longitude)

  return (
    <PageContainer>
      <BackButton />
      <VStack align="start" gap="1">
        <PageTitle>Sucursales</PageTitle>
        <Muted>Los locales que pueden atender tu zona.</Muted>
      </VStack>

      <VStack gap="3" align="stretch">
        {branches.map((branch, index) => (
          <Box
            key={branch.id}
            bg="bg.panel"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            padding="5"
          >
            <HStack justify="space-between" gap="2" marginBottom="3">
              <HStack gap="2" minWidth="0">
                <Strong fontSize="lg">{branch.name}</Strong>
                {index === 0 ? (
                  <Badge
                    colorPalette="blue"
                    variant="subtle"
                    borderRadius="full"
                    paddingX="2.5"
                    paddingY="1"
                    flexShrink={0}
                  >
                    Tu sucursal
                  </Badge>
                ) : null}
              </HStack>
              <Badge
                colorPalette={branch.active ? 'green' : 'red'}
                variant="subtle"
                borderRadius="full"
                paddingX="2.5"
                paddingY="1"
                flexShrink={0}
              >
                {branch.active ? 'Abierta' : 'Cerrada'}
              </Badge>
            </HStack>
            <VStack gap="2" align="stretch" color="fg.muted" fontSize="sm">
              <HStack gap="2">
                <Box color="brand.600" display="inline-flex">
                  <GeoPin width={16} height={16} />
                </Box>
                <Text>{branch.addressText}</Text>
              </HStack>
              {branch.phone ? (
                <HStack gap="2">
                  <Box color="brand.600" display="inline-flex">
                    <Handset width={16} height={16} />
                  </Box>
                  <Text>{branch.phone}</Text>
                </HStack>
              ) : null}
              <HStack gap="2">
                <Box color="brand.600" display="inline-flex">
                  <Clock width={16} height={16} />
                </Box>
                <Text>Hoy: {todayHours(branch)}</Text>
              </HStack>
            </VStack>
          </Box>
        ))}
      </VStack>

      {!isLoading && branches.length === 0 ? (
        <Box paddingY="12" textAlign="center">
          <Muted>No hay sucursales disponibles para tu zona.</Muted>
        </Box>
      ) : null}
    </PageContainer>
  )
}

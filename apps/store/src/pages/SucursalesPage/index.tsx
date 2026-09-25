import { Badge, Box, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import Clock from '@gravity-ui/icons/Clock'
import GeoPin from '@gravity-ui/icons/GeoPin'
import Handset from '@gravity-ui/icons/Handset'
import {
  BackButton,
  Card,
  EmptyState,
  InteractiveMap,
  PageContainer,
  PageHeader,
  Strong,
} from '@repo/components'
import { useAddresses, useNearbyBranches } from '@repo/api'
import { MAP_MARKER_COLORS } from '@repo/theme'
import { useAddressStore } from '../../stores/addressStore'
import { isBranchOpenNow, type Branch } from '@repo/domain'

const todayOfWeek = () => new Date().getDay()

const todayHours = (branch: Branch): string => {
  const today = branch.hours.find((hour) => hour.dayOfWeek === todayOfWeek())
  if (!today || today.closed || !today.opening || !today.closing) return 'Cerrada'
  return `${today.opening} a ${today.closing}`
}

const isOpen = (branch: Branch): boolean => branch.active && isBranchOpenNow(branch.hours)

export const SucursalesPage = () => {
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((address) => address.id === selectedAddressId)
  const { branches, isLoading } = useNearbyBranches(selected?.latitude, selected?.longitude)
  const firstOpenId = branches.find(isOpen)?.id

  return (
    <PageContainer>
      <BackButton />
      <PageHeader title="Sucursales" description="Los locales de tu zona y su estado actual." />

      <VStack gap="3" align="stretch">
        {branches.map((branch) => (
          <Card key={branch.id}>
            <Stack direction={{ base: 'column', md: 'row' }} gap="4" align="stretch">
              <VStack flex="1" align="stretch" gap="3" minWidth="0">
                <HStack justify="space-between" gap="2">
                  <HStack gap="2" minWidth="0">
                    <Strong fontSize="lg">{branch.name}</Strong>
                    {branch.id === firstOpenId ? (
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
                    colorPalette={isOpen(branch) ? 'green' : 'red'}
                    variant="subtle"
                    borderRadius="full"
                    paddingX="2.5"
                    paddingY="1"
                    flexShrink={0}
                  >
                    {isOpen(branch) ? 'Abierta' : 'Cerrada'}
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
              </VStack>
              <Box
                width={{ base: 'full', md: '200px' }}
                height="150px"
                flexShrink={0}
                borderRadius="xl"
                overflow="hidden"
                border="1px solid"
                borderColor="border.subtle"
              >
                <InteractiveMap
                  plain
                  interactive={false}
                  attributionControl={false}
                  center={{ latitude: branch.latitude, longitude: branch.longitude }}
                  markers={[
                    {
                      latitude: branch.latitude,
                      longitude: branch.longitude,
                      color: MAP_MARKER_COLORS.branch,
                      label: 'S',
                    },
                  ]}
                  zoom={12}
                  height="150px"
                  alt={`Ubicación de ${branch.name}`}
                />
              </Box>
            </Stack>
          </Card>
        ))}
      </VStack>

      {branches.length > 0 ? (
        <Text fontSize="2xs" color="fg.subtle" textAlign="center">
          Mapas: © OpenStreetMap contributors · Powered by Geoapify
        </Text>
      ) : null}

      {!isLoading && branches.length === 0 ? (
        <EmptyState
          title="Sin sucursales"
          description="No hay sucursales disponibles para tu zona."
        />
      ) : null}
    </PageContainer>
  )
}

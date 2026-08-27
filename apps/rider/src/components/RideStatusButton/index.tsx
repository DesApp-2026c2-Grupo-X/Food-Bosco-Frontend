import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useRiderProfile } from '@repo/api'
import { useRiderStore } from '../../stores/riderStore'

export const RideStatusButton = () => {
  const isOnline = useRiderStore((state) => state.isOnline)
  const setOnline = useRiderStore((state) => state.setOnline)
  const { setAvailability } = useRiderProfile()

  const toggle = async () => {
    const next = !isOnline
    setOnline(next)
    await setAvailability(next)
  }

  return (
    <Button
      size="sm"
      borderRadius="full"
      variant={isOnline ? 'solid' : 'outline'}
      bg={isOnline ? 'brand.500' : 'transparent'}
      color={isOnline ? 'white' : 'fg.muted'}
      borderColor="border.emphasized"
      _hover={{ bg: isOnline ? 'brand.600' : 'bg.muted' }}
      onClick={toggle}
      aria-label={isOnline ? 'Desconectarse' : 'Conectarse'}
    >
      <HStack gap="2">
        <Box width="2" height="2" borderRadius="full" bg={isOnline ? 'white' : 'fg.subtle'} />
        <Text>{isOnline ? 'Conectado' : 'Desconectado'}</Text>
      </HStack>
    </Button>
  )
}

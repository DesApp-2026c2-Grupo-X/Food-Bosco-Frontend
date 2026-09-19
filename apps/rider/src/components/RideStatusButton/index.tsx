import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useRideAvailability } from '../../hooks/useRideAvailability'

export const RideStatusButton = () => {
  const { available, onToggle } = useRideAvailability()

  return (
    <Button
      size="sm"
      borderRadius="full"
      variant={available ? 'solid' : 'outline'}
      bg={available ? 'brand.500' : 'transparent'}
      color={available ? 'white' : 'fg.muted'}
      borderColor="border.emphasized"
      _hover={{ bg: available ? 'brand.600' : 'bg.muted' }}
      onClick={onToggle}
      aria-label={available ? 'Desconectarse' : 'Conectarse'}
    >
      <HStack gap="2">
        <Box width="2" height="2" borderRadius="full" bg={available ? 'white' : 'fg.subtle'} />
        <Text>{available ? 'Conectado' : 'Desconectado'}</Text>
      </HStack>
    </Button>
  )
}

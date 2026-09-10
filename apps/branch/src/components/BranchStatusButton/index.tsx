import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useBranchStatusStore } from '../../stores/branchStatusStore'

export const BranchStatusButton = () => {
  const isOpen = useBranchStatusStore((state) => state.isOpen)
  const toggle = useBranchStatusStore((state) => state.toggle)

  return (
    <Button
      variant="outline"
      size="sm"
      borderRadius="full"
      color={isOpen ? 'success' : 'danger'}
      borderColor={isOpen ? 'success' : 'danger'}
      _hover={{ bg: isOpen ? 'bg.subtle' : 'bg.subtle' }}
      onClick={toggle}
      aria-label={isOpen ? 'Cerrar sucursal' : 'Abrir sucursal'}
    >
      <HStack gap="2">
        <Box width="2" height="2" borderRadius="full" bg={isOpen ? 'success' : 'danger'} />
        <Text>{isOpen ? 'Abierto' : 'Cerrado'}</Text>
      </HStack>
    </Button>
  )
}

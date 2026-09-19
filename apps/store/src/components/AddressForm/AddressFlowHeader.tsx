import { Box, Heading, VStack } from '@chakra-ui/react'
import ChevronLeft from '@gravity-ui/icons/ChevronLeft'
import GeoPin from '@gravity-ui/icons/GeoPin'
import { GhostButton, Muted } from '@repo/components'

interface AddressFlowHeaderProps {
  title: string
  description: string
  onBack?: () => void
}

export const AddressFlowHeader = ({ title, description, onBack }: AddressFlowHeaderProps) => (
  <VStack align="start" gap="1" marginBottom="5">
    {onBack ? (
      <GhostButton
        size="sm"
        width="11"
        height="11"
        minWidth="0"
        padding="0"
        bg="bg.muted"
        color="brand.600"
        _hover={{ color: 'brand.700', bg: 'bg.muted' }}
        marginBottom="1"
        aria-label="Volver"
        onClick={onBack}
      >
        <ChevronLeft width={22} height={22} />
      </GhostButton>
    ) : (
      <Box
        color="brand.600"
        bg="bg.muted"
        borderRadius="full"
        width="11"
        height="11"
        display="flex"
        alignItems="center"
        justifyContent="center"
        marginBottom="1"
      >
        <GeoPin width={22} height={22} />
      </Box>
    )}
    <Heading as="h2" fontSize="xl" fontWeight="bold">
      {title}
    </Heading>
    <Muted fontSize="sm">{description}</Muted>
  </VStack>
)

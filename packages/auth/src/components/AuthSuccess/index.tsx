import { Box, VStack } from '@chakra-ui/react'
import CircleCheckFill from '@gravity-ui/icons/CircleCheckFill'
import { Link } from 'react-router-dom'
import { Muted, PrimaryButton, Strong } from '@repo/components'
import type { AuthSuccessProps } from './types'

export const AuthSuccess = ({ title, description, buttonLabel, to }: AuthSuccessProps) => {
  return (
    <VStack gap="3" align="center" textAlign="center" paddingY="6">
      <Box color="success" display="flex">
        <CircleCheckFill width={44} height={44} />
      </Box>
      <Strong fontSize="lg">{title}</Strong>
      <Muted fontSize="sm">{description}</Muted>
      <PrimaryButton asChild width="full" marginTop="2">
        <Link to={to}>{buttonLabel}</Link>
      </PrimaryButton>
    </VStack>
  )
}

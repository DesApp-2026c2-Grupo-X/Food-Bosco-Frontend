import { Box, VStack } from '@chakra-ui/react'
import CircleExclamationFill from '@gravity-ui/icons/CircleExclamationFill'
import { Link } from 'react-router-dom'
import { Muted, PrimaryButton, SecondaryButton, Strong } from '@repo/components'
import type { AuthNoticeProps } from './types'

export const AuthNotice = ({
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
}: AuthNoticeProps) => {
  return (
    <VStack gap="3" align="center" textAlign="center" paddingY="6">
      <Box color="danger" display="flex">
        <CircleExclamationFill width={44} height={44} />
      </Box>
      <Strong fontSize="lg">{title}</Strong>
      <Muted fontSize="sm">{description}</Muted>
      <VStack gap="2" width="full" marginTop="2">
        <PrimaryButton asChild width="full">
          <Link to={primaryTo}>{primaryLabel}</Link>
        </PrimaryButton>
        {secondaryLabel && secondaryTo ? (
          <SecondaryButton asChild width="full">
            <Link to={secondaryTo}>{secondaryLabel}</Link>
          </SecondaryButton>
        ) : null}
      </VStack>
    </VStack>
  )
}

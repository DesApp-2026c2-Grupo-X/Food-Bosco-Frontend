import { Avatar, Box } from '@chakra-ui/react'
import { Muted, Strong, Subtle } from '../typography'
import type { ProfileIdentityProps } from './types'

export const ProfileIdentity = ({ firstName, lastName, email, subtitle }: ProfileIdentityProps) => {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim()

  return (
    <>
      <Avatar.Root size="xl">
        <Avatar.Fallback name={fullName} />
      </Avatar.Root>
      <Box minWidth="0">
        <Strong fontSize="lg">{fullName || 'Sin nombre'}</Strong>
        <Muted fontSize="sm" truncate>
          {email}
        </Muted>
        <Subtle fontSize="sm">{subtitle}</Subtle>
      </Box>
    </>
  )
}

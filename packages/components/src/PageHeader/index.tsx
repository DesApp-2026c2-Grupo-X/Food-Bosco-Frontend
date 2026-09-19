import { HStack, VStack } from '@chakra-ui/react'
import { Muted } from '../Muted'
import { PageTitle } from '../PageTitle'
import type { PageHeaderProps } from './types'

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <HStack justify="space-between" align="start" gap="4" width="full">
    <VStack align="start" gap="1">
      <PageTitle>{title}</PageTitle>
      {description ? <Muted>{description}</Muted> : null}
    </VStack>
    {action}
  </HStack>
)

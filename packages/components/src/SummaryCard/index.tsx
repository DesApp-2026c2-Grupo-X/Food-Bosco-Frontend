import { HStack, VStack } from '@chakra-ui/react'
import { Card } from '../Card'
import { MenuLink } from '../MenuLink'
import { Muted, Strong } from '../typography'
import type { SummaryCardProps } from './types'

export const SummaryCard = ({ title, meta, trailing, children, href }: SummaryCardProps) => {
  const body = (
    <>
      <HStack justify="space-between" align="start" gap="4">
        <VStack align="start" gap="1">
          <Strong fontSize="lg">{title}</Strong>
          {meta ? <Muted fontSize="sm">{meta}</Muted> : null}
        </VStack>
        {trailing}
      </HStack>
      {children}
    </>
  )

  if (href) {
    return (
      <MenuLink to={href} display="block">
        <Card interactive>{body}</Card>
      </MenuLink>
    )
  }

  return <Card>{body}</Card>
}

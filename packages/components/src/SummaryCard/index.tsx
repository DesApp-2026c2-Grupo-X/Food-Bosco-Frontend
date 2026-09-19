import { HStack, Link as ChakraLink, VStack } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { Card } from '../Card'
import { Muted } from '../Muted'
import { Strong } from '../Strong'
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
      <ChakraLink asChild display="block" _hover={{ textDecoration: 'none' }}>
        <NavLink to={href}>
          <Card interactive>{body}</Card>
        </NavLink>
      </ChakraLink>
    )
  }

  return <Card>{body}</Card>
}

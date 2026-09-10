import { Heading, Text, VStack } from '@chakra-ui/react'
import type { PageHeaderProps } from './types'

export const PageHeader = ({ title, description, align = 'start' }: PageHeaderProps) => (
  <VStack align={align} gap="2">
    <Heading as="h1" fontSize={{ base: '4xl', md: '2xl' }} fontWeight="bold">
      {title}
    </Heading>
    {description ? <Text color="fg.muted">{description}</Text> : null}
  </VStack>
)

import { Heading } from '@chakra-ui/react'
import type { PageTitleProps } from './types'

export const PageTitle = (props: PageTitleProps) => (
  <Heading as="h1" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" {...props} />
)

import { Heading, Text } from '@chakra-ui/react'
import type { HeadingProps, TextProps } from '@chakra-ui/react'

export type MutedProps = TextProps
export const Muted = (props: MutedProps) => <Text color="fg.muted" {...props} />

export type SubtleProps = TextProps
export const Subtle = (props: SubtleProps) => <Text color="fg.subtle" {...props} />

export type StrongProps = TextProps
export const Strong = (props: StrongProps) => <Text fontWeight="semibold" {...props} />

export type PriceProps = TextProps
export const Price = (props: PriceProps) => (
  <Text fontWeight="semibold" fontVariantNumeric="tabular-nums" {...props} />
)

export const Lead = (props: TextProps) => (
  <Text
    color="fg.muted"
    fontSize={{ base: 'md', md: 'lg' }}
    maxW="md"
    textWrap="pretty"
    {...props}
  />
)

export type EyebrowProps = TextProps
export const Eyebrow = ({ color = 'brand.600', ...props }: EyebrowProps) => (
  <Text
    fontSize="xs"
    fontWeight="semibold"
    letterSpacing="0.08em"
    textTransform="uppercase"
    color={color}
    {...props}
  />
)

export type PageTitleProps = HeadingProps
export const PageTitle = (props: PageTitleProps) => (
  <Heading as="h1" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" {...props} />
)

export type SectionTitleProps = HeadingProps
export const SectionTitle = (props: SectionTitleProps) => (
  <Heading
    as="h2"
    fontSize={{ base: '2xl', md: '3xl' }}
    fontWeight="bold"
    textWrap="balance"
    {...props}
  />
)

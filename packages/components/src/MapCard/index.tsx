import { Image, VStack } from '@chakra-ui/react'
import { Card } from '../Card'
import type { MapCardProps } from './types'

export const MapCard = ({ src, alt, legend, note, height = '320px' }: MapCardProps) => (
  <Card padding="0" overflow="hidden">
    <Image src={src} alt={alt} width="full" height={height} objectFit="cover" />
    {legend || note ? (
      <VStack align="stretch" gap="2" padding="4">
        {legend}
        {note}
      </VStack>
    ) : null}
  </Card>
)

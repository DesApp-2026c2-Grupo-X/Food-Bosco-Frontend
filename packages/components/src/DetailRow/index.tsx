import { HStack } from '@chakra-ui/react'
import { Muted } from '../Muted'
import { Strong } from '../Strong'
import type { DetailRowProps } from './types'

export const DetailRow = ({ label, value }: DetailRowProps) => (
  <HStack justify="space-between" gap="4">
    <Muted fontSize="sm">{label}</Muted>
    <Strong fontSize="sm">{value}</Strong>
  </HStack>
)

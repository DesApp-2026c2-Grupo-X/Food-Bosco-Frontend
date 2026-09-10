import { Box, Flex } from '@chakra-ui/react'
import { Eyebrow } from '../Eyebrow'
import { SectionTitle } from '../SectionTitle'
import type { SectionHeaderProps } from './types'

export const SectionHeader = ({ label, title, action }: SectionHeaderProps) => {
  return (
    <Flex justify="space-between" align="end" gap="4" wrap="wrap">
      <Box>
        {label ? <Eyebrow marginBottom="1">{label}</Eyebrow> : null}
        <SectionTitle>{title}</SectionTitle>
      </Box>
      {action}
    </Flex>
  )
}

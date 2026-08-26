import { Text, type TextProps } from '@chakra-ui/react'

export const Lead = (props: TextProps) => (
  <Text
    color="fg.muted"
    fontSize={{ base: 'md', md: 'lg' }}
    maxW="md"
    textWrap="pretty"
    {...props}
  />
)

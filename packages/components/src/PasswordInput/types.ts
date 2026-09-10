import type { ComponentProps } from 'react'
import type { Input } from '@chakra-ui/react'

export type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>

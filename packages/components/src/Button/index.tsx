import { Button, type ButtonProps } from '@chakra-ui/react'

export const PrimaryButton = ({ size = 'lg', ...props }: ButtonProps) => (
  <Button
    size={size}
    borderRadius="full"
    bg="brand.600"
    color="white"
    _hover={{ bg: 'brand.700' }}
    {...props}
  />
)

export const SecondaryButton = ({ size = 'lg', ...props }: ButtonProps) => (
  <Button
    size={size}
    variant="outline"
    color="fg"
    borderColor="border.emphasized"
    _hover={{ bg: 'bg.muted' }}
    borderRadius="full"
    {...props}
  />
)

export const InverseButton = ({ size = 'lg', ...props }: ButtonProps) => (
  <Button
    size={size}
    borderRadius="full"
    bg="white"
    color="brand.700"
    _hover={{ bg: 'brand.100' }}
    {...props}
  />
)

export const GhostButton = (props: ButtonProps) => (
  <Button variant="ghost" borderRadius="full" color="fg" _hover={{ bg: 'bg.muted' }} {...props} />
)

export const OutlineButton = (props: ButtonProps) => (
  <Button
    variant="outline"
    borderRadius="full"
    borderColor="border.subtle"
    _hover={{ borderColor: 'border.emphasized', bg: 'bg.muted' }}
    {...props}
  />
)

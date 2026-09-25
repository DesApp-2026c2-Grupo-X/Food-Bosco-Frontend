import { Button, type ButtonProps } from '@chakra-ui/react'

interface OutlineButtonBaseProps extends ButtonProps {
  borderColorToken: string
  hoverBorderColorToken?: string
}

const OutlineButtonBase = ({
  borderColorToken,
  hoverBorderColorToken,
  ...props
}: OutlineButtonBaseProps) => (
  <Button
    variant="outline"
    borderRadius="full"
    borderColor={borderColorToken}
    _hover={
      hoverBorderColorToken
        ? { borderColor: hoverBorderColorToken, bg: 'bg.muted' }
        : { bg: 'bg.muted' }
    }
    {...props}
  />
)

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
  <OutlineButtonBase size={size} color="fg" borderColorToken="border.emphasized" {...props} />
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
  <OutlineButtonBase
    borderColorToken="border.subtle"
    hoverBorderColorToken="border.emphasized"
    {...props}
  />
)

import { Image } from '@chakra-ui/react'
import { useColorModeValue } from '../ColorModeProvider/hooks/useColorModeValue'
import type { LogoProps } from './types'

export const Logo = ({ lightSrc, darkSrc, height = '40px', className }: LogoProps) => {
  const src = useColorModeValue(lightSrc, darkSrc)
  return (
    <Image
      src={src}
      alt="UNaHur"
      maxHeight={height}
      height={height}
      width="auto"
      objectFit="contain"
      className={className}
    />
  )
}

import {
  Box,
  DialogBackdrop,
  DialogCloseTrigger,
  DialogContent,
  DialogPositioner,
  DialogRoot,
  DrawerBackdrop,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerPositioner,
  DrawerRoot,
  Portal,
  useMediaQuery,
} from '@chakra-ui/react'
import type { ResponsiveModalProps } from './types'

export const ResponsiveModal = ({
  open,
  onClose,
  children,
  closable = true,
}: ResponsiveModalProps) => {
  const [isDesktop] = useMediaQuery(['(min-width: 48em)'], { ssr: false })

  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open && closable) onClose()
  }

  if (isDesktop) {
    return (
      <DialogRoot open={open} onOpenChange={handleOpenChange} placement="center">
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent borderRadius="3xl" maxW="md">
              <Box padding="6">{children}</Box>
              {closable ? <DialogCloseTrigger /> : null}
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>
    )
  }

  return (
    <DrawerRoot open={open} onOpenChange={handleOpenChange} placement="bottom">
      <Portal>
        <DrawerBackdrop />
        <DrawerPositioner>
          <DrawerContent
            maxW="lg"
            marginX="auto"
            borderTopRadius="3xl"
            borderBottomRadius="0"
            paddingBottom="calc(env(safe-area-inset-bottom) + 0.5rem)"
          >
            <Box
              width="10"
              height="1"
              borderRadius="full"
              bg="border.emphasized"
              marginX="auto"
              marginTop="2.5"
            />
            <Box padding="6" paddingTop="4">
              {children}
            </Box>
            {closable ? <DrawerCloseTrigger /> : null}
          </DrawerContent>
        </DrawerPositioner>
      </Portal>
    </DrawerRoot>
  )
}

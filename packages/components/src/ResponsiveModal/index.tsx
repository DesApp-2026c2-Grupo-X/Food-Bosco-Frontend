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
} from "@chakra-ui/react"
import type { ResponsiveModalProps } from "./types"

export const ResponsiveModal = ({ open, onClose, children }: ResponsiveModalProps) => {
  const [isDesktop] = useMediaQuery(["(min-width: 48em)"], { ssr: false })

  if (isDesktop) {
    return (
      <DialogRoot
        open={open}
        onOpenChange={(details) => !details.open && onClose()}
        placement="center"
      >
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent borderRadius="3xl" maxW="md">
              <Box padding="6">{children}</Box>
              <DialogCloseTrigger />
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>
    )
  }

  return (
    <DrawerRoot
      open={open}
      onOpenChange={(details) => !details.open && onClose()}
      placement="bottom"
    >
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
            <DrawerCloseTrigger />
          </DrawerContent>
        </DrawerPositioner>
      </Portal>
    </DrawerRoot>
  )
}

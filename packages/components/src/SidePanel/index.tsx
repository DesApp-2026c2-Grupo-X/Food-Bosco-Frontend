import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  Portal,
} from '@chakra-ui/react'
import type { SidePanelProps } from './types'

export const SidePanel = ({
  open,
  onClose,
  title,
  header,
  footer,
  children,
  maxW = 'md',
}: SidePanelProps) => (
  <DrawerRoot open={open} onOpenChange={(details) => !details.open && onClose()} placement="end">
    <Portal>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent h="100dvh" maxW={maxW} bg="bg.panel">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {header}
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody>{children}</DrawerBody>
          {footer ? <DrawerFooter>{footer}</DrawerFooter> : null}
        </DrawerContent>
      </DrawerPositioner>
    </Portal>
  </DrawerRoot>
)

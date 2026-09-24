import { Stack, Toast, Toaster as ChakraToaster, type CreateToasterReturn } from '@chakra-ui/react'
import { toaster as defaultToaster } from './toaster'

interface ToasterProps {
  toaster?: CreateToasterReturn
}

export const Toaster = ({ toaster = defaultToaster }: ToasterProps = {}) => (
  <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
    {(toast) => (
      <Toast.Root width={{ md: 'sm' }}>
        <Toast.Indicator />
        <Stack gap="1" flex="1" maxWidth="100%">
          {toast.title ? <Toast.Title>{toast.title}</Toast.Title> : null}
          {toast.description ? <Toast.Description>{toast.description}</Toast.Description> : null}
        </Stack>
      </Toast.Root>
    )}
  </ChakraToaster>
)

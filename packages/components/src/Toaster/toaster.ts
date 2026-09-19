import { createToaster } from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
  duration: 4000,
})

type NotifyOptions = {
  title: string
  description?: string
}

export const notifySuccess = ({ title, description }: NotifyOptions) => {
  toaster.create({ type: 'success', title, description })
}

export const notifyError = ({ title, description }: NotifyOptions) => {
  toaster.create({ type: 'error', title, description })
}

export const notifyInfo = ({ title, description }: NotifyOptions) => {
  toaster.create({ type: 'info', title, description })
}

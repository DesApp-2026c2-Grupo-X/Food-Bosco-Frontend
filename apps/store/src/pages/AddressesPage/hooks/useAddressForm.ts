import { useState } from 'react'
import type { Address } from '@repo/domain'

export const useAddressForm = () => {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)

  const openCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditing(address)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
  }

  return { open, editing, openCreate, openEdit, close }
}

import { Box, Button, VStack } from '@chakra-ui/react'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import Plus from '@gravity-ui/icons/Plus'
import { GhostButton, Muted, ResponsiveModal, Strong, Subtle } from '@repo/components'
import type { Address } from '@repo/domain'
import { useAddressFlow, type AddressFlowMode } from '../../hooks/useAddressFlow'
import { AddressConfirm } from './AddressConfirm'
import { AddressFlowHeader } from './AddressFlowHeader'
import { AddressForm } from './AddressForm'

interface AddressSheetProps {
  open: boolean
  onClose: () => void
  mode: AddressFlowMode
  closable?: boolean
  editing?: Address | null
  onSelect?: (id: string) => void
  onSaved?: (address: Address | null) => void
}

export const AddressSheet = ({
  open,
  onClose,
  mode,
  closable = true,
  editing = null,
  onSelect,
  onSaved,
}: AddressSheetProps) => {
  const {
    addresses,
    step,
    form,
    pending,
    editing: isEditing,
    submitting,
    error,
    select,
    openForm,
    submitForm,
    confirm,
    backToForm,
    backToList,
  } = useAddressFlow({ open, mode, editing, onSelect, onSaved })

  const hasSavedAddresses = addresses.length > 0

  const title =
    step === 'list'
      ? '¿A dónde te lo llevamos?'
      : step === 'confirm'
        ? '¿Es esta tu dirección?'
        : mode === 'manage' && isEditing
          ? 'Editar dirección'
          : 'Cargá tu dirección'

  const description =
    step === 'list'
      ? 'Elegí una dirección para ver qué productos están disponibles en tu zona.'
      : step === 'confirm'
        ? 'Confirmá que el punto en el mapa coincida con la realidad.'
        : 'Cargá la dirección y verificá la ubicación en el mapa.'

  const showBack = step === 'confirm' || (step === 'form' && mode === 'picker' && hasSavedAddresses)
  const onBack = step === 'confirm' ? backToForm : backToList

  return (
    <ResponsiveModal open={open} onClose={onClose} closable={closable}>
      <AddressFlowHeader
        title={title}
        description={description}
        onBack={showBack ? onBack : undefined}
      />

      {step === 'form' ? (
        <AddressForm
          form={form}
          submitting={submitting}
          error={error}
          onSubmit={submitForm}
          submitLabel="Continuar"
        />
      ) : step === 'confirm' && pending ? (
        <AddressConfirm
          input={pending}
          submitting={submitting}
          error={error}
          onConfirm={confirm}
          onBack={backToForm}
        />
      ) : (
        <VStack gap="2" align="stretch">
          {addresses.map((address) => (
            <Button
              key={address.id}
              variant="outline"
              width="full"
              height="auto"
              justifyContent="flex-start"
              textAlign="left"
              borderColor="border.subtle"
              borderRadius="xl"
              paddingX="4"
              paddingY="3.5"
              gap="3"
              _hover={{ borderColor: 'border.emphasized', bg: 'bg.muted' }}
              onClick={() => select(address.id)}
            >
              <Box flex="1" minWidth="0">
                <Strong>{address.label}</Strong>
                <Muted fontSize="sm" lineClamp={1}>
                  {address.text}
                </Muted>
                <Subtle fontSize="xs">{address.city}</Subtle>
              </Box>
              <Box color="fg.subtle" display="flex">
                <ChevronRight width={18} height={18} />
              </Box>
            </Button>
          ))}

          <GhostButton
            width="full"
            borderRadius="xl"
            paddingY="3.5"
            color="brand.600"
            onClick={openForm}
          >
            <Plus width={16} height={16} />
            Agregar nueva dirección
          </GhostButton>
        </VStack>
      )}
    </ResponsiveModal>
  )
}

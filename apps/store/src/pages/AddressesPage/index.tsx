import { Badge, Box, HStack, VStack } from '@chakra-ui/react'
import GeoPin from '@gravity-ui/icons/GeoPin'
import PencilToSquare from '@gravity-ui/icons/PencilToSquare'
import Plus from '@gravity-ui/icons/Plus'
import TrashBin from '@gravity-ui/icons/TrashBin'
import {
  BackButton,
  GhostButton,
  Muted,
  OutlineButton,
  PageContainer,
  PageTitle,
  PrimaryButton,
  Strong,
  Subtle,
} from '@repo/components'
import { EmptyState } from '@repo/components'
import { useAddressStore } from '../../stores/addressStore'
import type { Address } from '@repo/domain'
import { AddressFormDialog } from './AddressFormDialog'
import { useAddressForm } from './hooks/useAddressForm'

export const AddressesPage = () => {
  const addresses = useAddressStore((state) => state.addresses)
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const selectAddress = useAddressStore((state) => state.selectAddress)
  const removeAddress = useAddressStore((state) => state.removeAddress)
  const form = useAddressForm()

  return (
    <PageContainer>
      <BackButton />
      <VStack align="start" gap="1">
        <PageTitle>Mis direcciones</PageTitle>
        <Muted>Administrá las direcciones a las que te llevamos el pedido.</Muted>
      </VStack>

      <OutlineButton
        width="full"
        height="auto"
        borderRadius="xl"
        paddingY="3.5"
        color="brand.600"
        onClick={form.openCreate}
      >
        <Plus width={16} height={16} />
        Agregar dirección
      </OutlineButton>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<GeoPin width={40} height={40} />}
          title="Sin direcciones guardadas"
          description="Cargá una dirección para poder pedir."
        />
      ) : (
        <VStack gap="3" align="stretch">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={address.id === selectedAddressId}
              onSelect={() => selectAddress(address.id)}
              onEdit={() => form.openEdit(address)}
              onDelete={() => removeAddress(address.id)}
            />
          ))}
        </VStack>
      )}

      <AddressFormDialog
        open={form.open}
        editing={form.editing}
        form={form.form}
        onClose={form.close}
        onSubmit={form.onSubmit}
      />
    </PageContainer>
  )
}

interface AddressCardProps {
  address: Address
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

const AddressCard = ({ address, selected, onSelect, onEdit, onDelete }: AddressCardProps) => {
  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      padding="5"
    >
      <HStack justify="space-between" marginBottom="1">
        <HStack gap="2">
          <Strong fontSize="lg">{address.label}</Strong>
          {selected ? (
            <Badge
              colorPalette="orange"
              variant="subtle"
              borderRadius="full"
              paddingX="2.5"
              paddingY="1"
            >
              Actual
            </Badge>
          ) : null}
        </HStack>
        <Box color="brand.600" display="flex">
          <GeoPin width={20} height={20} />
        </Box>
      </HStack>
      <Muted fontSize="sm">{address.street}</Muted>
      <Subtle fontSize="sm">
        {address.city}
        {address.reference ? ` · ${address.reference}` : ''}
      </Subtle>

      <HStack gap="2" marginTop="4" flexWrap="wrap">
        {!selected ? (
          <PrimaryButton size="sm" onClick={onSelect}>
            Usar esta
          </PrimaryButton>
        ) : null}
        <OutlineButton size="sm" onClick={onEdit}>
          <PencilToSquare width={14} height={14} />
          Editar
        </OutlineButton>
        <GhostButton size="sm" color="danger" onClick={onDelete}>
          <TrashBin width={14} height={14} />
          Eliminar
        </GhostButton>
      </HStack>
    </Box>
  )
}

import { Badge, Box, Button, Grid, HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react'
import Check from '@gravity-ui/icons/Check'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAddresses } from '@repo/api'
import { useAddressStore } from '../../stores/addressStore'
import {
  BackButton,
  Card,
  Muted,
  PageTitle,
  Price,
  PrimaryButton,
  Strong,
  Subtle,
  TextAreaField,
  WidePageContainer,
} from '@repo/components'
import { EmptyState } from '@repo/components'
import { QuantityStepper } from '@repo/components'
import { routes } from '../../routes'
import { formatPrice, hasEstimatedPrice, type Product } from '@repo/domain'
import { useTrackRecentView } from '../../hooks/useTrackRecentView'
import { useProductConfig } from './hooks/useProductConfig'

export const ProductDetailPage = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId)
  const config = useProductConfig(productId, selectedAddress)

  useTrackRecentView(config.product?.id)

  if (config.isLoading) {
    return (
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="8">
        <Skeleton height="360px" borderRadius="2xl" />
        <VStack gap="4" align="stretch">
          <Skeleton height="40px" width="60%" />
          <Skeleton height="16px" />
          <Skeleton height="16px" width="80%" />
          <Skeleton height="120px" borderRadius="xl" />
        </VStack>
      </Grid>
    )
  }

  if (!config.product) {
    return (
      <EmptyState
        title="Producto no encontrado"
        description="El producto que buscás no existe o ya no está disponible."
        action={
          <PrimaryButton asChild>
            <Link to={routes.catalog}>Volver al catálogo</Link>
          </PrimaryButton>
        }
      />
    )
  }

  const { product } = config
  const promotion = product.promotion ?? null
  const estimatedPrice =
    promotion && hasEstimatedPrice(promotion) ? promotion.estimatedUnitPrice : null

  return (
    <WidePageContainer>
      <BackButton />

      <Grid
        templateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gap={{ base: '6', md: '10' }}
        alignItems="start"
      >
        <Box position={{ md: 'sticky' }} top="24">
          <Box borderRadius="2xl" overflow="hidden" aspectRatio="1 / 1" bg="bg.muted">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            ) : null}
          </Box>
        </Box>

        <VStack align="stretch" gap="6">
          <VStack align="start" gap="2">
            <PageTitle lineHeight="1.1" textWrap="balance">
              {product.name}
            </PageTitle>
            <Muted>{product.description}</Muted>
            {estimatedPrice != null && promotion ? (
              <HStack gap="2" align="baseline">
                <Text textDecoration="line-through" color="fg.subtle" aria-label="Precio anterior">
                  {formatPrice(promotion.originalPrice)}
                </Text>
                <Price fontSize="xl">{formatPrice(estimatedPrice)}</Price>
              </HStack>
            ) : (
              <Price fontSize="xl">{formatPrice(product.price)}</Price>
            )}
            <Muted fontSize="xs">
              Precio base. Los extras y el total final se calculan en el carrito.
            </Muted>
          </VStack>

          {product.configGroups.map((group) => (
            <ConfigGroup
              key={group.id}
              title={group.name}
              required={group.required}
              type={group.type}
              options={group.options}
              selected={config.selection[group.id]}
              onSelect={(optionId) => config.selectOption(group.id, optionId, group.type)}
            />
          ))}

          <TextAreaField
            label="Observaciones"
            value={config.notes}
            maxLength={500}
            onChange={(e) => config.setNotes(e.target.value)}
            placeholder="Sin cebolla, extra salsa, etc."
          />

          <Card variant="subtle">
            <HStack justify="space-between" marginBottom="4">
              <Strong>Cantidad</Strong>
              <QuantityStepper value={config.quantity} onChange={config.setQuantity} />
            </HStack>
            <HStack justify="space-between" marginBottom="4">
              <Muted>Total del ítem</Muted>
              <Price fontWeight="bold" fontSize="xl">
                {formatPrice(config.total)}
              </Price>
            </HStack>
            {config.missingRequired ? (
              <Text color="danger" fontSize="sm" marginBottom="3">
                Seleccioná las opciones obligatorias para continuar.
              </Text>
            ) : null}
            {config.error ? (
              <Text color="danger" fontSize="sm" marginBottom="3">
                {config.error}
              </Text>
            ) : null}
            <PrimaryButton
              width="full"
              loading={config.isAdding}
              disabled={!config.canAdd || config.isAdding}
              onClick={() => {
                void config.addToCart().then((added) => {
                  if (added) navigate(routes.cart)
                })
              }}
            >
              Agregar al carrito
            </PrimaryButton>
          </Card>

          <ProductPromotionsSection promotions={product.promotions ?? []} />
        </VStack>
      </Grid>
    </WidePageContainer>
  )
}

interface ProductPromotionsSectionProps {
  promotions: NonNullable<Product['promotions']>
}

const previewDescription = (promotion: NonNullable<Product['promotions']>[number]): string => {
  if (promotion.kind === 'PERCENTAGE') {
    return `${promotion.discountValue ?? 0}% de descuento`
  }
  if (promotion.kind === 'FIXED_AMOUNT') {
    return 'Descuento de monto fijo'
  }
  return 'Promoción por cantidad'
}

const ProductPromotionsSection = ({ promotions }: ProductPromotionsSectionProps) => {
  if (promotions.length === 0) return null

  return (
    <VStack align="stretch" gap="3">
      <Strong>Promociones aplicables</Strong>
      {promotions.map((promotion) => {
        const endsAt = new Date(promotion.endsAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'short',
        })

        return (
          <Card key={promotion.promotionId} variant="subtle" padding="4">
            <HStack justify="space-between" align="start" gap="3">
              <Badge colorPalette="brand" size="sm">
                {promotion.badge}
              </Badge>
              <Muted fontSize="xs">Hasta el {endsAt}</Muted>
            </HStack>
            <Strong fontSize="sm" marginTop="2" display="block">
              {promotion.name}
            </Strong>
            <Muted fontSize="xs" marginTop="1">
              {previewDescription(promotion)}
            </Muted>
            <VStack align="start" gap="1" marginTop="2">
              {promotion.minSubtotal > 0 ? (
                <Muted fontSize="xs">Compra mínima {formatPrice(promotion.minSubtotal)}</Muted>
              ) : null}
              {promotion.minQuantity > 0 ? (
                <Muted fontSize="xs">Mínimo {promotion.minQuantity} unidades</Muted>
              ) : null}
              {promotion.maxDiscount != null ? (
                <Muted fontSize="xs">Tope {formatPrice(promotion.maxDiscount)}</Muted>
              ) : null}
              <Muted fontSize="xs">El precio final se calcula en el carrito.</Muted>
            </VStack>
          </Card>
        )
      })}
    </VStack>
  )
}

interface ConfigGroupProps {
  title: string
  required: boolean
  type: 'single' | 'multiple'
  options: { id: string; name: string; extraPrice: number }[]
  selected: string | string[] | undefined
  onSelect: (optionId: string) => void
}

const ConfigGroup = ({ title, required, type, options, selected, onSelect }: ConfigGroupProps) => {
  const isSelected = (id: string) =>
    Array.isArray(selected) ? selected.includes(id) : selected === id

  return (
    <Box>
      <HStack gap="2" marginBottom="2">
        <Strong>{title}</Strong>
        {required ? (
          <Strong color="brand.600" fontSize="xs">
            Requerido
          </Strong>
        ) : (
          <Subtle fontSize="xs">Opcional</Subtle>
        )}
      </HStack>
      <VStack gap="2" align="stretch">
        {options.map((option) => {
          const selectedOption = isSelected(option.id)
          return (
            <Button
              key={option.id}
              variant="ghost"
              width="full"
              justifyContent="space-between"
              borderRadius="xl"
              paddingX="4"
              paddingY="3"
              border="1px solid"
              borderColor={selectedOption ? 'brand.500' : 'border.subtle'}
              bg={selectedOption ? { _light: 'brand.50', _dark: 'brand.950' } : 'bg.panel'}
              _hover={{
                bg: selectedOption ? { _light: 'brand.50', _dark: 'brand.950' } : 'bg.muted',
              }}
              onClick={() => onSelect(option.id)}
            >
              <HStack gap="2.5">
                <Box
                  width="18px"
                  height="18px"
                  borderRadius={type === 'single' ? 'full' : 'sm'}
                  border="1.5px solid"
                  borderColor={selectedOption ? 'brand.500' : 'border.emphasized'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={selectedOption ? 'brand.500' : 'transparent'}
                  color="white"
                >
                  {selectedOption && type === 'multiple' ? <Check width={12} height={12} /> : null}
                </Box>
                <Text fontWeight="medium" color={selectedOption ? 'fg' : 'fg.muted'}>
                  {option.name}
                </Text>
              </HStack>
              <Price
                color={
                  option.extraPrice > 0 ? { _light: 'brand.600', _dark: 'brand.300' } : 'fg.subtle'
                }
                fontSize="sm"
              >
                {option.extraPrice > 0 ? `+ ${formatPrice(option.extraPrice)}` : 'Sin cargo'}
              </Price>
            </Button>
          )
        })}
      </VStack>
    </Box>
  )
}

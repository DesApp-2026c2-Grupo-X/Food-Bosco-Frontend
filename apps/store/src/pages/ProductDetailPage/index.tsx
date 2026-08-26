import { Box, Button, Grid, HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react'
import Check from '@gravity-ui/icons/Check'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BackButton,
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
import { formatPrice } from '@repo/domain'
import { getCategoryName } from '@repo/api'
import { useProductConfig } from './hooks/useProductConfig'

export const ProductDetailPage = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const config = useProductConfig(productId ? Number(productId) : undefined)

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
  const categoryName = getCategoryName(product.categoryId)

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
            <Image
              src={product.image}
              alt={product.name}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
        </Box>

        <VStack align="stretch" gap="6">
          <VStack align="start" gap="2">
            {categoryName ? (
              <Strong color="brand.600" fontSize="sm">
                {categoryName}
              </Strong>
            ) : null}
            <PageTitle lineHeight="1.1" textWrap="balance">
              {product.name}
            </PageTitle>
            <Muted>{product.description}</Muted>
            <Price fontSize="xl">{formatPrice(product.price)}</Price>
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
            onChange={(e) => config.setNotes(e.target.value)}
            placeholder="Sin cebolla, extra salsa, etc."
          />

          <Box
            bg="bg.subtle"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            padding="5"
          >
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
            <PrimaryButton
              width="full"
              disabled={!config.canAdd}
              onClick={() => {
                config.addToCart()
                navigate(routes.cart)
              }}
            >
              Agregar al carrito
            </PrimaryButton>
          </Box>
        </VStack>
      </Grid>
    </WidePageContainer>
  )
}

interface ConfigGroupProps {
  title: string
  required: boolean
  type: 'single' | 'multiple'
  options: { id: number; name: string; priceDelta: number }[]
  selected: number | number[] | undefined
  onSelect: (optionId: number) => void
}

const ConfigGroup = ({ title, required, type, options, selected, onSelect }: ConfigGroupProps) => {
  const isSelected = (id: number) =>
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
              bg={selectedOption ? 'brand.50' : 'bg.panel'}
              _hover={{ bg: selectedOption ? 'brand.50' : 'bg.muted' }}
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
              <Price color={option.priceDelta > 0 ? 'brand.600' : 'fg.subtle'} fontSize="sm">
                {option.priceDelta > 0 ? `+ ${formatPrice(option.priceDelta)}` : 'Sin cargo'}
              </Price>
            </Button>
          )
        })}
      </VStack>
    </Box>
  )
}

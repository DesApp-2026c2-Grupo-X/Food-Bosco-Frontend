import { Badge, Box, HStack, VStack } from '@chakra-ui/react'
import {
  STOCK_ALERT_LABELS,
  STOCK_ALERT_PALETTE,
  getStockAlertLevel,
  type StockAlertLevel,
} from '@repo/domain'
import { OutlineButton } from '../Button'
import { Card } from '../Card'
import { TextLink } from '../TextLink'
import { Muted, Strong } from '../typography'
import type { LowStockAlertsSectionProps } from './types'

export const LowStockAlertsSection = ({
  alerts,
  isAdjusting = false,
  showBranch = false,
  branchName,
  stockPath,
  onAdjust,
}: LowStockAlertsSectionProps) => {
  if (alerts.length === 0) return null

  return (
    <VStack align="start" gap="4" width="full">
      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="2">
        <HStack gap="2.5" align="center">
          <Strong fontSize="xl">Alertas de stock</Strong>
          <Badge
            colorPalette="orange"
            variant="subtle"
            borderRadius="full"
            paddingX="2.5"
            paddingY="0.5"
          >
            {alerts.length} {alerts.length === 1 ? 'ingrediente' : 'ingredientes'}
          </Badge>
        </HStack>
        {stockPath ? (
          <TextLink to={stockPath} fontSize="sm">
            Ver todo el stock
          </TextLink>
        ) : null}
      </HStack>

      <VStack align="stretch" gap="3" width="full">
        {alerts.map((row) => {
          const rawLevel = getStockAlertLevel(row)
          const level: Exclude<StockAlertLevel, 'ok'> = rawLevel === 'ok' ? 'low_stock' : rawLevel
          const unit = row.ingredient?.unit ?? ''
          const minQuantity = row.ingredient?.minQuantity ?? 0
          const branchLabel = showBranch ? (branchName?.(row.branchId) ?? row.branchId) : null

          return (
            <Card
              key={`${row.branchId}-${row.ingredientId}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap="4"
              padding="4"
              flexWrap="wrap"
            >
              <VStack align="start" gap="1">
                <HStack gap="2" wrap="wrap">
                  <Strong>
                    {row.ingredient?.name ?? 'Ingrediente'}
                    {branchLabel ? ` · ${branchLabel}` : ''}
                  </Strong>
                  <Badge
                    colorPalette={STOCK_ALERT_PALETTE[level]}
                    variant="subtle"
                    borderRadius="full"
                    paddingX="2.5"
                    paddingY="0.5"
                    display="inline-flex"
                    alignItems="center"
                    gap="1.5"
                  >
                    <Box width="6px" height="6px" borderRadius="full" bg="currentColor" />
                    {STOCK_ALERT_LABELS[level]}
                  </Badge>
                </HStack>
                <Muted fontSize="sm">
                  Disponible: {row.quantity} {unit} · Mínimo: {minQuantity} {unit}
                </Muted>
              </VStack>

              {onAdjust ? (
                <OutlineButton size="sm" onClick={() => onAdjust(row)} loading={isAdjusting}>
                  Ajustar
                </OutlineButton>
              ) : null}
            </Card>
          )
        })}
      </VStack>
    </VStack>
  )
}

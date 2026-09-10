import { Box, Flex, Text } from '@chakra-ui/react'
import { Fragment } from 'react'
import type { OrderStatus } from '@repo/domain'
import type { OrderTimelineProps } from './types'

const TRACKING_STEPS = ['Pendiente', 'Confirmado', 'Preparando', 'En camino', 'Entregado']

const progressFor = (status: OrderStatus): number => {
  switch (status) {
    case 'PENDING':
      return 0
    case 'CONFIRMED':
      return 1
    case 'PREPARING':
      return 2
    case 'READY_FOR_DELIVERY':
    case 'ON_THE_WAY':
      return 3
    case 'DELIVERED':
      return 4
    default:
      return -1
  }
}

export const OrderTimeline = ({ status }: OrderTimelineProps) => {
  const current = progressFor(status)

  return (
    <Box>
      <Flex align="center">
        {TRACKING_STEPS.map((label, index) => (
          <Fragment key={label}>
            <Box
              width="14px"
              height="14px"
              borderRadius="full"
              flexShrink={0}
              bg={
                index === current
                  ? 'brand.600'
                  : index < current
                    ? 'brand.500'
                    : 'border.emphasized'
              }
            />
            {index < TRACKING_STEPS.length - 1 ? (
              <Box
                flex="1"
                height="2px"
                bg={index < current ? 'brand.500' : 'border.subtle'}
                marginX="1"
              />
            ) : null}
          </Fragment>
        ))}
      </Flex>
      <Flex marginTop="1.5">
        {TRACKING_STEPS.map((label, index) => (
          <Text
            key={label}
            flex="1"
            minWidth={0}
            fontSize="2xs"
            whiteSpace="nowrap"
            textAlign={
              index === 0 ? 'left' : index === TRACKING_STEPS.length - 1 ? 'right' : 'center'
            }
            color={index <= current ? 'fg' : 'fg.subtle'}
            fontWeight={index === current ? 'semibold' : 'medium'}
          >
            {label}
          </Text>
        ))}
      </Flex>
    </Box>
  )
}

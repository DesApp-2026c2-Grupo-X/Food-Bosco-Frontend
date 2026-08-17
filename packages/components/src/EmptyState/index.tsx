import { Box, Text, VStack } from "@chakra-ui/react"
import type { EmptyStateProps } from "./types"

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <VStack align="center" gap="2" paddingY="16" textAlign="center">
      {icon ? <Box color="brand.500">{icon}</Box> : null}
      <Text fontWeight="semibold" fontSize="lg">
        {title}
      </Text>
      <Text color="fg.muted" maxWidth="sm">
        {description}
      </Text>
      {action ? <Box marginTop="2">{action}</Box> : null}
    </VStack>
  )
}

import { VStack } from "@chakra-ui/react"
import type { PageContainerProps } from "./types"

export const PageContainer = (props: PageContainerProps) => (
  <VStack align="stretch" gap="6" maxW="2xl" marginX="auto" width="full" {...props} />
)

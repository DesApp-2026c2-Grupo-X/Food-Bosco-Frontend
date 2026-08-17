import { VStack } from "@chakra-ui/react"
import type { WidePageContainerProps } from "./types"

export const WidePageContainer = (props: WidePageContainerProps) => (
  <VStack align="stretch" gap={{ base: "8", md: "12" }} width="full" {...props} />
)

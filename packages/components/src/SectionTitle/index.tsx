import { Heading } from "@chakra-ui/react"
import type { SectionTitleProps } from "./types"

export const SectionTitle = (props: SectionTitleProps) => (
  <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" textWrap="balance" {...props} />
)

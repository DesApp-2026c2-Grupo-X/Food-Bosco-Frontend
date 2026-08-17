import { Field, Textarea } from "@chakra-ui/react"
import type { TextAreaFieldProps } from "./types"

export const TextAreaField = ({ label, required, invalid, errorText, ...props }: TextAreaFieldProps) => (
  <Field.Root required={required} invalid={invalid}>
    <Field.Label>{label}</Field.Label>
    <Textarea size="lg" borderRadius="xl" bg="bg.panel" {...props} />
    {errorText ? <Field.ErrorText>{errorText}</Field.ErrorText> : null}
  </Field.Root>
)

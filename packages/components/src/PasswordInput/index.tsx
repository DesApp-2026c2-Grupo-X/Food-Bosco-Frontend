import { useState } from "react"
import { IconButton, Input, InputGroup } from "@chakra-ui/react"
import Eye from "@gravity-ui/icons/Eye"
import EyeClosed from "@gravity-ui/icons/EyeClosed"
import type { PasswordInputProps } from "./types"

export const PasswordInput = (props: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup
      endElement={
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeClosed width={18} height={18} /> : <Eye width={18} height={18} />}
        </IconButton>
      }
    >
      <Input type={visible ? "text" : "password"} {...props} />
    </InputGroup>
  )
}

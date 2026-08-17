import { ThemeProvider } from "next-themes"
import type { ColorModeProviderProps } from "./types"

export const ColorModeProvider = ({ ...props }: ColorModeProviderProps) => {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
}

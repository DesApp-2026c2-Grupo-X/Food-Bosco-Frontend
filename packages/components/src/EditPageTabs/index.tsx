import { Box, Tabs } from '@chakra-ui/react'
import type { EditPageTabsProps } from './types'

export const EditPageTabs = ({ defaultValue, value, onChange, tabs }: EditPageTabsProps) => (
  <Box marginTop="6">
    <Tabs.Root
      {...(value !== undefined ? { value } : { defaultValue })}
      onValueChange={onChange ? (details) => onChange(details.value) : undefined}
      variant="line"
      colorPalette="brand"
    >
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
            {tab.hasError ? (
              <Box
                as="span"
                width="2"
                height="2"
                borderRadius="full"
                bg="red.500"
                display="inline-block"
                marginLeft="1.5"
                aria-label="Tiene errores"
              />
            ) : null}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value}>
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  </Box>
)
